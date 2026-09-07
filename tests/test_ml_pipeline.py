import pytest
import numpy as np
from ml_pipeline.drift_detector import SkillDriftDetector, extract_skills_from_text, SKILL_TAXONOMY

def test_skill_taxonomy_coverage():
    """Verify that skill taxonomy contains 100+ entities and spans key categories."""
    assert len(SKILL_TAXONOMY) >= 100
    assert "langchain" in SKILL_TAXONOMY
    assert "pytorch" in SKILL_TAXONOMY
    assert "docker" in SKILL_TAXONOMY
    assert "react" in SKILL_TAXONOMY
    assert "transformers" in SKILL_TAXONOMY

def test_extract_skills_multi_token():
    """Verify multi-token NLP skill extraction handles complex phrases."""
    sample_text = """
    Senior AI Engineer experienced in LangChain, Prompt Engineering, Vector Databases (ChromaDB, Pinecone),
    PyTorch, Transformers, LoRA Fine-Tuning, Docker, Kubernetes, and FastAPI.
    """
    extracted = extract_skills_from_text(sample_text)
    assert "langchain" in extracted
    assert "prompt engineering" in extracted
    assert "vector databases" in extracted
    assert "pytorch" in extracted
    assert "lora fine-tuning" in extracted
    assert "docker" in extracted
    assert "fastapi" in extracted

def test_drift_detector_baseline_and_scoring():
    """Verify baseline fitting and anomaly scoring."""
    detector = SkillDriftDetector()
    
    historical_corpus = [
        ["java", "mysql", "soap", "jquery", "spring"],
        ["c++", "linux", "subversion", "bare metal", "sql"],
        ["python", "pandas", "scikit-learn", "numpy", "r"]
    ]
    
    detector.fit_baseline(historical_corpus)
    
    # Modern skillset containing OOD concepts
    modern_skills = ["langchain", "prompt engineering", "rag architecture", "vector databases", "vllm"]
    score, missing = detector.calculate_drift_score(modern_skills)
    
    assert score >= 0.0
    assert score <= 1.0
    assert len(missing) > 0
