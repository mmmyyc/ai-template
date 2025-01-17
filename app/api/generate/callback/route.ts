import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";
import { verifySignatureEdge } from "@upstash/qstash/nextjs";

export const dynamic = 'force-dynamic';

const handler = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  const supabase = createClient();

  try {
    // 获取原始响应数据并解码
    const rawData = await request.json();
    const decodedData = JSON.parse(atob(rawData.body));
    console.log("Decoded response:", decodedData);
    
    if (!decodedData.success) {
      await supabase
        .from("image_generations")
        .update({
          status: "failed",
          error: decodedData.error || "Unknown error",
          updated_at: new Date().toISOString()
        })
        .eq("task_id", taskId);

      return NextResponse.json({
        data: {
          status: "failed",
          error: decodedData.error || "Generation failed"
        }
      });
    }

    // 图片数据已经是 base64 格式
    const dataUrl = `data:image/png;base64,${decodedData.result}`;

    await supabase
      .from("image_generations")
      .update({
        status: "completed",
        result: dataUrl,
        updated_at: new Date().toISOString()
      })
      .eq("task_id", taskId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Callback error:", error);

    const { error: updateError } = await supabase
      .from("image_generations")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        updated_at: new Date().toISOString()
      })
      .eq("task_id", taskId)
      .single();

    if (updateError) {
      console.error("Failed to update task status:", updateError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = verifySignatureEdge(handler);