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
          max: 3  // 未登录用户默认限制
        } 
      });
    }

    const { data: userData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ 
        data: { 
          used: 0,
          max: 3  // 免费用户默认限制
        } 
      });
    }

    // 根据用户计划返回对应的限制
    const max = 
      userData.plan === "basic" ? 50 :     // 基础版用户
      userData.plan === "advanced" ? 200 :  // 高级版用户
      3;                                    // 免费版用户

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
          max: 3  // 错误情况下默认限制
        } 
      },
      { status: 500 }
    );
  }
}