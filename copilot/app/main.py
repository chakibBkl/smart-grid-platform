import os
import sys
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .config import config
from .embeddings import vector_store
from .knowledge_base import initialize_knowledge_base
from .retrieval import retrieval_pipeline
from .llm_client import llm_client
from .conversation_memory import ConversationMemory
from ..prompts.templates import get_template, SYSTEM_PROMPT

class AIEnergyCopilot:
    def __init__(self):
        self.initialized = False

    def initialize(self):
        if not self.initialized:
            count = initialize_knowledge_base()
            self.initialized = True
            return count
        return 0

    async def process_message(
        self,
        message: str,
        conversation_id: Optional[str] = None,
    ) -> dict:
        if not self.initialized:
            self.initialize()

        if not conversation_id:
            import uuid
            conversation_id = str(uuid.uuid4())

        memory = ConversationMemory(conversation_id)

        retrieval_result = retrieval_pipeline.retrieve_with_context(
            message,
            conversation_history=memory.history if memory.message_count > 0 else None,
        )

        intent = self._detect_intent(message)
        template = get_template(intent)
        user_prompt = template.format(
            query=message,
            context=retrieval_result["context"],
        )

        response = await llm_client.generate(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

        memory.add_message("user", message)
        memory.add_message("assistant", response, metadata={
            "intent": intent,
            "sources": [d["metadata"].get("source", "") for d in retrieval_result["documents"]],
            "retrieval_scores": [d["score"] for d in retrieval_result["documents"]],
        })

        return {
            "reply": response,
            "conversation_id": conversation_id,
            "sources": [d["metadata"].get("source", "") for d in retrieval_result["documents"][:3]],
            "confidence": round(1 - min(retrieval_result["documents"][0]["score"], 0.5) / 0.5, 2) if retrieval_result["documents"] else 0.5,
            "intent": intent,
        }

    def _detect_intent(self, message: str) -> str:
        msg = message.lower()
        if any(w in msg for w in ["consumption", "load", "demand", "usage", "using"]):
            return "explain_consumption"
        if any(w in msg for w in ["buy", "sell", "purchase", "trade", "recommend"]):
            return "recommend_purchase"
        if any(w in msg for w in ["forecast", "predict", "future", "ahead"]):
            return "forecast_demand"
        if any(w in msg for w in ["market", "price", "conditions", "trading"]):
            return "market_conditions"
        if any(w in msg for w in ["report", "summary", "overview", "status"]):
            return "generate_report"
        return "explain_consumption"

copilot = AIEnergyCopilot()
