import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, generateText , Message } from 'ai';
import { ReadableStream } from 'stream/web';
import { prompt as promptTemplate } from '@/app/[locale]/dashboard/utils/prompt';
import { NextResponse } from "next/server";
// 允许流式响应最长30秒
export const maxDuration = 30;

// 处理生成的POST请求
export async function POST(req: Request) {
  // 从请求体解构，messages 这里是客户端传来的字符串
  const { messages: userInputString, options, language, style } = await req.json(); 

  // 检查 messages 是否真的是字符串 (健壮性检查)
  if (typeof userInputString !== 'string') {
    return NextResponse.json({ error: "Invalid request: messages should be a string." }, { status: 400 });
  }

  // --- 构建正确的消息数组 --- 
  // 使用 promptTemplate 生成系统提示
  const systemPrompt = promptTemplate(language, style);
  
  // 创建发送给 generateText 的消息数组
  const finalMessages: Omit<Message, 'id'>[] = [
    { role: 'system', content: systemPrompt },
    // 直接使用从客户端接收到的字符串作为用户内容
    { role: 'user', content: userInputString } 
  ];

  try {
    const anthropic = createAnthropic({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    // 使用修正后的消息数组调用 generateText
    const { text } = await generateText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: finalMessages 
    });

    return NextResponse.json({ data: { text } });

  } catch (error) {
    console.error("AI Generation Error:", error);
    // 根据错误类型返回更具体的错误信息
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // 检查是否是特定的 AI SDK 错误
    if (errorMessage.includes('InvalidPromptError')) {
      return NextResponse.json({ error: `AI prompt error: ${errorMessage}` }, { status: 400 });
    } 
    return NextResponse.json({ error: `AI generation failed: ${errorMessage}` }, { status: 500 });
  }
}