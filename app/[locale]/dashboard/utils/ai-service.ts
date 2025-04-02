"use client"

/**
 * AI服务模块 - 提供HTML生成和处理相关功能
 */

/**
 * 生成HTML内容
 * @param text 输入文本内容
 * @returns 返回HTML内容和元数据
 */
export async function generateSlideComponent(text: string): Promise<{
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
        options: {
          useMock: true,
          mockType: 'htmlContent'
        }
      }),
    });

    // if (!response.ok) {
    //   const errorText = await response.text();
    //   console.error("API error:", response.status, errorText);
    //   throw new Error(`生成HTML内容时出错: ${response.status} - ${errorText}`);
    // }

    const req = await response.json();
    const rawResponse = req.data.text;
    // 处理流式响应
    // const reader = response.body?.getReader();
    // let rawResponse = '';
    
    // if (reader) {
    //   let continueReading = true;
    //   while (continueReading) {
    //     const { done, value } = await reader.read();
    //     if (done) {
    //       continueReading = false;
    //       break;
    //     }
    //     rawResponse += new TextDecoder().decode(value);
    //   }
    // }
    
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
 * 从Markdown响应中提取HTML内容
 * @param markdown Markdown格式的文本
 * @returns 提取的HTML内容
 */
function extractHtmlFromMarkdown(markdown: string): string {
  // 尝试提取HTML代码块
  const htmlBlockRegex = /```(?:html)?\s*\n([\s\S]*?)```/g;
  let matches = htmlBlockRegex.exec(markdown);
  
  // 如果找到了HTML代码块
  if (matches && matches[1]) {
    return matches[1].trim();
  }
  
  // 尝试匹配任何代码块
  const anyCodeBlockRegex = /```([\s\S]*?)```/g;
  matches = anyCodeBlockRegex.exec(markdown);
  if (matches && matches[1]) {
    const code = matches[1].trim();
    // 检查是否包含HTML标签
    if (code.includes('<') && code.includes('>')) {
      return code;
    }
  }
  
  // 检查是否已经包含格式化的HTML标签（包括常见的嵌套结构）
  if (markdown.includes('<h1>') || markdown.includes('<ul>') || 
      markdown.includes('<ol>') || markdown.includes('<li>') ||
      markdown.includes('<br/>') || markdown.includes('<br>')) {
    return markdown;
  }
  
  // 如果没有找到HTML块，可能响应本身就是HTML
  if (markdown.includes('<html') || markdown.includes('<body') || 
      (markdown.includes('<div') && markdown.includes('</div>')) ||
      (markdown.includes('<p') && markdown.includes('</p>'))) {
    return markdown;
  }
  
  // 如果原始响应不包含HTML标签，将文本转换为基本HTML
  return convertTextToHtml(markdown);
}

/**
 * 将纯文本转换为基本HTML
 * @param text 纯文本内容
 * @returns HTML内容
 */
function convertTextToHtml(text: string): string {
  // 简单地将文本分成段落
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  if (paragraphs.length === 0) {
    return `<p>${escapeHtml(text)}</p>`;
  }
  
  let html = '';
  let foundTitle = false;
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    
    // 检查是否为标题(#开头)
    if (!foundTitle && trimmed.startsWith('#')) {
      const level = trimmed.match(/^#+/)[0].length;
      const content = trimmed.replace(/^#+\s+/, '');
      html += `<h${level}>${escapeHtml(content)}</h${level}>\n`;
      foundTitle = true;
      continue;
    }
    
    // 检查是否为列表项（- 或 * 或 1. 开头）
    if (trimmed.match(/^[-*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      const lines = trimmed.split('\n');
      const isOrdered = lines[0].match(/^\d+\.\s+/);
      
      html += isOrdered ? '<ol>\n' : '<ul>\n';
      
      for (const line of lines) {
        if (line.trim()) {
          const content = line.replace(/^[-*\d.]\s+/, '');
          html += `  <li>${escapeHtml(content)}</li>\n`;
        }
      }
      
      html += isOrdered ? '</ol>\n' : '</ul>\n';
      continue;
    }
    
    // 普通段落
    html += `<p>${escapeHtml(trimmed)}</p>\n`;
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

