# CityPulse AI

AI-powered urban infrastructure monitoring platform using public transport fleet as mobile sensing units for road damage detection and traffic analysis.

**Smart India Hackathon 2026**

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL + PostGIS + Row Level Security)
- **AI**: Google Gemini API (planned)
- **Maps**: Leaflet with OpenStreetMap
- **Deployment**: Vercel-ready

## ✨ Features

- 🚌 **Live Fleet Monitoring** - Real-time bus status and location tracking
- 📍 **GIS Map View** - Interactive incident visualization with filtering
- 🔍 **Incident Management** - Detection, verification, and workflow tracking
- 📊 **Analytics Dashboard** - Traffic patterns and incident trends
- 🛠️ **Work Order System** - Automated maintenance workflow
- 📈 **Road Health Scoring** - Infrastructure condition assessment
- 📄 **Report Generation** - CSV export for analysis

## 🎯 Demo Mode

CityPulse works **without database configuration** using sample data for demonstrations and development. Perfect for:
- Local development without Supabase setup
- Presentations and demos
- Testing UI components

Simply run `npm run dev` and the app will automatically use demo data.

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Supabase project** (optional - [create one here](https://app.supabase.com))
- **Gemini API key** (optional - [get one here](https://aistudio.google.com/app/apikey))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd CITYPULSE
npm install
```

### 2. Run in Demo Mode (No Setup Required)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - the app runs with demo data!

### 3. (Optional) Connect to Real Database

If you want to use a real Supabase database:

#### A. Copy Environment Template

```bash
cp .env.example .env.local
```

#### B. Get Your Credentials

Go to your [Supabase Project](https://app.supabase.com) → Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `anon` public key (safe for browser)
- `SUPABASE_SERVICE_ROLE_KEY`: `service_role` secret key ⚠️ **Server-only!**

#### C. Set Environment Variables

Edit `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Optional for admin ops

# Gemini AI (Optional - for future AI features)
GEMINI_API_KEY=AIzaSy...
```

#### D. Setup Database Schema

1. Open your Supabase project → **SQL Editor**
2. Copy & paste the contents of `supabase/schema.sql`
3. Click **Run**
4. (Optional) Run `supabase/seed.sql` for sample data

#### E. Verify Connection

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)

**Demo mode response:**
```json
{
  "status": "not_configured",
  "database": "not_configured",
  "message": "App running in demo mode"
}
```

**Connected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Database connection successful"
}
```

## Project Structure

```
CITYPULSE/
├── app/                    # Next.js App Router
│   ├── api/health/         # Health check endpoint
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
├── lib/                    # Shared code
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client + admin
│   │   └── middleware.ts   # Auth middleware
│   └── ai/                 # AI integration (coming soon)
├── docs/                   # Documentation
├── .kiro/steering/         # Development guidelines
└── middleware.ts           # Auth session refresh
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Security Notes

⚠️ **Never commit `.env.local` to version control**

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - use only server-side
- `GEMINI_API_KEY` must only be used in API routes and server actions
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser

## Development Guidelines

See `.kiro/steering/` for detailed guidelines on:
- Product vision and features (`product.md`)
- Technology standards (`tech.md`)
- Project structure and conventions (`structure.md`)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in project settings
4. Deploy

Vercel automatically detects Next.js and configures the build.

## Next Steps

The foundation is ready. Features will be built according to the product specification.

## License

[Your License Here]


## 📁 Project Structure

```
CITYPULSE/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── health/               # Health check endpoint
│   │   ├── incidents/            # Incident CRUD operations
│   │   ├── buses/                # Bus fleet data
│   │   ├── work-orders/          # Work order management
│   │   └── departments/          # Department data
│   ├── dashboard/                # Dashboard pages
│   │   ├── page.tsx              # Main overview
│   │   ├── incidents/            # Incident management
│   │   ├── map/                  # GIS map view
│   │   ├── fleet/                # Fleet monitoring
│   │   ├── analytics/            # Traffic analytics
│   │   ├── road-health/          # Road condition scoring
│   │   ├── work-orders/          # Work order tracking
│   │   ├── reports/              # Report generation
│   │   └── settings/             # App settings
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   ├── incidents/                # Incident modals and forms
│   ├── layout/                   # Layout components (Sidebar, Header)
│   ├── map/                      # Map components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Shared utilities
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client (public key)
│   │   ├── server.ts             # Server client + admin client
│   │   ├── middleware.ts         # Auth session refresh
│   │   └── env.ts                # Environment validation
│   ├── db/                       # Database access layer
│   │   ├── incidents.ts          # Incident queries
│   │   ├── buses.ts              # Bus queries
│   │   ├── work-orders.ts        # Work order queries
│   │   └── departments.ts        # Department queries
│   ├── schemas/                  # Zod validation schemas
│   │   └── database.ts           # Database types and validators
│   ├── types/                    # TypeScript types
│   │   └── dashboard.ts          # Dashboard component types
│   ├── data/                     # Demo data
│   │   └── sample-data.ts        # Sample incidents and buses
│   └── utils.ts                  # Utility functions
├── supabase/                     # Database setup
│   ├── schema.sql                # Complete schema (run this first)
│   ├── rls_policies.sql          # Row Level Security policies
│   ├── seed.sql                  # Sample data for testing
│   └── migrations/               # Version-controlled migrations
│       └── 001_initial_schema.sql
├── docs/                         # Documentation
│   ├── DATABASE-SETUP.md         # Detailed database guide
│   └── README.md                 # Additional documentation
├── middleware.ts                 # Next.js middleware (auth)
├── .env.example                  # Environment template
└── .env.local                    # Your local config (not in git)
```

## 🔒 Security Best Practices

### Environment Variables

- **Public keys** (`NEXT_PUBLIC_*`): Safe to expose in browser
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Secret keys** (no prefix): SERVER-ONLY, never in client code
  - `SUPABASE_SERVICE_ROLE_KEY` - bypasses Row Level Security
  - `GEMINI_API_KEY` - for AI API calls

### Client vs Server Usage

```typescript
// ✅ Client components (browser)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient() // Uses ANON key, respects RLS

// ✅ Server components (backend)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // Uses ANON key with session

// ✅ Admin operations (server-only)
import { createAdminClient } from '@/lib/supabase/server'
const supabase = createAdminClient() // Uses SERVICE ROLE, bypasses RLS
```

### Never Do This ❌

```typescript
// ❌ WRONG - Importing server client in client component
'use client'
import { createClient } from '@/lib/supabase/server' // ERROR!

// ❌ WRONG - Exposing service role key
const NEXT_PUBLIC_SUPABASE_SERVICE_KEY = "..." // NEVER!

// ❌ WRONG - Using admin client without validation
const supabase = createAdminClient() // Check env first!
```

## 🗄️ Database Schema

### Tables

- **buses** - Public transport fleet serving as mobile sensors
- **departments** - Municipal departments (Roads, Traffic, Public Works, etc.)
- **incidents** - AI-detected road damage and traffic incidents
- **work_orders** - Maintenance work orders linked to incidents
- **incident_observations** - Multiple detections of same incident

### Workflow Status

```
Incident Detection:
  detected → verified/rejected → assigned → in_progress → resolved

Work Order Lifecycle:
  pending → assigned → in_progress → completed/cancelled
```

See `docs/DATABASE-SETUP.md` for detailed schema documentation.

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint (type-checking)

# Database (manual)
# Run these in Supabase SQL Editor:
# 1. supabase/schema.sql       - Create tables and functions
# 2. supabase/rls_policies.sql - Setup access policies
# 3. supabase/seed.sql         - Add sample data (optional)
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if using admin features)
   - `GEMINI_API_KEY` (if using AI features)
4. Deploy!

Vercel auto-detects Next.js and configures builds automatically.

### Self-Hosting

```bash
npm run build
npm start
```

Set environment variables in your hosting platform.

## 🐛 Troubleshooting

### "Supabase not configured" Error

**Cause**: Environment variables missing or invalid

**Fix**:
1. Verify `.env.local` exists and has correct values
2. Check keys don't contain placeholder text like "your-project"
3. Restart dev server after changing env vars
4. Visit `/api/health` to verify configuration

### Database Connection Failed

**Cause**: Schema not setup or RLS blocking queries

**Fix**:
1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Run `supabase/rls_policies.sql` for access policies
3. Check Project Settings → API → URL and keys match `.env.local`
4. Verify anon key has public access in RLS policies

### Demo Data Not Showing

**Cause**: App is trying to use real database but failing

**Fix**:
1. Either: Setup database properly (see above)
2. Or: Remove/comment out Supabase env vars to force demo mode
3. Check browser console for specific errors

### Map Not Loading

**Cause**: Leaflet CSS not loaded or coordinates invalid

**Fix**:
- Verify `app/layout.tsx` imports `'leaflet/dist/leaflet.css'`
- Check latitude/longitude values are valid decimals

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Leaflet Maps](https://leafletjs.com)

## 🤝 Contributing

This is a Smart India Hackathon 2026 project. Contributions welcome:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

[Your License Here]

## 👥 Team

Smart India Hackathon 2026 - CityPulse AI Team

---

**Built with ❤️ for smarter cities**
