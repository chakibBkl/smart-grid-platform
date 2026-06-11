# NV TEAM Smart Grid Platform Reality Model

## Demo Data Statement

This MVP uses simulated operational data and deterministic demo calculations. No real Sonelgaz data is used. The frontend may show pilot-ready connectors, but those connectors are not active unless explicitly integrated with a validated backend and live data source.

The platform is a decision-support tool. It does not autonomously control the grid, execute dispatch actions, trade electricity, or approve critical operational decisions.

## Planned Pilot Data Sources

- SCADA telemetry
- Smart meters
- Renewable plant APIs
- Battery system APIs
- Weather APIs
- CSV historical imports
- Regional asset and maintenance systems

## Data Modes

- Demo Mode - Simulated Data: values come from the NV TEAM demo dataset and deterministic calculations.
- Pilot Ready - Connector Not Active: the UI is prepared for integration, but no live connector is active.
- Future Module - Regulation Dependent: functionality depends on regulation, market access, validated data, and operator governance.
- Live API - Connected: reserved for actual validated production/pilot integrations only.

## Metric Logic

- Total load is the sum of regional `currentLoadMW` values for national scope.
- Average grid health is the average of regional grid health scores.
- Average data quality is the average of regional data quality scores.
- Highest risk region is selected using risk severity and grid health.
- Highest demand region is selected by `demandPressure`.
- Highest solar region is selected by `solarPotential`.
- Best hybrid region is selected by combined solar potential, wind potential, and industrial demand score.

## Energy Balance

```text
totalSupplyMW = solarMW + windMW + batteryMW + conventionalMW
reserveMarginPercent = ((totalSupplyMW - totalDemandMW) / totalDemandMW) * 100
```

Reserve status:

- Below 0%: Deficit
- 0% to 5%: Tight
- 5% to 15%: Balanced
- Above 15%: Surplus

## Risk And Recommendation Logic

Risk increases when demand pressure is high, reserve margin is low, battery state of charge is low, forecast confidence is low, data quality is low, weather impact is high, or asset health is poor.

Recommendations are rule-based in demo mode:

- High peak pressure plus acceptable battery state of charge recommends preparing battery discharge.
- Low data quality recommends validating data before approval.
- High-demand regions recommend demand response and peak shaving.
- High-solar regions recommend solar forecasting and storage planning.

All recommendations require human operator approval.

## National Vs Regional Logic

The National Dashboard aggregates all regions and can open or manage regional dashboard status in demo mode.

Regional dashboards show only selected-region values, selected-region action logs, selected-region operator notes, and selected-region decision explanations. National values must be labeled as national references if shown.

## Market Intelligence Limitation

Market Intelligence is a national-level simulation and future-ready module. It does not represent real electricity market trading in Algeria. Advanced bidding, trading, and market optimization require regulatory approval, market access, and validated data integration.

## Human Approval Principle

The platform supports operators with forecasts, risk logic, recommendations, and traceability. Critical actions remain under human review and approval.
