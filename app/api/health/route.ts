import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        status: "not_configured",
        database: "not_configured",
        message: "Supabase environment variables are not configured. App running in demo mode.",
        details: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable database features.",
        timestamp: new Date().toISOString(),
      });
    }

    // Try to connect to database
    const supabase = await createClient();
    
    // Test connection by querying the departments table
    const { data, error } = await supabase
      .from('departments')
      .select('id')
      .limit(1);
    
    if (error) {
      return NextResponse.json(
        {
          status: "configured",
          database: "connection_failed",
          error: error.message,
          details: "Supabase is configured but connection failed. Check if database schema is set up.",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      message: "Database connection successful",
      tables_verified: !!data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Unexpected error during health check",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
