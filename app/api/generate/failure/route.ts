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
    let errorMessage = "Generation failed";
    
    try {
      const decodedData = JSON.parse(atob(rawData.body));
      console.log("Failure callback - Decoded response:", decodedData);
      
      // 确定失败原因
      if (decodedData.error) {
        errorMessage = decodedData.error;
      }
    } catch (e) {
      console.log("Failed to decode response body:", e);
    }

    // 检查是否是超时
    if (rawData.timeout || errorMessage.includes("timeout")) {
      errorMessage = "Generation timed out after 5 minutes";
    }
    
    // 更新任务状态为失败
    const { error: updateError } = await supabase
      .from("image_generations")
      .update({
        status: "failed",
        error: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq("task_id", taskId);

    if (updateError) {
      console.error("Failed to update task status:", updateError);
    }

    return NextResponse.json({
      data: {
        status: "failed",
        error: errorMessage
      }
    });

  } catch (error) {
    console.error("Failure callback error:", error);

    // 确保任务状态被更新为失败
    const { error: updateError } = await supabase
      .from("image_generations")
      .update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        updated_at: new Date().toISOString()
      })
      .eq("task_id", taskId);

    if (updateError) {
      console.error("Failed to update task status:", updateError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

// 使用 QStash Edge Runtime 验证签名
export const POST = verifySignatureEdge(handler); 
// export const POST = handler;