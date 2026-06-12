# NEURO GRID — AI-Powered Smart Grid Platform

## What is NEURO GRID?

NEURO GRID is an AI-driven decision-support platform for energy grid operators. It monitors the national electricity network in real time, forecasts energy supply and demand, simulates energy markets, optimizes grid operations, and provides explainable AI recommendations — all with a human operator keeping control.

The platform covers **12 regions** of the Algerian national grid.

---

## Getting Started

### Login

18 demo users are pre-configured. Use:

| Username | Password | Scope |
|----------|----------|-------|
| `national_admin` | `demo123` | National — full access |
| `national_operator` | `demo123` | National — operations |
| `hassi_admin` | `demo123` | Regional — Hassi Messaoud |
| `arzew_admin` | `demo123` | Regional — Arzew |
| *(and 11 more regional users)* | `demo123` | |

After login, choose **National** dashboard (all 12 regions) or **Regional** (locked to one assigned region).

---

## 1. National Dashboard — Control Center

The main operational view of the entire national grid.

**What you see:**
- KPI cards: regions monitored, total load (MW), average grid health, renewable energy share
- Regional performance bar chart — compare load, solar, wind across all 12 regions
- Risk Alert Center — priority alerts with severity, description, and recommended actions
- Action Center — actionable tasks with deadlines, expected impact, approve/reject buttons
- Region Control Panel — National Admin can toggle regions between **Active**, **Maintenance**, or **Disabled**
- Geo Intelligence preview card — best performing regions (highest solar, highest demand, best hybrid)
- Reality Mode badge — shows the platform is running in demo mode with simulated data

---

## 2. Regional Dashboard — Deep Dive

A focused view of a single region's operations.

**What you see:**
- Energy balance: demand vs. solar + wind + battery + conventional support
- 6 KPI cards: load, solar generation, wind generation, battery SOC, grid health, data quality
- Action Center with region-specific tasks
- Forecast confidence panel: accuracy metrics for load, solar, wind, price predictions
- Weather Impact Index: how weather affects solar, wind, and heat-driven load
- Asset Health Monitor: status of batteries, wind sites, solar panels, transformers, grid lines
- Data Sources Status: which data feeds are active (CSV demo data, weather, market)
- Operator Notes: save and persist notes for this region

---

## 3. Geo Intelligence — Interactive Map

An interactive map of Algeria showing all 12 regions color-coded by different layers.

**What you can do:**
- Toggle weather layers: risk level, solar potential, wind potential, grid health, demand pressure
- Click any region to see its performance summary (load, solar, wind, health, risk, strategy)
- Compare two regions side-by-side
- View AI recommendations per region
- Regional legend explains the color coding

---

## 4. Forecasting — AI Predictions

48-hour ahead predictions for grid operations.

**What you see:**
- Forecast charts for load, solar generation, wind generation, and market price
- Confidence intervals (shaded bands around predictions)
- KPI cards: peak, minimum, and average values for each forecast
- Typical daily pattern chart
- Model: ensemble Prophet + LSTM (version 2)

---

## 5. Market Simulation — Energy Trading

Simulates day-ahead electricity market behavior.

**What you see:**
- Price forecast with confidence bands
- Market sentiment indicator: bullish / bearish / neutral
- Volatility and trading volume metrics
- Trading Panel: adjust import/reserve scenarios with a slider and see operational impact
- Driving factors: renewable penetration, demand forecast, fuel prices, weather impact, grid congestion

---

## 6. Grid Monitoring — Real-Time Operations

Live grid telemetry dashboard.

**What you see:**
- Grid frequency, voltage levels, renewable share percentage, battery status
- Energy flow visualization: solar → wind → battery → grid with live MW values
- Frequency and voltage trend charts
- Renewable penetration over time
- WebSocket-connected for real-time updates

---

## 7. Renewables Control Center

Management view for renewable energy assets.

**What you see:**
- Solar and wind output levels
- Curtailment risk and utilization rates
- Renewable Integration Panel
- Weather Impact Index: how conditions affect renewable output
- Sustainability KPIs: renewable share, CO2 avoided, clean energy used
- Solar/wind forecast area charts
- Regional renewable potential bar chart
- Dispatch recommendations

---

## 8. Optimization Control Center

Dispatch planning and what-if simulation.

**What you see:**
- Dispatch planning: battery support, demand response, and grid support by peak-hour window
- Energy Balance Panel: supply vs demand with reserve margin
- Peak Pressure Card: expected peak hour, affected region, load, recommended action
- What-If Simulator: adjust battery state of charge and demand response levels to see projected cost savings and stability impact
- Scenario comparison: compare scenarios by cost, risk, and stability
- Decision Explanation Box: explains the reasoning behind the recommended dispatch

---

## 9. AI Decision Explanation

Structured explainable AI — not a chatbot.

**What you see:**
- Daily general situation summary (national view)
- All-region daily situation report
- Recommended decision with reasoning, expected impact, savings, risk level, and confidence
- Approve / Reject buttons (decisions are logged)
- Risk, forecast, and weather impact explanation cards
- Regional strategy explanations

---

## 10. 3D Digital Twin

An interactive 3D view of a region's energy infrastructure using Three.js.

**What you see:**
- 3D terrain with elevation coloring
- Devices: solar panels, wind turbines, batteries, substations, factories, homes
- Animated energy flow beams between devices
- Data flow beams from devices to the AI processing node
- Click any device to see its status and details
- Controls: reset view, toggle labels, toggle weather effects
- Fallback 2D view when 3D is not supported

---

## 11. Reports Center

Generate and export operational reports.

**Available report templates:**
- Daily Operations Report
- Risk & Peak Pressure Report
- Renewables & Sustainability Report
- Geo Intelligence Report

**What you see:**
- Data quality metrics bar chart
- Report preview with TXT export
- Notification log and operator decision log

---

## 12. Settings

Role-gated configuration panel (admin only).

**What you can do:**
- View access profile and permissions
- Check data reality status
- Control regional dashboard status (Active / Maintenance / Disabled)
- Reset demo data

---

## Key Design Principles

1. **Human-in-the-loop** — AI recommends, humans decide. Every AI action must be approved or rejected by an operator.
2. **Decision-support only** — The platform informs and advises. It does not automatically control grid equipment.
3. **Explainable AI** — Every recommendation comes with reasoning, expected impact, risk level, and confidence score.
4. **Demo mode** — All data is synthetically generated using realistic 5-year simulation models. No live grid connection.
5. **Transparency** — Reality Mode badges and Traceability panels are shown throughout the platform, making it clear what is simulated and what assumptions are being used.

---

## Demo Users Reference

| Username | Password | Role | Scope |
|----------|----------|------|-------|
| `national_admin` | `demo123` | National Admin | Full access |
| `national_operator` | `demo123` | National Operator | Operations |
| `analyst` | `demo123` | Analyst | Read-only |
| `viewer` | `demo123` | Viewer | View reports only |
| `hassi_admin` | `demo123` | Regional Admin | Hassi Messaoud |
| `arzew_admin` | `demo123` | Regional Admin | Arzew |
| `hassi_rmel_admin` | `demo123` | Regional Admin | Hassi R'Mel |
| `skikda_admin` | `demo123` | Regional Admin | Skikda |
| `adrar_admin` | `demo123` | Regional Admin | Adrar |
| `ghardaia_admin` | `demo123` | Regional Admin | Ghardaia |
| `biskra_admin` | `demo123` | Regional Admin | Biskra |
| `algiers_admin` | `demo123` | Regional Admin | Algiers |
| `setif_bba_admin` | `demo123` | Regional Admin | Setif / BBA |
| `annaba_admin` | `demo123` | Regional Admin | Annaba |
| `tamanrasset_admin` | `demo123` | Regional Admin | Tamanrasset |
| `bechar_tindouf_admin` | `demo123` | Regional Admin | Bechar / Tindouf |
| `arzew_operator` | `demo123` | Regional Operator | Arzew |
| `hassi_operator` | `demo123` | Regional Operator | Hassi Messaoud |
| `algiers_operator` | `demo123` | Regional Operator | Algiers |
