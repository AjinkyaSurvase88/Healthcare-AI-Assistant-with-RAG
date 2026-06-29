from typing import List
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.config.settings import settings
from app.services.rag.ingestion import get_vector_store
from app.models.schemas import SourceChunk, AnswerResponse
from app.utils.logger import logger

SYSTEM_PROMPT = """You are a professional Healthcare AI Assistant. 
You must answer the user's question based ONLY on the provided context below.
Do not guess or hallucinate.
If the information is not available in the provided documents, answer EXACTLY: "I could not find this information in the provided documents."
Do not provide any medical diagnosis or prescribe any medicines. Keep responses professional and objective.
Always cite your sources based on the context provided.

Context:
{context}

Question:
{question}

Answer:"""

def calculate_confidence(scores: List[float]) -> str:
    """
    Calculate confidence based on ChromaDB distance scores.
    Chroma uses L2 distance by default (lower is better, 0 is exact match).
    Or cosine distance if configured. 
    Assuming lower distance = higher similarity.
    """
    if not scores:
        return "Low"
    
    # Simple heuristic for L2/cosine distances:
    best_score = scores[0]
    if best_score < 0.5:
        return "High"
    elif best_score < 1.0:
        return "Medium"
    else:
        return "Low"

def generate_answer(question: str) -> AnswerResponse:
    vector_store = get_vector_store()
    
    # Retrieve top K documents with scores
    results = vector_store.similarity_search_with_score(question, k=settings.TOP_K)
    
    if not results:
        logger.warning(f"No context found for question: {question}")
        return AnswerResponse(
            answer="I could not find this information in the provided documents.",
            sources=[],
            confidence="Low",
            is_appointment=False
        )

    context_texts = []
    source_chunks = []
    scores = []
    
    for idx, (doc, score) in enumerate(results):
        scores.append(score)
        context_texts.append(f"[Source {idx+1}]: {doc.page_content}")
        
        source_chunks.append(
            SourceChunk(
                document_name=doc.metadata.get("source_file", "Unknown"),
                chunk_number=idx + 1,
                similarity_score=round(score, 4),
                content=doc.page_content
            )
        )
        
    context_str = "\n\n".join(context_texts)
    
    prompt = PromptTemplate(
        template=SYSTEM_PROMPT,
        input_variables=["context", "question"]
    )
    
    llm = OllamaLLM(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.LLM_MODEL,
        temperature=0.1
    )
    
    formatted_prompt = prompt.format(context=context_str, question=question)
    
    logger.info(f"Invoking LLM for question: {question}")
    try:
        response = llm.invoke(formatted_prompt)
    except Exception as e:
        logger.error(f"Error invoking LLM: {e}")
        raise e
        
    confidence = calculate_confidence(scores)
    
    return AnswerResponse(
        answer=response,
        sources=source_chunks,
        confidence=confidence,
        is_appointment=False
    )
