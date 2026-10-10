-- CityPulse AI - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Description: Enable RLS and define access policies for all tables

-- =====================================================
-- Enable Row Level Security on all tables
-- =====================================================
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_observations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BUSES: Read-only for authenticated users
-- =====================================================
-- Policy: All authenticated users can read buses
CREATE POLICY "Authenticated users can read buses"
    ON buses FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only service role can insert/update/delete buses
-- (This is enforced by not creating policies for INSERT/UPDATE/DELETE for regular users)

COMMENT ON POLICY "Authenticated users can read buses" ON buses IS 
    'All authenticated users can view bus fleet data';

-- =====================================================
-- DEPARTMENTS: Read-only for authenticated users
-- =====================================================
-- Policy: All authenticated users can read departments
CREATE POLICY "Authenticated users can read departments"
    ON departments FOR SELECT
    TO authenticated
    USING (true);

COMMENT ON POLICY "Authenticated users can read departments" ON departments IS 
    'All authenticated users can view department information';

-- =====================================================
-- INCIDENTS: Read for all authenticated, write with restrictions
-- =====================================================
-- Policy: All authenticated users can read incidents
CREATE POLICY "Authenticated users can read incidents"
    ON incidents FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can create incidents (from detection system)
CREATE POLICY "Authenticated users can create incidents"
    ON incidents FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Authenticated users can update incidents
-- In production, you'd check user role here (operator, analyst, admin)
CREATE POLICY "Authenticated users can update incidents"
    ON incidents FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: No deletes allowed (audit trail)
-- Only service role can delete (not creating policy for regular users)

COMMENT ON POLICY "Authenticated users can read incidents" ON incidents IS 
    'All authenticated users can view incident data';
COMMENT ON POLICY "Authenticated users can create incidents" ON incidents IS 
    'Detection system can create new incidents';
COMMENT ON POLICY "Authenticated users can update incidents" ON incidents IS 
    'Operators can verify, assign, and update incident status';

-- =====================================================
-- WORK_ORDERS: Read for all authenticated, write for supervisors
-- =====================================================
-- Policy: All authenticated users can read work orders
CREATE POLICY "Authenticated users can read work_orders"
    ON work_orders FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can create work orders
CREATE POLICY "Authenticated users can create work_orders"
    ON work_orders FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Authenticated users can update work orders
CREATE POLICY "Authenticated users can update work_orders"
    ON work_orders FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: No deletes (audit trail)

COMMENT ON POLICY "Authenticated users can read work_orders" ON work_orders IS 
    'All authenticated users can view work order data';
COMMENT ON POLICY "Authenticated users can create work_orders" ON work_orders IS 
    'Supervisors can create work orders for verified incidents';
COMMENT ON POLICY "Authenticated users can update work_orders" ON work_orders IS 
    'Supervisors and assigned personnel can update work order status';

-- =====================================================
-- INCIDENT_OBSERVATIONS: Read for all authenticated, write by system
-- =====================================================
-- Policy: All authenticated users can read observations
CREATE POLICY "Authenticated users can read observations"
    ON incident_observations FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can create observations (detection system)
CREATE POLICY "Authenticated users can create observations"
    ON incident_observations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: No updates or deletes (immutable audit trail)

COMMENT ON POLICY "Authenticated users can read observations" ON incident_observations IS 
    'All authenticated users can view incident observations';
COMMENT ON POLICY "Authenticated users can create observations" ON incident_observations IS 
    'Detection system can record additional observations of existing incidents';

-- =====================================================
-- NOTES ON RLS IMPLEMENTATION
-- =====================================================
-- 
-- Current Setup (MVP):
-- - All authenticated users have read access to all data
-- - All authenticated users can create/update incidents and work orders
-- - No public access (unauthenticated users blocked)
-- - Deletes are restricted (only service role can delete)
-- 
-- Future Enhancements:
-- 1. Implement role-based access control using auth.jwt() -> 'user_metadata' -> 'role'
-- 2. Restrict incident updates to operators and analysts only
-- 3. Restrict work order creation to supervisors and admins
-- 4. Add department-based filtering (users only see their department's work orders)
-- 5. Add audit logging for all sensitive operations
-- 
-- Example role-based policy (for future):
-- CREATE POLICY "Only operators can verify incidents"
--     ON incidents FOR UPDATE
--     TO authenticated
--     USING (auth.jwt() ->> 'role' IN ('operator', 'admin'))
--     WITH CHECK (auth.jwt() ->> 'role' IN ('operator', 'admin'));
-- 
-- =====================================================
