from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda, RunnableSequence
from backend.llm.client import get_llm_client

def build_extraction_chain(system_prompt: str, temperature: float = 0.2) -> RunnableSequence:
    llm = get_llm_client(temperature=temperature)
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
