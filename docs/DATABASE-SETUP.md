# CityPulse Database Setup Guide

Complete guide for setting up the Supabase database for CityPulse AI.

## Overview

CityPulse uses **Supabase** (PostgreSQL + PostGIS) with the following features:
- PostGIS for geographic queries
- Row Level Security (RLS) for access control
- Automatic timestamp triggers
- Foreign key relationships
- Check constraints for data validation

## Quick Setup (3 Steps)

### 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose organization, name, database password, region
4. Wait for project creation (~2 minutes)

### 2. Run Schema SQL

1. Open your project → **SQL Editor** (left sidebar)
2. Copy the entire contents of `supabase/schema.sql`
3. Paste into SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify success: "Success. No rows returned"

### 3. Setup Row Level Security

1. In SQL Editor, create a new query
2. Copy contents of `supabase/rls_policies.sql`
3. Paste and click **Run**
4. Verify policies exist: Table Editor → any table → Policies tab

### 4. (Optional) Add Sample Data

1. In SQL Editor, create a new query
2. Copy contents of `supabase/seed.sql`
3. Paste and click **Run**
4. Verify: Table Editor → buses → should see 6 buses

## Database Schema

### Core Tables

#### `buses`
Public transport fleet serving as mobile sensing units.

```sql
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_code TEXT NOT NULL UNIQUE,           -- e.g., "DL-1234"
    route_name TEXT NOT NULL,                -- e.g., "Route 52"
    status TEXT NOT NULL DEFAULT 'offline',  -- online|offline|maintenance
    last_latitude DECIMAL(10, 8),            -- Geographic coordinate
    last_longitude DECIMAL(11, 8),           -- Geographic coordinate
    last_seen_at TIMESTAMPTZ,                -- Last ping timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_buses_status` - Filter by online/offline
- `idx_buses_bus_code` - Quick lookup by bus code
- `idx_buses_location` (GIST) - Geographic queries
- `idx_buses_last_seen` - Recent activity queries

---

#### `departments`
Municipal departments responsible for incident resolution.

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Seeded departments:**
- Roads & Infrastructure
- Traffic Management
- Public Works
- Emergency Services

---

#### `incidents`
Road damage and traffic incidents detected by AI.

```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,                -- pothole|crack|flooding|debris|congestion|accident
    severity TEXT NOT NULL,                  -- low|medium|high|critical
    confidence DECIMAL(5, 2) NOT NULL,       -- AI confidence 0-100%
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    bus_id UUID REFERENCES buses(id),
    evidence_path TEXT,                      -- Storage path to image
    verification_status TEXT NOT NULL,       -- detected|verified|rejected|assigned|in_progress|resolved
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_incidents_event_type` - Filter by type
- `idx_incidents_severity` - Filter by severity
- `idx_incidents_verification_status` - Filter by status
- `idx_incidents_detected_at` - Sort by detection time
- `idx_incidents_location` (GIST) - Geographic queries
- `idx_incidents_status_severity` (composite) - Dashboard queries

**Workflow:**
```
detected → verified/rejected → assigned → in_progress → resolved
```

---

#### `work_orders`
Maintenance work orders for verified incidents.

```sql
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    assigned_to TEXT,                        -- Person/team assigned
    status TEXT NOT NULL DEFAULT 'pending',  -- pending|assigned|in_progress|completed|cancelled
    priority TEXT NOT NULL DEFAULT 'medium', -- low|medium|high|urgent
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    resolution_notes TEXT
);
```

**Indexes:**
- `idx_work_orders_incident_id` - Join with incidents
- `idx_work_orders_department_id` - Filter by department
- `idx_work_orders_status` - Filter by status
- `idx_work_orders_priority` - Sort by urgency

---

#### `incident_observations`
Multiple detections of the same incident by different buses.

```sql
CREATE TABLE incident_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    evidence_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purpose:** Strengthen incident confidence when multiple buses detect the same issue.

---

### Database Functions

#### `update_updated_at_column()`
Automatic trigger that updates `updated_at` timestamp on row changes.

Applied to: `buses`, `incidents`, `work_orders`

#### `calculate_distance(lat1, lon1, lat2, lon2)`
Calculate distance in meters between two geographic points using PostGIS.

```sql
SELECT calculate_distance(28.6139, 77.2090, 28.7041, 77.1025);
-- Returns: distance in meters
```

---

## Row Level Security (RLS)

### Access Model

CityPulse uses **public read, authenticated write** model:

- **Anonymous (anon) role**: Read-only access to all tables
- **Authenticated role**: Read + write access
- **Service role**: Bypasses all RLS (admin operations)

### Policies Applied

#### Buses
```sql
-- Public can view all buses
CREATE POLICY "Public read access to buses" ON buses
    FOR SELECT TO anon, authenticated USING (true);

-- Authenticated can update bus status (IoT devices)
CREATE POLICY "Authenticated write access to buses" ON buses
    FOR UPDATE TO authenticated USING (true);
```

#### Incidents
```sql
-- Public can view all incidents
CREATE POLICY "Public read access to incidents" ON incidents
    FOR SELECT TO anon, authenticated USING (true);

-- Authenticated can create incidents (AI detection)
CREATE POLICY "Authenticated write access to incidents" ON incidents
    FOR INSERT TO authenticated WITH CHECK (true);

-- Authenticated can update incident status
CREATE POLICY "Authenticated update access to incidents" ON incidents
    FOR UPDATE TO authenticated USING (true);
```

#### Work Orders & Departments
Similar pattern: Public read, authenticated write.

### Why Public Read Access?

CityPulse is a **public monitoring dashboard** for transparency:
- Citizens can view road conditions
- No sensitive personal data
- Incidents are public infrastructure issues
- Work order status is transparent

**For Production with User Auth:**
If you implement user authentication later:
1. Remove `anon` from SELECT policies
2. Add `auth.uid()` checks to policies
3. Implement role-based access (e.g., only dept managers can update work orders)

---

## Environment Variables

### Required for Database Access

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Optional for Admin Operations

```bash
# Only needed if using createAdminClient() for operations that bypass RLS
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Where to find these:**
1. Go to Project Settings → API
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Verification Steps

### 1. Check Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
```

Expected: `buses`, `departments`, `incidents`, `work_orders`, `incident_observations`

### 2. Verify Extensions

```sql
SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'postgis');
```

Expected: Both extensions installed

### 3. Check Departments Seeded

```sql
SELECT name FROM departments ORDER BY name;
```

Expected: 4 departments

### 4. Verify RLS Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Expected: `rowsecurity = true` for all tables

### 5. Test Policies

```sql
-- Switch to anon role
SET ROLE anon;
SELECT COUNT(*) FROM buses; -- Should work (read allowed)

-- Try insert (should fail - anon can't write)
INSERT INTO buses (bus_code, route_name, status) 
VALUES ('TEST-001', 'Test Route', 'online');
-- Expected error: "new row violates row-level security policy"

RESET ROLE;
```

---

## Common Issues

### "relation does not exist"

**Cause:** Schema not executed or tables not created  
**Fix:** Run `supabase/schema.sql` in SQL Editor

### "permission denied for table"

**Cause:** RLS policies not set up  
**Fix:** Run `supabase/rls_policies.sql`

### "function ST_Distance does not exist"

**Cause:** PostGIS extension not enabled  
**Fix:** Run `CREATE EXTENSION IF NOT EXISTS "postgis";`

### API returns empty arrays

**Cause:** Tables exist but empty, or RLS blocking queries  
**Fix:** 
1. Run `supabase/seed.sql` for sample data
2. Verify policies allow anon SELECT
3. Check browser console for specific errors

### "uuid_generate_v4() does not exist"

**Cause:** UUID extension not enabled  
**Fix:** Run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

---

## Storage Setup (Optional)

For incident evidence images:

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name: `incidents`
4. Public: Yes (for public dashboard viewing)
5. Create bucket

**Storage policies:**
```sql
-- Allow public to view images
CREATE POLICY "Public can view incident images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'incidents');

-- Allow authenticated to upload
CREATE POLICY "Authenticated can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'incidents');
```

**Usage in app:**
```typescript
const { data, error } = await supabase.storage
  .from('incidents')
  .upload(`${incidentId}.jpg`, file);
```

---

## Maintenance

### Backup Database

Via Supabase Dashboard:
1. Go to Database → Backups
2. Scheduled backups run automatically
3. Manual backup: Click "Create backup"

### Monitor Performance

1. Go to Database → Query Performance
2. Check slow queries
3. Add indexes if needed

### View Logs

1. Go to Logs → Database
2. Filter by severity
3. Check for errors or slow queries

---

## Migration Strategy

For production updates, use migration files:

```bash
supabase/migrations/
  001_initial_schema.sql       # Initial setup
  002_add_notifications.sql    # Future additions
  003_alter_incidents.sql      # Schema changes
```

**Apply migrations:**
```bash
# Local development
supabase db reset

# Production via CLI
supabase db push
```

---

## Next Steps

1. ✅ Database schema created
2. ✅ RLS policies configured
3. ✅ Sample data loaded (optional)
4. 🔄 Connect app to database (`.env.local`)
5. 🔄 Verify at `/api/health`
6. 🚀 Start building features!

---

For questions or issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- Project README
