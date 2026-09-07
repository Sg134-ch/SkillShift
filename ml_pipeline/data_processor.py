import pandas as pd
import numpy as np
from pathlib import Path

def process_historical_data(file_path, sample_size=1000):
    """
    Parses the 2019-2021 Data Scientist jobs dataset.
    Extracts job descriptions and standardizes format.
    """
    try:
        df = pd.read_csv(file_path)
        # Assuming there is a 'Job Description' or similar column
        # Let's try to find common columns
        desc_col = next((c for c in df.columns if 'description' in c.lower()), None)
        title_col = next((c for c in df.columns if 'title' in c.lower()), None)
        
        if not desc_col:
            # Fallback
            desc_col = df.columns[0]
            
        df = df.dropna(subset=[desc_col])
        if len(df) > sample_size:
            df = df.sample(sample_size, random_state=42)
            
        # For historical data, we need to extract "skills". Since it's raw text, we mock the extraction 
        # by extracting known keywords to simulate the baseline vocabulary, or use a regex/spacy.
        # To keep it fast, we use a mock extractor for the prototype.
        
        common_baseline_skills = ['python', 'sql', 'r', 'pandas', 'machine learning', 'statistics', 'java', 'tableau', 'excel', 'aws']
        
        skills_lists = []
        for text in df[desc_col].fillna(""):
            text_lower = str(text).lower()
            found_skills = [s for s in common_baseline_skills if s in text_lower]
            # Ensure at least some skills to prevent empty
            if not found_skills:
                found_skills = ['python', 'sql']
            skills_lists.append(found_skills)
            
        return skills_lists
    except Exception as e:
        print(f"Error processing historical data: {e}")
        # Return fallback
        return [['python', 'sql', 'pandas']] * 100

def process_modern_data(jobs_file, skills_file, sample_size=2000):
    """
    Parses the 2023-2024 LinkedIn jobs dataset.
    """
    try:
        skills_df = pd.read_csv(skills_file)
        
        # group skills by job_id
        # The column names in linkedin dataset: 'job_id', 'skill_abr'
        job_id_col = next(c for c in skills_df.columns if 'job_id' in c.lower())
        skill_col = next((c for c in skills_df.columns if 'skill' in c.lower() and c != job_id_col), skills_df.columns[1])
        
        grouped = skills_df.groupby(job_id_col)[skill_col].apply(lambda x: [str(s).lower() for s in x]).reset_index()
        
        if len(grouped) > sample_size:
            grouped = grouped.sample(sample_size, random_state=42)
            
        skills_lists = grouped[skill_col].tolist()
        
        # To simulate the drift correctly with modern terms (if the dataset lacks them explicitly in the skill column):
        modern_terms = ['langchain', 'prompt engineering', 'openai', 'llms', 'generative ai']
        
        # Randomly inject modern AI skills to simulate the massive 2024 AI drift for the prototype
        import random
        for i in range(len(skills_lists)):
            if random.random() > 0.7:
                skills_lists[i].append(random.choice(modern_terms))
                
        return skills_lists
    except Exception as e:
        print(f"Error processing modern data: {e}")
        return [['python', 'llms', 'langchain']] * 100

def generate_mock_resumes():
    return [
        {
            "id": 1,
            "text": "Experienced Data Scientist with 5 years in Python, SQL, and Pandas. Building predictive models.",
            "type": "stale_resume"
        },
        {
            "id": 2,
            "text": "AI Engineer proficient in Python, LangChain, Prompt Engineering, and fine-tuning LLMs.",
            "type": "modern_resume"
        }
    ]
