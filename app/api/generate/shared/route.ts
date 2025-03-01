import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 获取URL查询参数
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    
    const supabase = createClient();
    
    // 如果提供了ID，获取特定的图像生成
    if (idParam) {
      const { data: generation, error } = await supabase
        .from("image_generations")
        .select("id, prompt, result, created_at, user_id, type")
        .eq("id", idParam)
        .eq("is_shared", true)
        .eq("status", "completed")
        .single();
      
      if (error) {
        console.error("Error fetching generation by ID:", error);
        return NextResponse.json(
          { error: "Failed to fetch generation" },
          { status: 500 }
        );
      }
      
      if (!generation) {
        return NextResponse.json(
          { error: "Generation not found or not shared" },
          { status: 404 }
        );
      }
      
      // Get user profile for this generation
      let userName = 'Anonymous';
      
      if (generation.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("id", generation.user_id)
          .single();
          
        if (!profileError && profile) {
          userName = profile.name || 'Anonymous';
        }
      }
      
      return NextResponse.json({
        data: {
          ...generation,
          user_name: userName
        }
      });
    }
    
    // 如果没有提供ID，按分页获取共享内容（原始功能）
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // 验证参数
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 50;
    
    // 计算偏移量
    const offset = (validPage - 1) * validLimit;
    
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
        .select("id, name")
        .in("id", userIds);
        
      if (!profileError && profiles) {
        userProfiles = profiles.reduce<Record<string, string>>((acc, profile) => {
          acc[profile.id] = profile.name || 'Anonymous';
          return acc;
        }, {});
      }
    }
    
    // Add user names to the shared items
    const items_with_names = (shared_items || []).map(item => ({
      ...item,
      user_name: userProfiles[item.user_id] || 'Anonymous'
    }));
    
    return NextResponse.json({
      data: {
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