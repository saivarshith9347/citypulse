# CityPulse AI - Database Setup Guide

**Status:** Ready for Configuration  
**Database:** Supabase PostgreSQL with PostGIS  
**Date:** October 9, 2026

---

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project (note: takes ~2 minutes to provision)
3. **Environment Variables**: Have your `.env.local` file ready

---

## Step 1: Get Supabase Credentials

### A. Navigate to Project Settings

1. Open your Supabase project dashboard
2. Click **Settings** (gear icon in sidebar)
3. Click **API** in the settings menu

### B. Copy Required Values

You'll need three values:

1. **Project URL**
   - Found under "Project URL"
   - Example: `https://abcdefghijklmnop.supabase.co`

2. **Anon/Public Key**
   - Found under "Project API keys" → `anon` `public`
   - This key is safe for browser use

3. **Service Role Key** ⚠️
   - Found under "Project API keys" → `service_role` `secret`
   - **NEVER expose this to the browser**
   - Only use in server-side code

---

## Step 2: Configure Environment Variables

### Update `.env.local`

```bash
# Supabase Configuration (replace with your values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: AI Service (for future)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-key-here

# Optional: Gemini API (for future)
GEMINI_API_KEY=your-gemini-key-here
```

**Important:**
- Replace `your-project-id`, `your-anon-key-here`, and `your-service-role-key-here` with actual values
- Do NOT commit `.env.local` to git (already in `.gitignore`)
- The service role key must remain server-only

---

## Step 3: Run Database Schema

### Option A: Using Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Open `supabase/schema.sql` from this project
5. **Copy the entire file contents**
6. **Paste into the SQL Editor**
7. Click **Run** (or press Cmd/Ctrl + Enter)

**Expected output:**
```
Success. No rows returned
```

This means the schema was created successfully!

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Initialize Supabase in project (if not done)
supabase init

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

---

## Step 4: Verify Schema Creation

### Check Tables

Run this query in the SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- `buses`
- `departments`
- `incidents`
- `incident_observations`
- `work_orders`

### Check Row Level Security

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**All tables should show `rowsecurity = true`**

### Check Sample Departments

```sql
SELECT * FROM departments;
```

**Expected rows:**
- Roads & Infrastructure
- Traffic Management
- Public Works
- Emergency Services

---

## Step 5: Load Seed Data (Optional)

To populate with sample incidents and buses:

1. Open `supabase/seed.sql`
2. Copy the entire contents
3. Paste in SQL Editor
4. Run the query

**This creates:**
- 8 sample buses
- 10 sample incidents
- 3 sample work orders
- 1 sample observation

---

## Step 6: Configure Storage Bucket

For evidence images (detection photos):

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name: `incidents`
4. **Public bucket:** No (keep private for now)
5. Click **Create bucket**

### Set Bucket Policies

Navigate to **Storage** → `incidents` bucket → **Policies**

Create a policy:

**Name:** Authenticated users can upload  
**Operation:** INSERT  
**Policy:**
```sql
(auth.role() = 'authenticated')
```

**Name:** Authenticated users can read  
**Operation:** SELECT  
**Policy:**
```sql
(auth.role() = 'authenticated')
```

---

## Step 7: Verify Application Connection

### A. Restart Development Server

```bash
# Kill existing server if running
# Then restart
npm run dev
```

### B. Test Health Check

Open: http://localhost:3000/api/health

**Expected response (success):**
```json
{
  "status": "ok",
  "supabase": "connected",
  "message": "Database connection successful",
  "environment": "configured",
  "tables_verified": true,
  "timestamp": "2026-10-09T..."
}
```

**If you see an error:**
- Check environment variables in `.env.local`
- Verify schema was run successfully
- Check Supabase project is active (not paused)

### C. Test Dashboard

Open: http://localhost:3000/dashboard

**If database is connected:**
- No yellow "Database Not Configured" warning
- Stats show real data from seed.sql
- No "Demo Data" badges

**If still showing demo data:**
- Check browser console for errors
- Verify health check endpoint returns "ok"
- Check Supabase dashboard logs for query errors

---

## Database Schema Overview

### Tables

#### `buses`
Public transport fleet serving as mobile sensors.

**Key Fields:**
- `bus_code` - Unique identifier (e.g., "DL-1234")
- `route_name` - Route assignment
- `status` - online | offline | maintenance
- `last_latitude`, `last_longitude` - GPS coordinates
- `last_seen_at` - Last ping timestamp

#### `incidents`
Detected road damage and traffic incidents.

**Key Fields:**
- `event_type` - pothole | crack | flooding | debris | congestion | accident
- `severity` - low | medium | high | critical
- `confidence` - AI detection confidence (0-100%)
- `verification_status` - detected → verified → assigned → in_progress → resolved
- `latitude`, `longitude` - Incident location
- `bus_id` - Bus that detected it (foreign key)
- `evidence_path` - Path to detection image

#### `departments`
Municipal departments responsible for repairs.

**Key Fields:**
- `name` - Department name (unique)
- `contact_email` - Contact information

#### `work_orders`
Maintenance work orders for incidents.

**Key Fields:**
- `incident_id` - Related incident (foreign key)
- `department_id` - Assigned department (foreign key)
- `status` - pending | assigned | in_progress | completed | cancelled
- `priority` - low | medium | high | urgent
- `assigned_to` - Personnel assigned
- `resolution_notes` - Completion notes

#### `incident_observations`
Multiple detections of the same incident by different buses.

**Key Fields:**
- `incident_id` - Parent incident (foreign key)
- `bus_id` - Bus that made observation (foreign key)
- `observed_at` - Observation timestamp
- `confidence` - Detection confidence
- `latitude`, `longitude` - Observation location

### Relationships

```
buses ──┬─> incidents ──┬─> work_orders
        │               └─> incident_observations
        └─> incident_observations

departments ──> work_orders
```

### Indexes

All tables have proper indexes for:
- Primary keys (UUID)
- Foreign keys
- Frequently queried fields (status, timestamps)
- Geographic data (PostGIS GIST indexes)

---

## Row Level Security (RLS)

### Current Policies (MVP)

**All Tables:**
- ✅ RLS Enabled
- ✅ Authenticated users can READ all data
- ✅ Authenticated users can CREATE incidents/work orders
- ✅ Authenticated users can UPDATE incidents/work orders
- ❌ DELETE restricted (audit trail)
- ❌ Public access blocked

### Future Enhancements

Role-based policies will be added:

- **Operators**: Verify incidents
- **Analysts**: Assign to departments
- **Supervisors**: Create work orders
- **Admins**: Full access

---

## Data Access Functions

### Server-Side Functions (lib/db/)

All data access goes through typed functions:

#### Incidents (`lib/db/incidents.ts`)
- `getIncidents(query)` - List with filters
- `getIncidentById(id)` - Single incident with relations
- `createIncident(data)` - Create new incident
- `updateIncident(data)` - Update status/verification
- `getIncidentStats()` - Dashboard statistics
- `getRecentIncidents(limit)` - Latest incidents

#### Buses (`lib/db/buses.ts`)
- `getBuses(query)` - List with filters
- `getBusById(id)` - Single bus with incidents
- `getBusStats()` - Fleet statistics
- `getBusesWithDetectionCounts()` - Buses + detection counts

### Validation (lib/schemas/)

All inputs validated with Zod:

- `incidentSchema` - Incident structure
- `createIncidentSchema` - New incident validation
- `updateIncidentSchema` - Update validation
- `busSchema`, `workOrderSchema`, etc.

---

## Common Issues & Solutions

### Issue: "Failed to fetch incidents" error

**Cause:** Schema not run or RLS blocking access

**Solution:**
```sql
-- Check if tables exist
SELECT * FROM incidents LIMIT 1;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Verify you're authenticated (run in SQL Editor)
SELECT auth.uid();  -- Should return a UUID
```

### Issue: Dashboard shows demo data despite schema

**Cause:** Environment variables not loaded or connection failed

**Solution:**
1. Restart dev server: `npm run dev`
2. Check `.env.local` has correct values
3. Test health endpoint: `/api/health`
4. Check browser console for errors

### Issue: "Service role key" error in browser

**Cause:** Trying to use service role key in client component

**Solution:**
- Never import `createAdminClient()` in client components
- Only use `createClient()` from `lib/supabase/client.ts` in browser
- Service role functions only in API routes or Server Components

### Issue: PostGIS extension error

**Cause:** PostGIS not enabled in Supabase project

**Solution:**
```sql
-- Run in SQL Editor
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### Issue: No data in dropdown/select fields

**Cause:** Seed data not loaded

**Solution:**
1. Run `supabase/seed.sql` in SQL Editor
2. Verify with: `SELECT COUNT(*) FROM incidents;`

---

## Security Checklist

Before going to production:

- [ ] Environment variables properly set
- [ ] `.env.local` in `.gitignore` (already done)
- [ ] Service role key never in browser code
- [ ] RLS enabled on all tables
- [ ] Storage bucket policies configured
- [ ] HTTPS only (enforced by Supabase)
- [ ] Rate limiting configured (optional)
- [ ] Audit logs enabled (optional)

---

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","supabase":"connected"}`

### 2. Query Incidents
Open SQL Editor:
```sql
SELECT 
  i.event_type,
  i.severity,
  i.verification_status,
  b.bus_code
FROM incidents i
LEFT JOIN buses b ON i.bus_id = b.id
ORDER BY i.detected_at DESC
LIMIT 10;
```

### 3. Check Dashboard
Visit: http://localhost:3000/dashboard

Should show:
- Real stats (not demo values)
- No warning banner
- Incidents from database

---

## Next Steps

After database is configured:

1. **Authentication**: Implement login/signup pages
2. **Incident Management**: Build full CRUD interface
3. **GIS Map**: Integrate Leaflet for spatial visualization
4. **Work Orders**: Complete workflow system
5. **Analytics**: Build comprehensive dashboards

---

## Support

### Supabase Documentation
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostGIS](https://supabase.com/docs/guides/database/extensions/postgis)

### Project Files
- Schema: `supabase/schema.sql`
- Seed Data: `supabase/seed.sql`
- Migrations: `supabase/migrations/`
- Data Functions: `lib/db/`
- Validation: `lib/schemas/`

---

**Setup Status:** ⚠️ Requires Manual Configuration

**Once completed, the dashboard will automatically switch from demo data to live database data.**
