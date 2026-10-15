-- =====================================================
-- CityPulse AI - Row Level Security Policies
-- =====================================================
-- This file defines RLS policies for public/anonymous access
-- Since CityPulse is a monitoring dashboard without user auth,
-- we allow anonymous read access and authenticated write access
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_observations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read access to buses" ON buses;
DROP POLICY IF EXISTS "Public read access to departments" ON departments;
DROP POLICY IF EXISTS "Public read access to incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated write access to incidents" ON incidents;
DROP POLICY IF EXISTS "Public read access to work_orders" ON work_orders;
DROP POLICY IF EXISTS "Authenticated write access to work_orders" ON work_orders;
DROP POLICY IF EXISTS "Public read access to observations" ON incident_observations;

-- =====================================================
-- BUSES POLICIES
-- =====================================================
-- Allow public read access for dashboard display
CREATE POLICY "Public read access to buses"
    ON buses
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to update bus status (for bus IoT devices)
CREATE POLICY "Authenticated write access to buses"
    ON buses
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- DEPARTMENTS POLICIES
-- =====================================================
-- Departments are public reference data
CREATE POLICY "Public read access to departments"
    ON departments
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- =====================================================
-- INCIDENTS POLICIES
-- =====================================================
-- Allow public read access for monitoring dashboard
CREATE POLICY "Public read access to incidents"
    ON incidents
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users (bus AI systems) to create incidents
CREATE POLICY "Authenticated write access to incidents"
    ON incidents
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update incident status
CREATE POLICY "Authenticated update access to incidents"
    ON incidents
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- WORK ORDERS POLICIES
-- =====================================================
-- Allow public read access for transparency
CREATE POLICY "Public read access to work_orders"
    ON work_orders
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to create work orders
CREATE POLICY "Authenticated write access to work_orders"
    ON work_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update work orders
CREATE POLICY "Authenticated update access to work_orders"
    ON work_orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- INCIDENT OBSERVATIONS POLICIES
-- =====================================================
-- Allow public read access
CREATE POLICY "Public read access to observations"
    ON incident_observations
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to create observations
CREATE POLICY "Authenticated write access to observations"
    ON incident_observations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- =====================================================
-- NOTES
-- =====================================================
-- This configuration allows:
-- 1. Anonymous (public) READ access to all tables for dashboard viewing
-- 2. Authenticated WRITE access for bus IoT systems and operators
-- 3. Service role bypasses all RLS for admin operations
--
-- For production with user authentication, you would:
-- 1. Remove anon access from sensitive operations
-- 2. Add user-role-based policies (e.g., only dept. managers can update work orders)
-- 3. Implement auth.uid() checks in policies
-- =====================================================
