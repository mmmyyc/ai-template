"use client"

/**
 * AI服务模块 - 提供HTML生成和处理相关功能
 */

/**
 * 生成HTML内容
 * @param text 输入文本内容
 * @returns 返回HTML内容和元数据
 */
export async function generateSlideComponent(text: string, language: string, style: string, generateType: string): Promise<{
  htmlContent: string;
  slideData: {
    id: string;
    title: string;
    content: string;
  };
}> {
  try {
    // 生成提示词
    const userPrompt = `${text}`;
    const title = text.split('\n')[0].replace(/^#+\s+/, "").trim();
    // 发送API请求
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: userPrompt,
        language: language,
        style: style,
        generateType: generateType,
        options: {
          useMock: true,
          mockType: 'htmlContent'
        }
      }),
    });


    const req = await response.json();
    const rawResponse = req.data.text;
    
    // 从响应中提取HTML内容
    let htmlContent = extractHtmlFromMarkdown(rawResponse);
    
    // 如果获得了HTML内容，返回它和相关数据
    if (htmlContent) {
      return {
        htmlContent,
        slideData: {
          id: `slide-${Date.now()}`,
          title,
          content: text,
        },
      };
    }
    
    // 没有获得预期结果，使用备用生成方法
    htmlContent = generateFallbackHtml(title, text);
    
    return {
      htmlContent,
      slideData: {
        id: `slide-${Date.now()}`,
        title,
        content: text,
      },
    };
  } catch (error) {
    // 出错时使用备用生成
    const lines = text.split("\n").filter((line) => line.trim().length > 0);
    const title = lines[0].replace(/^#+\s+/, "").trim();
    const htmlContent = generateFallbackHtml(title, text);
    
    return {
      htmlContent,
      slideData: {
        id: `slide-${Date.now()}`,
        title,
        content: text,
      },
    };
  }
}

/**
 * 从Markdown响应中提取HTML内容 (改进版)
 * @param markdown Markdown格式的文本
 * @returns 提取的HTML内容
 */
export function extractHtmlFromMarkdown(markdown: string): string {
  const originalMarkdown = markdown.trim();

  // 1. 优先提取 ```html ... ``` 代码块
  const htmlBlockRegex = /```html\s*\n([\s\S]*?)```/g;
  let matches = htmlBlockRegex.exec(originalMarkdown);
  if (matches && matches[1]) {
    console.log("提取到HTML代码块 (```html)");
    return matches[1].trim();
  }

  // 2. 尝试提取任何 ``` ... ``` 代码块，并检查其内容是否像HTML
  const anyCodeBlockRegex = /```[a-zA-Z]*\s*\n([\s\S]*?)```/g;
  // 使用循环查找所有代码块，以防HTML前有其他代码块
  let codeBlockContent: string | null = null;
  while ((matches = anyCodeBlockRegex.exec(originalMarkdown)) !== null) {
    const currentContent = matches[1].trim();
    // 检查是否包含基本HTML标签，更倾向于以 '<' 开头
    if (currentContent.startsWith('<') && currentContent.includes('>')) {
      console.log("提取到看起来像HTML的通用代码块 (```)");
      codeBlockContent = currentContent;
      break; // 找到第一个像HTML的代码块就停止
    }
    // 如果不以 '<' 开头，但包含关键标签，也可能是目标
    if (!currentContent.startsWith('<') && 
        (currentContent.includes('<html') || currentContent.includes('<body') || currentContent.includes('<style') || currentContent.includes('<div') || currentContent.includes('<p'))) {
       console.log("提取到包含关键HTML标签的通用代码块 (```)");
       codeBlockContent = currentContent;
       break; 
    } 
  }
  if (codeBlockContent) {
    return codeBlockContent;
  }

  // 3. 尝试移除开头的解释性文字或Markdown标题，然后检查是否为HTML
  // 移除常见的AI解释性开头，例如 "以下是..." 或 Markdown 标题
  let contentWithoutPrefix = originalMarkdown
    .replace(/^#+\s+.*\n?/, '') // 移除Markdown标题行
    .replace(/^.*?```html\s*\n/i, '') // 移除 ```html 之前的文字 (如果存在)
    .replace(/^.*?```\s*\n/i, '')   // 移除 ``` 之前的文字 (如果存在)
    .replace(/```$/, '') // 移除结尾的 ```
    .trim();

  // 检查清理后的内容是否以HTML标签开头
  if (contentWithoutPrefix.startsWith('<') && contentWithoutPrefix.includes('>')) {
    // 进一步检查，确保它不仅仅是单个标签或损坏的HTML
    if (contentWithoutPrefix.includes('</') || contentWithoutPrefix.includes('/>')) {
        console.log("移除前缀后，内容以HTML标签开头");
        return contentWithoutPrefix;
    }
  }

  // 4. 最后手段：检查原始输入是否就是裸露的HTML
  if (originalMarkdown.startsWith('<') && originalMarkdown.includes('>')) {
     if (originalMarkdown.includes('</') || originalMarkdown.includes('/>')) {
        console.log("原始输入看起来像裸露的HTML");
        return originalMarkdown;
     }
  }
  
  // 5. 如果以上都不是，则假定是纯Markdown或文本，进行转换 (作为备用方案)
  console.warn("未能明确提取HTML，将尝试按Markdown转换");
  return convertTextToHtml(originalMarkdown);
}

/**
 * 将纯文本或基本Markdown转换为HTML
 * @param text 输入文本
 * @returns 转换后的HTML字符串
 */
function convertTextToHtml(text: string): string {
  let html = text
    .replace(/&/g, '&amp;') // 处理&符号
    .replace(/</g, '&lt;')  // 处理<符号
    .replace(/>/g, '&gt;')  // 处理>符号
    .replace(/"/g, '&quot;') // 处理引号
    .replace(/'/g, '&#39;'); // 处理单引号

  // 基本Markdown转换
  html = html
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^[-*+] (.*?)$/gm, '<li>$1</li>') // 列表项
    .replace(/(\n){2,}/g, '<br/><br/>') // 段落换行
    .replace(/\n/g, '<br/>'); // 单行换行
    
  // 包裹列表项 (兼容旧环境)
  if (html.includes('<li>')) {
    // 使用 [\s\S] 代替 . 和 s 标志来匹配包括换行符在内的任何字符
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>').replace(/<\/ul>\s*<ul>/g, '');
  }

  return html;
}

/**
 * 备用HTML生成函数
 * @param title 标题
 * @param text 内容
 * @returns HTML内容
 */
function generateFallbackHtml(title: string, text: string): string {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  let content = '';
  
  content = `<h2>${escapeHtml(title)}</h2>\n`;
  
  if (paragraphs.length > 0) {
    content += paragraphs.map(p => {
      if (p.startsWith('- ') || p.startsWith('* ')) {
        // 处理无序列表
        const items = p.split('\n').map(item => 
          item.trim().replace(/^[-*]\s+/, '')
        ).filter(item => item);
        
        if (items.length > 0) {
          return '<ul>\n' + items.map(item => 
            `  <li>${escapeHtml(item)}</li>`
          ).join('\n') + '\n</ul>';
        }
      } else if (p.match(/^\d+\.\s/)) {
        // 处理有序列表
        const items = p.split('\n').map(item => 
          item.trim().replace(/^\d+\.\s+/, '')
        ).filter(item => item);
        
        if (items.length > 0) {
          return '<ol>\n' + items.map(item => 
            `  <li>${escapeHtml(item)}</li>`
          ).join('\n') + '\n</ol>';
        }
      }
      
      // 普通段落
      return `<p>${escapeHtml(p)}</p>`;
    }).join('\n');
  } else {
    content += `<p>${escapeHtml(text)}</p>`;
  }
  
  return content;
}

/**
 * 根据内容确定内容类型
 * @param text 输入文本
 * @returns 内容类型
 */
function determineContentType(text: string): string {
  const lowerText = text.toLowerCase();
  
  // 检查特定内容模式
  const isConclusion = lowerText.includes("conclusion") || lowerText.includes("summary");
  const isIntroduction = lowerText.includes("introduction") || lowerText.includes("overview");
  const hasBulletPoints = text.includes("-") || text.includes("*");
  const hasNumbers = /\d+\.\s/.test(text);
  const containsStats = /\d+%|\d+ million|\d+ billion|\d+ dollars/.test(text);

  // 生成适当的内容类型
  if (isConclusion) return '总结';
  if (isIntroduction) return '介绍';
  if (hasBulletPoints || hasNumbers) return '列表';
  if (containsStats) return '数据';
  return '正文';
}

/**
 * 辅助函数，用于HTML转义
 * @param str 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

