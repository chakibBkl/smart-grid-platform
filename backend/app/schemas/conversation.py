from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConversationRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ConversationResponse(BaseModel):
    reply: str
    conversation_id: str
    sources: list[str] = []
    confidence: float = 0.0
