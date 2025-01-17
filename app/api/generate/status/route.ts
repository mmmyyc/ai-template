import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";

export const dynamic = 'force-dynamic';

/**
 * 获取任务状态的 GET 请求
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    // 获取任务状态
    const { data: task, error } = await supabase
      .from("image_generations")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to fetch task status" }, { status: 500 });
    }

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        status: task.status,
        result: task.result,
        error: task.error
      }
    });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
