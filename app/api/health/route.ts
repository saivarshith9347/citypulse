import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Simple query to check Supabase connection
    const { error } = await supabase.from("_healthcheck").select("*").limit(1);
    
    // If the table doesn't exist, that's okay - connection still works
    // We're just checking if we can reach Supabase
    const isConnected = !error || error.code === "PGRST116"; // PGRST116 = table not found
    
    if (!isConnected) {
      return NextResponse.json(
        {
          status: "error",
          supabase: "disconnected",
          error: error?.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      supabase: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        supabase: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
