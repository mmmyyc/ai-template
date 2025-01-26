import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    // Fetch user's generation history
    const { data: generations, error } = await supabase
      .from("image_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50); // Limit to most recent 50 generations
    if (error) {
      console.error("Error fetching generations:", error);
      return NextResponse.json(
        { error: "Failed to fetch generation history" },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: {
      generations: generations || []
    }});

  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 