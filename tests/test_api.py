import pytest
from fastapi.testclient import TestClient
from backend.main import app, parse_document_content
from backend.database import (
    save_screening_run, 
    get_screening_history, 
    save_jd_audit, 
    get_jd_audit_history
)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "online"
    assert data.get("db") == "sqlite_connected"

def test_resume_matching_endpoint():
    payload = {
        "resume_text": "Experienced Python and PyTorch engineer building LLM applications with LangChain, Docker, and FastAPI.",
        "target_job_title": "Machine Learning Engineer"
    }
    response = client.post("/api/match", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score_before_adaptation" in data
    assert "score_after_adaptation" in data
    assert "explanation" in data
    # Adapted score should reward modern skills over stale baseline
    assert data["score_after_adaptation"] >= data["score_before_adaptation"]

def test_batch_screening_endpoint_and_db_persistence():
    payload = {
        "target_job_title": "Machine Learning Engineer",
        "candidates": [
            {
                "id": "cand-test-1",
                "name": "Sarah Chen",
                "title": "Senior AI Specialist",
                "resume_text": "Pioneered production RAG pipelines using LangChain, Vector Databases, LoRA Fine-Tuning, Docker, and FastAPI."
            }
        ]
    }
    response = client.post("/api/batch-screen", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert "metrics" in res_data
    assert "candidates" in res_data

    # Verify saved in SQLite history
    hist_response = client.get("/api/history/screenings")
    assert hist_response.status_code == 200
    hist_data = hist_response.json()
    assert len(hist_data.get("history", [])) > 0

def test_jd_audit_endpoint_and_db_persistence():
    payload = {
        "jd_text": "Looking for Java 8, Subversion, SOAP web services developer with Bare-metal server management experience.",
        "target_job_title": "Software Engineer"
    }
    response = client.post("/api/audit-jd", json=payload)
    assert response.status_code == 200
    audit_data = response.json()
    assert "modernityScore" in audit_data
    assert "suggestedReplacements" in audit_data
    assert "modernizedText" in audit_data

    # Verify saved in SQLite history
    hist_response = client.get("/api/history/audits")
    assert hist_response.status_code == 200
    hist_data = hist_response.json()
    assert len(hist_data.get("history", [])) > 0

def test_parse_document_content_helper():
    text_content = b"Candidate John Doe with expertise in Python, PyTorch, and Docker."
    parsed = parse_document_content("resume.txt", text_content)
    assert "Candidate John Doe" in parsed
    assert "PyTorch" in parsed

