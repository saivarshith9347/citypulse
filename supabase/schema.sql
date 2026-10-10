-- =====================================================
-- CityPulse AI - Complete Database Schema
-- =====================================================
-- This file combines all migrations for easy setup via Supabase SQL Editor
-- Simply copy and paste this entire file into the SQL Editor and execute
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- TABLES
-- =====================================================

-- Buses: Public transport fleet
CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_code TEXT NOT NULL UNIQUE,
    route_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
    last_latitude DECIMAL(10, 8),
    last_longitude DECIMAL(11, 8),
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_buses_last_seen ON buses(last_seen_at DESC);
CREATE INDEX idx_buses_bus_code ON buses(bus_code);
CREATE INDEX idx_buses_location ON buses USING GIST (
    ST_SetSRID(ST_MakePoint(last_longitude, last_latitude), 4326)::geography
) WHERE last_latitude IS NOT NULL AND last_longitude IS NOT NULL;

-- Departments: Municipal departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO departments (name, contact_email) VALUES
    ('Roads & Infrastructure', 'roads@citypulse.gov'),
    ('Traffic Management', 'traffic@citypulse.gov'),
    ('Public Works', 'publicworks@citypulse.gov'),
    ('Emergency Services', 'emergency@citypulse.gov')
ON CONFLICT (name) DO NOTHING;

-- Incidents: Detected road damage and traffic incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL CHECK (event_type IN ('pothole', 'crack', 'flooding', 'debris', 'congestion', 'accident')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
    evidence_path TEXT,
    verification_status TEXT NOT NULL DEFAULT 'detected' CHECK (verification_status IN ('detected', 'verified', 'rejected', 'assigned', 'in_progress', 'resolved')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_event_type ON incidents(event_type);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_verification_status ON incidents(verification_status);
CREATE INDEX idx_incidents_detected_at ON incidents(detected_at DESC);
CREATE INDEX idx_incidents_bus_id ON incidents(bus_id);
CREATE INDEX idx_incidents_location ON incidents USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);
CREATE INDEX idx_incidents_status_severity ON incidents(verification_status, severity);

-- Work Orders: Maintenance work orders
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    resolution_notes TEXT
);

CREATE INDEX idx_work_orders_incident_id ON work_orders(incident_id);
CREATE INDEX idx_work_orders_department_id ON work_orders(department_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at DESC);

-- Incident Observations: Multiple detections of same incident
CREATE TABLE IF NOT EXISTS incident_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    evidence_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_observations_incident_id ON incident_observations(incident_id);
CREATE INDEX idx_observations_bus_id ON incident_observations(bus_id);
CREATE INDEX idx_observations_observed_at ON incident_observations(observed_at DESC);
CREATE INDEX idx_observations_location ON incident_observations USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_buses_updated_at
    BEFORE UPDATE ON buses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL,
    lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_observations ENABLE ROW LEVEL SECURITY;

-- Buses policies
CREATE POLICY "Authenticated users can read buses"
    ON buses FOR SELECT TO authenticated USING (true);

-- Departments policies
CREATE POLICY "Authenticated users can read departments"
    ON departments FOR SELECT TO authenticated USING (true);

-- Incidents policies
CREATE POLICY "Authenticated users can read incidents"
    ON incidents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create incidents"
    ON incidents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update incidents"
    ON incidents FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);

-- Work Orders policies
CREATE POLICY "Authenticated users can read work_orders"
    ON work_orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create work_orders"
    ON work_orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update work_orders"
    ON work_orders FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);

-- Incident Observations policies
CREATE POLICY "Authenticated users can read observations"
    ON incident_observations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create observations"
    ON incident_observations FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Schema is ready. Next steps:
-- 1. Create a Storage bucket named 'incidents' for evidence images
-- 2. Run seed.sql to populate sample data (optional)
-- 3. Verify with: SELECT * FROM buses; SELECT * FROM departments;
-- =====================================================
