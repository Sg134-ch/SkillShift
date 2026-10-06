import uuid
import random
from datetime import datetime
from ml_pipeline.drift_detector import extract_skills_from_text
from backend.database import get_drift_timeline, save_drift_metric, save_raw_job

class JobBoardClient:
    """
    Pluggable Job Board Client.
    Currently uses a mock generator to simulate live API responses from Adzuna/LinkedIn 
    to avoid rate limits or requiring enterprise API keys.
    """
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        
    def fetch_recent_jobs(self, limit: int = 20):
        # Simulated responses mimicking a live API payload
        modern_tech = ["Next.js 15", "Gemini Pro", "vLLM", "Agentic Workflows", "LangGraph", "ChromaDB", "Anthropic Claude", "Qdrant", "Ollama"]
        companies = ["TechNova", "AI Frontier", "DataDynamics", "CloudScale", "Stripe", "OpenAI", "Databricks"]
        titles = ["AI Engineer", "Machine Learning Engineer", "Full Stack Developer", "Data Scientist"]
        
        jobs = []
        for _ in range(limit):
            job_id = f"job-{uuid.uuid4().hex[:8]}"
            title = random.choice(titles)
            company = random.choice(companies)
            
            # Create a realistic sounding job description with some modern drift
            selected_modern = random.sample(modern_tech, k=random.randint(1, 3))
            base_skills = ["Python", "SQL", "React", "Docker", "AWS", "Machine Learning"]
            selected_base = random.sample(base_skills, k=random.randint(2, 4))
            
            raw_text = f"We are looking for a {title} at {company}. " \
                       f"You should have strong experience with {', '.join(selected_base)}. " \
                       f"Additionally, you will be working with cutting edge tools including {', '.join(selected_modern)}."
                       
            jobs.append({
                "id": job_id,
                "title": title,
                "company": company,
                "description": raw_text
            })
            
        return jobs

    # Future state: Just replace the simulation with this!
    # def fetch_recent_jobs(self, limit: int = 20):
    #     response = requests.get(f"https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=YOUR_ID&app_key={self.api_key}&results_per_page={limit}")
    #     
    #     jobs = []
    #     for raw_job in response.json()['results']:
    #         jobs.append({
    #             "id": raw_job['id'],
    #             "title": raw_job['title'],
    #             "company": raw_job['company']['display_name'],
    #             "description": raw_job['description'] # The ML Pipeline will analyze this!
    #         })
    #     return jobs

def run_ingestion_cycle():
    """
    Fetches new jobs, analyzes them for new skills (concept drift), 
    and updates the database.
    """
    client = JobBoardClient()
    print("Fetching live jobs from API...")
    jobs = client.fetch_recent_jobs(limit=25)
    
    timeline = get_drift_timeline()
    if not timeline:
        last_metric = {"month": "2024-05", "vocab_size": 2975, "new_skills_detected": 33, "emerging_skills": []}
    else:
        last_metric = timeline[-1]
        
    current_month = datetime.utcnow().strftime("%Y-%m")
    
    # If we already have a record for this month, we'll build on it
    if last_metric["month"] == current_month:
        current_vocab_size = last_metric["vocab_size"]
        current_new_skills = last_metric["new_skills_detected"]
        emerging_skills = set(last_metric["emerging_skills"])
    else:
        # It's a new month
        current_vocab_size = last_metric["vocab_size"]
        current_new_skills = 0
        emerging_skills = set()
        
    for job in jobs:
        # Extract skills using the ML pipeline
        extracted = extract_skills_from_text(job["description"])
        extracted_names = [s["name"] for s in extracted]
        
        # Save the raw job for auditing
        save_raw_job(job["id"], job["title"], job["company"], job["description"], extracted_names)
        
        # Check for Out of Distribution (OOD) / Drift
        for s in extracted:
            if s.get("isOOD", False) or s.get("domain") == "Emerging Tech":
                if s["name"] not in emerging_skills:
                    emerging_skills.add(s["name"])
                    current_new_skills += 1
                    current_vocab_size += 1

    # Save updated metrics
    save_drift_metric(
        month=current_month, 
        vocab_size=current_vocab_size, 
        new_skills_detected=current_new_skills, 
        emerging_skills=list(emerging_skills)
    )
    
    print(f"Ingestion complete. Added {current_new_skills} new skills to vocabulary.")
    return {
        "status": "success",
        "jobs_processed": len(jobs),
        "new_skills_found": current_new_skills,
        "emerging_skills": list(emerging_skills)
    }

def fetch_recent_jobs(self, limit: int = 20):
    response = requests.get(f"https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=YOUR_ID&app_key={self.api_key}&results_per_page={limit}")
    
    jobs = []
    for raw_job in response.json()['results']:
        jobs.append({
            "id": raw_job['id'],
            "title": raw_job['title'],
            "company": raw_job['company']['display_name'],
            "description": raw_job['description'] # The ML Pipeline will analyze this!
        })
    return jobs
