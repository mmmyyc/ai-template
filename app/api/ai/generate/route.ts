import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, generateText , Message } from 'ai';
import { ReadableStream } from 'stream/web';
import { prompt as promptTemplate } from '@/app/[locale]/dashboard/utils/prompt';
import { NextResponse } from "next/server";
// 允许流式响应最长30秒
export const maxDuration = 30;

// 预设的假数据响应
const mockResponses = {
  htmlContent: `
这个幻灯片组件可以用来展示重要的信息点，布局清晰，视觉效果良好
\`\`\`html
<style>
  .content-container {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    color: #333333;
  }
  
  h2 {
    color: #2563eb;
    font-size: 1.8rem;
    margin-top: 0;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
  }
  
  h3 {
    color: #4b5563;
    font-size: 1.4rem;
    margin-top: 24px;
    margin-bottom: 12px;
  }
  
  p {
    line-height: 1.6;
    margin-bottom: 16px;
  }
  
  ul, ol {
    padding-left: 24px;
    margin-bottom: 16px;
  }
  
  li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  @media (prefers-color-scheme: dark) {
    .content-container {
      background-color: #1f2937;
      color: #e5e7eb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    
    h2 {
      color: #60a5fa;
      border-bottom-color: #374151;
    }
    
    h3 {
      color: #9ca3af;
    }
  }
</style>

<div class="content-container">
  <h2>示例HTML内容</h2>
  <h3>知识要点</h3>
  <p>这是一段示例文本，用于演示HTML内容的生成和展示。下面是几个要点：</p>
  <ul>
    <li>这是第一个要点，包含了基本信息和概念介绍</li>
    <li>这是第二个要点，展示了更详细的内容和例子</li>
    <li>这是第三个要点，总结了主要内容并提供了应用建议</li>
  </ul>
  <p>以上内容是一个简单的HTML格式示例，可以根据需要进行调整和扩展。</p>
</div>
\`\`\` 
`
};

// 创建一个模拟的流式响应
function createMockStream(content: string) {
  const encoder = new TextEncoder();
  const chunks = content.match(/.{1,100}/g) || []; // 将内容分成小块，移除's'标志

  return new ReadableStream({
    start(controller) {
      let i = 0;
      
      function push() {
        if (i < chunks.length) {
          controller.enqueue(encoder.encode(chunks[i]));
          i++;
          setTimeout(push, 100); // 模拟延迟，每100ms发送一个块
        } else {
          controller.close();
        }
      }
      
      push();
    }
  });
}

// 处理生成的POST请求
export async function POST(req: Request) {
  const { messages, options } = await req.json();
  
  // 检查是否请求使用模拟数据（可以通过选项或URL参数传递）
  const useMock = options?.useMock === true;
  
  // if (useMock) {
  //   console.log("使用模拟数据响应...");
    
  //   // 决定使用哪种模拟数据（基于选项或内容分析）
  //   const mockType = options?.mockType || 'conceptCard';
  //   const mockContent = mockResponses[mockType as keyof typeof mockResponses] || mockResponses.conceptCard;
    
  //   // 创建并返回模拟的流式响应
  //   const mockStream = createMockStream(mockContent);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  //   return new Response(mockStream);
  // }

  // 替换提示词模板中的文章内容
  const userContent = messages;
  const systemPrompt = promptTemplate;
  
  // 创建新的消息数组，只包含系统提示(已经内嵌了用户内容)
  const simplifiedMessages: Omit<Message, 'id'>[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  const anthropic = createAnthropic({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const { text } = await generateText({
    model: anthropic('claude-3-7-sonnet-20250219'),
    messages: simplifiedMessages
  });

  // return result.toDataStreamResponse();
  return NextResponse.json({ data: { text } });
}