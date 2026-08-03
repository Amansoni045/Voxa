import logging
import os
import time
from typing import List, Dict, Any

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough, RunnableSequence, RunnableParallel
from langchain_mistralai import ChatMistralAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

from core.summarize import summarize, generate_title

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_llm() -> ChatMistralAI:
    """Instantiate and return the ChatMistralAI LLM instance."""
    return ChatMistralAI(
        model="mistral-small-latest",
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        temperature=0.2,
    )


def split_transcript(transcript: str) -> List[str]:
    """Split the input transcript into manageable text chunks for LLM processing."""
    if not transcript or not transcript.strip():
        return []
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=3000,
        chunk_overlap=200,
    )
    return splitter.split_text(transcript)


def build_chain(system_prompt: str) -> RunnableSequence:
    """Build a LangChain RunnableSequence pipeline with system prompt and string output parsing."""
    llm = get_llm()
    return (
        RunnablePassthrough()
        | RunnableLambda(lambda x: {"text": x})
        | ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{text}"),
        ])
        | llm
        | StrOutputParser()
    )


def _invoke_with_retry(
    chain: RunnableSequence, input_text: str, max_retries: int = 3, initial_delay: float = 1.0
) -> str:
    """Invoke a LangChain runnable with exponential backoff retries on failure."""
    delay = initial_delay
    for attempt in range(1, max_retries + 1):
        try:
            result = chain.invoke(input_text)
            return result if isinstance(result, str) else str(result)
        except Exception as e:
            logger.warning(
                "Attempt %d/%d failed with error: %s. Retrying in %.1fs...",
                attempt,
                max_retries,
                e,
                delay,
            )
            if attempt == max_retries:
                logger.error("All %d retries failed for LLM invocation.", max_retries)
                raise e
            time.sleep(delay)
            delay *= 2.0
    return ""


def _is_empty_or_negative(text: str) -> bool:
    """Check if the extracted text is empty or indicates no results were found."""
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


def extract_with_map_reduce(
    transcript: str,
    extraction_prompt: str,
    cleanup_prompt: str,
) -> str:
    """
    Extract information from long transcripts using a Map-Reduce strategy.

    1. Split transcript into chunks.
    2. Run extraction on every chunk.
    3. Merge all partial outputs.
    4. Run one final cleanup/deduplication step.
    """
    if not transcript or not transcript.strip():
        logger.info("Transcript is empty or whitespace only. Skipping extraction.")
        return "No action items found."

    chunks = split_transcript(transcript)
    if not chunks:
        logger.info("No chunks produced from transcript. Skipping extraction.")
        return "No action items found."

    logger.info("Processing %d transcript chunk(s)...", len(chunks))
    extraction_chain = build_chain(extraction_prompt)

    valid_partial_results: List[str] = []

    for i, chunk in enumerate(chunks):
        logger.info("Processing chunk %d/%d...", i + 1, len(chunks))
        try:
            res = _invoke_with_retry(extraction_chain, chunk)
            if res and res.strip() and not _is_empty_or_negative(res):
                valid_partial_results.append(res.strip())
        except Exception as e:
            logger.error("Skipping chunk %d due to unhandled extraction error: %s", i + 1, e)

    if not valid_partial_results:
        logger.info("No valid extracted items found in any chunk.")
        return "No action items found."

    if len(chunks) == 1 or len(valid_partial_results) == 1:
        logger.info("Single chunk or single valid result available. Skipping cleanup phase.")
        return valid_partial_results[0]

    combined_results = "\n\n".join(valid_partial_results)
    logger.info("Executing cleanup and deduplication phase...")

    cleanup_chain = build_chain(cleanup_prompt)
    try:
        cleanup_res = _invoke_with_retry(cleanup_chain, combined_results)
        return cleanup_res.strip() if cleanup_res else "No action items found."
    except Exception as e:
        logger.error("Cleanup phase failed: %s. Returning merged partial results fallback.", e)
        return combined_results


def extract_action_items(transcript: str) -> str:
    """Extract action items from transcript using map-reduce."""
    res = extract_with_map_reduce(
        transcript,
        extraction_prompt="""
You are an expert meeting analyst.

Extract ALL action items from this meeting chunk.

For each action item provide:
- Task
- Owner
- Deadline (or 'Not specified')

Return only the action items found in this chunk.
If none are found, return:
No action items found.
""",
        cleanup_prompt="""
You are an expert meeting analyst.

The following action items were extracted from different parts of the SAME meeting.

Some may be duplicated.

Merge duplicate tasks.
Keep the most complete version.
Preserve owner and deadline.
Return one clean numbered list.

If no action items exist, return:
No action items found.
""",
    )
    if _is_empty_or_negative(res):
        return "No action items found."
    return res


def extract_key_decisions(transcript: str) -> str:
    """Extract key decisions from transcript using map-reduce."""
    res = extract_with_map_reduce(
        transcript,
        extraction_prompt="""
Extract all key decisions from this meeting chunk.

Return only the decisions from this chunk.

If none exist, return:
No key decisions found.
""",
        cleanup_prompt="""
These decisions were extracted from different chunks of the same meeting.

Merge duplicates.

Return one clean numbered list.

If none exist, return:
No key decisions found.
""",
    )
    if _is_empty_or_negative(res):
        return "No key decisions found."
    return res


def extract_questions(transcript: str) -> str:
    """Extract unresolved questions and follow-ups from transcript using map-reduce."""
    res = extract_with_map_reduce(
        transcript,
        extraction_prompt="""
Extract unresolved questions, blockers,
or follow-up items from this meeting chunk.

Return only the questions from this chunk.

If none exist, return:
No open questions found.
""",
        cleanup_prompt="""
These questions were extracted from different chunks of the same meeting.

Merge duplicates.

Return one clean numbered list.

If none exist, return:
No open questions found.
""",
    )
    if _is_empty_or_negative(res):
        return "No open questions found."
    return res


def _safe_run(func, transcript: str, fallback: str = "") -> str:
    try:
        return func(transcript)
    except Exception as e:
        logger.error("Task execution error in parallel pipeline: %s", e)
        return fallback


def process_transcript_parallel(transcript: str) -> Dict[str, Any]:
    """
    Execute summary, action items, decisions, questions, and title extraction in parallel.
    Uses RunnableParallel to run independent tasks concurrently.
    """
    parallel_pipeline = RunnableParallel(
        summary=RunnableLambda(lambda t: _safe_run(summarize, t, fallback="")),
        action_items=RunnableLambda(lambda t: _safe_run(extract_action_items, t, fallback="No action items found.")),
        key_decisions=RunnableLambda(lambda t: _safe_run(extract_key_decisions, t, fallback="No key decisions found.")),
        questions=RunnableLambda(lambda t: _safe_run(extract_questions, t, fallback="No open questions found.")),
        title=RunnableLambda(lambda t: _safe_run(generate_title, t, fallback="Untitled Meeting")),
    )

    return parallel_pipeline.invoke(transcript)