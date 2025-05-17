import { createAnthropic, AnthropicProviderOptions } from '@ai-sdk/anthropic';
import { streamText, Message, tool } from 'ai';
import { promptPPT } from '@/app/[locale]/dashboard/utils/promptPPT';
import { promptCard } from '@/app/[locale]/dashboard/utils/promptCard';
import { promptOutline } from '@/app/[locale]/dashboard/utils/promptOutline';
import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { z } from 'zod';
// 允许流式响应最长60秒
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

  // 获取消息和请求体
  const requestData = await req.json();
  const { messages } = requestData; // 移除useTools参数
  
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
  
  try {
    const anthropic = createAnthropic({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    let result;

    // 根据generateType决定使用哪种生成方式
    if (generateType === "PPT") {
      // 定义生成大纲的工具
      const outlineTool = tool({
        description: '根据主题生成PPT大纲，提供清晰的结构和内容安排',
        parameters: z.object({
          topic: z.string().describe('PPT的主题'),
          language: z.string().describe('生成大纲使用的语言')
        }),
        execute: async ({ topic, language }) => {
          console.log(`[outlineTool] Called with topic: "${topic}", language: "${language}"`);
          const systemPrompt = promptOutline(language);
          console.log(`[outlineTool] Generated system prompt: "${systemPrompt.substring(0, 100)}..."`);
          try {
          const outlineModel = anthropic('claude-3-7-sonnet-20250219');
          const outlineResponse = await streamText({
            model: outlineModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: topic }
            ]
          });
            const outlineText = await outlineResponse.text; // 确保消费文本流
            console.log(`[outlineTool] Successfully generated outline (first 100 chars): "${outlineText.substring(0, 100)}..."`);
            if (!outlineText || outlineText.trim() === "") {
              console.warn("[outlineTool] Generated outline is empty!");
              throw new Error("Generated outline was empty.");
            }
            return { outline: outlineText };
          } catch (error) {
            console.error('[outlineTool] Error during execution:', error);
            throw error; // 重新抛出错误，让外部捕获
          }
        }
      });
      
      // 定义根据大纲生成PPT的工具
      const pptTool = tool({
        description: '根据提供的大纲生成PPT的HTML内容',
        parameters: z.object({
          outline: z.string().describe('PPT的大纲结构'),
          style: z.string().describe('PPT的风格'),
          language: z.string().describe('生成PPT使用的语言')
        }),
        execute: async ({ outline, style, language }) => {
          // 使用promptPPT生成PPT内容
          const systemPrompt = promptPPT(language, style);
          
          const pptModel = anthropic('claude-3-7-sonnet-20250219');
          const pptResponse = await streamText({
            model: pptModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `\n\n--- Previous HTML Content ---\n${previousHtml}\n\n根据以下大纲生成PPT：\n\n${outline}` }
            ]
          });
          
          return { html: pptResponse.text };
        }
      });
      console.log("开始生成PPT");
      // 使用多步骤工具调用流程
      result = streamText({
        model: anthropic('claude-3-7-sonnet-20250219'),
        maxSteps: 2, // 允许最多2步（生成大纲 + 生成PPT）
        tools: {
          generateOutline: outlineTool,
          generatePPT: pptTool
        },
        messages: [
          { 
            role: 'user', 
            content: `我需要一个关于"${text}"的PPT，请先生成大纲，然后根据大纲生成PPT的HTML内容。语言：${language}，风格：${style}。` 
          }
        ],
        providerOptions: {
          anthropic: {
            thinking: { type: 'enabled', budgetTokens: 10240 },
          } satisfies AnthropicProviderOptions,
        },
      });
    } 
    // if (generateType === "PPT") {
    //   // 直接生成PPT的工具
    //   const directPPTTool = tool({
    //     description: '直接生成PPT的HTML内容',
    //     parameters: z.object({
    //       topic: z.string().describe('PPT的主题'),
    //       style: z.string().describe('PPT的风格'),
    //       language: z.string().describe('生成PPT使用的语言')
    //     }),
    //     execute: async ({ topic, style, language }) => {
    //       // 使用promptPPT生成PPT内容
    //       const systemPrompt = promptPPT(language, style);
          
    //       // 组合用户请求文本和上一次的HTML内容
    //       let userContent = topic;
    //       if (previousHtml && previousHtml.trim().length > 0) {
    //         userContent = `\n\n--- Previous HTML Content ---\n${previousHtml}\n\n${topic}`;
    //       }
          
    //       const pptModel = anthropic('claude-3-7-sonnet-20250219');
    //       const pptResponse = await streamText({
    //         model: pptModel,
    //         messages: [
    //           { role: 'system', content: systemPrompt },
    //           { role: 'user', content: userContent }
    //         ]
    //       });
          
    //       return { html: pptResponse.text };
    //     }
    //   });
    //   // 使用单步工具调用流程
    //   result = streamText({
    //     model: anthropic('claude-3-7-sonnet-20250219'),
    //     maxSteps: 1, // 只需要1步直接生成PPT
    //     tools: {
    //       generatePPT: directPPTTool
    //     },
    //     messages: [
    //       { 
    //         role: 'user', 
    //         content: `我需要一个关于"${text}"的PPT，语言：${language}，风格：${style}。` 
    //       }
    //     ],
    //     providerOptions: {
    //       anthropic: {
    //         thinking: { type: 'enabled', budgetTokens: 10240 },
    //       } satisfies AnthropicProviderOptions,
    //     },
    //   });
    // } 
    else {
      // 原有的生成流程，只处理非PPT和PPT_WITH_OUTLINE的类型（例如"CARD"）
      // 确定系统提示
      let systemPrompt = "";
      if (generateType === "OUTLINE") {
        systemPrompt = promptOutline(language);
      } else {
        systemPrompt = promptCard(language, style);
      }
      
      // 组合用户请求文本和上一次的HTML内容
      let userContent = text;
      if (previousHtml && previousHtml.trim().length > 0) {
        userContent += `\n\n--- Previous HTML Content ---\n${previousHtml}`;
      }
      
      // 创建发送给模型的消息
      const finalMessages: Omit<Message, 'id'>[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ];

      // 流式生成文本
      result = streamText({
        model: anthropic('claude-3-7-sonnet-20250219'),
        messages: finalMessages,
        providerOptions: {
          anthropic: {
            thinking: { type: 'enabled', budgetTokens: 10240 },
          } satisfies AnthropicProviderOptions,
        },
      });
    }
    
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