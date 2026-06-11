from .embeddings import vector_store
from .config import config

class RetrievalPipeline:
    def __init__(self):
        self.vector_store = vector_store

    def retrieve(self, query: str, top_k: int = None) -> list[dict]:
        k = top_k or config.TOP_K_RETRIEVAL
        results = self.vector_store.similarity_search(query, k=k)

        for r in results:
            r["score"] = round(r["score"], 4)

        return results

    def retrieve_with_context(self, query: str, conversation_history: list = None) -> dict:
        enhanced_query = query
        if conversation_history and len(conversation_history) > 2:
            recent = conversation_history[-3:]
            context_str = " ".join([m.get("content", "") for m in recent if isinstance(m, dict)])
            enhanced_query = f"{query} [context: {context_str}]"

        documents = self.retrieve(enhanced_query)

        context = "\n\n".join([
            f"[Source: {d['metadata'].get('source', 'unknown')}] {d['content']}"
            for d in documents
        ])

        return {
            "context": context,
            "documents": documents,
            "query": query,
        }

retrieval_pipeline = RetrievalPipeline()
