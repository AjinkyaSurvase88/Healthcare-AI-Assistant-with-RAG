# Healthcare AI Assistant

A complete Healthcare AI Assistant that answers questions from healthcare documents using Retrieval-Augmented Generation (RAG).

Built with **FastAPI**, **React**, **Tailwind CSS**, and **ChromaDB**.  
Powered by **Gemma 3** running locally via **Ollama**.

## Architecture

- **Frontend**: React 19 + Vite, Tailwind CSS, Framer Motion for animations.
- **Backend**: FastAPI with Python 3.11.
- **Embedding Model**: `all-MiniLM-L6-v2` via HuggingFace `sentence-transformers`.
- **Vector Database**: ChromaDB (running locally in `./backend/vector_store`).
- **LLM**: Gemma 3 via Ollama (configured via `OLLAMA_BASE_URL`).

The assistant features an intelligent Agent Router that automatically detects if a question is about scheduling an appointment and routes it to a mock Appointment Tool instead of querying the RAG pipeline.

## Project Structure

```
healthcare-ai-assistant/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── config/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── agent/  # Routing and Appointment Tool
│   │   │   └── rag/    # Ingestion and Retrieval pipelines
│   │   ├── utils/
│   │   └── main.py
│   ├── data/           # Uploaded documents
│   ├── tests/
│   ├── vector_store/   # ChromaDB persistence
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
└── .env.example
```

## Prerequisites

1. **Python 3.11+** installed.
2. **Node.js 20+** and npm installed.
3. [Ollama](https://ollama.ai/) running on your host machine.

### Pulling Gemma 3

Before starting the assistant, ensure Ollama is installed and run:

```bash
ollama pull gemma3
```

## Installation & Running

### 1. Environment Configuration

Copy `.env.example` to `.env` inside the `backend/` folder:

```bash
cp .env.example backend/.env
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### 3. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`

## Features

- **Document Ingestion**: Upload PDF, TXT, or DOCX documents to populate the ChromaDB vector store.
- **Semantic Search**: Uses LangChain and SentenceTransformers to retrieve the top K most relevant chunks.
- **RAG Generation**: Sends context and instructions to Gemma 3 to answer truthfully and strictly from context.
- **Appointment Agent**: Automatically books fake appointments if asked about schedules.
- **Confidence Scores**: Shows High/Medium/Low confidence depending on the semantic distance of the context.
- **Source Citations**: Returns exact chunk snippets and document names.

## Limitations & Future Improvements

- The appointment tool is currently a mock. In production, this would integrate with an actual scheduling system.
- Streaming LLM output is not yet fully implemented across the stack (FastAPI supports it, but the frontend currently waits for the full response).
- Authentication and rate limiting are omitted for this hackathon version but should be implemented before production deployment.

## System Prompts

The assistant operates under a strict RAG prompt:
> You must answer the user's question based ONLY on the provided context below. Do not guess or hallucinate. If the information is not available in the provided documents, answer EXACTLY: "I could not find this information in the provided documents." Do not provide any medical diagnosis or prescribe any medicines.
