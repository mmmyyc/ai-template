import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 获取URL查询参数
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // 验证参数
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 50;
    
    // 计算偏移量
    const offset = (validPage - 1) * validLimit;
    
    const supabase = createClient();
    
    // 先获取总数
    const { count, error: countError } = await supabase
      .from("image_generations")
      .select("id", { count: 'exact', head: true })
      .eq("is_shared", true)
      .eq("status", "completed");
      
    if (countError) {
      console.error("Error counting shared items:", countError);
    }
    
    // 使用分页获取共享内容
    const { data: shared_items, error } = await supabase
      .from("image_generations")
      .select("id, prompt, result, created_at, user_id, type")
      .eq("is_shared", true)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .range(offset, offset + validLimit - 1); // 使用range进行分页
    
    if (error) {
      console.error("Error fetching shared items:", error);
      return NextResponse.json(
        { error: "Failed to fetch shared items" },
        { status: 500 }
      );
    }
    
    // Get user profiles for the shared items
    const userIds = Array.from(new Set((shared_items || []).map(item => item.user_id)));
    
    let userProfiles: Record<string, string> = {};
    
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);
        
      if (!profileError && profiles) {
        userProfiles = profiles.reduce<Record<string, string>>((acc, profile) => {
          acc[profile.id] = profile.username || profile.full_name || 'Anonymous';
          return acc;
        }, {});
      }
    }
    
    // Add user names to the shared items
    const items_with_names = (shared_items || []).map(item => ({
      ...item,
      user_name: userProfiles[item.user_id] || 'Anonymous'
    }));
    
    return NextResponse.json(
    {
        data:{
            shared_items: items_with_names,
            total: count || 0,
            page: validPage,
            limit: validLimit,
            total_pages: count ? Math.ceil(count / validLimit) : 1
            }
    });

  } catch (error) {
    console.error("Shared items fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 