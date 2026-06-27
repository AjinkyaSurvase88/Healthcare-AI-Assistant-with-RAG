import os
import shutil
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.models.schemas import QuestionRequest, AnswerResponse, IngestResponse, DocumentInfo, HealthResponse
from app.services.rag.ingestion import ingest_document, get_vector_store
from app.services.rag.retrieval import generate_answer
from app.services.agent.router import route_query, handle_appointment_query
from app.config.settings import settings
from app.utils.logger import logger
import requests

router = APIRouter()

@router.post("/ingest", response_model=IngestResponse)
async def ingest_file(file: UploadFile = File(...)):
    """Uploads a healthcare document and ingests it into the vector database."""
    allowed_extensions = [".pdf", ".txt", ".docx"]
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
        
    file_path = os.path.join(settings.DATA_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        chunks_processed = ingest_document(file_path, file.filename)
        
        return IngestResponse(
            message="Document successfully ingested.",
            chunks_processed=chunks_processed,
            document_name=file.filename
        )
    except Exception as e:
        logger.error(f"Error during ingestion: {e}")
        # Cleanup file if ingestion failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    """Answers a question using either the Mock Appointment tool or the RAG pipeline."""
    question = request.question
    
    if route_query(question):
        logger.info("Routing query to Appointment Tool")
        answer = handle_appointment_query(question)
        return AnswerResponse(
            answer=answer,
            sources=[],
            confidence="High",
            is_appointment=True
        )
        
    logger.info("Routing query to RAG Pipeline")
    return generate_answer(question)


@router.get("/documents", response_model=List[DocumentInfo])
async def list_documents():
    """Lists all uploaded documents."""
    docs = []
    if os.path.exists(settings.DATA_DIR):
        for filename in os.listdir(settings.DATA_DIR):
            file_path = os.path.join(settings.DATA_DIR, filename)
            if os.path.isfile(file_path):
                # We could query Chroma for chunk count, but for simplicity, we mock chunks here or just return 0 
                # if we don't track it in a separate DB. Let's just return basic info.
                docs.append(
                    DocumentInfo(
                        id=filename,
                        filename=filename,
                        chunks=0, # To get exact chunks requires querying ChromaDB metadata
                        ingested_at=str(os.path.getctime(file_path))
                    )
                )
    return docs


@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Deletes a document from the filesystem. (Note: ChromaDB deletion is complex without IDs, so we just delete the file)."""
    file_path = os.path.join(settings.DATA_DIR, doc_id)
    if os.path.exists(file_path):
        os.remove(file_path)
        # Ideally, we should also delete from ChromaDB here.
        # But ChromaDB delete requires chunk IDs which we didn't store externally.
        return {"message": f"Document {doc_id} deleted."}
    
    raise HTTPException(status_code=404, detail="Document not found")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Returns the health status of the application and its dependencies."""
    llm_status = False
    try:
        res = requests.get(settings.OLLAMA_BASE_URL)
        if res.status_code == 200:
            llm_status = True
    except:
        pass
        
    chroma_status = os.path.exists(settings.CHROMA_DB_DIR)
    
    return HealthResponse(
        status="ok",
        llm_available=llm_status,
        chroma_available=chroma_status
    )
