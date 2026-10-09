# Project Structure & Conventions

## Directory Layout

```
CITYPULSE/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── (routes)/             # Page routes (can use route groups)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   └── [feature]/            # Feature-specific components
├── lib/                      # Shared utilities and configurations
│   ├── supabase/             # Supabase clients and utilities
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client + admin client
│   │   └── middleware.ts     # Middleware client
│   ├── ai/                   # AI integration (Gemini)
│   └── utils.ts              # General utilities
├── docs/                     # Project documentation
├── .kiro/                    # Kiro configuration
│   └── steering/             # Development guidelines
├── public/                   # Static assets
└── [config files]            # Root configuration files
```

## Naming Conventions

### Files and Folders

- **Components**: PascalCase for component files (`UserProfile.tsx`)
- **Utilities**: camelCase for utility files (`formatDate.ts`)
- **API Routes**: kebab-case for route folders (`/api/user-profile`)
- **Route Groups**: Wrap in parentheses `(auth)` - doesn't affect URL structure

### Code

- **React Components**: PascalCase (`function UserProfile()`)
- **Functions**: camelCase (`function getUserData()`)
- **Constants**: UPPER_SNAKE_CASE (`const API_BASE_URL`)
- **Types/Interfaces**: PascalCase with descriptive names (`type UserProfile`, `interface ApiResponse`)

## Component Organization

### Server Components (default)

- Use for data fetching and rendering
- Can directly access server-side resources
- File: `ComponentName.tsx`

### Client Components

- Add `"use client"` directive at the top
- Use for interactivity, state, effects
- File: `ComponentName.tsx` (same extension)

### Shared Components

Place reusable components in:
- `components/ui/` - UI primitives from shadcn/ui
- `components/` - Custom shared components

## Import Aliases

Use `@/` for absolute imports from project root:

```typescript
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
```

## API Route Structure

```typescript
// app/api/[route]/route.ts
export async function GET(request: Request) { }
export async function POST(request: Request) { }
// etc.
```

## Environment Variables

- Client-accessible: `NEXT_PUBLIC_*`
- Server-only: No prefix (never accessed in client code)
