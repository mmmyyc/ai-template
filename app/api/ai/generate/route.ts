import { createAnthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { streamText, generateText , Message } from 'ai';
import { promptPPT } from '@/app/[locale]/dashboard/utils/promptPPT';
import { promptCard } from '@/app/[locale]/dashboard/utils/promptCard';
import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
// 允许流式响应最长30秒
export const maxDuration = 60;

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

  // 从请求体解构，messages 这里是客户端传来的字符串
  const { messages: userInputString, options, language, style, generateType } = await req.json(); 

  // 检查 messages 是否真的是字符串 (健壮性检查)
  if (typeof userInputString !== 'string') {
    return NextResponse.json({ error: "Invalid request: messages should be a string." }, { status: 400 });
  }

  let systemPrompt = "";
  if(generateType === "PPT"){
    // --- 构建正确的消息数组 --- 
    // 使用 promptPPT 生成系统提示
    systemPrompt = promptPPT(language, style);
  }else{
    // 使用 promptCard 生成系统提示
    systemPrompt = promptCard(language, style);
  }
  
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
      messages: finalMessages,
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 1000 },
        } satisfies AnthropicProviderOptions,
      }, 
    });
    // 更新用户可用次数和最多使用次数
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