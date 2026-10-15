/**
 * Environment validation for Supabase configuration.
 * Checks if Supabase is properly configured before attempting to use it.
 */

interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Check if Supabase environment variables are configured and valid.
 * Returns null if not configured, or the validated config if valid.
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if variables exist and are not placeholder values
  if (
    !url ||
    !anonKey ||
    url.includes('your-project') ||
    url.includes('placeholder') ||
    anonKey.includes('your-') ||
    anonKey.includes('placeholder') ||
    anonKey.length < 20 // JWT tokens are much longer
  ) {
    return null;
  }

  return { url, anonKey };
}

/**
 * Check if Supabase is configured for use.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/**
 * Get service role key if configured.
 * Returns null if not configured.
 */
export function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (
    !key ||
    key.includes('your-') ||
    key.includes('placeholder') ||
    key.length < 20
  ) {
    return null;
  }
  
  return key;
}
