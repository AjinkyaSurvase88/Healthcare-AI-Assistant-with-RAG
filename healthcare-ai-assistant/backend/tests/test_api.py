import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

def test_health_check():
    # Mock the health check requests.get call
    with patch("requests.get") as mock_get:
        mock_get.return_value.status_code = 200
        
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "llm_available" in data
        assert "chroma_available" in data

def test_appointment_routing():
    # Test that a question about appointments gets routed to the appointment tool
    response = client.post("/api/v1/ask", json={"question": "I want to book an appointment"})
    assert response.status_code == 200
    
    data = response.json()
    assert data["is_appointment"] is True
    assert "Available Appointments" in data["answer"]

@patch("app.api.endpoints.generate_answer")
def test_rag_routing(mock_generate_answer):
    # Test that a non-appointment question goes to the RAG pipeline
    mock_response = {
        "answer": "This is a mocked answer from RAG.",
        "sources": [],
        "confidence": "Medium",
        "is_appointment": False
    }
    mock_generate_answer.return_value = mock_response
    
    response = client.post("/api/v1/ask", json={"question": "What are the symptoms of flu?"})
    assert response.status_code == 200
    
    data = response.json()
    assert data["is_appointment"] is False
    assert data["answer"] == "This is a mocked answer from RAG."
