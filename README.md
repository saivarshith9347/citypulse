# CityPulse

AI-powered urban insights platform built with Next.js and Supabase.

## Tech Stack

- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- A Supabase project ([create one here](https://app.supabase.com))
- A Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

## Getting Started

### 1. Clone and Install

```bash
cd CITYPULSE
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
```

**Where to find these values:**

- **Supabase**: Project Settings → API
  - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `anon` `public` key
  - `SUPABASE_SERVICE_ROLE_KEY`: `service_role` `secret` key ⚠️ Keep this secret!

- **Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Verify Health Check

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to verify the Supabase connection.

Expected response:
```json
{
  "status": "ok",
  "supabase": "connected",
  "timestamp": "2026-10-09T..."
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
