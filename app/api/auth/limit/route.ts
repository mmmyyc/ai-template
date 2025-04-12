import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ 
        data: { 
          used: 0,
          max: 10  // 未登录用户默认限制
        } 
      });
    }

    const { data: userData } = await supabase
      .from("profiles")
      .select("available_uses, max_uses")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ 
        data: { 
          used: 0,
          max: 10  // 免费用户默认限制
        } 
      });
    }

    // 根据用户计划返回对应的限制
    const max = userData.max_uses;

    return NextResponse.json({ 
      data: { 
        used: userData.available_uses || 0,
        max: max
      } 
    });

  } catch (error) {
    console.error('Failed to fetch user limit:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch limit", 
        data: { 
          used: 0,
          max: 10  // 错误情况下默认限制
        } 
      },
      { status: 500 }
    );
  }
}