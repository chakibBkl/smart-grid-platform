from typing import Optional
import json
import os

MEMORY_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "memory")
os.makedirs(MEMORY_DIR, exist_ok=True)

class ConversationMemory:
    def __init__(self, conversation_id: str):
        self.conversation_id = conversation_id
        self.memory_file = os.path.join(MEMORY_DIR, f"{conversation_id}.json")
        self.history = self._load()

    def _load(self) -> list:
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, "r") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return []
        return []

    def _save(self):
        with open(self.memory_file, "w") as f:
            json.dump(self.history, f, indent=2)

    def add_message(self, role: str, content: str, metadata: Optional[dict] = None):
        self.history.append({
            "role": role,
            "content": content,
            "metadata": metadata or {},
            "timestamp": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        })
        self._save()

    def get_recent_context(self, n: int = 5) -> str:
        recent = self.history[-n:] if len(self.history) > n else self.history
        return "\n".join([f"{m['role']}: {m['content'][:200]}" for m in recent])

    def clear(self):
        self.history = []
        if os.path.exists(self.memory_file):
            os.remove(self.memory_file)

    @property
    def message_count(self) -> int:
        return len(self.history)

    @property
    def summary(self) -> dict:
        return {
            "conversation_id": self.conversation_id,
            "message_count": self.message_count,
            "last_message": self.history[-1]["content"][:100] if self.history else "",
            "last_updated": self.history[-1]["timestamp"] if self.history else "",
        }
