import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/libs/supabase/server";
// ComfyUI API 的基础 URL，如果环境变量未设置则使用默认值
const COMFY_API_URL = process.env.COMFY_API_URL 

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
    // apiFormData.append('type', formData.get('type') as string || 'basic')
    
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
    // 调用 ComfyUI API 生成图片
    const response = await fetch(COMFY_API_URL, {
      // headers: {
      //   Authorization: `Token ${process.env.MODAL_TOKEN_ID}:${process.env.MODAL_TOKEN_SECRET}`,
      // },
      method: 'POST',
      body: apiFormData,
    })

    // 检查 API 响应状态
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    // 获取生成的图片数据并转换为 base64
    const imageBuffer = await response.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64Image}`
    
    // 返回数据 URL
    return NextResponse.json({
      data: {
        url: dataUrl
      }
    })

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
