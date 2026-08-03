from typing import Dict, Any, List
from langchain_core.runnables import RunnableLambda, RunnableParallel

from backend.llm.chains import build_extraction_chain
from backend.llm.prompts import (
    ACTION_ITEMS_EXTRACTION_PROMPT,
    ACTION_ITEMS_CLEANUP_PROMPT,
    KEY_DECISIONS_EXTRACTION_PROMPT,
    KEY_DECISIONS_CLEANUP_PROMPT,
    OPEN_QUESTIONS_EXTRACTION_PROMPT,
    OPEN_QUESTIONS_CLEANUP_PROMPT,
)
from backend.llm.summary import generate_summary, generate_title, split_transcript_for_summary
from backend.models.meeting import MeetingAnalysis
from backend.models.api import APIResponse
from backend.shared.logger import get_logger

logger = get_logger("voxa.analysis")

def _is_empty_or_negative(text: str) -> bool:
    cleaned = text.strip().lower()
    if not cleaned:
        return True
    negative_phrases = (
        "no action items found",
        "no key decisions found",
        "no open questions found",
        "no action items",
        "no key decisions",
        "no open questions",
    )
    return any(cleaned.startswith(phrase) or cleaned == phrase for phrase in negative_phrases)

def extract_with_map_reduce(transcript: str, extraction_prompt: str, cleanup_prompt: str) -> str:
    if not transcript or not transcript.strip():
        return "No action items found."

    chunks = split_transcript_for_summary(transcript)
    if not chunks:
        return "No action items found."

    extraction_chain = build_extraction_chain(extraction_prompt, temperature=0.2)
    valid_partial_results: List[str] = []

    for i, chunk in enumerate(chunks):
        try:
            res = extraction_chain.invoke(chunk)
            if res and res.strip() and not _is_empty_or_negative(res):
                valid_partial_results.append(res.strip())
        except Exception as e:
            logger.error("Skipping chunk %d due to error: %s", i + 1, e)

    if not valid_partial_results:
        return "No action items found."

    if len(chunks) == 1 or len(valid_partial_results) == 1:
        return valid_partial_results[0]

    combined_results = "\n\n".join(valid_partial_results)
    cleanup_chain = build_extraction_chain(cleanup_prompt, temperature=0.2)
    try:
        cleanup_res = cleanup_chain.invoke(combined_results)
        return cleanup_res.strip() if cleanup_res else "No action items found."
    except Exception as e:
        logger.error("Cleanup phase failed: %s", e)
        return combined_results

def extract_action_items(transcript: str) -> str:
    res = extract_with_map_reduce(transcript, ACTION_ITEMS_EXTRACTION_PROMPT, ACTION_ITEMS_CLEANUP_PROMPT)
    return "No action items found." if _is_empty_or_negative(res) else res

def extract_key_decisions(transcript: str) -> str:
    res = extract_with_map_reduce(transcript, KEY_DECISIONS_EXTRACTION_PROMPT, KEY_DECISIONS_CLEANUP_PROMPT)
    return "No key decisions found." if _is_empty_or_negative(res) else res

def extract_questions(transcript: str) -> str:
    res = extract_with_map_reduce(transcript, OPEN_QUESTIONS_EXTRACTION_PROMPT, OPEN_QUESTIONS_CLEANUP_PROMPT)
    return "No open questions found." if _is_empty_or_negative(res) else res

def _safe_run(func, transcript: str, fallback: str = "") -> str:
    try:
        return func(transcript)
    except Exception as e:
        logger.error("Task execution error in parallel pipeline: %s", e)
        return fallback

def run_parallel_analysis(transcript: str) -> Dict[str, Any]:
    parallel_pipeline = RunnableParallel(
        summary=RunnableLambda(lambda t: _safe_run(generate_summary, t, fallback="")),
        action_items=RunnableLambda(lambda t: _safe_run(extract_action_items, t, fallback="No action items found.")),
        key_decisions=RunnableLambda(lambda t: _safe_run(extract_key_decisions, t, fallback="No key decisions found.")),
        questions=RunnableLambda(lambda t: _safe_run(extract_questions, t, fallback="No open questions found.")),
        title=RunnableLambda(lambda t: _safe_run(generate_title, t, fallback="Untitled Meeting")),
    )
    return parallel_pipeline.invoke(transcript)

def process_transcript_api(transcript: str) -> Dict[str, Any]:
    try:
        if not transcript or not transcript.strip():
            return APIResponse[MeetingAnalysis].fail(
                message="Transcript text is empty or invalid.",
                error_type="ValueError"
            ).model_dump()

        raw_data = run_parallel_analysis(transcript)
        analysis = MeetingAnalysis(
            title=raw_data.get("title", "Untitled Meeting"),
            summary=raw_data.get("summary", ""),
            action_items=raw_data.get("action_items", "No action items found."),
            key_decisions=raw_data.get("key_decisions", "No key decisions found."),
            questions=raw_data.get("questions", "No open questions found.")
        )
        return APIResponse[MeetingAnalysis].ok(analysis).model_dump()
    except Exception as e:
        logger.exception("Error processing transcript in API pipeline")
        return APIResponse[MeetingAnalysis].fail(
            message=str(e),
            error_type=type(e).__name__
        ).model_dump()
