import os
from typing import List, Tuple
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from app.config.settings import settings
from app.utils.logger import logger
from app.utils.exceptions import DocumentProcessingError

def get_embeddings():
    return HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)

def get_vector_store():
    return Chroma(
        persist_directory=settings.CHROMA_DB_DIR,
        embedding_function=get_embeddings()
    )

def load_document(file_path: str):
    logger.info(f"Loading document: {file_path}")
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if ext == ".pdf":
            loader = PyPDFLoader(file_path)
        elif ext == ".txt":
            loader = TextLoader(file_path)
        elif ext == ".docx":
            loader = Docx2txtLoader(file_path)
        else:
            raise DocumentProcessingError(f"Unsupported file extension: {ext}")
        
        return loader.load()
    except Exception as e:
        logger.error(f"Error loading document {file_path}: {e}")
        raise DocumentProcessingError(f"Failed to load document: {str(e)}")

def ingest_document(file_path: str, filename: str) -> int:
    """
    Ingests a document, splits it, and saves to ChromaDB.
    Returns the number of chunks processed.
    """
    docs = load_document(file_path)
    
    # Update metadata with filename
    for doc in docs:
        doc.metadata["source_file"] = filename
        
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = text_splitter.split_documents(docs)
    logger.info(f"Split {filename} into {len(chunks)} chunks")
    
    vector_store = get_vector_store()
    vector_store.add_documents(chunks)
    
    logger.info(f"Successfully ingested {filename} into ChromaDB")
    return len(chunks)
