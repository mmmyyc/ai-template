import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";
import { verifySignatureEdge } from "@upstash/qstash/nextjs";

export const dynamic = 'force-dynamic';

const handler = async (request: NextRequest) => {
  // 使用服务端角色访问数据库，绕过 RLS
  const supabase = createClient();

  try {
    // 获取原始响应数据并解码
    const rawData = await request.json();
    const decodedData = JSON.parse(atob(rawData.body));
    console.log("Decoded response:", decodedData);
    
    const taskId = decodedData.taskId;
    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }
    console.log("Task ID:", taskId);

    // 先检查任务是否存在
    const { data: task, error: selectError } = await supabase
      .from('image_generations')
      .select('*')
      .eq('task_id', taskId)
      .single();
    
    console.log("Task data:", task);
    console.log("Select error:", selectError);

    if (!task) {
      console.error("Task not found:", taskId);
      return NextResponse.json({
        data: {
          status: "failed",
          error: "Task not found"
        }
      });
    }

    if (!decodedData.success) {
      const { error: updateError } = await supabase
        .from("image_generations")
        .update({
          status: 'failed',
          error: decodedData.error || "Unknown error",
          updated_at: new Date().toISOString()
        })
        .eq("task_id", taskId);

      if (updateError) {
        console.error("Failed to update task status:", updateError);
      }

      return NextResponse.json({
        data: {
          status: "failed",
          error: decodedData.error || "Generation failed"
        }
      });
    }

    const dataUrl = decodedData.result;
    console.log("Data URL:", dataUrl);

    const { error: updateError } = await supabase
      .from("image_generations")
      .update({
        status: 'completed',
        result: dataUrl,
        updated_at: new Date().toISOString()
      })
      .eq("task_id", taskId);

    if (updateError) {
      console.error("Failed to update task status:", updateError);
      return NextResponse.json({
        data: {
          status: "failed",
          error: "Failed to update database"
        }
      });
    }

    return NextResponse.json({
      data: {
        status: "completed",
        result: dataUrl
      }
    });

  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = verifySignatureEdge(handler);
// export const POST = handler;