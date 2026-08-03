from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

from backend.llm.client import get_llm_client
from backend.rag.vectorstore import build_vector_store, load_vector_store
from backend.rag.retriever import get_mmr_retriever

def format_docs(docs):
    return "\n\n".join([doc.page_content for doc in docs])

RAG_PROMPT_TEMPLATE = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an expert meeting assistant. Answer the user's question 
based ONLY on the meeting transcript context provided below.

If the answer is not found in the context, say: 
"I could not find this information in the meeting transcript."

Always be concise and precise. If quoting someone, mention it clearly.

Context from meeting transcript:
{context}""",
    ),
    ("human", "{question}"),
])

def build_rag_chain(transcript: str):
    vector_store = build_vector_store(transcript)
    retriever = get_mmr_retriever(vector_store)
    llm = get_llm_client(temperature=0.3)

    return (
        {
            "context": retriever | RunnableLambda(format_docs),
            "question": RunnablePassthrough()
        }
        | RAG_PROMPT_TEMPLATE
        | llm
        | StrOutputParser()
    )

def load_rag_chain():
    vector_store = load_vector_store()
    retriever = get_mmr_retriever(vector_store)
    llm = get_llm_client(temperature=0.3)

    return (
        {
            "context": retriever | RunnableLambda(format_docs),
            "question": RunnablePassthrough()
        }
        | RAG_PROMPT_TEMPLATE
        | llm
        | StrOutputParser()
    )

def ask_question(rag_chain, question: str) -> str:
    return rag_chain.invoke(question)
