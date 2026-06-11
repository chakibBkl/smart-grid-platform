CREATE TABLE IF NOT EXISTS telemetry (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    demand_kw FLOAT,
    solar_generation_kw FLOAT,
    wind_generation_kw FLOAT,
    frequency_hz FLOAT,
    voltage_v FLOAT,
    state_of_charge FLOAT,
    temperature FLOAT,
    irradiance FLOAT,
    wind_speed FLOAT,
    humidity FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    forecast_type VARCHAR(50) NOT NULL,
    forecast_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hour INT NOT NULL,
    price_per_mwh FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS control_actions (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tap_change FLOAT,
    battery_rate FLOAT,
    reward FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telemetry_timestamp ON telemetry(timestamp DESC);
CREATE INDEX idx_forecasts_timestamp ON forecasts(timestamp DESC);
