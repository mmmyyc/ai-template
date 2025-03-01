import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
    
    // Get generationId from request body
    const body = await request.json();
    const { generationId } = body;
    
    if (!generationId) {
      return NextResponse.json(
        { error: "Generation ID is required" },
        { status: 400 }
      );
    }
    
    // Verify that the generation belongs to the current user
    const { data: generation, error: getError } = await supabase
      .from("image_generations")
      .select("*")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single();
      
    if (getError || !generation) {
      return NextResponse.json(
        { error: "Generation not found or not owned by you" },
        { status: 404 }
      );
    }
    
    // Update the generation to be shared
    const { error: updateError } = await supabase
      .from("image_generations")
      .update({ is_shared: true })
      .eq("id", generationId);
      
    if (updateError) {
      console.error("Error sharing generation:", updateError);
      return NextResponse.json(
        { error: "Failed to share generation" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Generation shared successfully"
    });
    
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    
    // Get generationId from request body
    const body = await request.json();
    const { generationId } = body;
    
    if (!generationId) {
      return NextResponse.json(
        { error: "Generation ID is required" },
        { status: 400 }
      );
    }
    
    // Verify that the generation belongs to the current user
    const { data: generation, error: getError } = await supabase
      .from("image_generations")
      .select("*")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .single();
      
    if (getError || !generation) {
      return NextResponse.json(
        { error: "Generation not found or not owned by you" },
        { status: 404 }
      );
    }
    
    // Update the generation to be not shared
    const { error: updateError } = await supabase
      .from("image_generations")
      .update({ is_shared: false })
      .eq("id", generationId);
      
    if (updateError) {
      console.error("Error unsharing generation:", updateError);
      return NextResponse.json(
        { error: "Failed to unshare generation" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Generation unshared successfully"
    });
    
  } catch (error) {
    console.error("Unshare error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 