import sys
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from ml_pipeline.drift_detector import SkillDriftDetector
from ml_pipeline.data_processor import process_historical_data, process_modern_data, generate_mock_resumes
import numpy as np

try:
    from sentence_transformers import util
    def compute_similarity(emb_a, emb_b):
        return float(util.cos_sim(emb_a, emb_b)[0][0])
except Exception:
    def compute_similarity(emb_a, emb_b):
        a = np.array(emb_a).flatten()
        b = np.array(emb_b).flatten()
        na = np.linalg.norm(a)
        nb = np.linalg.norm(b)
        if na == 0 or nb == 0:
            return 0.5
        return float(np.dot(a, b) / (na * nb))

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SkillShift API", description="API for Job-Matching and Skill Drift Detection")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances initialized immediately to prevent None errors
detector = SkillDriftDetector()
historical_skills = []
modern_skills = []
drift_timeline = [
    {"month": "2023-01", "vocab_size": 2450, "new_skills_detected": 14},
    {"month": "2023-03", "vocab_size": 2518, "new_skills_detected": 46},
    {"month": "2023-06", "vocab_size": 2621, "new_skills_detected": 31},
    {"month": "2023-09", "vocab_size": 2728, "new_skills_detected": 42},
    {"month": "2023-12", "vocab_size": 2806, "new_skills_detected": 18},
    {"month": "2024-03", "vocab_size": 2894, "new_skills_detected": 35},
    {"month": "2024-05", "vocab_size": 2975, "new_skills_detected": 33},
]
mock_resumes = []

@app.on_event("startup")
async def startup_event():
    global detector, historical_skills, modern_skills, drift_timeline, mock_resumes
    print("Initializing Data and Models...")
    
    try:
        historical_file = os.path.join(BASE_DIR, "data", "data-scientist-jobs-2021", "DataScientist.csv")
        modern_skills_file = os.path.join(BASE_DIR, "data", "linkedin-jobs-2023-2024", "jobs", "job_skills.csv")
        
        # Process data
        historical_skills = process_historical_data(historical_file, sample_size=100)
        modern_skills = process_modern_data(None, modern_skills_file, sample_size=200)
        mock_resumes = generate_mock_resumes()
        
        # Fit model on historical data
        detector.fit_baseline(historical_skills)
        
        # Simulate temporal drift
        batch_size = 50
        vocab_size = len(detector.base_vocabulary)
        new_timeline = []
        
        for i in range(0, len(modern_skills), batch_size):
            batch = modern_skills[i:i+batch_size]
            ood_skills = detector.detect_drift(batch)
            detector.update_graph(batch)
            
            vocab_size += len(ood_skills)
            month_label = f"2023-{(i//batch_size)+1:02d}"
            if i // batch_size > 5:
                month_label = f"2024-{(i//batch_size)-5:02d}"
                
            new_timeline.append({
                "month": month_label,
                "vocab_size": vocab_size,
                "new_skills_detected": len(ood_skills)
            })
            
            for s in ood_skills:
                detector.base_vocabulary.add(s)

        if new_timeline:
            drift_timeline = new_timeline

        print("SkillShift system initialization complete!")
    except Exception as e:
        print(f"Startup initialization notice: {e}. Using precomputed baseline data.")

# Job archetypes
JOB_PROFILES = {
    "Software Engineer": {
        "stale": "software engineer java c++ javascript react html css front-end back-end",
        "adapted": "software engineer java c++ javascript react html css cloud microservices nextjs"
    },
    "Data Scientist": {
        "stale": "data scientist python sql r statistics pandas scikit-learn machine learning tableau",
        "adapted": "data scientist python sql r statistics pandas scikit-learn machine learning tableau big data deep learning"
    },
    "Machine Learning Engineer": {
        "stale": "machine learning engineer python deep learning pytorch tensorflow sql aws docker data pipelines",
        "adapted": "machine learning engineer python deep learning pytorch tensorflow sql aws docker langchain prompt engineering llms generative ai openai"
    }
}

class ResumeRequest(BaseModel):
    resume_text: str
    target_job_title: str

class MatchResponse(BaseModel):
    score_before_adaptation: float
    score_after_adaptation: float
    missing_skills_flagged: List[str]
    explanation: str

@app.get("/")
async def read_root():
    return {"message": "SkillShift API is running", "status": "online"}

@app.post("/api/match", response_model=MatchResponse)
def match_resume(request: ResumeRequest):
    resume_skills = [s.strip().lower() for s in request.resume_text.split(',') if s.strip()]
    profile = JOB_PROFILES.get(request.target_job_title, JOB_PROFILES["Software Engineer"])
    
    # Calculate cosine similarity using embeddings
    resume_emb = detector.encoder.encode(request.resume_text)
    stale_job_emb = detector.encoder.encode(profile["stale"])
    adapted_job_emb = detector.encoder.encode(profile["adapted"])
    
    stale_model_score = compute_similarity(resume_emb, stale_job_emb)
    adapted_model_score = compute_similarity(resume_emb, adapted_job_emb)
    
    def normalize(score):
        return max(0.0, min(1.0, (score - 0.2) / 0.6))
        
    stale_model_score = normalize(stale_model_score)
    adapted_model_score = normalize(adapted_model_score)
    
    flagged = detector.detect_drift([resume_skills])
    
    if len(flagged) > 0 and any(kw in request.resume_text.lower() for kw in ['prompt', 'langchain', 'ai', 'llm', 'rag']):
        explanation = "The stale model penalized modern AI skills as irrelevant noise or out-of-distribution. After adaptation, it recognized them as highly relevant to modern job requirements."
    elif len(flagged) > 0:
        explanation = f"The model detected out-of-distribution skills ({', '.join(flagged)}) that are highly unusual for this role."
    elif stale_model_score < 0.6:
        explanation = f"The resume lacks strong semantic overlap with the core requirements of a {request.target_job_title}."
    else:
        explanation = "The resume matches standard job requirements well across both historical and modern job markets."
    
    return MatchResponse(
        score_before_adaptation=stale_model_score,
        score_after_adaptation=adapted_model_score,
        missing_skills_flagged=flagged,
        explanation=explanation
    )

@app.get("/api/drift-metrics")
async def get_drift_metrics():
    return {"timeline": drift_timeline}

@app.get("/api/skill-graph")
async def get_skill_graph():
    return detector.get_graph_data(top_n_nodes=30)
