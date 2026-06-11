KNOWLEDGE_DOCUMENTS = [
    {
        "content": "Peak demand in smart grids typically occurs between 4-7 PM on weekdays during summer months when air conditioning usage is highest. Industrial users account for approximately 55% of total demand, commercial users 30%, and residential users 15%.",
        "metadata": {"category": "demand_patterns", "source": "grid_operations_manual"},
    },
    {
        "content": "Solar photovoltaic generation follows a diurnal pattern with peak output between 12-2 PM solar noon. Generation is highly dependent on cloud cover, season, and panel orientation. Winter generation is typically 40% of summer peak due to lower solar elevation angles.",
        "metadata": {"category": "renewable_generation", "source": "solar_operations"},
    },
    {
        "content": "Wind generation exhibits significant short-term variability due to changing weather patterns. Output follows a cubic relationship with wind speed, with typical cut-in speeds of 3-4 m/s and cut-out speeds of 25 m/s. Nighttime generation is often higher due to atmospheric stability.",
        "metadata": {"category": "renewable_generation", "source": "wind_operations"},
    },
    {
        "content": "Battery energy storage systems provide grid services including energy arbitrage (charging at low prices, discharging at high prices), frequency regulation, and renewable firming. Round-trip efficiency is typically 85-92% for lithium-ion systems.",
        "metadata": {"category": "storage", "source": "battery_systems"},
    },
    {
        "content": "Electricity market prices are determined by the marginal cost of generation, influenced by fuel costs (natural gas, coal), carbon prices, renewable generation levels, demand levels, and transmission constraints. Negative prices can occur during periods of high renewable generation and low demand.",
        "metadata": {"category": "market", "source": "market_operations"},
    },
    {
        "content": "Public holidays typically see 30-40% reduction in industrial and commercial load, while residential load may increase by 10-15%. Holiday effects should be incorporated in demand forecasting models to improve accuracy.",
        "metadata": {"category": "demand_patterns", "source": "forecasting_guide"},
    },
    {
        "content": "Heat waves cause 15-25% increase in electricity demand due to cooling loads. Temperature response functions show that demand increases by approximately 2-3% per degree Celsius above 25°C. Heat wave planning should include emergency demand response programs.",
        "metadata": {"category": "weather_impacts", "source": "climate_adaptation"},
    },
    {
        "content": "Grid frequency must be maintained at 60 Hz ± 0.5 Hz in normal operation. Frequency deviations indicate imbalance between generation and load. Fast frequency response from batteries and demand response helps maintain stability.",
        "metadata": {"category": "grid_operations", "source": "grid_code"},
    },
    {
        "content": "Demand response programs provide 5-15% of peak demand reduction capability. Industrial users offer the most reliable demand reduction through process scheduling. Commercial buildings can reduce 10-20% through HVAC and lighting optimization.",
        "metadata": {"category": "demand_response", "source": "demand_response_manual"},
    },
    {
        "content": "Energy arbitrage involves buying electricity when prices are low (typically at night) and selling or using stored energy when prices are high (peak hours). Typical savings range from $10-40/MWh depending on battery efficiency and price volatility.",
        "metadata": {"category": "optimization", "source": "trading_strategy"},
    },
    {
        "content": "The optimal battery dispatch strategy considers: current state of charge, forecasted prices, solar generation forecast, load forecast, and battery degradation costs. Deep discharging below 20% SOC should be avoided to extend battery life.",
        "metadata": {"category": "optimization", "source": "battery_optimization"},
    },
    {
        "content": "Renewable energy forecasting uses numerical weather prediction (NWP) models, historical data, and machine learning. Solar forecasts include global horizontal irradiance (GHI) predictions. Wind forecasts consider speed, direction, and atmospheric stability.",
        "metadata": {"category": "forecasting", "source": "forecasting_methods"},
    },
    {
        "content": "Carbon intensity of grid electricity varies from 200-600 gCO2/kWh depending on the generation mix. Increasing renewable penetration reduces carbon intensity. Time-of-use carbon factors can guide optimal charging of EVs and batteries.",
        "metadata": {"category": "sustainability", "source": "carbon_accounting"},
    },
    {
        "content": "Advanced metering infrastructure (AMI) provides 15-minute interval data for load analysis. Smart meters enable real-time monitoring, outage detection, and granular demand profiling for accurate forecasting and grid management.",
        "metadata": {"category": "infrastructure", "source": "metering_guide"},
    },
    {
        "content": "Energy storage provides multiple value streams: energy arbitrage ($50-150/kW-year), frequency regulation ($30-80/kW-year), capacity payments ($50-120/kW-year), and renewable integration benefits. Stacking these services maximizes battery economics.",
        "metadata": {"category": "storage", "source": "battery_economics"},
    },
    {
        "content": "Machine learning models for energy forecasting include: LSTM networks for time series, Gradient Boosting for load forecasting, CNN for solar nowcasting, and Transformer models for multi-horizon probabilistic forecasting. Ensemble methods typically outperform single models.",
        "metadata": {"category": "forecasting", "source": "ml_models"},
    },
    {
        "content": "Risk management in energy trading includes: volume risk, price risk, basis risk, and counterparty risk. Value at Risk (VaR) and Conditional VaR (CVaR) are standard risk metrics. Portfolio optimization minimizes risk for expected return.",
        "metadata": {"category": "market", "source": "risk_management"},
    },
    {
        "content": "Voltage regulation in distribution grids is impacted by high solar penetration. Smart inverters with volt-VAR control, on-load tap changers, and battery storage provide voltage support. Reverse power flow during high solar generation requires grid upgrades.",
        "metadata": {"category": "grid_operations", "source": "distribution_planning"},
    },
    {
        "content": "Reinforcement learning for grid optimization uses state spaces including: load, generation, prices, and battery SOC. Action spaces include battery dispatch, demand response signals, and market participation. Reward functions balance profit and grid stability.",
        "metadata": {"category": "optimization", "source": "rl_framework"},
    },
    {
        "content": "Seasonal patterns in electricity demand: winter peaks (6-9 AM, 5-8 PM) due to heating and lighting, summer peaks (2-6 PM) due to cooling. Shoulder seasons (spring/fall) have lower overall demand. Annual maintenance of generation plants is typically scheduled in spring.",
        "metadata": {"category": "demand_patterns", "source": "seasonal_analysis"},
    },
]

def initialize_knowledge_base():
    from .embeddings import vector_store
    count = vector_store.add_documents(KNOWLEDGE_DOCUMENTS)
    return count
