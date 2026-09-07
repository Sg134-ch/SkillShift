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

# Initialize on import
init_db()
