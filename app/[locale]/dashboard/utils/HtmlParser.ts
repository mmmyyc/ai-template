/**
 * HtmlParser utility for extracting domain-specific content from AI responses
 */

// Define interfaces for parsed content
export interface Html {
  content: string;
}

export interface Outline {
  content: string;
}

export interface MixContent {
  type: "text" | "html" | "outline";
  text?: string;
  html?: Html;
  outline?: Outline;
}

/**
 * Parse streaming AI response content for outline and HTML
 * @param content The content to parse
 * @returns A MixContent object with the parsed content
 */
export function parseStreamContent(content: string): MixContent {
  // 添加调试日志
  console.log("Parsing stream content:", content.substring(0, 100) + (content.length > 100 ? "..." : ""));
  
  // 检查是否有完整的outline标记
  const hasOutlineStart = content.includes("<<outline-start>>");
  const hasOutlineEnd = content.includes("<<outline-end>>");
  
  // 检查是否有完整的html标记
  const hasHtmlStart = content.includes("<<html-start>>");
  const hasHtmlEnd = content.includes("<<html-end>>");
  
  console.log(`Markers found - Outline: [${hasOutlineStart?"start":""}${hasOutlineEnd?",end":""}], HTML: [${hasHtmlStart?"start":""}${hasHtmlEnd?",end":""}]`);
  
  // 优先处理大纲内容
  if (hasOutlineStart) {
    const outlineRegex = /<<outline-start>>([\s\S]*?)(?:<<outline-end>>|$)/;
    const outlineMatch = content.match(outlineRegex);
    
    if (outlineMatch && outlineMatch[1]) {
      const outlineContent = outlineMatch[1].trim();
      console.log("Extracted outline content:", outlineContent.substring(0, 100) + (outlineContent.length > 100 ? "..." : ""));
      
      return {
        type: "outline",
        outline: { content: outlineContent }
      };
    }
  }
  
  // 处理HTML内容
  if (hasHtmlStart) {
    const htmlRegex = /<<html-start>>([\s\S]*?)(?:<<html-end>>|$)/;
    const htmlMatch = content.match(htmlRegex);
    
    if (htmlMatch && htmlMatch[1]) {
      const htmlContent = htmlMatch[1].trim();
      console.log("Extracted HTML content:", htmlContent.substring(0, 100) + (htmlContent.length > 100 ? "..." : ""));
      
      return {
        type: "html",
        html: { content: htmlContent }
      };
    }
  }
  
  // 如果内容包含未闭合的标记（流式传输中常见），则尝试提取已有部分
  if (hasOutlineStart && !hasOutlineEnd) {
    const partialOutlineContent = content.split("<<outline-start>>")[1]?.trim();
    if (partialOutlineContent) {
      console.log("Extracted partial outline:", partialOutlineContent.substring(0, 100) + (partialOutlineContent.length > 100 ? "..." : ""));
      return {
        type: "outline",
        outline: { content: partialOutlineContent }
      };
    }
  }
  
  if (hasHtmlStart && !hasHtmlEnd) {
    const partialHtmlContent = content.split("<<html-start>>")[1]?.trim();
    if (partialHtmlContent) {
      console.log("Extracted partial HTML:", partialHtmlContent.substring(0, 100) + (partialHtmlContent.length > 100 ? "..." : ""));
      return {
        type: "html",
        html: { content: partialHtmlContent }
      };
    }
  }
  
  // 如果没有特殊内容，检查是否有markdown格式的内容
  if (content.includes("```html") || content.includes("<html") || content.includes("<div") || content.includes("<p>")) {
    console.log("Content appears to contain HTML but not in our DSL format");
  }
  
  // 如果无特殊内容，返回文本
  console.log("No special content markers found, returning as text");
  return {
    type: "text",
    text: content
  };
}

/**
 * Parse the entire response to extract both outline and HTML if present
 * @param content The complete content to parse
 * @returns An object containing both outline and HTML if found
 */
export function parseCompleteContent(content: string): {
  outline?: Outline;
  html?: Html;
  text?: string;
} {
  const result: {
    outline?: Outline;
    html?: Html;
    text?: string;
  } = {};
  
  // 提取outline内容(即使不完整)
  const outlineRegex = /<<outline-start>>([\s\S]*?)(?:<<outline-end>>|$)/;
  const outlineMatch = content.match(outlineRegex);
  
  if (outlineMatch && outlineMatch[1]) {
    result.outline = { content: outlineMatch[1].trim() };
    console.log("Complete parser extracted outline:", 
                result.outline.content.substring(0, 100) + 
                (result.outline.content.length > 100 ? "..." : ""));
  }
  
  // 提取HTML内容(即使不完整)
  const htmlRegex = /<<html-start>>([\s\S]*?)(?:<<html-end>>|$)/;
  const htmlMatch = content.match(htmlRegex);
  
  if (htmlMatch && htmlMatch[1]) {
    result.html = { content: htmlMatch[1].trim() };
    console.log("Complete parser extracted HTML:", 
               result.html.content.substring(0, 100) + 
               (result.html.content.length > 100 ? "..." : ""));
  }
  
  // 如果内容不包含任何标记但看起来像HTML
  if (!result.outline && !result.html) {
    if (content.includes("```html") || content.includes("<html") || 
        content.includes("<div") || content.includes("<p>")) {
      console.log("Content appears to contain HTML but not in our DSL format");
    }
    
    result.text = content;
  }
  
  return result;
} 