-- Public reference information for Sri Lankan commissioned solar projects.
-- Operating measurements in the dashboard are simulated and must not be
-- represented as authorised plant telemetry.

CREATE TABLE IF NOT EXISTS solar_sites (
    site_id VARCHAR(32) PRIMARY KEY,
    plant_name VARCHAR(150) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Sri Lanka',
    district VARCHAR(80),
    province VARCHAR(80),
    location VARCHAR(100),
    technology VARCHAR(50) DEFAULT 'Ground-mounted Solar PV',
    commissioned_year SMALLINT,
    installed_capacity_mw NUMERIC(10,3),
    published_annual_energy_gwh NUMERIC(10,2),
    operating_status VARCHAR(30),
    data_source VARCHAR(30) DEFAULT 'PUBLIC_REFERENCE',
    source_url TEXT
);

INSERT INTO solar_sites VALUES
('SL-SOLAR-001','Polonnaruwa Solar Power Project','Sri Lanka','Polonnaruwa','North Central','Polonnaruwa','Ground-mounted Solar PV',2020,1.0,1.6,'Commissioned','PUBLIC_REFERENCE','https://escas.lk/projects/'),
('SL-SOLAR-002','Galle Solar Power Project','Sri Lanka','Galle','Southern','Godaudamandiya, Imaduwa','Ground-mounted Solar PV',2020,1.0,1.5,'Commissioned','PUBLIC_REFERENCE','https://escas.lk/projects/'),
('SL-SOLAR-003','Habarana Solar Power Project','Sri Lanka','Anuradhapura','North Central','Thibalawa village','Ground-mounted Solar PV',2020,1.0,1.6,'Commissioned','PUBLIC_REFERENCE','https://escas.lk/projects/'),
('SL-SOLAR-004','Vavuniya Solar Power Project','Sri Lanka','Vavuniya','Northern','Mamaduwa village','Ground-mounted Solar PV',2023,2.0,3.3,'Commissioned','PUBLIC_REFERENCE','https://escas.lk/projects/'),
('SL-SOLAR-005','Trincomalee Solar Power Project','Sri Lanka','Trincomalee','Eastern','Kanniyar village','Ground-mounted Solar PV',2024,4.0,6.7,'Commissioned','PUBLIC_REFERENCE','https://escas.lk/projects/')
ON CONFLICT (site_id) DO UPDATE SET
    plant_name=EXCLUDED.plant_name,
    installed_capacity_mw=EXCLUDED.installed_capacity_mw,
    published_annual_energy_gwh=EXCLUDED.published_annual_energy_gwh;

CREATE TABLE IF NOT EXISTS measurements (
    measurement_id BIGSERIAL PRIMARY KEY,
    site_id VARCHAR(32) REFERENCES solar_sites(site_id),
    timestamp TIMESTAMPTZ NOT NULL,
    generation_kw NUMERIC(12,3),
    grid_voltage_v NUMERIC(10,3),
    active_power_kw NUMERIC(12,3),
    data_source VARCHAR(30) NOT NULL,
    data_quality VARCHAR(30) NOT NULL
);
