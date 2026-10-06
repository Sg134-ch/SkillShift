import pytest
import numpy as np
from ml_pipeline.drift_detector import SkillDriftDetector, extract_skills_from_text, SKILL_TAXONOMY

def test_skill_taxonomy_coverage():
    """Verify that skill taxonomy contains 100+ entities and spans key categories."""
    total_skills = sum(len(skills) for skills in SKILL_TAXONOMY.values())
    assert total_skills >= 100
    all_skills_flat = [s for skills in SKILL_TAXONOMY.values() for s in skills]
    assert "langchain" in all_skills_flat
    assert "pytorch" in all_skills_flat
    assert "docker" in all_skills_flat
    assert "react" in all_skills_flat
    assert "transformers" in all_skills_flat

def test_extract_skills_multi_token():
    """Verify multi-token NLP skill extraction handles complex phrases."""
    sample_text = """
    Senior AI Engineer experienced in LangChain, Prompt Engineering, Vector Databases (ChromaDB, Pinecone),
    PyTorch, Transformers, LoRA Fine-Tuning, Docker, Kubernetes, and FastAPI.
    """
    extracted = extract_skills_from_text(sample_text)
    extracted_raw = [s['raw'] for s in extracted]
    assert "langchain" in extracted_raw
    assert "prompt engineering" in extracted_raw
    assert "vector databases" in extracted_raw
    assert "pytorch" in extracted_raw
    assert "docker" in extracted_raw
    assert "fastapi" in extracted_raw

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

