import os
import json
import requests
from typing import Dict, Any, List

# In a real environment, read from env var.
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

def get_jd_audit_llm(jd_text: str, target_job_title: str) -> Dict[str, Any]:
    """
    Calls an external LLM (e.g. OpenAI) to audit the job description for obsolete skills
    and suggest modern alternatives.
    """
    if not OPENAI_API_KEY:
        # Fallback response for demonstration if no API key is provided
        return None

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are an expert HR Technology and Tech Stack Auditor. 
    Analyze the following job description for the role of '{target_job_title}'.
    Identify any outdated, legacy, or obsolete technologies (e.g. Hadoop, SVN, Java 8, SOAP).
    Provide modern cloud/AI alternatives for each.
    Return ONLY a JSON object with the following structure:
    {{
        "staleKeywords": ["skill1", "skill2"],
        "suggestedReplacements": [
            {{"stale": "skill1", "modern": "modern_alternative1"}},
            {{"stale": "skill2", "modern": "modern_alternative2"}}
        ],
        "modernityScore": <int 0-100>
    }}
    
    Job Description:
    {jd_text}
    """
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json={
                "model": "gpt-4-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            },
            timeout=15
        )
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            # Clean up markdown JSON blocks if any
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
    except Exception as e:
        print(f"LLM API Error: {e}")
        
    return None

def forecast_skill_drift_llm(current_skills: List[str], target_job_title: str) -> List[Dict[str, Any]]:
    """
    Uses an LLM to semantically forecast skill drift for the next 5 years (2026-2031).
    """
    if not OPENAI_API_KEY:
        return None
        
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are a technical forecaster. Given the current emerging skills for {target_job_title}, 
    predict the trajectory of these skills and new paradigms emerging up to 2031.
    Current emerging skills: {current_skills}
    
    Return ONLY a JSON array of objects representing the timeline (1 per year, 2026 to 2031):
    [
        {{"year": 2026, "emerging_tech": ["tech1", "tech2"], "predicted_adoption_pct": 45}},
        ...
        {{"year": 2031, "emerging_tech": ["techX", "techY"], "predicted_adoption_pct": 85}}
    ]
    """
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json={
                "model": "gpt-4-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3
            },
            timeout=15
        )
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
    except Exception as e:
        print(f"LLM Forecasting Error: {e}")
        
    return None

def generate_learning_roadmap_llm(missing_skills: List[str], target_job_title: str) -> Dict[str, Any]:
    """
    Uses an LLM to generate a personalized, beginner-friendly learning roadmap and a Mermaid flowchart.
    """
    if not OPENAI_API_KEY:
        return None
        
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    You are an expert, empathetic career coach and technical mentor.
    A candidate wants to become a '{target_job_title}' but is missing the following modern skills:
    {missing_skills}
    
    Create a highly personalized, professional, and information-dense learning roadmap for them. 
    Explain concepts clearly but maintain an enterprise-grade, professional tone. Focus on how these skills connect to their career growth and market demand.
    
    Return ONLY a JSON object with this exact structure:
    {{
      "targetRole": "{target_job_title}",
      "primaryDomain": "Focus area (e.g. Modern Web, GenAI, MLOps)",
      "missingSkillsCount": {len(missing_skills)},
      "missingSkillsList": {json.dumps(missing_skills)},
      "estimatedTotalDuration": "E.g. 6-8 Weeks (Part-time)",
      "careerImpact": "A brief, highly professional 2-sentence explanation of how learning these skills will boost their marketability and career trajectory.",
      "mermaidFlowchart": "A valid Mermaid JS string (graph TD) showing the step-by-step learning journey, starting from basics to these new skills. Use nodes like A[Learn X] --> B[Master Y].",
      "stages": [
        {{
          "stageNumber": 1,
          "title": "Professional stage title",
          "timeframe": "E.g. Weeks 1-2",
          "focus": "A highly informative explanation of what they will learn and its industry relevance.",
          "milestones": ["Clear actionable step 1", "Clear actionable step 2"],
          "verifiedResources": [
             {{"name": "Course Name on Coursera/NPTEL/edX/MIT OCW", "url": "https://coursera.org/..."}}
          ]
        }}
      ]
    }}
    Ensure the JSON is valid and contains no markdown formatting outside of the string values.
    """
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json={
                "model": "gpt-4-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4
            },
            timeout=20
        )
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
    except Exception as e:
        print(f"LLM Roadmap Error: {e}")
        
    return None
