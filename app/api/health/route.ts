import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test connection by querying the departments table (always has data)
    const { data, error } = await supabase
      .from('departments')
      .select('id')
      .limit(1);
    
    if (error) {
      return NextResponse.json(
        {
          status: "error",
          supabase: "disconnected",
          error: error.message,
          details: "Failed to query database. Ensure schema is set up correctly.",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Check if we have environment variables configured
    const hasEnvVars = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    return NextResponse.json({
      status: "ok",
      supabase: "connected",
      message: "Database connection successful",
      environment: hasEnvVars ? "configured" : "missing variables",
      tables_verified: data ? true : false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        supabase: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Unexpected error during health check",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
