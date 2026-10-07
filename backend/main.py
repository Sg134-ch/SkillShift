import sys
import os
import re
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from ml_pipeline.drift_detector import SkillDriftDetector, extract_skills_from_text, SKILL_TAXONOMY
from backend.database import (
    save_screening_run, 
    get_screening_history, 
    save_jd_audit, 
    get_jd_audit_history,
    get_companies_from_db,
    get_job_profile_from_db,
    get_drift_timeline
)
from backend.ingestion_service import run_ingestion_cycle
from backend.llm_client import get_jd_audit_llm, forecast_skill_drift_llm, generate_learning_roadmap_llm
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

app = FastAPI(title="SkillShift API", description="Production API for Concept Drift, ATS Screening & Skill Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global detector instance
detector = SkillDriftDetector()
historical_skills = []
modern_skills = []
# Removed mock drift_timeline

@app.on_event("startup")
async def startup_event():
    global detector, historical_skills, modern_skills
    print("Initializing Data and Models...")
    
    try:
        historical_file = os.path.join(BASE_DIR, "data", "data-scientist-jobs-2021", "DataScientist.csv")
        modern_skills_file = os.path.join(BASE_DIR, "data", "linkedin-jobs-2023-2024", "jobs", "job_skills.csv")
        
        historical_skills = process_historical_data(historical_file, sample_size=100)
        modern_skills = process_modern_data(None, modern_skills_file, sample_size=200)
        
        detector.fit_baseline(historical_skills)
        print("SkillShift system initialization complete!")
    except Exception as e:
        print(f"Startup initialization notice: {e}. Using precomputed baseline data.")

# Job profiles are now loaded dynamically from the SQLite database.
# See backend.database for initial seeding.

class ResumeRequest(BaseModel):
    resume_text: str
    target_job_title: str

class MatchResponse(BaseModel):
    score_before_adaptation: float
    score_after_adaptation: float
    missing_skills_flagged: List[str]
    explanation: str
    roadmap: Optional[Dict[str, Any]] = None
    candidate_skills: List[str] = []
    required_skills_found: List[str] = []
    outdated_skills: List[str] = []
    missing_skills: List[str] = []

@app.get("/")
async def read_root():
    return {"message": "SkillShift API is running", "status": "online", "db": "sqlite_connected"}

# Helper to parse document byte streams
def parse_document_content(filename: str, content: bytes) -> str:
    lower_fn = filename.lower()
    if lower_fn.endswith('.pdf'):
        try:
            from pdfminer.high_level import extract_text
            import io
            text = extract_text(io.BytesIO(content))
            if text and len(text.strip()) > 30:
                return text.strip()
        except Exception as e:
            print(f"PDF extraction error: {e}")
            pass
            
        try:
            raw = content.decode('utf-8', errors='ignore')
            clean = re.sub(r'[^a-zA-Z0-9\+\#\.\,\-\s]', ' ', raw)
            clean = re.sub(r'\s+', ' ', clean).strip()
            if len(clean) > 30:
                return clean
        except Exception:
            pass
        return ""
        
    elif lower_fn.endswith('.docx') or lower_fn.endswith('.doc'):
        try:
            import docx
            import io
            doc = docx.Document(io.BytesIO(content))
            text = " ".join([p.text for p in doc.paragraphs if p.text.strip()])
            if len(text.strip()) > 20:
                return text.strip()
        except Exception:
            pass
        return content.decode('utf-8', errors='ignore')
    else:
        return content.decode('utf-8', errors='ignore')

# File Upload & Parsing Endpoints
@app.post("/api/parse-resume")
async def parse_single_resume(file: UploadFile = File(...)):
    content = await file.read()
    extracted_text = parse_document_content(file.filename, content)
    skills = extract_skills_from_text(extracted_text)
    return {
        "filename": file.filename,
        "text": extracted_text,
        "extracted_skills": skills,
        "filesize": f"{(len(content) / 1024):.1f} KB"
    }

@app.post("/api/upload-batch")
async def upload_batch_resumes(files: List[UploadFile] = File(...)):
    parsed_candidates = []
    for f in files:
        content = await f.read()
        extracted_text = parse_document_content(f.filename, content)
        clean_name = os.path.splitext(f.filename)[0].replace('-', ' ').replace('_', ' ')
        skills = extract_skills_from_text(extracted_text)
        
        parsed_candidates.append({
            "id": f"uploaded-{uuid.uuid4().hex[:8]}",
            "name": clean_name.title(),
            "title": "Machine Learning Engineer",
            "resumeSnippet": extracted_text[:140] + "...",
            "resume_text": extracted_text,
            "skills": [s['name'] for s in skills]
        })
        
    return {"candidates": parsed_candidates, "count": len(parsed_candidates)}

# Single Resume Match Evaluation
@app.post("/api/match")
def match_resume(request: ResumeRequest):
    text_lower = request.resume_text.lower()
    
    profile = get_job_profile_from_db(request.target_job_title)
    if not profile:
        # Dynamic fallback based on title
        title_lower = request.target_job_title.lower()
        if 'frontend' in title_lower or 'web' in title_lower or 'react' in title_lower:
            profile = {"stale": "HTML, CSS, JavaScript, jQuery, Bootstrap", "adapted": "React, Next.js, TypeScript, Tailwind CSS, GraphQL"}
        elif 'backend' in title_lower or 'software' in title_lower:
            profile = {"stale": "Java, Spring, SQL, SOAP, XML", "adapted": "Python, FastAPI, Docker, Kubernetes, AWS, Microservices"}
        elif 'data' in title_lower or 'analyst' in title_lower:
            profile = {"stale": "Excel, VBA, SQL, Tableau, SPSS", "adapted": "Python, Pandas, Snowflake, dbt, Power BI, SQL"}
        else:
            profile = get_job_profile_from_db("Machine Learning Engineer")
            if not profile:
                profile = {"stale": "Python, Scikit-learn, Pandas", "adapted": "PyTorch, LangChain, RAG, LLMs, Docker"}
    
    stale_job_emb = detector.encoder.encode(profile["stale"])
    adapted_job_emb = detector.encoder.encode(profile["adapted"])
    resume_emb = detector.encoder.encode(request.resume_text)
    
    stale_sim = compute_similarity(resume_emb, stale_job_emb)
    adapted_sim = compute_similarity(resume_emb, adapted_job_emb)
    
    extracted = extract_skills_from_text(request.resume_text)
    flagged_ood = [s['name'] for s in extracted if s['isOOD']]
    flagged_stale = [s['name'] for s in extracted if s['domain'] == 'Legacy Stack']
    found_base = [s['name'] for s in extracted if s['domain'] in ['Data Science', 'Deep Learning', 'DevOps & MLOps']]
    
    stale_score = 0.45 + (len(found_base) * 0.05) + (len(flagged_stale) * 0.08) - (len(flagged_ood) * 0.10)
    adapted_score = 0.45 + (len(found_base) * 0.05) + (len(flagged_ood) * 0.12) - (len(flagged_stale) * 0.08)
    
    stale_score = round(max(0.18, min(0.95, (stale_score * 0.6) + (stale_sim * 0.4))), 2)
    adapted_score = round(max(0.25, min(0.98, (adapted_score * 0.6) + (adapted_sim * 0.4))), 2)
    
    if len(flagged_ood) > 0 and adapted_score > stale_score:
        explanation = f"The stale 2021 model penalized modern skills ({', '.join(flagged_ood[:3])}) as out-of-distribution noise. After concept drift adaptation, the 2024 model recognized them as top-priority requirements for {request.target_job_title}."
    elif len(flagged_stale) > 0 and stale_score > adapted_score:
        explanation = f"Reverse drift detected: Candidate utilizes legacy tools ({', '.join(flagged_stale[:3])}) that have declined in contemporary job descriptions in favor of cloud-native frameworks."
    elif stale_score >= 0.75:
        explanation = f"Strong alignment with established core foundational requirements for {request.target_job_title}. Minimal concept drift divergence detected."
    else:
        explanation = f"The resume demonstrates moderate semantic overlap across both historical and modern criteria for {request.target_job_title}."
        
    # Generate true missing skills for the roadmap
    modern_skills_in_profile = {s['name'] for s in extract_skills_from_text(profile.get("adapted", ""))}
    candidate_skills = {s['name'] for s in extracted}
    true_missing = list(modern_skills_in_profile - candidate_skills)
    
    # Calculate new categories for UI
    candidate_skills_list = [s['name'] for s in extracted]
    print(f'DEBUG candidate_skills_list: {candidate_skills_list}')
    print(f'DEBUG extracted: {extracted}')
    outdated_skills_list = flagged_stale
    
    modern_reqs = {s['name'] for s in extract_skills_from_text(profile.get("adapted", ""))}
    required_found = list(set(candidate_skills_list).intersection(modern_reqs))
    
    roadmap = None
    if true_missing:
        # Only take top 5 missing skills to keep the prompt focused
        roadmap = generate_learning_roadmap_llm(true_missing[:5], request.target_job_title)
        
    return MatchResponse(
        score_before_adaptation=stale_score,
        score_after_adaptation=adapted_score,
        missing_skills_flagged=flagged_ood,
        explanation=explanation,
        roadmap=roadmap,
        candidate_skills=candidate_skills_list,
        required_skills_found=required_found,
        outdated_skills=outdated_skills_list,
        missing_skills=true_missing
    )

@app.get("/api/drift-metrics")
async def get_drift_metrics(target_job_title: str = "Machine Learning Engineer"):
    # Read true timeline from DB instead of memory
    timeline = get_drift_timeline()
    
    # Append the LLM-predicted future drift to the historical timeline
    forecast = forecast_skill_drift_llm(["vllm", "lora", "langchain"], target_job_title)
    
    if forecast and timeline:
        # Convert forecasted years into timeline format for the UI
        for item in forecast:
            timeline.append({
                "month": f"{item.get('year')}-01", 
                "vocab_size": timeline[-1]["vocab_size"] + item.get("predicted_adoption_pct", 10) * 10,
                "new_skills_detected": len(item.get("emerging_tech", [])),
                "is_forecast": True,
                "emerging": item.get("emerging_tech", [])
            })
            
    return {"timeline": timeline}

@app.post("/api/trigger-ingestion")
async def trigger_ingestion():
    # Force a live data ingestion cycle
    result = run_ingestion_cycle()
    return result

@app.get("/api/skill-graph")
async def get_skill_graph():
    return detector.get_graph_data(top_n_nodes=35)

# Company Demands Data is now loaded dynamically from the SQLite database.
# See backend.database for initial seeding.

@app.get("/api/companies")
async def get_companies(skill: str = None, domain: str = None):
    results = get_companies_from_db(skill, domain)
    return {"companies": results, "total": len(results)}

# Recruiter Batch Screening & Persistent DB Logging
class BatchCandidate(BaseModel):
    id: str
    name: str
    title: str
    resume_text: str

class BatchScreenRequest(BaseModel):
    target_job_title: str
    candidates: List[BatchCandidate]

class GithubVerifyRequest(BaseModel):
    github_url: str
    claimed_skills: List[str]

@app.post("/api/verify-github")
def verify_github_skills(req: GithubVerifyRequest):
    import requests
    # Extract username
    url = req.github_url.rstrip('/')
    username = url.split('/')[-1]
    
    try:
        response = requests.get(f"https://api.github.com/users/{username}/repos?sort=updated&per_page=15", timeout=10)
        if response.status_code != 200:
            return {"verified_skills": [], "languages": []}
            
        repos = response.json()
        languages_found = set()
        for repo in repos:
            if not repo.get('fork') and repo.get('language'):
                languages_found.add(repo.get('language').lower())
        
        # Mapping to match claimed skills against found languages
        verified = []
        for skill in req.claimed_skills:
            lower_skill = skill.lower().strip()
            if not lower_skill:
                continue
                
            if lower_skill in languages_found:
                verified.append(skill)
            elif lower_skill in ["machine learning", "deep learning", "pytorch", "tensorflow", "keras", "pandas", "numpy", "scikit-learn"] and ("python" in languages_found or "r" in languages_found or "jupyter notebook" in languages_found):
                verified.append(skill)
            elif lower_skill in ["jupyter notebook", "data science", "statistics", "data analysis"] and ("r" in languages_found or "python" in languages_found or "jupyter notebook" in languages_found):
                verified.append(skill)
            elif lower_skill in ["react", "react.js", "next.js", "vue", "angular", "node.js", "express"] and ("javascript" in languages_found or "typescript" in languages_found):
                verified.append(skill)
            elif lower_skill in ["react native", "expo"] and ("javascript" in languages_found or "typescript" in languages_found):
                verified.append(skill)
                
        return {"verified_skills": list(set(verified)), "repos_scanned": len(repos), "languages": list(languages_found)}
    except Exception as e:
        return {"verified_skills": [], "error": str(e)}

@app.post("/api/batch-screen")
def batch_screen_candidates(request: BatchScreenRequest):
    profile = get_job_profile_from_db(request.target_job_title)
    if not profile:
        profile = get_job_profile_from_db("Machine Learning Engineer")
        if not profile:
            profile = {"stale": "", "adapted": ""}
    stale_job_emb = detector.encoder.encode(profile["stale"])
    adapted_job_emb = detector.encoder.encode(profile["adapted"])
    
    scored_candidates = []
    
    for cand in request.candidates:
        resume_emb = detector.encoder.encode(cand.resume_text)
        
        stale_sim = compute_similarity(resume_emb, stale_job_emb)
        adapted_sim = compute_similarity(resume_emb, adapted_job_emb)
        
        extracted = extract_skills_from_text(cand.resume_text)
        flagged_ood = [s['name'] for s in extracted if s['isOOD']]
        flagged_stale = [s['name'] for s in extracted if s['domain'] == 'Legacy Stack']
        found_base = [s['name'] for s in extracted if s['domain'] in ['Data Science', 'Deep Learning', 'DevOps & MLOps']]
        
        stale_score = 0.45 + (len(found_base) * 0.05) + (len(flagged_stale) * 0.08) - (len(flagged_ood) * 0.10)
        adapted_score = 0.45 + (len(found_base) * 0.05) + (len(flagged_ood) * 0.12) - (len(flagged_stale) * 0.08)
        
        norm_stale = round(max(0.18, min(0.95, (stale_score * 0.6) + (stale_sim * 0.4))), 2)
        norm_adapted = round(max(0.25, min(0.98, (adapted_score * 0.6) + (adapted_sim * 0.4))), 2)
        
        if len(flagged_ood) > 0 and norm_adapted > norm_stale:
            notes = f"Penalized by legacy ATS as irrelevant due to unseen modern terminology ({', '.join(flagged_ood[:2])}). Restored by concept drift adaptation."
        elif len(flagged_stale) > 0 and norm_stale > norm_adapted:
            notes = f"Reverse concept drift: Reliance on legacy tools ({', '.join(flagged_stale[:2])}) reduced alignment with modern cloud/containerized expectations."
        elif norm_stale >= 0.75:
            notes = "Strong evergreen core competence. Consistently high alignment across historical and modern screening models."
        else:
            notes = "Candidate exhibits standard baseline overlap against benchmark requirements."
            
        scored_candidates.append({
            "id": cand.id,
            "name": cand.name,
            "title": cand.title,
            "resumeSnippet": cand.resume_text[:140] + ("..." if len(cand.resume_text) > 140 else ""),
            "legacyAtsScore": norm_stale,
            "adaptedModelScore": norm_adapted,
            "flaggedSkills": flagged_ood,
            "matchNotes": notes
        })
    
    # Assign ranks based on legacy score
    scored_candidates.sort(key=lambda x: x["legacyAtsScore"], reverse=True)
    for i, c in enumerate(scored_candidates):
        c["legacyRank"] = i + 1
        
    # Assign ranks based on adapted score
    scored_candidates.sort(key=lambda x: x["adaptedModelScore"], reverse=True)
    false_negatives = 0
    total_gain = 0
    
    for i, c in enumerate(scored_candidates):
        c["adaptedRank"] = i + 1
        c["rankShift"] = c["legacyRank"] - c["adaptedRank"]
        score_diff = round((c["adaptedModelScore"] - c["legacyAtsScore"]) * 100, 1)
        total_gain += max(0, score_diff)
        
        if (c["adaptedModelScore"] >= 0.70 and c["adaptedModelScore"] - c["legacyAtsScore"] >= 0.20) or c["rankShift"] >= 2:
            c["verdict"] = "False Negative Corrected 🌟"
            c["verdictType"] = "emerald"
            false_negatives += 1
        elif any(s in c["flaggedSkills"] for s in ['Next.js 14', 'Tailwind CSS', 'Supabase']):
            c["verdict"] = "Framework Shift Recognized ⚡"
            c["verdictType"] = "indigo"
        elif c["adaptedModelScore"] >= 0.75 and abs(c["adaptedModelScore"] - c["legacyAtsScore"]) < 0.15:
            c["verdict"] = "Consistent Baseline Core ✅"
            c["verdictType"] = "cyan"
        elif c["legacyAtsScore"] - c["adaptedModelScore"] >= 0.20 or c["rankShift"] <= -2:
            c["verdict"] = "Reverse Drift / Legacy Penalty 📉"
            c["verdictType"] = "rose"
        elif c["adaptedModelScore"] >= 0.60:
            c["verdict"] = "Emerging Junior Talent 📈"
            c["verdictType"] = "cyan"
        else:
            c["verdict"] = "Low Alignment ❌"
            c["verdictType"] = "rose"
            
    total = len(scored_candidates)
    fn_rate = round((false_negatives / total * 100), 1) if total > 0 else 0
    avg_gain = round(total_gain / total, 1) if total > 0 else 0
    
    metrics = {
        "totalScreened": total,
        "falseNegativesRecovered": false_negatives,
        "falseNegativeRate": f"{fn_rate}%",
        "averageAdaptationGain": f"+{avg_gain}%"
    }
    
    # Save screening run to SQLite database
    try:
        run_id = f"run-{uuid.uuid4().hex[:8]}"
        save_screening_run(run_id, request.target_job_title, metrics, scored_candidates)
    except Exception as e:
        print(f"Database save error: {e}")
    
    return {
        "candidates": scored_candidates,
        "metrics": metrics
    }

# Job Description Drift Audit API
class JDAuditRequest(BaseModel):
    jd_text: str
    target_job_title: str

@app.post("/api/audit-jd")
def audit_job_description(request: JDAuditRequest):
    # Try LLM first for intelligent JD auditing
    llm_audit = get_jd_audit_llm(request.jd_text, request.target_job_title)
    
    if llm_audit:
        base_modernity = llm_audit.get("modernityScore", 50)
        stale_count = len(llm_audit.get("staleKeywords", []))
        optimized = min(98, base_modernity + (stale_count * 14) + 10)
        
        mod_text = request.jd_text
        for rep in llm_audit.get("suggestedReplacements", []):
            mod_text = re.sub(re.escape(rep['stale']), rep['modern'], mod_text, flags=re.IGNORECASE)
            
        res = {
            "modernityScore": base_modernity,
            "optimizedScore": optimized,
            "staleKeywords": llm_audit.get("staleKeywords", []),
            "suggestedReplacements": llm_audit.get("suggestedReplacements", []),
            "candidateReachPenalty": f"-{min(75, stale_count * 14 + 10)}% Modern Candidate Reach",
            "verdict": "Obsolete requirements detected." if stale_count > 0 else "Clean, contemporary job description.",
            "modernizedText": mod_text
        }
    else:
        # Fallback to static rules
        extracted = extract_skills_from_text(request.jd_text)
        stale_items = [s for s in extracted if s['domain'] == 'Legacy Stack']
        
        stale_map = {
            "hadoop": "Apache Spark / Vector Databases",
            "mapreduce": "Apache Spark / Distributed Embeddings",
            "svn": "Git / GitHub Actions CI/CD",
            "subversion": "Git / GitHub Actions CI/CD",
            "java 8": "Python 3.11+ / Modern Java 21",
            "weka": "PyTorch / Scikit-Learn / Hugging Face",
            "perl": "Python / FastAPI",
            "soap": "REST APIs / gRPC / JSON",
            "angularjs": "React 19 / Next.js 14",
            "jquery": "React / Modern TypeScript",
            "bootstrap 3": "Tailwind CSS",
            "sas": "Python (Pandas, Polars)",
            "spss": "Python / Scikit-Learn",
            "excel vba": "Python Data Automation"
        }
        
        found_stale = [s['name'] for s in stale_items]
        replacements = []
        for s in stale_items:
            modern = stale_map.get(s['raw'], f"Modern {s['name']} Alternative")
            replacements.append({"stale": s['name'], "modern": modern})
                
        stale_count = len(found_stale)
        base_modernity = max(25, 100 - (stale_count * 15))
        optimized = min(98, base_modernity + (stale_count * 14) + 10)
        
        mod_text = request.jd_text
        for rep in replacements:
            mod_text = re.sub(re.escape(rep['stale']), rep['modern'], mod_text, flags=re.IGNORECASE)
        
        res = {
            "modernityScore": base_modernity,
            "optimizedScore": optimized,
            "staleKeywords": found_stale,
            "suggestedReplacements": replacements,
            "candidateReachPenalty": f"-{min(75, stale_count * 14 + 10)}% Modern Candidate Reach",
            "verdict": "Obsolete requirements detected that suppress modern applicant conversion." if stale_count > 0 else "Clean, contemporary job description with strong modern alignment.",
            "modernizedText": mod_text
        }
    
    # Save audit report to SQLite database
    try:
        audit_id = f"audit-{uuid.uuid4().hex[:8]}"
        save_jd_audit(audit_id, request.target_job_title, request.jd_text, res)
    except Exception as e:
        print(f"Database save error: {e}")
        
    return res

# History retrieval API
@app.get("/api/history/screenings")
async def get_history_screenings():
    return {"history": get_screening_history(limit=15)}

@app.get("/api/history/audits")
async def get_history_audits():
    return {"history": get_jd_audit_history(limit=15)}
