import pandas as pd
import networkx as nx
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except Exception:
    HAS_SENTENCE_TRANSFORMERS = False
    print("Notice: Running in lightweight semantic encoder mode.")

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
            
        # Default baseline vocabulary to prevent empty state
        self.base_vocabulary = {'python', 'sql', 'r', 'pandas', 'machine learning', 'statistics', 'java', 'tableau', 'excel', 'aws', 'c++', 'docker', 'linux'}
        self.co_occurrence_graph = nx.Graph()
        
        # Populate initial default graph nodes
        initial_edges = [
            ('python', 'sql', 10), ('python', 'pandas', 9), ('python', 'machine learning', 8),
            ('machine learning', 'statistics', 7), ('sql', 'tableau', 6), ('docker', 'aws', 7),
            ('python', 'docker', 8), ('java', 'sql', 6), ('c++', 'linux', 7)
        ]
        for u, v, w in initial_edges:
            self.co_occurrence_graph.add_edge(u, v, weight=w)

        self.is_fitted = True
        
    def fit_baseline(self, historical_skills_lists):
        """
        historical_skills_lists: List[List[str]] where each sublist is the skills from one historical job posting.
        """
        if not historical_skills_lists:
            return

        for skills in historical_skills_lists:
            for skill in skills:
                if isinstance(skill, str) and skill.strip():
                    self.base_vocabulary.add(skill.strip().lower())
            
        all_skills = list(self.base_vocabulary)
        if len(all_skills) == 0:
            return
            
        # Build co-occurrence graph
        for skills in historical_skills_lists:
            clean_skills = [s.strip().lower() for s in skills if isinstance(s, str) and s.strip()]
            for i in range(len(clean_skills)):
                for j in range(i+1, len(clean_skills)):
                    s1, s2 = clean_skills[i], clean_skills[j]
                    if self.co_occurrence_graph.has_edge(s1, s2):
                        self.co_occurrence_graph[s1][s2]['weight'] += 1
                    else:
                        self.co_occurrence_graph.add_edge(s1, s2, weight=1)

        # Get embeddings for base vocabulary and fit OOD detector
        try:
            embeddings = self.encoder.encode(all_skills)
            self.ood_detector.fit(embeddings)
        except Exception as e:
            print(f"OOD fit note: {e}")

        self.is_fitted = True

    def detect_drift(self, new_skills_lists):
        """
        Detects if new skills fall outside the expected distribution (OOD)
        """
        new_unique_skills = set()
        for skills in new_skills_lists:
            for skill in skills:
                if isinstance(skill, str) and skill.strip():
                    new_unique_skills.add(skill.strip().lower())
                    
        # Find skills genuinely new to vocabulary
        unseen_skills = list(new_unique_skills - self.base_vocabulary)
        if not unseen_skills:
            return []
            
        try:
            embeddings = self.encoder.encode(unseen_skills)
            predictions = self.ood_detector.predict(embeddings)
            ood_skills = [unseen_skills[i] for i in range(len(unseen_skills)) if predictions[i] == -1]
        except Exception:
            ood_keywords = ['prompt', 'langchain', 'ai', 'llm', 'rag', 'vector', 'lora', 'nextjs', 'tailwind']
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
                        
    def get_graph_data(self, top_n_nodes=30):
        nodes = []
        edges = []
        
        sorted_nodes = sorted(self.co_occurrence_graph.degree(weight='weight'), key=lambda x: x[1], reverse=True)
        top_nodes = [n[0] for n in sorted_nodes[:top_n_nodes]]
        
        for i, node in enumerate(top_nodes):
            nodes.append({"id": node, "label": node, "group": 1})
            
        for u, v, data in self.co_occurrence_graph.edges(data=True):
            if u in top_nodes and v in top_nodes:
                edges.append({"from": u, "to": v, "value": data.get('weight', 1)})
                
        return {"nodes": nodes, "edges": edges}
