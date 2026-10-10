# Project Structure & Conventions

## Directory Layout

```
CITYPULSE/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── page.tsx              # Command center overview
│   │   ├── fleet/                # Bus fleet monitoring
│   │   ├── incidents/            # Incident management
│   │   ├── map/                  # GIS map view
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── work-orders/          # Department work orders
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── health/               # Health check
│   │   ├── buses/                # Bus fleet endpoints
│   │   ├── incidents/            # Incident CRUD
│   │   ├── detections/           # AI detection ingestion
│   │   ├── work-orders/          # Work order management
│   │   ├── analytics/            # Analytics data
│   │   └── webhooks/             # External integrations
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Public home/landing
│   └── globals.css               # Global styles + Tailwind
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── map/                      # Map-related components
│   │   ├── IncidentMap.tsx       # Main map component
│   │   ├── BusMarker.tsx         # Bus location marker
│   │   ├── IncidentMarker.tsx    # Incident marker
│   │   └── HeatmapLayer.tsx      # Heatmap overlay
│   ├── incidents/                # Incident management
│   │   ├── IncidentList.tsx
│   │   ├── IncidentCard.tsx
│   │   ├── IncidentDetails.tsx
│   │   └── VerificationPanel.tsx
│   ├── fleet/                    # Bus fleet components
│   │   ├── BusCard.tsx
│   │   ├── BusStatus.tsx
│   │   └── RouteInfo.tsx
│   ├── analytics/                # Charts and visualizations
│   │   ├── DamageDistribution.tsx
│   │   ├── SeverityChart.tsx
│   │   └── TimeSeriesChart.tsx
│   ├── work-orders/              # Work order components
│   │   ├── WorkOrderForm.tsx
│   │   ├── WorkOrderList.tsx
│   │   └── StatusBadge.tsx
│   └── layout/                   # Layout components
│       ├── DashboardNav.tsx
│       ├── Header.tsx
│       └── Sidebar.tsx
├── lib/                          # Shared utilities and configurations
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client + admin
│   │   └── middleware.ts         # Auth middleware
│   ├── ai/                       # AI service integration
│   │   ├── client.ts             # Python service API client
│   │   ├── fallback.ts           # Simulated detections
│   │   └── types.ts              # Detection types
│   ├── types/                    # Shared TypeScript types
│   │   ├── database.ts           # Database types (generated)
│   │   ├── incident.ts           # Incident types
│   │   ├── bus.ts                # Bus types
│   │   └── workorder.ts          # Work order types
│   ├── schemas/                  # Zod validation schemas
│   │   ├── incident.ts
│   │   ├── bus.ts
│   │   └── workorder.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useIncidents.ts
│   │   ├── useBuses.ts
│   │   └── useAuth.ts
│   ├── constants.ts              # App constants
│   └── utils.ts                  # General utilities
├── supabase/                     # Database migrations & seed
│   ├── migrations/               # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   ├── schema.sql                # Combined schema (for SQL editor)
│   └── seed.sql                  # Sample data
├── docs/                         # Project documentation
│   ├── DESIGN.md                 # System design
│   ├── AUDIT-RESULTS.md          # Audit report
│   ├── API.md                    # API documentation
│   └── chatgpt-analysis.md       # SIH problem statement
├── .kiro/                        # Kiro configuration
│   └── steering/                 # Development guidelines
│       ├── product.md            # Product requirements
│       ├── tech.md               # Tech stack & standards
│       └── structure.md          # This file
├── public/                       # Static assets
│   ├── bus-icon.svg
│   ├── markers/                  # Map marker icons
│   └── ...
└── [config files]                # Root configuration files
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.ts
    ├── .env.example
    └── .env.local
```

## Naming Conventions

### Files and Folders

- **Components**: PascalCase for component files (`IncidentCard.tsx`)
- **Utilities**: camelCase for utility files (`formatCoordinates.ts`)
- **API Routes**: kebab-case for route folders (`/api/work-orders`)
- **Route Groups**: Wrap in parentheses `(dashboard)` - doesn't affect URL structure
- **Database Files**: snake_case with numbers (`001_initial_schema.sql`)

### Code

- **React Components**: PascalCase (`function IncidentMap()`)
- **Functions**: camelCase (`function calculateDistance()`)
- **Constants**: UPPER_SNAKE_CASE (`const MAX_DETECTION_AGE`)
- **Types/Interfaces**: PascalCase (`type Incident`, `interface BusLocation`)
- **Enums**: PascalCase with UPPER_SNAKE_CASE values

```typescript
enum IncidentStatus {
  DETECTED = 'DETECTED',
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}
```

## Component Organization

### Server Components (default)

Use for:
- Data fetching from Supabase
- Initial page loads
- SEO-important content
- Static content

```typescript
// app/(dashboard)/incidents/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function IncidentsPage() {
  const supabase = await createClient();
  const { data: incidents } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return <IncidentList incidents={incidents} />;
}
```

### Client Components

Use for:
- Interactive UI (buttons, forms, modals)
- Maps (Leaflet requires browser)
- Charts (Recharts requires browser)
- Real-time subscriptions
- State management with hooks

```typescript
'use client';

import { useState } from 'react';
import { MapContainer } from 'react-leaflet';

export function IncidentMap({ incidents }: { incidents: Incident[] }) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  return (
    <MapContainer>
      {/* Map content */}
    </MapContainer>
  );
}
```

### Shared Components

- **`components/ui/`**: shadcn/ui primitives (buttons, cards, dialogs)
- **`components/map/`**: Map-specific components (markers, layers)
- **`components/incidents/`**: Incident-related components
- **`components/layout/`**: Layout components (nav, header, sidebar)

## Import Aliases

Use `@/` for absolute imports from project root:

```typescript
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { incidentSchema } from '@/lib/schemas/incident';
import type { Incident } from '@/lib/types/incident';
```

## API Route Structure

### Standard CRUD Pattern

```typescript
// app/api/incidents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { incidentSchema } from '@/lib/schemas/incident';

// GET /api/incidents - List incidents
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Query params
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Fetch (RLS automatically applies)
  let query = supabase
    .from('incidents')
    .select('*, buses(number, route), departments(name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count: data.length });
}

// POST /api/incidents - Create incident
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate
    const body = await request.json();
    const validatedData = incidentSchema.parse(body);

    // Insert
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        ...validatedData,
        status: 'DETECTED',
        detected_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Dynamic Route Parameters

```typescript
// app/api/incidents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/incidents/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ... fetch incident by id
}

// PATCH /api/incidents/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updates = await request.json();
  // ... update incident
}
```

## Database Conventions

### Table Names

- Plural: `incidents`, `buses`, `work_orders`
- snake_case: `audit_logs`, `department_assignments`

### Column Names

- snake_case: `created_at`, `bus_id`, `incident_type`
- Timestamps: `created_at`, `updated_at`, `resolved_at`
- Foreign keys: `{table}_id` (e.g., `bus_id`, `department_id`)
- Booleans: `is_verified`, `is_active`
- Enums: descriptive (`incident_type`, `severity_level`)

### Relationships

```sql
-- One-to-many: One bus has many incidents
CREATE TABLE incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id uuid REFERENCES buses(id) ON DELETE CASCADE,
  -- ...
);

-- Many-to-one: Many work orders belong to one incident
CREATE TABLE work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES incidents(id) ON DELETE CASCADE,
  -- ...
);

-- Many-to-many: Incidents can be assigned to multiple departments (via junction)
CREATE TABLE department_assignments (
  incident_id uuid REFERENCES incidents(id),
  department_id uuid REFERENCES departments(id),
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (incident_id, department_id)
);
```

## Environment Variables

### Required Variables

```bash
# Supabase (public - safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase (server-only - NEVER expose)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Python AI Service (server-only)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-api-key

# Optional: Gemini API (server-only, if used)
GEMINI_API_KEY=your-gemini-key
```

### Usage Rules

- ✅ Browser code can access `NEXT_PUBLIC_*` variables
- ❌ Never access non-prefixed variables in client components
- ✅ API routes can access all variables
- ✅ Server components can access all variables

## Type Safety

### Generated Database Types

Use Supabase CLI to generate types:

```bash
npx supabase gen types typescript --project-id your-project-id > lib/types/database.ts
```

Then use in queries:

```typescript
import type { Database } from '@/lib/types/database';

const supabase = createClient<Database>();

const { data } = await supabase
  .from('incidents')  // TypeScript knows this table exists
  .select('*')        // TypeScript knows the columns
  .single();          // data is typed as Incident
```

### Manual Types

For complex types, define manually:

```typescript
// lib/types/incident.ts
export type IncidentStatus = 
  | 'DETECTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export type IncidentType = 
  | 'pothole'
  | 'crack'
  | 'flooding'
  | 'debris'
  | 'congestion';

export interface Incident {
  id: string;
  bus_id: string;
  type: IncidentType;
  status: IncidentStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
  };
  confidence: number;
  image_url?: string;
  description?: string;
  detected_at: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}
```

## Map Integration

### Leaflet Components (Client-Side Only)

```typescript
'use client';

import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

export function IncidentMap() {
  return (
    <MapContainer
      center={[28.6139, 77.2090]}  // Delhi
      zoom={12}
      style={{ height: '600px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {/* Markers */}
    </MapContainer>
  );
}
```

## Testing Conventions (Future)

```
tests/
├── unit/
│   ├── lib/
│   │   └── utils.test.ts
│   └── schemas/
│       └── incident.test.ts
├── integration/
│   └── api/
│       └── incidents.test.ts
└── e2e/
    └── incident-workflow.test.ts
```

## Git Workflow

- Branch naming: `feature/incident-map`, `fix/auth-redirect`
- Commit messages: Conventional commits (`feat:`, `fix:`, `docs:`)
- PR titles: Clear and descriptive
- Merge to `main` triggers Vercel deployment

## Documentation

Keep these updated as features are built:
- `docs/API.md` - API endpoint documentation
- `docs/DESIGN.md` - System architecture
- `README.md` - Setup instructions
- Inline JSDoc for complex functions

---

**Remember:** This structure supports both the SIH demo and future production scaling. Keep it simple for MVP, but organized for growth.
