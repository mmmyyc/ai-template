import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 从URL获取分页参数
    const { searchParams } = new URL(request.url);
    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '9');
    
    // 验证并设置默认值
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 50) limit = 9;
    
    // 计算分页偏移量
    const offset = (page - 1) * limit;
    
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // 获取总记录数
    const { count, error: countError } = await supabase
      .from("image_generations")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id);
      
    if (countError) {
      console.error("Error counting generations:", countError);
      return NextResponse.json(
        { error: "Failed to count generations" },
        { status: 500 }
      );
    }
    
    // 使用分页参数获取指定范围的记录
    const { data: generations, error } = await supabase
      .from("image_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error("Error fetching generations:", error);
      return NextResponse.json(
        { error: "Failed to fetch generation history" },
        { status: 500 }
      );
    }
    
    // 计算总页数
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    return NextResponse.json({
      data: {
        generations: generations || [],
        total: count,
        page,
        limit,
        totalPages
      }
    });

  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 