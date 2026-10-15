import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv, getServiceRoleKey } from "./env";

/**
 * Create a Supabase client for server-side use (Server Components, Server Actions, Route Handlers).
 * Automatically manages auth cookies for user sessions.
 * 
 * Throws an error if Supabase is not configured.
 */
export async function createClient() {
  const supabaseEnv = getSupabaseEnv();
  
  if (!supabaseEnv) {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseEnv.url,
    supabaseEnv.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client for server-side operations that bypass RLS.
 * IMPORTANT: Only use this for admin operations. Never expose service role key to client.
 * 
 * Throws an error if Supabase or service role key is not configured.
 */
export function createAdminClient() {
  const supabaseEnv = getSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();
  
  if (!supabaseEnv || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be configured."
    );
  }

  return createServerClient(
    supabaseEnv.url,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Admin client doesn't need cookie management
        },
      },
    }
  );
}
