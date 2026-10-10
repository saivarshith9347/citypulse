# Technology Stack & Standards

## Core Stack

### Frontend (Next.js Application)
- **Framework**: Next.js 16+ (App Router, TypeScript)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: Leaflet.js with OpenStreetMap tiles
- **Charts**: Recharts (for analytics dashboards)
- **State Management**: React hooks, Server Components for data fetching
- **Deployment**: Vercel

### Backend & Database
- **Database**: Supabase PostgreSQL with PostGIS extension
- **Auth**: Supabase Auth (email/password, role-based)
- **Storage**: Supabase Storage (detection images, work order photos)
- **Row Level Security**: Enabled on all tables
- **Real-time**: Supabase real-time subscriptions (for live updates)

### AI Processing Service (Separate)
- **Framework**: Python FastAPI
- **Computer Vision**: OpenCV
- **Object Detection**: YOLO (YOLOv8 or YOLOv5)
- **Image Processing**: NumPy, Pillow
- **Deployment**: Docker container (standalone service)
- **Communication**: REST API (JSON)

### Optional AI Enhancements
- **Gemini API**: For natural language incident summaries (future)
- **Rate Limiting**: Track usage in database

## TypeScript Standards

- Always use strict mode (`strict: true` in tsconfig.json)
- Prefer explicit types over implicit `any`
- Use Zod for runtime validation at API boundaries
- Define proper types for all function parameters and return values
- Create shared type definitions in `lib/types/`

```typescript
// Example: Zod schema + TypeScript type
import { z } from 'zod';

export const incidentSchema = z.object({
  bus_id: z.string().uuid(),
  type: z.enum(['pothole', 'crack', 'congestion']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  confidence: z.number().min(0).max(100),
});

export type Incident = z.infer<typeof incidentSchema>;
```

## Security Requirements

### Secrets Management

**NEVER expose these to the browser:**

- ❌ `SUPABASE_SERVICE_ROLE_KEY` - Bypasses RLS, server-only
- ❌ `GEMINI_API_KEY` - If used, server-only
- ❌ `AI_SERVICE_API_KEY` - Python service auth, server-only
- ❌ Database connection strings

**Safe for browser (with `NEXT_PUBLIC_` prefix):**

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_MAP_TILE_URL` (if custom tiles)

### Row Level Security (RLS)

**Every table must have RLS enabled.** Policies by role:

#### Operators
- READ: All incidents, buses, departments
- WRITE: Update incident status (detected → verified/rejected)
- NO DELETE: Audit trail preservation

#### Supervisors
- READ: All incidents assigned to their department
- WRITE: Create work orders, assign tasks, update progress
- UPDATE: Mark incidents as in_progress → resolved

#### Admins
- READ: Everything
- WRITE: User management, system configuration
- DELETE: Limited to test data only (production audit trail preserved)

#### Public (Unauthenticated)
- NO ACCESS to any data

### Validation

- Use Zod schemas for ALL API inputs
- Validate and sanitize user inputs
- Validate GPS coordinates (lat/lng bounds)
- Validate image file types and sizes
- Rate limit API endpoints (detection submissions, AI calls)

### Audit Trail

Track these actions in `audit_logs` table:
- Incident status changes
- Work order creation
- Department assignments
- User role changes
- AI service calls

## API Design Standards

### Route Structure

```typescript
// app/api/[resource]/route.ts
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Input validation schema
const inputSchema = z.object({
  // ... fields
});

export async function POST(request: Request) {
  try {
    // 1. Validate input
    const body = await request.json();
    const data = inputSchema.parse(body);

    // 2. Authenticate
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Business logic with RLS
    const { data: result, error } = await supabase
      .from('table')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    // 4. Return response
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
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

### AI Service Integration

Python AI service runs separately. Next.js API routes call it:

```typescript
// app/api/detect/route.ts
export async function POST(request: Request) {
  // 1. Validate auth
  // 2. Get image from request
  // 3. Call Python service: POST http://ai-service:8000/detect
  // 4. Store detection in Supabase
  // 5. Return result
  
  // Fallback: If AI service unavailable, return simulated detection
}
```

**Environment variable for AI service:**
```bash
AI_SERVICE_URL=http://localhost:8000  # Dev
AI_SERVICE_URL=https://ai.citypulse.app  # Production
AI_SERVICE_API_KEY=secret_key_here  # Server-only
```

## Database Standards

### Schema Design

- Use UUIDs for primary keys (`uuid` type, `gen_random_uuid()`)
- Include `created_at` and `updated_at` on all tables
- Use `timestamptz` for timestamps (timezone-aware)
- Use PostGIS `geography(Point, 4326)` for GPS coordinates
- Use `jsonb` for flexible metadata fields
- Add indexes on foreign keys and query-heavy columns

### Naming Conventions

- Tables: `snake_case`, plural (`incidents`, `work_orders`)
- Columns: `snake_case` (`bus_id`, `created_at`)
- Indexes: `idx_table_column` (`idx_incidents_bus_id`)
- Foreign keys: `fk_table_column` (`fk_incidents_bus_id`)
- Enum types: `snake_case` with `_enum` suffix (`incident_type_enum`)

### Migrations

Store all migrations in `supabase/migrations/`:
```
supabase/migrations/
  001_initial_schema.sql
  002_add_work_orders.sql
  003_add_rls_policies.sql
```

Create a combined `supabase/schema.sql` for easy setup.

## GIS and Mapping

### Leaflet Integration

```typescript
'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Use OpenStreetMap tiles (free, no API key)
const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
```

### PostGIS Queries

```sql
-- Find incidents within 500m of a point
SELECT * FROM incidents
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  500  -- meters
);

-- Calculate distance between bus and incident
SELECT 
  bus_id,
  ST_Distance(
    bus_location::geography,
    incident_location::geography
  ) as distance_meters
FROM bus_incidents;
```

## Code Quality

- Use meaningful variable and function names
- Write self-documenting code with clear intent
- Add JSDoc comments for complex functions
- Keep functions small and focused (<50 lines)
- Follow the DRY principle
- Extract magic numbers to named constants

```typescript
// Good
const MAX_DETECTION_AGE_HOURS = 24;
const CRITICAL_SEVERITY_THRESHOLD = 80;

// Bad
if (detection.age > 24 && detection.score > 80) { ... }
```

## Testing Strategy (Future)

- Unit tests for utility functions (`lib/utils/`)
- API route tests with Supabase mocks
- E2E tests for critical flows (incident workflow)
- AI service integration tests

## Performance

- Use Next.js Server Components for data fetching
- Implement pagination for large lists (100 items per page)
- Lazy load map markers (cluster for >100 points)
- Optimize images (next/image component)
- Cache analytics queries (hourly aggregation)

## AI Service Fallback Strategy

If Python AI service is unavailable:

1. **Graceful Degradation**: Return simulated detections with clear flag
2. **Queue for Retry**: Store image, process when service recovers
3. **Status Indicator**: Show "AI service unavailable" in dashboard
4. **Demo Mode**: Use pre-generated detections for SIH demo

```typescript
async function detectRoadDamage(imageUrl: string) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/detect`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AI_SERVICE_API_KEY}` },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    
    if (!response.ok) throw new Error('AI service error');
    
    return await response.json();
  } catch (error) {
    // Fallback to simulated detection
    console.warn('AI service unavailable, using simulated data');
    return generateSimulatedDetection();
  }
}
```

## Deployment

### Vercel (Next.js App)
- Automatic deployments from main branch
- Environment variables in project settings
- Edge middleware for auth
- Serverless API routes

### Python AI Service
- Docker container
- Deploy on Render, Railway, or DigitalOcean
- Expose REST API endpoint
- Health check endpoint: `/health`

### Supabase
- Managed PostgreSQL instance
- Enable PostGIS extension
- Configure Auth providers
- Set up Storage buckets

## No Unnecessary Dependencies

**DO NOT ADD unless justified:**
- ❌ Redis (use Supabase for caching)
- ❌ Socket.IO (use Supabase real-time)
- ❌ Additional databases (PostgreSQL sufficient)
- ❌ Complex state management (React hooks sufficient)
- ❌ GraphQL (REST API is adequate)

Keep the stack simple and maintainable.
