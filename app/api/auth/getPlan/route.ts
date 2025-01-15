import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ data: { plan: 'free' } });
    }

    const { data: userData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ data: { plan: 'free' } });
    }

    return NextResponse.json({ 
      data: { 
        plan: userData.plan === "basic" ? "basic" : 
              userData.plan === "advanced" ? "advanced" : 
              "free" 
      } 
    });

  } catch (error) {
    console.error('Failed to fetch user plan:', error);
    return NextResponse.json(
      { error: "Failed to fetch plan", data: { plan: "free" } },
      { status: 500 }
    );
  }
}