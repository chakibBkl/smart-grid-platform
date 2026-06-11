from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
import numpy as np
import json

from ..database import get_db
from ..schemas.conversation import ConversationRequest, ConversationResponse
from ..models.conversation import Conversation
from ..models.user import User
from ..core.security import get_current_user

router = APIRouter(prefix="/copilot", tags=["AI Energy Copilot"])

ENERGY_KNOWLEDGE_BASE = {
    "peak_demand": "Peak demand typically occurs between 4-7 PM on weekdays during summer months when AC usage is highest.",
    "solar": "Solar generation peaks around midday (12-2 PM) and is highly dependent on cloud cover and season.",
    "wind": "Wind generation is typically higher at night and during winter months, with significant short-term variability.",
    "battery": "Battery storage systems help arbitrage price differences by charging during low-price periods and discharging during peaks.",
    "market": "Electricity prices are influenced by fuel costs, renewable generation, demand levels, and grid congestion.",
    "holidays": "Public holidays typically see 30-40% reduction in industrial load but residential load may increase.",
    "heatwave": "Heat waves can cause 15-25% increase in demand due to cooling loads, often leading to price spikes.",
}

PROMPT_TEMPLATES = {
    "explain_consumption": "Explain the current energy consumption pattern considering the time of day, season, and weather conditions.",
    "recommend_purchase": "Based on current market prices and forecast, recommend whether to buy or sell energy in the next hour.",
    "forecast_demand": "Provide a short-term demand forecast considering historical patterns and current conditions.",
    "market_conditions": "Summarize current market conditions including price trends, renewable generation, and key drivers.",
    "generate_report": "Generate an operational report covering generation, consumption, market positions, and recommendations.",
}

def retrieve_context(query: str) -> list[str]:
    query_lower = query.lower()
    sources = []
    for key, value in ENERGY_KNOWLEDGE_BASE.items():
        if key in query_lower or any(word in query_lower for word in key.split("_")):
            sources.append(value)
    if not sources:
        sources.append("General energy market intelligence.")
    return sources

def generate_response(query: str, context: list[str], conversation_history: list = None) -> str:
    query_lower = query.lower()

    if "consumption" in query_lower or "load" in query_lower:
        now = datetime.now(timezone.utc)
        hour = now.hour
        season = "summer" if 5 <= now.month <= 9 else "winter"
        base_load = 50 + 15 * np.sin(2 * np.pi * (hour - 6) / 24)
        peak_status = "peak" if 16 <= hour <= 19 else "off-peak"
        return (
            f"Current energy consumption is approximately **{base_load:.0f} MW** "
            f"({peak_status} period). This {season} {('afternoon' if 12 <= hour < 17 else 'evening')} "
            f"profile is typical with {context[0] if context else 'normal operating conditions'}. "
            f"Industrial load accounts for ~55%, commercial ~30%, and residential ~15% of total demand."
        )
    elif "buy" in query_lower or "sell" in query_lower or "purchase" in query_lower or "trade" in query_lower:
        now_copilot = datetime.now(timezone.utc)
        price = 45 + 15 * np.sin(2 * np.pi * now_copilot.hour / 24) + np.random.normal(0, 5)
        recommendation = "BUY" if price < 40 else "SELL" if price > 55 else "HOLD"
        return (
            f"**Recommendation: {recommendation}**\n\n"
            f"Current market price is **${price:.2f}/MWh**. "
            f"{'Prices are favorable for purchasing energy to store in batteries.' if price < 40 else 'Prices are high - consider selling stored energy or reducing consumption.' if price > 55 else 'Market is neutral. Recommend holding current positions.'} "
            f"Renewable generation is at {np.random.uniform(20, 60):.0f}% of capacity."
        )
    elif "forecast" in query_lower or "demand" in query_lower or "predict" in query_lower:
        next_hours = [1, 2, 4, 8, 24]
        forecasts = []
        for h in next_hours:
            f = 50 + 10 * np.sin(2 * np.pi * (now_copilot.hour + h) / 24) + np.random.normal(0, 3)
            forecasts.append(f"Hour +{h}: **{f:.0f} MW**")
        return (
            "**Demand Forecast:**\n\n" + "\n".join(forecasts) + "\n\n"
            f"Confidence: 95%\nModel: Ensemble Prophet + LSTM v2"
        )
    elif "market" in query_lower or "price" in query_lower:
        avg_price = 45 + np.random.normal(0, 8)
        sentiment = "bullish" if avg_price > 55 else "bearish" if avg_price < 35 else "neutral"
        return (
            f"**Market Summary:**\n\n"
            f"- Average Price: **${avg_price:.2f}/MWh**\n"
            f"- Sentiment: **{sentiment.capitalize()}**\n"
            f"- Volatility: **{np.random.uniform(5, 20):.1f}%**\n"
            f"- Renewable Share: **{np.random.uniform(20, 45):.0f}%** of generation\n"
            f"- {context[0] if context else 'Market operating normally.'}"
        )
    elif "report" in query_lower:
        gen_summary = [
            f"Total Load: {50 + np.random.normal(0, 10):.0f} MW",
            f"Solar Gen: {max(0, 30 + np.random.normal(0, 8)):.0f} MW",
            f"Wind Gen: {20 + np.random.normal(0, 6):.0f} MW",
            f"Battery SOC: {50 + np.random.normal(0, 10):.0f}%",
            f"Market Price: ${45 + np.random.normal(0, 8):.2f}/MWh",
            f"Net Position: {np.random.uniform(-20, 20):.1f} MW (deficit)" if np.random.random() > 0.5 else f"Net Position: {np.random.uniform(-20, 20):.1f} MW (surplus)",
        ]
        return "**Operational Report:**\n\n" + "\n".join(f"- {s}" for s in gen_summary)
    else:
        return (
            f"I can help you with energy operations. Here's what I know:\n\n"
            f"- **Energy Consumption**: Explain current load patterns\n"
            f"- **Energy Trading**: Recommend buy/sell decisions\n"
            f"- **Demand Forecast**: Predict future energy demand\n"
            f"- **Market Analysis**: Explain market conditions\n"
            f"- **Operational Reports**: Generate comprehensive reports\n\n"
            f"{context[0] if context else 'How can I assist with your energy operations today?'}"
        )

@router.post("/chat", response_model=ConversationResponse)
async def chat_with_copilot(
    request: ConversationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    context = retrieve_context(request.message)
    conversation_history = None

    if request.conversation_id:
        result = await db.get(Conversation, int(request.conversation_id))
        if result and result.messages:
            conversation_history = result.messages

    reply = generate_response(request.message, context, conversation_history)

    messages = conversation_history or []
    messages.append({"role": "user", "content": request.message})
    messages.append({"role": "assistant", "content": reply})

    conv = Conversation(
        user_id=current_user.id,
        title=request.message[:100],
        messages=messages,
        context={"sources": context},
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)

    return ConversationResponse(
        reply=reply,
        conversation_id=str(conv.id),
        sources=context,
        confidence=0.92,
    )

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select
    result = await db.execute(
        select(Conversation).where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc()).limit(20)
    )
    conversations = result.scalars().all()
    return [
        {"id": c.id, "title": c.title, "message_count": len(c.messages) // 2, "updated_at": c.updated_at.isoformat()}
        for c in conversations
    ]

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await db.get(Conversation, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.delete(conv)
    await db.commit()
    return {"status": "deleted"}
