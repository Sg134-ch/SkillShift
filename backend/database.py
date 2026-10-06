import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "skillshift.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Screening Runs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS screening_runs (
        id TEXT PRIMARY KEY,
        target_role TEXT NOT NULL,
        total_screened INTEGER NOT NULL,
        false_negatives INTEGER NOT NULL,
        false_negative_rate TEXT NOT NULL,
        avg_adaptation_gain TEXT NOT NULL,
        candidates_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Candidate Profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        resume_snippet TEXT,
        legacy_score REAL,
        adapted_score REAL,
        rank_shift INTEGER,
        verdict TEXT,
        flagged_skills_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Job Description Audits table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jd_audits (
        id TEXT PRIMARY KEY,
        role_title TEXT NOT NULL,
        raw_text TEXT NOT NULL,
        modernity_score INTEGER NOT NULL,
        optimized_score INTEGER NOT NULL,
        penalty_text TEXT,
        stale_keywords_json TEXT,
        replacements_json TEXT,
        modernized_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Company Demands table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS company_demands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT,
        tier TEXT,
        logoColor TEXT,
        roleTitle TEXT,
        department TEXT,
        salaryBand TEXT,
        location TEXT,
        hiringUrgency TEXT,
        growthPct TEXT,
        requiredSkills_json TEXT,
        emergingSkills_json TEXT,
        description TEXT
    )
    """)
    
    # Job Profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS job_profiles (
        title TEXT PRIMARY KEY,
        stale_profile TEXT NOT NULL,
        adapted_profile TEXT NOT NULL
    )
    """)
    
    # Drift Metrics table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drift_metrics (
        month TEXT PRIMARY KEY,
        vocab_size INTEGER NOT NULL,
        new_skills_detected INTEGER NOT NULL,
        emerging_skills_json TEXT NOT NULL
    )
    """)
    
    # Live Job Postings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS live_job_postings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT,
        raw_text TEXT NOT NULL,
        extracted_skills_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()

# --- CRUD Operations for Screening Runs ---

def save_screening_run(run_id: str, target_role: str, metrics: Dict[str, Any], candidates: List[Dict[str, Any]]):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT OR REPLACE INTO screening_runs 
    (id, target_role, total_screened, false_negatives, false_negative_rate, avg_adaptation_gain, candidates_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        run_id,
        target_role,
        metrics.get("totalScreened", len(candidates)),
        metrics.get("falseNegativesRecovered", 0),
        metrics.get("falseNegativeRate", "0%"),
        metrics.get("averageAdaptationGain", "+0%"),
        json.dumps(candidates),
        datetime.utcnow().isoformat()
    ))
    
    # Save individual candidates
    for c in candidates:
        cursor.execute("""
        INSERT OR REPLACE INTO candidates
        (id, name, title, resume_snippet, legacy_score, adapted_score, rank_shift, verdict, flagged_skills_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c.get("id"),
            c.get("name"),
            c.get("title"),
            c.get("resumeSnippet", ""),
            c.get("legacyAtsScore", 0.0),
            c.get("adaptedModelScore", 0.0),
            c.get("rankShift", 0),
            c.get("verdict", ""),
            json.dumps(c.get("flaggedSkills", [])),
            datetime.utcnow().isoformat()
        ))
        
    conn.commit()
    conn.close()

def get_screening_history(limit: int = 20) -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id, target_role, total_screened, false_negatives, false_negative_rate, avg_adaptation_gain, candidates_json, created_at
    FROM screening_runs
    ORDER BY created_at DESC
    LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "targetRole": r["target_role"],
            "totalScreened": r["total_screened"],
            "falseNegatives": r["false_negatives"],
            "falseNegativeRate": r["false_negative_rate"],
            "avgAdaptationGain": r["avg_adaptation_gain"],
            "candidates": json.loads(r["candidates_json"]),
            "createdAt": r["created_at"]
        })
        
    conn.close()
    return results

# --- CRUD Operations for JD Audits ---

def save_jd_audit(audit_id: str, role_title: str, raw_text: str, result: Dict[str, Any]):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT OR REPLACE INTO jd_audits
    (id, role_title, raw_text, modernity_score, optimized_score, penalty_text, stale_keywords_json, replacements_json, modernized_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        audit_id,
        role_title,
        raw_text,
        result.get("modernityScore", 50),
        result.get("optimizedScore", 95),
        result.get("candidateReachPenalty", ""),
        json.dumps(result.get("staleKeywords", [])),
        json.dumps(result.get("suggestedReplacements", [])),
        result.get("modernizedText", ""),
        datetime.utcnow().isoformat()
    ))
    
    conn.commit()
    conn.close()

def get_jd_audit_history(limit: int = 20) -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id, role_title, raw_text, modernity_score, optimized_score, penalty_text, stale_keywords_json, replacements_json, modernized_text, created_at
    FROM jd_audits
    ORDER BY created_at DESC
    LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "roleTitle": r["role_title"],
            "rawText": r["raw_text"],
            "modernityScore": r["modernity_score"],
            "optimizedScore": r["optimized_score"],
            "candidateReachPenalty": r["penalty_text"],
            "staleKeywords": json.loads(r["stale_keywords_json"]),
            "suggestedReplacements": json.loads(r["replacements_json"]),
            "modernizedText": r["modernized_text"],
            "createdAt": r["created_at"]
        })
        
    conn.close()
    return results

def seed_initial_data():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Seed Drift Metrics
    cursor.execute("SELECT COUNT(*) FROM drift_metrics")
    drift_count = cursor.fetchone()[0]
    
    if drift_count == 0:
        drift_timeline = [
            {"month": "2023-01", "vocab_size": 2450, "new_skills_detected": 14, "emerging_skills": []},
            {"month": "2023-03", "vocab_size": 2518, "new_skills_detected": 46, "emerging_skills": []},
            {"month": "2023-06", "vocab_size": 2621, "new_skills_detected": 31, "emerging_skills": []},
            {"month": "2023-09", "vocab_size": 2728, "new_skills_detected": 42, "emerging_skills": []},
            {"month": "2023-12", "vocab_size": 2806, "new_skills_detected": 18, "emerging_skills": []},
            {"month": "2024-03", "vocab_size": 2894, "new_skills_detected": 35, "emerging_skills": []},
            {"month": "2024-05", "vocab_size": 2975, "new_skills_detected": 33, "emerging_skills": []}
        ]
        for d in drift_timeline:
            cursor.execute("""
            INSERT INTO drift_metrics (month, vocab_size, new_skills_detected, emerging_skills_json)
            VALUES (?, ?, ?, ?)
            """, (d["month"], d["vocab_size"], d["new_skills_detected"], json.dumps(d["emerging_skills"])))
            
    cursor.execute("SELECT COUNT(*) FROM company_demands")
    companies_count = cursor.fetchone()[0]
    
    if companies_count == 0:
        # Seed Companies
        companies = [
            {
                "id": "databricks", "name": "Databricks", "industry": "Data & AI Lakehouse", "tier": "AI Unicorn / Enterprise",
                "logoColor": "#ff3621", "roleTitle": "GenAI Applications Engineer", "department": "AI Solutions & MosaicML",
                "salaryBand": "$165,000 - $215,000", "location": "San Francisco, CA (Hybrid / Remote)",
                "hiringUrgency": "Surging Demand 🔥", "growthPct": "+240%",
                "requiredSkills": ["Python", "LangChain", "RAG Architecture", "FastAPI", "Vector Databases", "PyTorch"],
                "emergingSkills": ["Vector Databases", "LangChain", "RAG Architecture", "LoRA Fine-Tuning"],
                "description": "Building next-generation generative AI workflows and custom LLM inference pipelines on MosaicML and Lakehouse architecture."
            },
            {
                "id": "openai", "name": "OpenAI", "industry": "Frontier AI Research", "tier": "Frontier Lab",
                "logoColor": "#10a37f", "roleTitle": "AI Platform Systems Engineer", "department": "Applied Engineering",
                "salaryBand": "$200,000 - $285,000", "location": "San Francisco, CA (Hybrid)",
                "hiringUrgency": "Surging Demand 🔥", "growthPct": "+310%",
                "requiredSkills": ["Python", "PyTorch", "Docker", "Kubernetes", "FastAPI", "Distributed Systems"],
                "emergingSkills": ["vLLM", "Triton Inference", "Prompt Engineering", "LoRA / Fine-Tuning"],
                "description": "Scale high-throughput API endpoints and orchestrate distributed model evaluation infrastructure for millions of developers."
            },
            {
                "id": "anthropic", "name": "Anthropic", "industry": "AI Safety & Large Models", "tier": "Frontier Lab",
                "logoColor": "#d97706", "roleTitle": "Prompt Systems & Evaluation Engineer", "department": "Model Alignment & Product",
                "salaryBand": "$180,000 - $240,000", "location": "San Francisco, CA (Hybrid / Remote)",
                "hiringUrgency": "Surging Demand 🔥", "growthPct": "+280%",
                "requiredSkills": ["Python", "Prompt Engineering", "Statistics", "Scikit-Learn", "FastAPI", "TypeScript"],
                "emergingSkills": ["Prompt Engineering", "RAG Architecture", "LlamaIndex"],
                "description": "Develop automated benchmarking pipelines and evaluate safety steering across frontier Claude model architectures."
            },
            {
                "id": "scale-ai", "name": "Scale AI", "industry": "Data Engine for Enterprise AI", "tier": "AI Unicorn",
                "logoColor": "#ec4899", "roleTitle": "LLM Fine-Tuning Specialist", "department": "Generative AI Platform",
                "salaryBand": "$160,000 - $210,000", "location": "New York, NY / Remote",
                "hiringUrgency": "High Growth ⚡", "growthPct": "+190%",
                "requiredSkills": ["Python", "PyTorch", "LoRA / PEFT", "Hugging Face", "SQL", "Docker"],
                "emergingSkills": ["LoRA / Fine-Tuning", "Vector Databases", "Llama 3 Adaptation"],
                "description": "Create customized model adaptation runs and RLHF alignment datasets for Fortune 500 enterprise clients."
            },
            {
                "id": "snowflake", "name": "Snowflake", "industry": "Data Cloud & Cortex AI", "tier": "Public Enterprise",
                "logoColor": "#29b5e8", "roleTitle": "MLOps & Cortex AI Developer", "department": "Data Cloud Platforms",
                "salaryBand": "$155,000 - $205,000", "location": "San Mateo, CA / Remote",
                "hiringUrgency": "High Growth ⚡", "growthPct": "+145%",
                "requiredSkills": ["Python", "SQL", "AWS", "Docker", "FastAPI", "Snowpark ML"],
                "emergingSkills": ["Vector Search", "LangChain", "Cortex LLMs"],
                "description": "Enable serverless LLM query features and semantic search capabilities across petabyte-scale data warehouses."
            },
            {
                "id": "stripe", "name": "Stripe", "industry": "Financial Infrastructure", "tier": "FinTech Giant",
                "logoColor": "#635bff", "roleTitle": "Machine Learning Infrastructure Engineer", "department": "Radar Fraud & Risk ML",
                "salaryBand": "$175,000 - $230,000", "location": "Seattle, WA / San Francisco, CA / Remote",
                "hiringUrgency": "Active Hiring ✅", "growthPct": "+65%",
                "requiredSkills": ["Python", "SQL", "Docker", "Kubernetes", "AWS", "Scikit-Learn", "PyTorch"],
                "emergingSkills": ["FastAPI", "Vector Databases", "Streaming Inference"],
                "description": "Architect low-latency ML scoring systems processing hundreds of millions of transaction requests daily."
            },
            {
                "id": "mistral-ai", "name": "Mistral AI", "industry": "Open-Weight Frontier Models", "tier": "Frontier AI Unicorn",
                "logoColor": "#f97316", "roleTitle": "Open Source Model Optimization Engineer", "department": "Core Inference Team",
                "salaryBand": "$170,000 - $230,000", "location": "Paris, France / Remote EU & US",
                "hiringUrgency": "Surging Demand 🔥", "growthPct": "+350%",
                "requiredSkills": ["Python", "C++", "PyTorch", "CUDA", "Docker", "Hugging Face"],
                "emergingSkills": ["vLLM", "Quantization (AWQ/GGUF)", "LoRA Fine-Tuning"],
                "description": "Optimize ultra-efficient inference runtimes for open-weight models (Mistral, Mixtral) on edge and cloud clusters."
            },
            {
                "id": "microsoft", "name": "Microsoft", "industry": "Cloud & AI Copilot", "tier": "Big Tech",
                "logoColor": "#00a4ef", "roleTitle": "Azure AI & Semantic Kernel Engineer", "department": "Azure AI Platform",
                "salaryBand": "$160,000 - $220,000", "location": "Redmond, WA / Remote",
                "hiringUrgency": "High Growth ⚡", "growthPct": "+110%",
                "requiredSkills": ["Python", "C#", "Azure", "Docker", "FastAPI", "SQL"],
                "emergingSkills": ["Semantic Kernel", "Vector Databases", "RAG Architecture", "Prompt Engineering"],
                "description": "Build enterprise-grade Copilot orchestration backends and vector indexing pipelines on Azure OpenAI Service."
            }
        ]
        
        for c in companies:
            cursor.execute("""
            INSERT INTO company_demands 
            (id, name, industry, tier, logoColor, roleTitle, department, salaryBand, location, hiringUrgency, growthPct, requiredSkills_json, emergingSkills_json, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["id"], c["name"], c["industry"], c["tier"], c["logoColor"], c["roleTitle"], c["department"],
                c["salaryBand"], c["location"], c["hiringUrgency"], c["growthPct"],
                json.dumps(c["requiredSkills"]), json.dumps(c["emergingSkills"]), c["description"]
            ))
            
    cursor.execute("SELECT COUNT(*) FROM job_profiles")
    profiles_count = cursor.fetchone()[0]
    
    if profiles_count == 0:
        # Seed Job Profiles
        profiles = {
            "Software Engineer": {
                "stale": "software engineer java 8 c++ javascript jquery react html css svn subversion soap web services front-end back-end bare-metal",
                "adapted": "software engineer react 19 nextjs 14 typescript tailwind css nodejs python fastapi docker kubernetes aws microservices graphql rest serverless"
            },
            "Data Scientist": {
                "stale": "data scientist sas spss excel vba r statistics sql pandas scikit-learn machine learning tableau predictive modeling monolithic scripts",
                "adapted": "data scientist python sql pandas scikit-learn machine learning pytorch transformers deep learning big data snowflake dbt mlflow experiment tracking"
            },
            "Machine Learning Engineer": {
                "stale": "machine learning engineer hadoop mapreduce java 8 weka scikit-learn python perl classical ml data pipelines svn ant",
                "adapted": "machine learning engineer python deep learning pytorch langchain prompt engineering llms rag architecture vector databases lora fine-tuning fastapi docker aws kubernetes vllm"
            }
        }
        
        for title, p in profiles.items():
            cursor.execute("""
            INSERT INTO job_profiles (title, stale_profile, adapted_profile)
            VALUES (?, ?, ?)
            """, (title, p["stale"], p["adapted"]))
            
    conn.commit()
    conn.close()

# --- New Getters ---

def get_companies_from_db(skill: str = None, domain: str = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM company_demands")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"], "name": r["name"], "industry": r["industry"], "tier": r["tier"],
            "logoColor": r["logoColor"], "roleTitle": r["roleTitle"], "department": r["department"],
            "salaryBand": r["salaryBand"], "location": r["location"], "hiringUrgency": r["hiringUrgency"],
            "growthPct": r["growthPct"], "requiredSkills": json.loads(r["requiredSkills_json"]),
            "emergingSkills": json.loads(r["emergingSkills_json"]), "description": r["description"]
        })
        
    # Apply filters
    if skill:
        skill_lower = skill.lower().strip()
        results = [
            c for c in results 
            if any(skill_lower in s.lower() for s in c["requiredSkills"] + c["emergingSkills"])
            or skill_lower in c["roleTitle"].lower()
        ]
    if domain and domain != "all":
        results = [c for c in results if domain.lower() in c["industry"].lower() or domain.lower() in c["roleTitle"].lower()]
        
    return results

def get_job_profile_from_db(title: str) -> Dict[str, str]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT stale_profile, adapted_profile FROM job_profiles WHERE LOWER(title) = LOWER(?)", (title,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"stale": row["stale_profile"], "adapted": row["adapted_profile"]}
    return None

# --- CRUD for Ingestion & Drift ---

def save_drift_metric(month: str, vocab_size: int, new_skills_detected: int, emerging_skills: List[str]):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO drift_metrics (month, vocab_size, new_skills_detected, emerging_skills_json)
    VALUES (?, ?, ?, ?)
    """, (month, vocab_size, new_skills_detected, json.dumps(emerging_skills)))
    conn.commit()
    conn.close()

def get_drift_timeline() -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT month, vocab_size, new_skills_detected, emerging_skills_json FROM drift_metrics ORDER BY month ASC")
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "month": r["month"],
            "vocab_size": r["vocab_size"],
            "new_skills_detected": r["new_skills_detected"],
            "emerging_skills": json.loads(r["emerging_skills_json"])
        })
    return results

def save_raw_job(job_id: str, title: str, company: str, raw_text: str, extracted_skills: List[str]):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO live_job_postings (id, title, company, raw_text, extracted_skills_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (job_id, title, company, raw_text, json.dumps(extracted_skills), datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

# Initialize on import
init_db()
seed_initial_data()
