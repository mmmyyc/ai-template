import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";
import { Client } from "@upstash/qstash";
import sharp from 'sharp';

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
    const type = formData.get('type')
    // 验证输入：确保提供了 prompt
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }
    
    // 处理参考图片：验证并添加到请求中
    let referenceImageBase64: string | null = null;
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

      try {
        // 读取图片数据
        const imageBuffer = Buffer.from(await referenceImage.arrayBuffer());
        
        // 获取图片信息
        const metadata = await sharp(imageBuffer).metadata();
        let compressedImage = sharp(imageBuffer);

        // 调整图片大小
        compressedImage = compressedImage.resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        });

        // 根据原始格式选择压缩策略
        let outputBuffer: Buffer;
        if (metadata.format === 'png') {
          outputBuffer = await compressedImage
            .png({
              quality: 80,
              compressionLevel: 9,
              palette: true
            })
            .toBuffer();
        } else if (metadata.format === 'webp') {
          outputBuffer = await compressedImage
            .webp({
              quality: 75,
              effort: 6
            })
            .toBuffer();
        } else {
          // 默认转换为jpeg
          outputBuffer = await compressedImage
            .jpeg({
              quality: 80,
              mozjpeg: true,
              chromaSubsampling: '4:2:0'
            })
            .toBuffer();
        }

        // 检查压缩后的大小
        if (outputBuffer.length > 1024 * 1024) {
          // 如果还是太大，进一步压缩
          const quality = Math.floor((1024 * 1024 / outputBuffer.length) * 80);
          outputBuffer = await compressedImage
            .jpeg({
              quality: Math.max(quality, 40), // 不低于40%质量
              mozjpeg: true,
              chromaSubsampling: '4:2:0'
            })
            .toBuffer();
        }

        // 转换压缩后的图片为 base64
        referenceImageBase64 = outputBuffer.toString('base64');
      } catch (error) {
        console.error('Image compression error:', error);
        return NextResponse.json(
          { error: 'Failed to process image. Please try a different image.' },
          { status: 400 }
        );
      }
    }
    // 创建一个任务ID
    const taskId = crypto.randomUUID();
    // 构建请求体并检查大小
    const requestBody = {
      prompt: prompt as string,
      referenceImage: referenceImageBase64,
      taskId,
      type
    };

    const bodySize = Buffer.byteLength(JSON.stringify(requestBody));
    const maxSize = 1024 * 1024; // 1MB

    if (bodySize > maxSize) {
      return NextResponse.json(
        { error: `Request size (${(bodySize / 1024).toFixed(1)}KB) exceeds 1MB limit` },
        { status: 400 }
      );
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

    // 将任务信息存储到数据库
    const { error: taskError } = await supabase
      .from("image_generations")
      .insert({
        task_id: taskId,
        user_id: user.id,
        status: "pending",
        prompt: prompt as string,
        type: type as string
      });

    if (taskError) {
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }

    // 使用 QStash 发送请求到 ComfyUI API
    await qstash.publishJSON({
      url: COMFY_API_URL,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'Proxy-Authorization': `Basic ${Buffer.from(`${process.env.Token_ID}:${process.env.Token_Secret}`).toString('base64')}`,
        // 'Upstash-Callback': `https://cbae-157-254-154-72.ngrok-free.app/api/generate/callback`,
        // 'Upstash-Failure-Callback': `https://cbae-157-254-154-72.ngrok-free.app/api/generate/failure`
        'Upstash-Callback': `https://www.ycamie.com/api/generate/callback`,
        'Upstash-Failure-Callback': `https://www.ycamie.com/api/generate/failure`
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
