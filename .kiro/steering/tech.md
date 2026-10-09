# Technology Stack & Standards

## Core Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Google Gemini API
- **Deployment**: Vercel

## TypeScript Standards

- Always use strict mode (`strict: true` in tsconfig.json)
- Prefer explicit types over implicit `any`
- Use Zod for runtime validation at API boundaries
- Define proper types for all function parameters and return values

## Security Requirements

### Secrets Management

- **Service Role Key**: Server-only. Never expose to client code.
  - Use only in API routes, server actions, and server components
  - Prefix variable: `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_`)
  
- **Gemini API Key**: Server-only. Never expose to client code.
  - Use only in API routes and server actions
  - Prefix variable: `GEMINI_API_KEY` (no `NEXT_PUBLIC_`)
  
- **Public Keys**: Safe for client use
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Validation

- Use Zod schemas for all API inputs
- Validate and sanitize user inputs
- Use TypeScript's type system + runtime validation for defense in depth

## Code Quality

- Use meaningful variable and function names
- Write self-documenting code with clear intent
- Add comments for complex business logic only
- Keep functions small and focused
- Follow the DRY principle

## Database

- Use Supabase Row Level Security (RLS) for data access control
- Write migrations for all schema changes
- Use the anon key for user operations (respects RLS)
- Use the service role key only for admin operations (bypasses RLS)
