CREATE TABLE IF NOT EXISTS residential_tariff_schemes (
    scheme_code VARCHAR(30) PRIMARY KEY,
    scheme_name VARCHAR(100) NOT NULL,
    description TEXT,
    tariff_rules_version VARCHAR(50)
);

INSERT INTO residential_tariff_schemes VALUES
('NET_METERING','Net Metering','Energy credits; applicable agreement rules required','CONFIGURED_EXTERNALLY'),
('NET_ACCOUNTING','Net Accounting','Export electricity paid under applicable agreement rules','CONFIGURED_EXTERNALLY'),
('NET_PLUS','Net Plus','Separate generation supplied to grid; consumption billed separately','CONFIGURED_EXTERNALLY'),
('NET_PLUS_PLUS','Net Plus Plus','Extended rooftop generation subject to approved capacity and wiring','CONFIGURED_EXTERNALLY')
ON CONFLICT (scheme_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS residential_customers (
    customer_id VARCHAR(32) PRIMARY KEY,
    display_code VARCHAR(32) NOT NULL,
    utility_provider VARCHAR(10) CHECK (utility_provider IN ('CEB','LECO')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS residential_sites (
    site_id VARCHAR(32) PRIMARY KEY,
    customer_id VARCHAR(32) REFERENCES residential_customers(customer_id),
    district VARCHAR(80),
    province VARCHAR(80),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    utility_account_ref VARCHAR(80),
    connection_scheme VARCHAR(30) REFERENCES residential_tariff_schemes(scheme_code),
    installation_status VARCHAR(30),
    approval_status VARCHAR(30),
    data_source VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS residential_solar_systems (
    site_id VARCHAR(32) PRIMARY KEY REFERENCES residential_sites(site_id),
    system_type VARCHAR(30) DEFAULT 'ROOFTOP_SOLAR',
    solar_capacity_kw NUMERIC(10,3),
    panel_count INTEGER,
    panel_wattage_w INTEGER,
    inverter_capacity_kw NUMERIC(10,3),
    connection_phase VARCHAR(20),
    maximum_export_kw NUMERIC(10,3)
);

CREATE TABLE IF NOT EXISTS residential_measurements (
    measurement_id BIGSERIAL PRIMARY KEY,
    site_id VARCHAR(32) REFERENCES residential_sites(site_id),
    timestamp TIMESTAMPTZ NOT NULL,
    solar_generation_kw NUMERIC(10,3),
    household_consumption_kw NUMERIC(10,3),
    grid_import_kw NUMERIC(10,3),
    grid_export_kw NUMERIC(10,3),
    voltage_v NUMERIC(10,3),
    frequency_hz NUMERIC(6,3),
    battery_soc_percent NUMERIC(5,2),
    data_source VARCHAR(30) NOT NULL,
    data_quality VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS residential_energy_credits (
    credit_id BIGSERIAL PRIMARY KEY,
    site_id VARCHAR(32) REFERENCES residential_sites(site_id),
    billing_period VARCHAR(7) NOT NULL,
    exported_kwh NUMERIC(12,3),
    credited_kwh NUMERIC(12,3),
    export_value_lkr NUMERIC(12,2)
);
