import { createAnthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { streamText, Message } from 'ai';
import { promptPPT } from '@/app/[locale]/dashboard/utils/promptPPT';
import { promptCard } from '@/app/[locale]/dashboard/utils/promptCard';
import { createClient } from "@/libs/supabase/server";

// 允许流式响应最长60秒
export const maxDuration = 60;
export const runtime = "edge";

// 处理来自useChat的POST请求
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in" }, { status: 401 }); 
  }
  
  // 获取用户 profile 信息
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", user?.email)
    .single();

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  if(profile.available_uses <= 0){
    return Response.json({ error: "No available uses left" }, { status: 403 });
  }

  // 从请求中获取消息
  const { messages } = await req.json();
  
  // 提取最后一条用户消息
  const lastUserMessage = messages[messages.length - 1];
  let userOptions = {};
  
  try {
    // 尝试解析用户消息中的JSON数据
    userOptions = JSON.parse(lastUserMessage.content);
  } catch (e) {
    return Response.json({ error: "Invalid message format" }, { status: 400 });
  }
  
  const { text, language, style, generateType } = userOptions as { 
    text: string, 
    language: string, 
    style: string, 
    generateType: string 
  };
  
  // 确定系统提示
  let systemPrompt = "";
  if(generateType === "PPT"){
    systemPrompt = promptPPT(language, style);
  } else {
    systemPrompt = promptCard(language, style);
  }
  
  // 创建发送给模型的消息
  const finalMessages: Omit<Message, 'id'>[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: text }
  ];

  try {
    const anthropic = createAnthropic({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    // 使用streamText流式生成回复
    const result = streamText({
      model: anthropic('claude-3-7-sonnet-20250219'),
      messages: finalMessages,
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens: 1024 },
        } satisfies AnthropicProviderOptions,
      },
    });
    
    // 异步更新用户可用次数，不阻塞响应
    updateUserCredits(supabase, profile).catch(error => {
      console.error("Failed to update user credits:", error);
    });
    
    // 返回流式响应 - 这是useChat接口所需的格式
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    if (errorMessage.includes('InvalidPromptError')) {
      return Response.json({ error: `AI prompt error: ${errorMessage}` }, { status: 400 });
    } 
    
    return Response.json({ error: `AI generation failed: ${errorMessage}` }, { status: 500 });
  }
}

// 辅助函数：更新用户积分
async function updateUserCredits(supabase: any, profile: any) {
  let available_uses = profile.available_uses - 1;
  let max_uses = profile.max_uses;
  if(available_uses < 10){
    max_uses = 10;
  }
  
  const { error } = await supabase
    .from("profiles")
    .update({
      available_uses: available_uses,
      max_uses: max_uses,
    })
    .eq("id", profile?.id);
    
  if (error) {
    throw new Error(`Failed to update user credits: ${error.message}`);
  }
} 