import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

// Add dynamic route config
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ plan: "free" });
    }

    // 获取用户的 profile 信息
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    // 如果找不到 profile 或没有 plan 信息，返回 free
    if (!profile || !profile.plan) {
      return NextResponse.json({ plan: "free" });
    }

    return NextResponse.json({ plan: profile.plan });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json({ plan: "free" });
  }
} 