from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.config.constants import SUMMARIZE_CHUNK_SIZE, SUMMARIZE_CHUNK_OVERLAP
from backend.llm.client import get_llm_client
from backend.llm.prompts import MAP_SUMMARY_PROMPT, COMBINED_SUMMARY_PROMPT, TITLE_PROMPT
from backend.llm.chains import build_extraction_chain

def split_transcript_for_summary(transcript: str) -> list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=SUMMARIZE_CHUNK_SIZE,
        chunk_overlap=SUMMARIZE_CHUNK_OVERLAP
    )
    return splitter.split_text(transcript)

def generate_summary(transcript: str) -> str:
    if not transcript or not transcript.strip():
        return ""

    map_chain = build_extraction_chain(MAP_SUMMARY_PROMPT, temperature=0.3)
    combined_chain = build_extraction_chain(COMBINED_SUMMARY_PROMPT, temperature=0.3)

    chunks = split_transcript_for_summary(transcript)
    if not chunks:
        return ""

    current_summaries = [map_chain.invoke(chunk) for chunk in chunks]

    batch_size = 8
    while len(current_summaries) > 1:
        next_level = []
        for i in range(0, len(current_summaries), batch_size):
            batch = current_summaries[i : i + batch_size]
            combined_batch_text = "\n\n".join(batch)
            reduced_summary = combined_chain.invoke(combined_batch_text)
            next_level.append(reduced_summary)
        current_summaries = next_level

    return current_summaries[0]

def generate_title(transcript: str) -> str:
    title_chain = build_extraction_chain(TITLE_PROMPT, temperature=0.3)
    return title_chain.invoke(transcript[:2000])
