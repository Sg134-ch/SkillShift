import os
from pathlib import Path

# Important: this must be imported after kaggle.json is present
import kaggle

# Datasets to download
DATASETS = [
    {"name": "arshkon/linkedin-job-postings", "dir": "linkedin-jobs-2023-2024"},
    {"name": "andrewmvd/data-scientist-jobs", "dir": "data-scientist-jobs-2021"},
    {"name": "gauravduttakiit/resume-dataset", "dir": "resume-dataset"}
]

DATA_DIR = Path("data")

def download_datasets():
    kaggle.api.authenticate()
    DATA_DIR.mkdir(exist_ok=True)
    
    for ds in DATASETS:
        target_dir = DATA_DIR / ds["dir"]
        if target_dir.exists() and any(target_dir.iterdir()):
            print(f"Dataset {ds['name']} already downloaded in {target_dir}")
            continue
            
        print(f"Downloading {ds['name']}...")
        target_dir.mkdir(exist_ok=True)
        try:
            kaggle.api.dataset_download_files(ds["name"], path=str(target_dir), unzip=True)
            print(f"Successfully downloaded and unzipped {ds['name']}")
        except Exception as e:
            print(f"Failed to download {ds['name']}. Error: {e}")

if __name__ == "__main__":
    download_datasets()
