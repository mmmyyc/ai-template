import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";
import { Client } from "@upstash/qstash";

// ComfyUI API 的基础 URL，如果环境变量未设置则使用默认值
const COMFY_API_URL = process.env.COMFY_API_URL

// 初始化 QStash 客户端
const qstash = new Client({
  baseUrl: process.env.QSTASH_URL!,
  token: process.env.QSTASH_TOKEN!,
})

export const dynamic = 'force-dynamic';

/**
 * 处理图片生成的 POST 请求
 * @param request NextRequest 对象，包含请求数据
 * @returns NextResponse 对象，包含生成的图片或错误信息
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
  }
  try {
    // 从请求中获取表单数据
    const formData = await request.formData()
    const prompt = formData.get('prompt')
    const referenceImage = formData.get('reference_image')

    // 验证输入：确保提供了 prompt
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // 准备发送到 ComfyUI API 的数据
    const apiFormData = new FormData()
    
    // 添加文本数据
    apiFormData.append('prompt', prompt as string)
    
    // 处理参考图片：验证并添加到请求中
    if (referenceImage) {
      // 验证参考图片是否为文件类型
      if (!(referenceImage instanceof File)) {
        return NextResponse.json(
          { error: 'Invalid reference image' },
          { status: 400 }
        )
      }
      
      // 验证文件类型是否为图片
      if (!referenceImage.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File must be an image' },
          { status: 400 }
        )
      }

      // 将验证通过的图片添加到请求数据中
      apiFormData.append('file', referenceImage)
    }

    const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", user?.email)
    .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.available_uses <= 0) {
      return NextResponse.json({ error: "No available uses left" }, { status: 403 });
    }

    const { error: updateError } = await supabase
    .from("profiles")
    .update({
      available_uses: profile.available_uses - 1,
    })
    .eq("id", profile?.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update usage count" }, { status: 500 });
    }

    // 创建一个任务ID
    const taskId = crypto.randomUUID();

    // 将任务信息存储到数据库
    const { error: taskError } = await supabase
      .from("image_generations")
      .insert({
        task_id: taskId,
        user_id: user.id,
        status: "pending",
        prompt: prompt as string
      });

    if (taskError) {
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }

    // 使用 QStash 发送请求到 ComfyUI API
    await qstash.publishJSON({
      url: COMFY_API_URL,
      body: {
        prompt: prompt as string,
        referenceImage: referenceImage instanceof File ? Buffer.from(await referenceImage.arrayBuffer()).toString('base64') : null,
        taskId
      },
      headers: {
        'Content-Type': 'application/json',
        'Proxy-Authorization': `Basic ${Buffer.from(`${process.env.Token_ID}:${process.env.Token_Secret}`).toString('base64')}`,
        'Upstash-Callback': `https://www.ycamie.com/api/generate/callback?taskId=${taskId}`,
        // 'Upstash-Failure-Callback': `${process.env.NEXT_PUBLIC_SITE_URL}/api/generate/failure?taskId=${taskId}`
      }
    });

    // 返回任务ID
    return NextResponse.json({
      data: {
        status: "pending",
        taskId
      }
    });

  } catch (error) {
    // 错误处理
    console.error('Generation error:', error)
    
    // 根据错误类型返回适当的状态码
    if (error instanceof Error) {
      if (error.message.includes('API error')) {
        return NextResponse.json(
          { error: 'External API error' },
          { status: 502 }
        )
      }
    }

    // 默认错误响应
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
