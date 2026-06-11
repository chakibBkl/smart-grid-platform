import os
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .config import config

class VectorStore:
    def __init__(self):
        self.documents = []
        self.metadatas = []
        self.ids = []
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        self._fitted = False
        self._vectors = None

    def add_documents(self, documents: list[dict]) -> int:
        count = 0
        for doc in documents:
            doc_id = str(hash(doc["content"]))
            if doc_id not in self.ids:
                self.documents.append(doc["content"])
                self.metadatas.append(doc.get("metadata", {}))
                self.ids.append(doc_id)
                count += 1

        if self.documents:
            self._vectors = self.vectorizer.fit_transform(self.documents)
            self._fitted = True

        return count

    def similarity_search(self, query: str, k: int = 5) -> list[dict]:
        if not self._fitted or not self.documents:
            return []

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self._vectors)[0]
        top_indices = np.argsort(similarities)[::-1][:k]

        results = []
        for idx in top_indices:
            results.append({
                "content": self.documents[idx],
                "metadata": self.metadatas[idx],
                "score": round(float(similarities[idx]), 4),
            })
        return results

    def delete_collection(self):
        self.documents = []
        self.metadatas = []
        self.ids = []
        self._vectors = None
        self._fitted = False

vector_store = VectorStore()
