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
from backend.models.meeting import MeetingAnalysis, SectionResult, SectionStatus
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
        return ""

    chunks = split_transcript_for_summary(transcript)
    if not chunks:
        return ""

    extraction_chain = build_extraction_chain(extraction_prompt, temperature=0.2)
    valid_partial_results: List[str] = []

    for i, chunk in enumerate(chunks):
        res = extraction_chain.invoke(chunk)
        if res and res.strip() and not _is_empty_or_negative(res):
            valid_partial_results.append(res.strip())

    if not valid_partial_results:
        return ""

    if len(chunks) == 1 or len(valid_partial_results) == 1:
        return valid_partial_results[0]

    combined_results = "\n\n".join(valid_partial_results)
    cleanup_chain = build_extraction_chain(cleanup_prompt, temperature=0.2)
    cleanup_res = cleanup_chain.invoke(combined_results)
    return cleanup_res.strip() if cleanup_res else ""

def safe_run_section(func, transcript: str) -> SectionResult:
    try:
        raw_res = func(transcript)
        if not raw_res or _is_empty_or_negative(raw_res):
            return SectionResult.empty()
        return SectionResult.ok(raw_res)
    except Exception as e:
        logger.error("Section extraction failed: %s", e)
        return SectionResult.fail(e, provider="Mistral AI")

def run_parallel_analysis(transcript: str) -> Dict[str, SectionResult]:
    def safe_title(t: str) -> str:
        try:
            return generate_title(t) or "Untitled Analysis"
        except Exception:
            return "Untitled Analysis"

    parallel_pipeline = RunnableParallel(
        summary=RunnableLambda(lambda t: safe_run_section(generate_summary, t)),
        action_items=RunnableLambda(
            lambda t: safe_run_section(
                lambda text: extract_with_map_reduce(
                    text, ACTION_ITEMS_EXTRACTION_PROMPT, ACTION_ITEMS_CLEANUP_PROMPT
                ),
                t,
            )
        ),
        key_decisions=RunnableLambda(
            lambda t: safe_run_section(
                lambda text: extract_with_map_reduce(
                    text, KEY_DECISIONS_EXTRACTION_PROMPT, KEY_DECISIONS_CLEANUP_PROMPT
                ),
                t,
            )
        ),
        questions=RunnableLambda(
            lambda t: safe_run_section(
                lambda text: extract_with_map_reduce(
                    text, OPEN_QUESTIONS_EXTRACTION_PROMPT, OPEN_QUESTIONS_CLEANUP_PROMPT
                ),
                t,
            )
        ),
        title=RunnableLambda(safe_title),
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
            title=raw_data.get("title", "Untitled Analysis"),
            summary=raw_data.get("summary", SectionResult.empty()),
            action_items=raw_data.get("action_items", SectionResult.empty()),
            key_decisions=raw_data.get("key_decisions", SectionResult.empty()),
            questions=raw_data.get("questions", SectionResult.empty()),
        )

        return APIResponse[MeetingAnalysis].ok(analysis).model_dump()
    except Exception as e:
        logger.exception("Error processing transcript in API pipeline")
        return APIResponse[MeetingAnalysis].fail(
            message=str(e),
            error_type=type(e).__name__
        ).model_dump()
