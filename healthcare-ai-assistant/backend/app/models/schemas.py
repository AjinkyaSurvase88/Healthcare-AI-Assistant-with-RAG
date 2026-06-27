from pydantic import BaseModel, Field
from typing import List, Optional

class QuestionRequest(BaseModel):
    question: str = Field(..., description="The question to ask the healthcare assistant")

class SourceChunk(BaseModel):
    document_name: str
    chunk_number: int
    similarity_score: float
    content: str

class AnswerResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
    confidence: str = Field(..., description="High, Medium, or Low")
    is_appointment: bool = Field(default=False, description="Whether this was routed to the appointment tool")

class IngestResponse(BaseModel):
    message: str
    chunks_processed: int
    document_name: str

class DocumentInfo(BaseModel):
    id: str
    filename: str
    chunks: int
    ingested_at: str

class HealthResponse(BaseModel):
    status: str
    llm_available: bool
    chroma_available: bool
