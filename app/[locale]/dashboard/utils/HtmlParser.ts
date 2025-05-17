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
  // Check for outline content first
  const outlineRegex = /<<outline-start>>([\s\S]*?)<<outline-end>>/;
  const outlineMatch = content.match(outlineRegex);
  
  if (outlineMatch && outlineMatch[1]) {
    return {
      type: "outline",
      outline: { content: outlineMatch[1].trim() }
    };
  }
  
  // Check for HTML content
  const htmlRegex = /<<html-start>>([\s\S]*?)<<html-end>>/;
  const htmlMatch = content.match(htmlRegex);
  
  if (htmlMatch && htmlMatch[1]) {
    return {
      type: "html",
      html: { content: htmlMatch[1].trim() }
    };
  }
  
  // If no special content found, return as text
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
  
  // Extract outline if present
  const outlineRegex = /<<outline-start>>([\s\S]*?)<<outline-end>>/;
  const outlineMatch = content.match(outlineRegex);
  
  if (outlineMatch && outlineMatch[1]) {
    result.outline = { content: outlineMatch[1].trim() };
  }
  
  // Extract HTML if present
  const htmlRegex = /<<html-start>>([\s\S]*?)<<html-end>>/;
  const htmlMatch = content.match(htmlRegex);
  
  if (htmlMatch && htmlMatch[1]) {
    result.html = { content: htmlMatch[1].trim() };
  }
  
  // If neither outline nor HTML was found, treat as text
  if (!result.outline && !result.html) {
    result.text = content;
  }
  
  return result;
} 