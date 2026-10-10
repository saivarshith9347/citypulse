-- CityPulse AI - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Create core tables for buses, incidents, departments, work orders, and observations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geographic data
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- TABLE: buses
-- Description: Public transport buses used as mobile sensing units
-- =====================================================
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

-- Index for frequently queried fields
CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_buses_last_seen ON buses(last_seen_at DESC);
CREATE INDEX idx_buses_bus_code ON buses(bus_code);

-- Geographic index for location queries
CREATE INDEX idx_buses_location ON buses USING GIST (
    ST_SetSRID(ST_MakePoint(last_longitude, last_latitude), 4326)::geography
) WHERE last_latitude IS NOT NULL AND last_longitude IS NOT NULL;

COMMENT ON TABLE buses IS 'Public transport fleet serving as mobile sensing units';
COMMENT ON COLUMN buses.bus_code IS 'Unique identifier displayed on the bus (e.g., DL-1234)';
COMMENT ON COLUMN buses.status IS 'Current operational status: online, offline, or maintenance';

-- =====================================================
-- TABLE: departments
-- Description: Municipal departments responsible for incident resolution
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sample departments (can be modified)
INSERT INTO departments (name, contact_email) VALUES
    ('Roads & Infrastructure', 'roads@citypulse.gov'),
    ('Traffic Management', 'traffic@citypulse.gov'),
    ('Public Works', 'publicworks@citypulse.gov'),
    ('Emergency Services', 'emergency@citypulse.gov')
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE departments IS 'Municipal departments handling different types of incidents';

-- =====================================================
-- TABLE: incidents
-- Description: Road damage and traffic incidents detected by AI
-- =====================================================
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

-- Indexes for queries and filtering
CREATE INDEX idx_incidents_event_type ON incidents(event_type);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_verification_status ON incidents(verification_status);
CREATE INDEX idx_incidents_detected_at ON incidents(detected_at DESC);
CREATE INDEX idx_incidents_bus_id ON incidents(bus_id);

-- Geographic index for spatial queries
CREATE INDEX idx_incidents_location ON incidents USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);

-- Composite index for common filtered queries
CREATE INDEX idx_incidents_status_severity ON incidents(verification_status, severity);

COMMENT ON TABLE incidents IS 'Road damage and traffic incidents detected by AI from bus camera feeds';
COMMENT ON COLUMN incidents.event_type IS 'Type of incident: pothole, crack, flooding, debris, congestion, accident';
COMMENT ON COLUMN incidents.severity IS 'Impact level: low, medium, high, critical';
COMMENT ON COLUMN incidents.confidence IS 'AI detection confidence score (0-100%)';
COMMENT ON COLUMN incidents.verification_status IS 'Workflow status: detected → verified/rejected → assigned → in_progress → resolved';
COMMENT ON COLUMN incidents.evidence_path IS 'Storage path to detection image (e.g., incidents/uuid.jpg)';

-- =====================================================
-- TABLE: work_orders
-- Description: Maintenance work orders for incident resolution
-- =====================================================
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

-- Indexes for work order queries
CREATE INDEX idx_work_orders_incident_id ON work_orders(incident_id);
CREATE INDEX idx_work_orders_department_id ON work_orders(department_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_priority ON work_orders(priority);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at DESC);

COMMENT ON TABLE work_orders IS 'Maintenance work orders created for verified incidents';
COMMENT ON COLUMN work_orders.assigned_to IS 'Name or ID of person/team assigned to this work order';
COMMENT ON COLUMN work_orders.status IS 'Work order lifecycle: pending → assigned → in_progress → completed/cancelled';
COMMENT ON COLUMN work_orders.priority IS 'Urgency level derived from incident severity';

-- =====================================================
-- TABLE: incident_observations
-- Description: Multiple observations of the same incident by different buses
-- =====================================================
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

-- Indexes for observation queries
CREATE INDEX idx_observations_incident_id ON incident_observations(incident_id);
CREATE INDEX idx_observations_bus_id ON incident_observations(bus_id);
CREATE INDEX idx_observations_observed_at ON incident_observations(observed_at DESC);

-- Geographic index
CREATE INDEX idx_observations_location ON incident_observations USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);

COMMENT ON TABLE incident_observations IS 'Multiple detections of the same incident, strengthening confidence';
COMMENT ON COLUMN incident_observations.incident_id IS 'Links to the parent incident';

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
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
-- FUNCTION: Calculate distance between two points (meters)
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

COMMENT ON FUNCTION calculate_distance IS 'Returns distance in meters between two lat/lng points';
