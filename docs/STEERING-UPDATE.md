# Steering Files Update Summary

**Date:** October 9, 2026  
**Task:** Update Kiro steering files for CityPulse AI SIH project

---

## What Was Updated

All three steering files have been completely rewritten to reflect the actual **CityPulse AI** project requirements for Smart India Hackathon 2026.

### Files Updated

1. ✅ `.kiro/steering/product.md` (121 lines)
2. ✅ `.kiro/steering/tech.md` (349 lines)
3. ✅ `.kiro/steering/structure.md` (531 lines)

**Total:** 1,001 lines of comprehensive documentation

---

## Key Changes

### 1. Product Definition (.kiro/steering/product.md)

**Before:** Generic placeholder about "AI-powered urban insights platform"

**After:** Complete product specification including:

- **Actual Product**: Bus-based mobile sensing for road damage detection
- **Target Users**: Municipal operators, department supervisors, city officials, admins
- **7 MVP Modules**:
  1. Command Center Dashboard
  2. Bus Fleet Monitoring
  3. Incident Management
  4. GIS Map & Heatmaps
  5. Road Damage & Traffic Analytics
  6. Department Assignment & Work Orders
  7. Python AI Service Integration
- **Success Criteria**: Clear demo requirements
- **Out of Scope**: What NOT to build for MVP

**Value:** Developers now understand WHAT to build and WHY

---

### 2. Technology Stack (.kiro/steering/tech.md)

**Before:** Generic stack with Gemini AI focus

**After:** Complete technical architecture including:

#### Frontend Stack
- Next.js 16+ with TypeScript
- Tailwind CSS + shadcn/ui
- **Leaflet.js** for maps (OpenStreetMap)
- **Recharts** for analytics
- Vercel deployment

#### Backend Stack
- Supabase PostgreSQL + **PostGIS** (for geospatial)
- Supabase Auth + Storage
- Row Level Security (RLS) policies

#### AI Processing
- **Separate Python service** (FastAPI)
- OpenCV + YOLO for detection
- REST API integration
- **Fallback strategy** for when AI unavailable

#### Security Standards
- Clear separation of server-only vs. browser-safe env vars
- `SUPABASE_SERVICE_ROLE_KEY` - Server only ❌ browser
- `AI_SERVICE_API_KEY` - Server only ❌ browser
- `NEXT_PUBLIC_*` - Safe for browser ✅
- RLS policies for all tables by role (operator, supervisor, admin)

#### API Design Patterns
- Zod validation for all inputs
- Standard error handling
- Auth checks on every route
- Audit trail logging

#### Code Quality Standards
- TypeScript strict mode
- Naming conventions
- No unnecessary dependencies (no Redis, Socket.IO, etc.)

**Value:** Developers know HOW to build securely and correctly

---

### 3. Project Structure (.kiro/steering/structure.md)

**Before:** Generic Next.js folder layout

**After:** Detailed directory structure for CityPulse AI:

#### Complete Directory Tree
```
app/
  (auth)/          # Login/signup
  (dashboard)/     # Protected routes
    fleet/         # Bus monitoring
    incidents/     # Incident management
    map/           # GIS view
    analytics/     # Charts
    work-orders/   # Maintenance workflow
  api/             # All API routes
    buses/
    incidents/
    detections/
    work-orders/
    analytics/

components/
  ui/              # shadcn/ui
  map/             # Map components
  incidents/       # Incident UI
  fleet/           # Bus UI
  analytics/       # Charts
  work-orders/     # Work order UI
  layout/          # Nav, header, sidebar

lib/
  supabase/        # Auth clients
  ai/              # Python service client + fallback
  types/           # TypeScript types
  schemas/         # Zod schemas
  hooks/           # Custom React hooks
  constants.ts
  utils.ts

supabase/
  migrations/      # SQL migrations
  schema.sql       # Combined schema
  seed.sql         # Sample data
```

#### Naming Conventions
- Components: `IncidentCard.tsx`
- API routes: `/api/work-orders`
- Database: `snake_case` tables
- Types: PascalCase
- Constants: UPPER_SNAKE_CASE

#### Component Patterns
- **Server Components**: Data fetching, SEO
- **Client Components**: Maps, charts, interactivity
- Import aliases: `@/lib/supabase/client`

#### API Route Structure
- Standard CRUD pattern with examples
- Auth checks
- Zod validation
- Error handling
- RLS integration

#### Database Conventions
- Table names: plural, snake_case
- Foreign keys: `{table}_id`
- Timestamps: `created_at`, `updated_at`
- PostGIS for GPS: `geography(Point, 4326)`

#### Type Safety
- Generate types from Supabase
- Manual types for complex structures
- Zod schemas for runtime validation

#### Map Integration
- Leaflet with SSR workaround
- OpenStreetMap tiles (no API key)
- PostGIS spatial queries

**Value:** Developers know WHERE to put code and HOW to organize it

---

## Architecture Highlights

### Separation of Concerns

```
┌─────────────────────────────────────────┐
│   Next.js Web App (Vercel)             │
│   - User interface                      │
│   - API routes                          │
│   - Supabase client                     │
└────────────┬────────────────────────────┘
             │
             ├──────────────────────────┐
             │                          │
             ▼                          ▼
┌────────────────────┐    ┌────────────────────────┐
│  Supabase Backend  │    │  Python AI Service     │
│  - PostgreSQL      │    │  - FastAPI             │
│  - PostGIS         │    │  - OpenCV + YOLO       │
│  - Auth            │    │  - Damage detection    │
│  - Storage         │    │  - Docker container    │
│  - RLS             │    │  - REST API            │
└────────────────────┘    └────────────────────────┘
```

### Data Flow

```
Bus Camera → Python AI Service → Detection Result
                    ↓
        Next.js API Route (validate)
                    ↓
           Supabase (store with RLS)
                    ↓
       Dashboard UI (fetch with RLS)
                    ↓
    Operator verifies → Department assigned → Work order created
```

### Security Model

```
Browser
  ├─ Can access: NEXT_PUBLIC_* env vars ✅
  ├─ Supabase auth: Anon key (RLS enforced) ✅
  └─ Cannot access: Service role key ❌

API Routes (Server)
  ├─ Can access: All env vars ✅
  ├─ Supabase auth: Service role (bypasses RLS) ✅
  └─ Python AI service: API key auth ✅

Database (Supabase)
  ├─ RLS enabled on all tables ✅
  ├─ Operators: Read all, verify detections
  ├─ Supervisors: Create work orders
  └─ Admins: Full access
```

---

## MVP Module Definitions

### Module 1: Command Center Dashboard
**Purpose:** Real-time system overview  
**Features:** Live bus map, recent detections, alert counters, system health

### Module 2: Bus Fleet Monitoring
**Purpose:** Track sensing units  
**Features:** Bus locations, online/offline status, detection activity per bus

### Module 3: Incident Management
**Purpose:** Core workflow hub  
**Features:** Browse incidents, verify/reject, filter, assign to departments

### Module 4: GIS Map & Heatmaps
**Purpose:** Spatial visualization  
**Features:** Interactive map, incident markers, heatmap overlay, clustering

### Module 5: Road Damage & Traffic Analytics
**Purpose:** Insights and trends  
**Features:** Damage distribution charts, severity breakdown, time-series analysis

### Module 6: Department Assignment & Work Orders
**Purpose:** Maintenance workflow  
**Features:** Assign to departments, create work orders, track progress, photo upload

### Module 7: Python AI Service Integration
**Purpose:** AI processing pipeline  
**Features:** Detection API, YOLO inference, confidence scoring, fallback to simulated data

---

## Implementation Phases (Recommended)

### Phase 1: Foundation (Week 1)
- Database schema with RLS
- Auth pages (login/signup)
- Basic dashboard layout
- Map component setup

### Phase 2: Core Workflow (Week 2)
- Incident CRUD API
- Bus fleet API
- Incident list and details UI
- Map with markers

### Phase 3: AI Integration (Week 3)
- Python AI service API client
- Detection ingestion endpoint
- Simulated data fallback
- Verification workflow

### Phase 4: Analytics & Work Orders (Week 4)
- Analytics dashboard with charts
- Heatmap implementation
- Work order system
- Department assignment

### Phase 5: Polish & Demo (Week 5)
- UI refinements
- Sample data seeding
- Performance optimization
- Demo script preparation

---

## Key Architectural Decisions

### ✅ Decisions Made

1. **Leaflet over Google Maps**: No API key, unlimited usage, OSM tiles
2. **Separate Python AI Service**: Better isolation, can scale independently
3. **PostGIS for geospatial**: Native PostgreSQL, efficient spatial queries
4. **Recharts for analytics**: Lightweight, React-native, no d3.js complexity
5. **No Redis/Socket.IO**: Supabase real-time sufficient for MVP
6. **Simulated data fallback**: Demo works even if AI service down
7. **RLS over middleware auth**: Database-level security, foolproof

### ❌ Explicitly Avoided

1. **Multiple databases**: PostgreSQL handles everything
2. **GraphQL**: REST API simpler for MVP
3. **Complex state management**: React hooks sufficient
4. **Real-time streaming**: Polling adequate for demo
5. **Native mobile apps**: Responsive web only for MVP

---

## Security Checklist

✅ All tables have RLS enabled  
✅ Service role key never exposed to browser  
✅ AI service API key server-only  
✅ All API inputs validated with Zod  
✅ Auth checks on every protected route  
✅ GPS coordinates validated (lat/lng bounds)  
✅ Image uploads validated (type, size)  
✅ Audit trail for all state changes  
✅ Rate limiting on detection endpoints  

---

## Next Steps for Developers

1. **Read all three steering files** in `.kiro/steering/`
2. **Review `docs/DESIGN.md`** for detailed architecture
3. **Start with Module 1**: Auth + Database foundation
4. **Follow the structure conventions** in `structure.md`
5. **Use the API patterns** from `tech.md`
6. **Keep security checklist** in mind

---

## Questions Answered by These Docs

- ❓ What are we building? → **product.md**
- ❓ What tech do we use? → **tech.md**
- ❓ Where does code go? → **structure.md**
- ❓ How do we handle auth? → **tech.md (Security section)**
- ❓ How do maps work? → **structure.md (Map Integration)**
- ❓ What if AI service is down? → **tech.md (AI Fallback)**
- ❓ What tables do we need? → **To be created in DESIGN.md**
- ❓ What routes do we build? → **structure.md (API Routes)**
- ❓ How do we deploy? → **tech.md (Deployment)**

---

## File Comparison

### Before Update
- Generic ANPR platform documentation
- Placeholder content
- No specific modules defined
- Gemini-focused AI approach

### After Update
- **CityPulse AI** bus-based road monitoring
- 7 specific MVP modules defined
- Python AI service architecture
- Complete security model
- Detailed code organization
- Implementation phases
- Clear architectural decisions

---

**Status:** ✅ All steering files updated and ready for development

**Next Action:** Begin implementation following Module 1 (Auth + Database)

---

**Updated by:** Kiro AI  
**Documentation Quality:** Production-ready
