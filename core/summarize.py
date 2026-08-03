from langchain_mistralai import ChatMistralAI 
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from langchain_core.runnables import RunnablePassthrough, RunnableLambda 

import os 

def get_llm():
    return ChatMistralAI(
        model = "mistral-small-latest",
        mistral_api_key = os.getenv("MISTRAL_API_KEY"),
        temperature = 0.3
    )

def split_transcript(transcript: str) -> list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 3000,
        chunk_overlap = 200
    )

    return splitter.split_text(transcript)

def summarize(transcript : str) -> str:
    if not transcript or not transcript.strip():
        return ""

    llm = get_llm()

    map_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "Summarize this portion of a meeting transcript concisely."),
            ("human", "{text}"),
        ]
    )
    map_chain = map_prompt | llm | StrOutputParser()

    combined_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an expert meeting summarizer. Combine these partial summaries "
                "into one final professional meeting summary in bullet points.",
            ),
            ("human", "{text}"),
        ]
    )
    combined_chain = (
        RunnablePassthrough() | RunnableLambda(lambda x: {"text": x}) | combined_prompt | llm | StrOutputParser()
    )

    chunks = split_transcript(transcript)
    if not chunks:
        return ""

    current_summaries = [map_chain.invoke({"text": chunk}) for chunk in chunks]

    # Iteratively reduce summaries in batches until only one final summary remains
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

def generate_title(transcipt : str) -> str:
    llm = get_llm()

    title_chain = (
        RunnablePassthrough() | RunnableLambda(lambda x:{"text":x}) | 
        ChatPromptTemplate.from_messages([
             (
                "system",
                "Based on the meeting transcript, generate a short professional meeting title "
                "(max 8 words). Only return the title, nothing else.",
            ),
            ("human", "{text}"),
        ])
        | llm
        |StrOutputParser()
    )

    return title_chain.invoke(transcipt[:2000])