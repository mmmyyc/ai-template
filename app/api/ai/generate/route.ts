import { createAnthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { streamText, Message } from 'ai';
import { promptPPT } from '@/app/[locale]/dashboard/utils/promptPPT';
import { promptCard } from '@/app/[locale]/dashboard/utils/promptCard';
import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
// 允许流式响应最长30秒
export const maxDuration = 60;
export const runtime = "edge";

// 处理生成的POST请求
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
  }
  // 获取用户 profile 信息
  const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("email", user?.email)
  .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if(profile.available_uses <= 0){
    return NextResponse.json({ error: "No available uses left" }, { status: 403 });
  }

  // 获取消息
  const { messages } = await req.json();
  
  // 提取最后一条用户消息
  const lastUserMessage = messages[messages.length - 1];
  let userOptions = {};
  
  try {
    // 尝试解析用户消息中的JSON数据
    userOptions = JSON.parse(lastUserMessage.content);
  } catch (e) {
    return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
  }
  
  const { text, language, style, generateType, previousHtml } = userOptions as { 
    text: string, 
    language: string, 
    style: string, 
    generateType: string, 
    previousHtml?: string // 将 previousHtml 设为可选
  };
  
  // 确定系统提示
  let systemPrompt = "";
  if(generateType === "PPT"){
    systemPrompt = promptPPT(language, style);
  } else {
    systemPrompt = promptCard(language, style);
  }
  
  // 组合用户请求文本和上一次的HTML内容
  let userContent = text;
  if (previousHtml && previousHtml.trim().length > 0) {
    userContent += `\n\n--- Previous HTML Content ---\n${previousHtml}`;
  }
  
  // 创建发送给模型的消息，包含之前的HTML内容作为上下文
  const finalMessages: Omit<Message, 'id'>[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent } // 使用包含先前HTML的用户内容
  ];

  try {
    const anthropic = createAnthropic({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    // 流式生成文本
    const result = streamText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: finalMessages,
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 4096 },
        } satisfies AnthropicProviderOptions,
      },
    });
    
    // 更新用户可用次数
    let available_uses = profile.available_uses - 1;
    let max_uses = profile.max_uses;
    if(available_uses < 10){
      max_uses = 10;
    }
    
    // 消息队列发送成功后，更新用户可用次数
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        available_uses: profile.available_uses - 1,
        max_uses: max_uses,
      })
      .eq("id", profile?.id);
    
    // 返回流式响应
    return result.toDataStreamResponse(
      {
        headers: {
          'Content-Type': 'text/event-stream',
        },
      }
    );
  } catch (error) {
    console.error("AI Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    if (errorMessage.includes('InvalidPromptError')) {
      return NextResponse.json({ error: `AI prompt error: ${errorMessage}` }, { status: 400 });
    } 
    
    return NextResponse.json({ error: `AI generation failed: ${errorMessage}` }, { status: 500 });
  }
}