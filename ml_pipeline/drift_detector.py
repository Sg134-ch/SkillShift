import pandas as pd
import networkx as nx
import numpy as np
import re
from typing import List, Dict, Set, Any, Tuple

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except Exception:
    HAS_SENTENCE_TRANSFORMERS = False
    print("Notice: Running in lightweight semantic encoder mode.")

# Comprehensive 100+ Skill Ontology across Eras & Domains
SKILL_TAXONOMY = {
    # Generative AI & Emergent LLM Stack (High Concept Drift)
    'Generative AI': [
        'langchain', 'llamaindex', 'prompt engineering', 'rag', 'rag architecture',
        'vector databases', 'pinecone', 'chromadb', 'weaviate', 'qdrant', 'milvus',
        'lora', 'qlora', 'peft', 'fine-tuning', 'openai api', 'anthropic claude',
        'llms', 'large language models', 'vllm', 'ollama', 'hugging face', 'transformers',
        'triton inference server', 'semantic kernel', 'agentic workflows', 'langgraph',
        'whisper', 'stable diffusion', 'diffusion models', 'dsp'
    ],
    # Classical Data Science & Analytical Core (Baseline Evergreen)
    'Data Science': [
        'python', 'sql', 'r', 'pandas', 'numpy', 'scikit-learn', 'scipy',
        'xgboost', 'lightgbm', 'random forest', 'statistics', 'a/b testing',
        'hypothesis testing', 'linear regression', 'logistic regression',
        'tableau', 'power bi', 'matplotlib', 'seaborn', 'jupyter', 'excel'
    ],
    # Deep Learning & Neural Frameworks
    'Deep Learning': [
        'pytorch', 'tensorflow', 'keras', 'cuda', 'computer vision', 'opencv',
        'nlp', 'natural language processing', 'spacy', 'nltk', 'bert', 'embeddings'
    ],
    # Cloud, DevOps & MLOps Infrastructure
    'DevOps & MLOps': [
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'fastapi', 'flask',
        'mlflow', 'kubeflow', 'dvc', 'airflow', 'prefect', 'ci/cd', 'github actions',
        'terraform', 'linux', 'bash', 'kafka', 'spark', 'snowflake', 'dbt'
    ],
    # Modern Web & Full-Stack
    'Modern Web': [
        'react', 'next.js', 'nextjs', 'typescript', 'javascript', 'tailwind css',
        'tailwind', 'graphql', 'rest api', 'nodejs', 'express', 'supabase',
        'postgresql', 'mongodb', 'redis', 'html5', 'css3'
    ],
    # Legacy Stacks (Reverse Concept Drift / Deprecated)
    'Legacy Stack': [
        'hadoop', 'mapreduce', 'svn', 'subversion', 'java 8', 'soap', 'soap xml',
        'weka', 'perl', 'angularjs', 'jquery', 'bootstrap 3', 'sas', 'spss',
        'excel vba', 'apache ant', 'apache tomcat', 'ejb', 'struts'
    ]
}

# Inverted index for fast multi-token lookup
SKILL_TO_DOMAIN = {}
ALL_KNOWN_SKILLS = []
for domain, skills in SKILL_TAXONOMY.items():
    for skill in skills:
        SKILL_TO_DOMAIN[skill] = domain
        ALL_KNOWN_SKILLS.append(skill)

# Sort by length descending for greedy longest-match tokenization
ALL_KNOWN_SKILLS.sort(key=len, reverse=True)

def extract_skills_from_text(text: str) -> List[Dict[str, str]]:
    """
    Extracts structured technical skills from free-form resume or JD text.
    """
    text_clean = " " + re.sub(r'[^a-zA-Z0-9\+\#\.\-]', ' ', str(text).lower()) + " "
    found_skills = []
    matched_phrases = set()

    for skill in ALL_KNOWN_SKILLS:
        # Pattern ensures word boundaries or clean token separation
        pattern = r'(?:\b|\s)' + re.escape(skill) + r'(?:\b|\s)'
        if re.search(pattern, text_clean):
            # Avoid duplicate sub-substring matching
            if not any(skill in m for m in matched_phrases):
                matched_phrases.add(skill)
                found_skills.append({
                    'name': skill.title(),
                    'raw': skill,
                    'domain': SKILL_TO_DOMAIN[skill],
                    'isOOD': SKILL_TO_DOMAIN[skill] in ['Generative AI', 'Modern Web'] and skill not in ['react', 'javascript', 'python']
                })

    return found_skills

class LightweightSemanticEncoder:
    """
    Lightweight fallback embedding generator when sentence-transformers / PyTorch is not yet installed.
    Uses subword hash embeddings and normalized latent projections.
    """
    def __init__(self, dim=64):
        self.dim = dim

    def encode(self, texts):
        is_single = isinstance(texts, str)
        if is_single:
            texts = [texts]

        vectors = []
        for text in texts:
            vec = np.zeros(self.dim, dtype=np.float32)
            words = str(text).lower().replace('-', ' ').replace('/', ' ').split()
            for w in words:
                h1 = hash(w) % self.dim
                vec[h1] += 1.5
                for i in range(max(0, len(w) - 2)):
                    h2 = hash(w[i:i+3]) % self.dim
                    vec[h2] += 0.5
            norm = np.linalg.norm(vec)
            if norm > 1e-6:
                vec /= norm
            vectors.append(vec)

        arr = np.array(vectors)
        return arr[0] if is_single else arr

class SkillDriftDetector:
    def __init__(self, embedding_model="all-MiniLM-L6-v2"):
        if HAS_SENTENCE_TRANSFORMERS:
            try:
                self.encoder = SentenceTransformer(embedding_model)
            except Exception as e:
                print(f"Warning loading SentenceTransformer: {e}. Falling back to lightweight encoder.")
                self.encoder = LightweightSemanticEncoder()
        else:
            self.encoder = LightweightSemanticEncoder()
            
        try:
            from sklearn.ensemble import IsolationForest
            self.ood_detector = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        except Exception:
            class SimpleOOD:
                def __init__(self, **kwargs): pass
                def fit(self, X): pass
                def predict(self, X): return np.ones(len(X))
            self.ood_detector = SimpleOOD()
            
        # Default baseline vocabulary (2021 historical dataset)
        self.base_vocabulary = set(SKILL_TAXONOMY['Data Science'] + SKILL_TAXONOMY['Deep Learning'] + ['docker', 'aws', 'linux', 'java', 'c++'])
        self.co_occurrence_graph = nx.Graph()
        
        # Initial co-occurrence graph edges
        initial_edges = [
            ('python', 'sql', 10), ('python', 'pandas', 9), ('python', 'scikit-learn', 8),
            ('python', 'pytorch', 8), ('pytorch', 'tensorflow', 6), ('sql', 'tableau', 7),
            ('docker', 'aws', 8), ('docker', 'kubernetes', 7), ('fastapi', 'docker', 7),
            ('langchain', 'llms', 9), ('langchain', 'rag', 8), ('rag', 'vector databases', 8),
            ('python', 'langchain', 8), ('prompt engineering', 'llms', 8),
            ('react', 'typescript', 9), ('react', 'nextjs', 8), ('nextjs', 'tailwind css', 7)
        ]
        for u, v, w in initial_edges:
            self.co_occurrence_graph.add_edge(u, v, weight=w)

        self.is_fitted = True
        
    def fit_baseline(self, historical_skills_lists):
        if not historical_skills_lists:
            return

        for skills in historical_skills_lists:
            for skill in skills:
                if isinstance(skill, str) and skill.strip():
                    self.base_vocabulary.add(skill.strip().lower())
            
        all_skills = list(self.base_vocabulary)
        if len(all_skills) == 0:
            return
            
        for skills in historical_skills_lists:
            clean_skills = [s.strip().lower() for s in skills if isinstance(s, str) and s.strip()]
            for i in range(len(clean_skills)):
                for j in range(i+1, len(clean_skills)):
                    s1, s2 = clean_skills[i], clean_skills[j]
                    if self.co_occurrence_graph.has_edge(s1, s2):
                        self.co_occurrence_graph[s1][s2]['weight'] += 1
                    else:
                        self.co_occurrence_graph.add_edge(s1, s2, weight=1)

        try:
            embeddings = self.encoder.encode(all_skills)
            self.ood_detector.fit(embeddings)
        except Exception as e:
            print(f"OOD fit note: {e}")

        self.is_fitted = True

    def detect_drift(self, new_skills_lists):
        new_unique_skills = set()
        for skills in new_skills_lists:
            for skill in skills:
                if isinstance(skill, str) and skill.strip():
                    new_unique_skills.add(skill.strip().lower())
                    
        unseen_skills = list(new_unique_skills - self.base_vocabulary)
        if not unseen_skills:
            return []
            
        try:
            embeddings = self.encoder.encode(unseen_skills)
            predictions = self.ood_detector.predict(embeddings)
            ood_skills = [unseen_skills[i] for i in range(len(unseen_skills)) if predictions[i] == -1]
        except Exception:
            ood_keywords = ['prompt', 'langchain', 'ai', 'llm', 'rag', 'vector', 'lora', 'nextjs', 'tailwind', 'vllm']
            ood_skills = [s for s in unseen_skills if any(k in s.lower() for k in ood_keywords)]
        
        return ood_skills
        
    def update_graph(self, new_skills_lists):
        for skills in new_skills_lists:
            clean_skills = [s.strip().lower() for s in skills if isinstance(s, str) and s.strip()]
            for i in range(len(clean_skills)):
                for j in range(i+1, len(clean_skills)):
                    s1, s2 = clean_skills[i], clean_skills[j]
                    if self.co_occurrence_graph.has_edge(s1, s2):
                        self.co_occurrence_graph[s1][s2]['weight'] += 1
                    else:
                        self.co_occurrence_graph.add_edge(s1, s2, weight=1)
                        
    def get_graph_data(self, top_n_nodes=35):
        nodes = []
        edges = []
        
        sorted_nodes = sorted(self.co_occurrence_graph.degree(weight='weight'), key=lambda x: x[1], reverse=True)
        top_nodes = [n[0] for n in sorted_nodes[:top_n_nodes]]
        
        for node in top_nodes:
            domain = SKILL_TO_DOMAIN.get(node, 'Data Science')
            group_id = 1 if domain == 'Generative AI' else 2 if domain == 'Data Science' else 3 if domain == 'DevOps & MLOps' else 4
            nodes.append({
                "id": node, 
                "label": node.title(), 
                "group": group_id,
                "cluster": domain,
                "isOOD": domain in ['Generative AI', 'Modern Web']
            })
            
        for u, v, data in self.co_occurrence_graph.edges(data=True):
            if u in top_nodes and v in top_nodes:
                edges.append({"from": u, "to": v, "value": data.get('weight', 1)})
                
        return {"nodes": nodes, "edges": edges}

    def calculate_drift_score(self, candidate_skills: List[str]) -> Tuple[float, List[str]]:
        """
        Calculates normalized drift adaptation score and returns missing OOD skills.
        """
        if not candidate_skills:
            return 0.5, []
            
        clean_skills = [s.strip().lower() for s in candidate_skills if isinstance(s, str) and s.strip()]
        ood = self.detect_drift([clean_skills])
        in_vocab = [s for s in clean_skills if s in self.base_vocabulary]
        
        score = 0.45 + (len(in_vocab) * 0.05) + (len(ood) * 0.10)
        norm_score = float(max(0.0, min(1.0, score)))
        return round(norm_score, 2), ood

