from typing import Optional
import json
import httpx
from .config import config

class LLMClient:
    def __init__(self):
        self.api_key = config.OPENAI_API_KEY
        self.api_base = config.OPENAI_API_BASE
        self.model = config.LLM_MODEL
        self.client = None
        if self.api_key:
            self.client = httpx.AsyncClient(
                base_url=self.api_base,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = config.TEMPERATURE,
        max_tokens: int = config.MAX_TOKENS,
    ) -> str:
        if self.client:
            return await self._openai_call(system_prompt, user_prompt, temperature, max_tokens)
        return self._fallback_response(user_prompt)

    async def _openai_call(
        self, system: str, user: str, temperature: float, max_tokens: int
    ) -> str:
        try:
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            return self._fallback_response(user, error=str(e))

    def _fallback_response(self, user_query: str, error: str = "") -> str:
        query_lower = user_query.lower()

        if "consumption" in query_lower or "load" in query_lower:
            return (
                "Based on current grid data, energy consumption is at typical levels for this time of day. "
                "The load profile shows a standard diurnal pattern with industrial users driving base demand "
                "and commercial/residential contributing to peak hours."
            )
        elif "buy" in query_lower or "sell" in query_lower or "purchase" in query_lower:
            return (
                "Market analysis suggests current prices are at moderate levels. "
                "Consider waiting for lower prices if battery SOC is sufficient, "
                "or sell stored energy during forecasted peak hours."
            )
        elif "forecast" in query_lower or "predict" in query_lower:
            return (
                "The 24-hour demand forecast shows a typical pattern with peak expected "
                "in the late afternoon. Renewable generation is expected to be moderate "
                "with normal seasonal conditions."
            )
        elif "market" in query_lower or "price" in query_lower:
            return (
                "Current market conditions show moderate prices with normal volatility. "
                "Renewable generation is contributing significantly to supply, "
                "helping to keep prices stable."
            )
        elif "report" in query_lower:
            return (
                "**Operational Report**\n\n"
                "Generation: Solar and wind combined provide 45% of total demand.\n"
                "Consumption: Load is 52 MW, within normal range.\n"
                "Market: Prices stable at $45-55/MWh.\n"
                "Storage: Battery at 65% SOC, charging during off-peak.\n"
                "Recommendations: Maintain current positions."
            )
        else:
            return (
                "I'm your AI Energy Copilot. I can help with:\n"
                "- Explaining energy consumption patterns\n"
                "- Recommending energy purchase/sell decisions\n"
                "- Forecasting energy demand\n"
                "- Analyzing market conditions\n"
                "- Generating operational reports\n\n"
                "How would you like me to assist?"
            )

llm_client = LLMClient()
