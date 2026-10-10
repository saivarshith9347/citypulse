# CityPulse AI - Quick Start Guide

## Overview
This guide helps you get CityPulse AI running locally in under 10 minutes.

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier: https://supabase.com)
- Git (optional)

---

## Step 1: Environment Setup (2 minutes)

### 1.1 Install Dependencies
```bash
cd /Users/ksaivarshith/Downloads/CITYPULSE
npm install
```

### 1.2 Configure Environment Variables
Already done! Your `.env.local` file is configured.

---

## Step 2: Database Setup (5 minutes)

### 2.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - Name: `citypulse` (or any name)
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait 2-3 minutes for project creation

### 2.2 Get API Credentials
1. In your project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon public** key
   - **service_role** key (click "Reveal" to see it)

### 2.3 Update Environment Variables
Edit `.env.local` and replace:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2.4 Run Database Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Should see "Success. No rows returned"

### 2.5 Load Seed Data
1. Still in SQL Editor, click **New Query**
2. Copy entire contents of `supabase/seed.sql`
3. Paste and click **Run**
4. Should insert 4 departments

---

## Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

Server starts at: http://localhost:3000

---

## Step 4: Verify Everything Works

### 4.1 Check Health Endpoint
Open: http://localhost:3000/api/health

Should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-10-09T..."
}
```

### 4.2 Check Dashboard
Open: http://localhost:3000/dashboard

Should see:
- Sidebar with navigation
- 6 stat cards (may show 0 if no data)
- Charts (may be empty if no data)
- Fleet status

### 4.3 Check GIS Map
Open: http://localhost:3000/dashboard/map

Should see:
- Interactive map (OpenStreetMap)
- Filters panel (toggle with "Filters" button)
- Side panel with incident list (may be empty)

### 4.4 Check Incident Management
Open: http://localhost:3000/dashboard/incidents

Should see:
- Statistics cards
- Search bar
- Incident table (may be empty)

---

## Step 5: Add Sample Data (Optional)

### 5.1 Create a Sample Incident via API

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "pothole",
    "severity": "high",
    "confidence": 85,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "description": "Large pothole on main road"
  }'
```

Should return the created incident JSON.

### 5.2 Verify on Map
1. Refresh http://localhost:3000/dashboard/map
2. Should see a marker at the coordinates
3. Click marker to see popup

### 5.3 Verify in Incident Management
1. Refresh http://localhost:3000/dashboard/incidents
2. Should see the incident in the table
3. Click to open detail modal

---

## Troubleshooting

### Build Errors
**Problem**: TypeScript errors or build fails
**Solution**: 
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Failed
**Problem**: Health check shows "disconnected"
**Solution**:
1. Verify `.env.local` has correct credentials
2. Check Supabase project is running (not paused)
3. Restart dev server: `npm run dev`

### Map Not Displaying
**Problem**: Blank map or white screen
**Solution**:
1. Check browser console for errors
2. Verify Leaflet CSS is loading (check Network tab)
3. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### No Data Showing
**Problem**: Tables are empty
**Solution**:
1. Check if database migrations ran successfully
2. Verify seed data was inserted (check Supabase Table Editor)
3. Create sample incident using curl command above

### Port Already in Use
**Problem**: "Port 3000 already in use"
**Solution**:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## What to Test

### ✅ Basic Functionality
- [ ] Dashboard loads without errors
- [ ] Map displays correctly
- [ ] Can toggle filters panel
- [ ] Can refresh data
- [ ] Incident table displays
- [ ] Search works
- [ ] Statistics update

### ✅ Incident Workflow
- [ ] Create incident via API
- [ ] See incident on map
- [ ] Click marker shows popup
- [ ] Click incident in table opens modal
- [ ] Can update status
- [ ] Can add description
- [ ] Can create work order

### ✅ Work Orders
- [ ] Work order modal opens
- [ ] Department auto-selects
- [ ] Priority auto-sets
- [ ] Can submit work order
- [ ] Incident status updates to "assigned"

### ✅ Filters
- [ ] Filter by incident type
- [ ] Filter by severity
- [ ] Filter by status
- [ ] Multiple filters work together
- [ ] Clear filters resets

### ✅ Responsive Design
- [ ] Desktop view (>1024px)
- [ ] Tablet view (768-1024px)
- [ ] Mobile view (<768px)
- [ ] Map works on mobile
- [ ] Modals fit on small screens

---

## Next Steps

### 1. Add More Sample Data
Create buses, more incidents, and work orders using the API or Supabase Table Editor.

### 2. Implement Authentication
Add login/signup pages using Supabase Auth.

### 3. Build Remaining Pages
- Fleet monitoring (`/dashboard/fleet`)
- Road health analytics (`/dashboard/road-health`)
- Analytics dashboard (`/dashboard/analytics`)
- Work orders management (`/dashboard/work-orders`)
- Reports (`/dashboard/reports`)
- Settings (`/dashboard/settings`)

### 4. Integrate AI Service
Build the Python AI service for image analysis and connect it.

### 5. Deploy to Production
Deploy to Vercel or your preferred hosting platform.

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database (via Supabase dashboard)
# - SQL Editor: Run migrations
# - Table Editor: View/edit data
# - API Docs: Test endpoints

# Testing
curl http://localhost:3000/api/health  # Check health
curl http://localhost:3000/api/incidents  # Get incidents
curl http://localhost:3000/api/buses  # Get buses
curl http://localhost:3000/api/departments  # Get departments
```

---

## Documentation

- `README.md`: Project overview
- `docs/DESIGN.md`: System architecture
- `docs/DATABASE-SETUP.md`: Detailed database guide
- `docs/MAP-AND-INCIDENT-MANAGEMENT.md`: Map/incident features
- `docs/IMPLEMENTATION-SUMMARY.md`: Complete feature list

---

## Support

**Issues?** Check:
1. Browser console for frontend errors
2. Terminal for backend errors
3. Supabase logs for database issues
4. Network tab for API failures

**Still stuck?** Review the troubleshooting section or check documentation.

---

## Success! 🎉

If you can:
- ✅ See the dashboard
- ✅ View the map
- ✅ Create an incident
- ✅ See it on the map
- ✅ Update its status

**You're ready to develop!**

---

**Happy coding! 🚀**
