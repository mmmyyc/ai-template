"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import ThemeToggle from "@/components/ThemeToggle"
import { ElementSelector } from "@/components/element-selector"
import { FriendlyEditor } from "@/app/[locale]/dashboard/components/cssEditor/friendly-editor"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  RefreshCw,
  Edit,
  Eye,
  Code,
  Trash2,
  Download,
  FileDown,
  ImageDown
} from "lucide-react" 
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MarkdownEditor from "@/app/[locale]/dashboard/components/common/markdown-editor"
import parse, { HTMLReactParserOptions, Element as HtmlParserElement, domToReact, DOMNode } from 'html-react-parser'
import { 
  saveHtmlToLocalStorage, 
  loadHtmlFromLocalStorage, 
  hasSavedHtml,
  clearSavedHtml
} from "@/app/[locale]/dashboard/utils/localStorage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import html2canvas from 'html2canvas'

// Helper function to inject styles into an iframe
const injectStylesIntoIframe = (iframeDoc: Document, styles: string): HTMLStyleElement => {
  const styleElement = iframeDoc.createElement('style');
  styleElement.textContent = styles;
  styleElement.id = 'editor-injected-styles'; // Add an ID for easy removal
  iframeDoc.head.appendChild(styleElement);
  return styleElement;
};

// Helper function to remove injected styles
const removeInjectedStylesFromIframe = (iframeDoc: Document) => {
  const styleElement = iframeDoc.getElementById('editor-injected-styles');
  if (styleElement) {
    iframeDoc.head.removeChild(styleElement);
  }
};

// Selection mode styles to be injected
const selectionModeStyles = `
  body.selecting {
    cursor: default; /* Default cursor for body */
    position: relative;
    z-index: 2;
  }
  body.selecting * {
    pointer-events: auto !important;
    cursor: pointer !important; /* Make all elements clickable */
  }
  body.selecting [data-no-select],
  body.selecting [data-no-select] * {
    pointer-events: none !important; /* Disable events for non-selectable */
    cursor: not-allowed !important;
  }
  body.selecting *:not([data-no-select]):not([data-no-select] *):hover {
    outline: 2px dashed #3b82f6 !important;
    outline-offset: 2px !important;
    background-color: rgba(59, 130, 246, 0.05) !important;
    position: relative !important;
    z-index: 3 !important;
  }
  /* Ensure text nodes can trigger events on their parent */
  body.selecting p, body.selecting span, body.selecting div,
  body.selecting h1, body.selecting h2, body.selecting h3,
  body.selecting h4, body.selecting h5, body.selecting h6,
  body.selecting li, body.selecting a, body.selecting strong,
  body.selecting em, body.selecting code {
    position: relative !important; /* Needed for z-index */
    z-index: 1 !important;
  }
`;

interface ArticleEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
  onAIAction?: (selectedText: string) => Promise<void>
  isGenerating?: boolean
  generatedComponentCode?: string
  htmlContent?: string
  slideData?: {
    id: string
    title: string
    content: string
    style: {
      fontFamily: string
      fontSize: number
      color: string
    }
  }
}

export default function ArticleEditor({ 
  initialContent = "", 
  onSave,
  onAIAction,
  isGenerating = false,
  generatedComponentCode = "",
  htmlContent = "",
  slideData = {
    id: "slide-1",
    title: "AI Generated Slide",
    content: "Select text and click the AI button to generate content",
    style: {
      fontFamily: "Inter",
      fontSize: 16,
      color: "#000000",
    },
  }
}: ArticleEditorProps) {
  const [markdownContent, setMarkdownContent] = useState(initialContent)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [activePreviewTab, setActivePreviewTab] = useState<"ppt" | "html">("ppt")
  const [localHtmlContent, setLocalHtmlContent] = useState(htmlContent || "")
  
  // 添加一个状态来跟踪已选择的元素路径
  const [selectedElementPath, setSelectedElementPath] = useState<string | null>(null);
  // 为每个渲染的HTML元素分配一个唯一ID的计数器
  const elementIdCounter = useRef(0);
  // 为需要渲染的组件分配唯一key，强制在HTML内容变化时重新渲染
  const [renderKey, setRenderKey] = useState(0);

  // ============================================================================
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [originalClasses, setOriginalClasses] = useState<string>("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
  const [appliedChanges, setAppliedChanges] = useState<Array<{ element: string; before: string; after: string }>>([]);
  const [processingFeedback, setProcessingFeedback] = useState<string | null>(null);

  // 添加对内容容器的引用
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Ref for the iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Ref to store iframe document for easier access in callbacks
  const iframeDocRef = useRef<Document | null>(null);

  // --- Path Functions ---

  // Modified getElementPath for more logging
  const getElementPath = useCallback((element: HTMLElement, contextDoc: Document = document): string => {
    let path = [];
    let current: HTMLElement | null = element;
    
    while (current && current !== contextDoc.body && current !== contextDoc.documentElement) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
          selector += `#${current.id}`;
          // Potentially break early if ID is unique enough
      } else {
         if (current.className) {
           // Keep classes simple for stability
           const stableClasses = current.className.split(' ')
             .filter(cls => cls && !cls.startsWith('hover:') && !cls.startsWith('focus:') && !cls.includes(':')) // Avoid stateful/complex classes
             .join('.');
           if(stableClasses) selector += '.' + stableClasses;
         }
         if (current.parentElement) {
           const siblings = Array.from(current.parentElement.children);
           // Filter siblings by the same tag name before getting index
           const sameTagSiblings = siblings.filter(sib => sib.tagName === current.tagName);
           const index = sameTagSiblings.indexOf(current);
           if (sameTagSiblings.length > 1) { // Only add nth-of-type if necessary
               selector += `:nth-of-type(${index + 1})`;
           }
         }
      }
      
      path.unshift(selector);
      current = current.parentElement as HTMLElement | null;
    }
    const finalPath = path.join(' > ');
    console.log("Generated Path:", finalPath, "for element:", element);
    return finalPath;
  }, []);

  // Modified findElementByPath for more logging and fallback mechanisms
  const findElementByPath = useCallback((path: string, container: Document | HTMLElement): HTMLElement | null => {
    console.log(`findElementByPath: Attempting to find path: "${path}"`);
    
    try {
      const root = container instanceof Document ? container.body : container;
      if (!root) {
        console.error('findElementByPath: Root element (body or container) not found.');
        return null;
      }
      
      // Try the exact path first
      let foundElement = root.querySelector(path) as HTMLElement | null;
      
      // If that fails, try with simplified path (fallback mechanism)
      if (!foundElement) {
        console.warn(`findElementByPath: Primary query failed for path: "${path}". Trying fallbacks...`);
        
        // Fallback 1: Try removing nth-of-type selectors which can be brittle
        const simplifiedPath = path.replace(/:nth-of-type\(\d+\)/g, '');
        if (simplifiedPath !== path) {
          console.log(`findElementByPath: Trying simplified path: "${simplifiedPath}"`);
          foundElement = root.querySelector(simplifiedPath) as HTMLElement | null;
        }
        
        // Fallback 2: Try with tag names only (most basic)
        if (!foundElement) {
          const tagOnlyPath = path.split(' > ')
            .map(part => part.split('.')[0].split('#')[0].split(':')[0])
            .join(' > ');
            
          if (tagOnlyPath !== path && tagOnlyPath !== simplifiedPath) {
            console.log(`findElementByPath: Trying tag-only path: "${tagOnlyPath}"`);
            foundElement = root.querySelector(tagOnlyPath) as HTMLElement | null;
          }
        }

        // Fallback 3: Try individual segments to find closest match
        if (!foundElement) {
          const segments = path.split(' > ');
          // Try progressively shorter path segments, starting from the end
          for (let i = segments.length - 1; i > 0; i--) {
            const partialPath = segments.slice(0, i).join(' > ');
            console.log(`findElementByPath: Trying partial path: "${partialPath}"`);
            const partialElement = root.querySelector(partialPath) as HTMLElement | null;
            
            if (partialElement) {
              // Found a partial match, now try to find child that most closely matches
              const remainingSegments = segments.slice(i);
              const lastSegment = remainingSegments[remainingSegments.length - 1];
              const tagName = lastSegment.split('.')[0].split('#')[0].split(':')[0];
              
              // Find all elements of target type within the partial element
              const candidates = Array.from(partialElement.querySelectorAll(tagName));
              if (candidates.length > 0) {
                console.log(`findElementByPath: Found ${candidates.length} potential elements`);
                // Just use the first matching element of this type as a fallback
                foundElement = candidates[0] as HTMLElement;
                break;
              }
            }
          }
        }
      }
      
      if (foundElement) {
        console.log(`findElementByPath: Successfully found element for path: "${path}"`, foundElement);
        } else {
        console.error(`findElementByPath: All attempts to find element failed for path: "${path}"`);
      }
      
      return foundElement;
      } catch (error) {
      console.error(`findElementByPath: Error querying path: "${path}"`, error);
      return null;
    }
  }, []);

  // Toggle selection mode
  useEffect(() => {
    if (isSelecting) {
      document.body.classList.add('selecting');
    } else {
      document.body.classList.remove('selecting');
    }
    
    return () => {
      document.body.classList.remove('selecting');
    };
  }, [isSelecting]);

  // Handle content change from the editor
  const handleEditorChange = useCallback((content: string) => {
    setMarkdownContent(content)
    if (onSave) {
      onSave(content)
    }
  }, [onSave])

  // Update local HTML content when the prop changes
  useEffect(() => {
    if (htmlContent) {
      setLocalHtmlContent(htmlContent);
      // 保存到localStorage
      saveHtmlToLocalStorage(htmlContent);
    }
  }, [htmlContent]);

  // 初始化时，如果props没有提供html内容，尝试从localStorage加载
  useEffect(() => {
    if (!htmlContent) {
      const savedHtml = loadHtmlFromLocalStorage();
      if (savedHtml) {
        setLocalHtmlContent(savedHtml);
        console.log('成功从本地存储加载HTML内容');
      }
    }
  }, []);

  // Generate HTML from markdown content only if no external HTML is provided
  useEffect(() => {
    if (!htmlContent && !hasSavedHtml()) {
      // Simple conversion of markdown to HTML for display
      // This is a simple approach - in production you might want more robust conversion
      let html = markdownContent
        .replace(/# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        .replace(/<\/li>\n<li>/g, '</li><li>')
        .replace(/<li>([^]*?)<\/li>/g, '<ul>$&</ul>')
        .replace(/<\/ul>\n<ul>/g, '')
        .replace(/\n\n/g, '<br/><br/>')
      
      setLocalHtmlContent(html);
      // 保存到localStorage
      saveHtmlToLocalStorage(html);
    }
  }, [markdownContent, htmlContent]);

  // Add styles for the tabs and editor
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
    .article-editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 500px;
      overflow: hidden;
    }
    .preview-content-area {
      height: 100%;
      overflow: hidden;
    }
    .markdown-preview-content {
      overflow-y: auto;
    }
    .editor-content-area {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .main-tabs {
      flex: 1;
    }
    
    /* 控制HTML内容渲染区域的样式 */
    .content-container {
      max-width: 100%;
      width: 100%;
      position: relative;
      overflow: hidden;
    }
    .html-content {
      max-width: 100%;
      width: 100%;
      position: relative;
    }
    .html-content * {
      max-width: 100%;
    }
    .html-content iframe, 
    .html-content embed,
    .html-content object,
    .html-content video {
      max-width: 100%;
      width: 100%;
      height: auto;
    }
    
    /* 选择模式下的层样式 */
    .html-content-wrapper.content-hidden {
      opacity: 0.2;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    
    .element-selector-wrapper {
      position: relative;
      z-index: 10;
    }
    `
    document.head.appendChild(style)

    // Add another style element for selection mode
    const selectStyle = document.createElement("style")
    selectStyle.innerHTML = `
      /* 特殊处理：确保所有元素在选择模式下可点击 */
      body.selecting .content-container * {
        pointer-events: auto !important;
      }
      
      /* 确保文本节点可以被选择 */
      body.selecting .element-selector-wrapper p,
      body.selecting .element-selector-wrapper span,
      body.selecting .element-selector-wrapper div,
      body.selecting .element-selector-wrapper h1,
      body.selecting .element-selector-wrapper h2,
      body.selecting .element-selector-wrapper h3,
      body.selecting .element-selector-wrapper h4,
      body.selecting .element-selector-wrapper h5,
      body.selecting .element-selector-wrapper h6,
      body.selecting .element-selector-wrapper li {
        cursor: pointer !important;
        position: relative !important;
        z-index: 1 !important;
      }
      
      /* 更明显的悬停效果 */
      body.selecting .element-selector-wrapper *:not([data-no-select]):not([data-no-select] *):hover {
        outline: 3px dashed #3b82f6 !important;
        outline-offset: 2px !important;
        position: relative !important;
        z-index: 10 !important; 
        background-color: rgba(59, 130, 246, 0.05) !important;
      }
      
      /* 为了便于选择小元素，增加点击区域 */
      body.selecting .element-selector-wrapper span,
      body.selecting .element-selector-wrapper a,
      body.selecting .element-selector-wrapper small,
      body.selecting .element-selector-wrapper em,
      body.selecting .element-selector-wrapper strong,
      body.selecting .element-selector-wrapper code {
        min-height: 24px !important;
        min-width: 24px !important;
        display: inline-block !important;
      }
      
      /* 排除不可选择元素 */
      body.selecting [data-no-select] {
        pointer-events: auto !important;
        cursor: not-allowed !important;
      }
      
      /* 显示处理中的反馈 */
      .processing-feedback {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 9999;
        transition: opacity 0.3s ease;
      }
    `
    document.head.appendChild(selectStyle)

    return () => {
      document.head.removeChild(style)
      document.head.removeChild(selectStyle)
    }
  }, [])

  // 清除本地存储的HTML内容
  const handleClearStorage = () => {
    clearSavedHtml();
    setLocalHtmlContent('');
    setRenderKey(prev => prev + 1);
    console.log('已清除本地存储的HTML内容');
  };

  // 改进下载HTML功能，添加PPT模式下的样式
  const handleDownloadHtml = () => {
    try {
      if (!iframeRef.current || !iframeRef.current.contentDocument) {
             throw new Error("Iframe content not available");
        }
        const iframeDoc = iframeRef.current.contentDocument;
        // Get the full outerHTML of the iframe's document
        const htmlContent = iframeDoc.documentElement.outerHTML;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `content-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      setProcessingFeedback('HTML downloaded');
    } catch (error) {
      console.error('Error downloading HTML:', error);
      setProcessingFeedback(`Download failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
       setTimeout(() => setProcessingFeedback(null), 2000);
    }
  };

  // 使用html2canvas下载图片 - 修正并处理动画
  const handleDownloadImage = async () => { // Make async for await
    setProcessingFeedback('准备截图环境...');
    
    // 获取 iframe 及其内部文档和 body (与之前相同)
    if (!iframeRef.current) {
      setProcessingFeedback('错误：无法找到 iframe 元素');
      setTimeout(() => setProcessingFeedback(null), 3000);
      return;
    }
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) {
      setProcessingFeedback('错误：无法访问 iframe 内容文档');
      setTimeout(() => setProcessingFeedback(null), 3000);
      return;
    }
    const iframeBody = iframeDoc.body;
    if (!iframeBody) {
      setProcessingFeedback('错误：无法访问 iframe body');
      setTimeout(() => setProcessingFeedback(null), 3000);
      return;
    }

    // --- 禁用动画 --- 
    const disableAnimationStyleId = 'temp-disable-animations';
    let tempStyleElement: HTMLStyleElement | null = null;
    try {
      setProcessingFeedback('禁用动画并准备截图...');
      tempStyleElement = iframeDoc.createElement('style');
      tempStyleElement.id = disableAnimationStyleId;
      // 强制禁用所有动画和过渡
      tempStyleElement.textContent = `
        * {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important; /* 同时禁用平滑滚动 */
        }
      `;
      iframeDoc.head.appendChild(tempStyleElement);

      // 等待浏览器应用样式 (使用 Promise + requestAnimationFrame)
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 50)); // 添加一个小的额外延迟确保渲染

      setProcessingFeedback('正在生成图片...');
      // 对 iframe 的 body 元素进行截图
      const canvas = await html2canvas(iframeBody, {
        backgroundColor: getComputedStyle(iframeBody).backgroundColor || '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false
      });

      // --- 恢复动画 (在截图完成后立即进行) ---
      if (tempStyleElement) {
          iframeDoc.head.removeChild(tempStyleElement);
          tempStyleElement = null; // 清理引用
      }
      setProcessingFeedback('处理图片...');

      // --- 图片处理和下载逻辑 (与之前类似) ---
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('无法创建图片Blob');
          }
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          const filePrefix = activePreviewTab === "ppt" ? "幻灯片" : "文章";
          downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.png`;
          downloadLink.href = url;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          setTimeout(() => URL.revokeObjectURL(url), 100);
          setProcessingFeedback('图片已下载');
          setTimeout(() => setProcessingFeedback(null), 2000);
        }, 'image/png');
      } catch (blobError: any) {
        console.error('创建Blob时出错:', blobError);
        // Fallback to toDataURL
        try {
          const imgData = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          const filePrefix = activePreviewTab === "ppt" ? "幻灯片" : "文章";
          downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.png`;
          downloadLink.href = imgData;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          setProcessingFeedback('图片已下载');
          setTimeout(() => setProcessingFeedback(null), 2000);
        } catch (dataUrlError: any) {
          throw new Error(`无法创建下载链接: ${dataUrlError.message}`);
        }
      }

    } catch (error) {
      console.error('下载图片时出错:', error);
      setProcessingFeedback(`下载图片失败: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setProcessingFeedback(null), 3000);
    } finally {
      // --- 确保动画恢复 --- 
      if (tempStyleElement && iframeDoc?.head.contains(tempStyleElement)) {
        iframeDoc.head.removeChild(tempStyleElement);
        console.log("确保临时样式已被移除");
      }
      // 不需要再在这里移除反馈信息，因为它在成功或失败后已经设置了超时
    }
  };

  // --- Iframe Setup and Event Handling ---

  // Function to set up listeners inside the iframe
  const setupIframeListeners = useCallback(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow || !iframeRef.current.contentDocument) {
      console.log("Iframe not ready for listeners yet");
      return;
    }
    const iframeDoc = iframeRef.current.contentDocument;
    iframeDocRef.current = iframeDoc; // Store for use in handlers

    if (isSelecting) {
      console.log("Setting up iframe listeners for selection");
      iframeDoc.body.classList.add('selecting');
      injectStylesIntoIframe(iframeDoc, selectionModeStyles);

      // Define handlers within the scope where iframeDoc is current
      const handleIframeClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        if (target.hasAttribute('data-no-select') || target.closest('[data-no-select]')) {
          console.log('Iframe element not selectable');
          return;
        }

        // 添加更多调试信息
        console.log('原始点击元素:', {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          textContent: target.textContent?.substring(0, 20) || '(empty)'
        });

        let bestElement = target;
        
        // 保持最原始的选择逻辑，避免过度选择父元素
        // 只在极少数情况下选择父元素（几乎没有内容或尺寸的元素）
        const rect = bestElement.getBoundingClientRect();
        if ((rect.width === 0 && rect.height === 0) || 
            (bestElement.tagName === 'SPAN' && !bestElement.textContent?.trim())) {
          console.log('元素完全空白，尝试查找有意义的父元素');
          
          let parent = bestElement.parentElement;
          if (parent && !parent.hasAttribute('data-no-select')) {
            bestElement = parent;
            console.log('选择父元素:', parent.tagName, parent.className);
          }
        }

        // Simplified selection logic for iframe, can add heuristics back if needed
        console.log('最终选择的元素:', bestElement.tagName, bestElement.className);

        const elementPath = getElementPath(bestElement, iframeDoc);
        const currentClassNames = bestElement.className || "";

        console.log('Selected element path (iframe):', elementPath);

        setSelectedElementPath(elementPath);
        setSelectedElement(bestElement); // Store the actual iframe element reference
        setOriginalClasses(currentClassNames);

        // Calculate position relative to main window
        const iframeRect = iframeRef.current!.getBoundingClientRect();
        const elementRect = bestElement.getBoundingClientRect(); // Relative to iframe viewport

        const editorWidth = 340; // Approx editor width
        const editorHeight = 500; // Approx editor height
        const padding = 10;

        // Calculate position relative to main window viewport
        let idealX = iframeRect.left + elementRect.right + padding;
        let idealY = iframeRect.top + elementRect.top;

        // Adjust X position
        if (idealX + editorWidth > window.innerWidth - padding) { // Check right boundary
            idealX = iframeRect.left + elementRect.left - editorWidth - padding; // Try left
            if (idealX < padding) { // If left also fails, center horizontally
                idealX = (window.innerWidth - editorWidth) / 2;
            }
        }
        idealX = Math.max(padding, idealX); // Ensure within left boundary

        // Adjust Y position
        if (idealY + editorHeight > window.innerHeight - padding) { // Check bottom boundary
            idealY = window.innerHeight - editorHeight - padding; // Align to bottom
        }
        idealY = Math.max(padding, idealY); // Ensure within top boundary


        setEditorPosition({ x: idealX, y: idealY });
        setShowEditor(true);
        setIsSelecting(false); // Turn off selection mode
      };

      const handleIframeMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.hasAttribute('data-no-select') || target.closest('[data-no-select]')) {
           target.style.cursor = 'not-allowed';
           return;
        }
        // Styling is now handled by injected CSS :hover rule
         target.style.cursor = 'pointer';
      };

      const handleIframeMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
         target.style.cursor = ''; // Reset cursor
        // Outline is removed automatically by CSS
      };

      iframeDoc.body.addEventListener('click', handleIframeClick, true); // Use capture phase
      iframeDoc.body.addEventListener('mouseover', handleIframeMouseOver);
      iframeDoc.body.addEventListener('mouseout', handleIframeMouseOut);

      // Store handlers to remove them later
      (iframeRef.current as any).__editor_listeners = {
        click: handleIframeClick,
        mouseover: handleIframeMouseOver,
        mouseout: handleIframeMouseOut,
      };

    } else {
      // Cleanup listeners and styles if selection mode is off
      cleanupIframeListeners();
    }
  }, [isSelecting, getElementPath]); // Add dependencies

  // Function to clean up listeners and styles
  const cleanupIframeListeners = () => {
    if (iframeRef.current && (iframeRef.current as any).__editor_listeners && iframeDocRef.current) {
      console.log("Cleaning up iframe listeners");
      const listeners = (iframeRef.current as any).__editor_listeners;
      const iframeDoc = iframeDocRef.current;
      iframeDoc.body.removeEventListener('click', listeners.click, true);
      iframeDoc.body.removeEventListener('mouseover', listeners.mouseover);
      iframeDoc.body.removeEventListener('mouseout', listeners.mouseout);
      iframeDoc.body.classList.remove('selecting');
      removeInjectedStylesFromIframe(iframeDoc);
      (iframeRef.current as any).__editor_listeners = null; // Clear stored listeners
      iframeDocRef.current = null; // Clear doc ref
    }
  };

  // Effect to setup/cleanup iframe listeners when selection mode changes or iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log("Iframe loaded, setting up listeners if needed.");
       // Small delay to ensure contentDocument is fully accessible after load event
       setTimeout(() => {
           if (isSelecting) {
              setupIframeListeners();
           }
       }, 50);
    };

    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      // If already loaded (e.g., on hot reload or quick tab switch)
      handleLoad();
    } else {
      iframe.addEventListener('load', handleLoad);
    }

    // Trigger setup/cleanup immediately if isSelecting changes while iframe is loaded
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        if (isSelecting) {
            setupIframeListeners();
        } else {
            cleanupIframeListeners();
        }
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
      // Ensure cleanup happens when component unmounts or isSelecting turns false
      cleanupIframeListeners();
    };
  }, [isSelecting, setupIframeListeners]); // setupIframeListeners is memoized by useCallback

  // --- Button Handlers (Early Definitions) ---
  const handleStartSelecting = useCallback(() => {
    setSelectedElement(null);
    setSelectedElementPath(null);
    setShowEditor(false);
    setIsSelecting(true);
    console.log('Starting selection mode (iframe)');
    // 简单延迟确保DOM更新完成
    setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        // 确保iframe加载完成后再设置样式
        console.log("Selection mode: Adding selecting class to iframe body");
        const iframeDoc = iframeRef.current.contentDocument;
        iframeDoc.body.classList.add('selecting');
        injectStylesIntoIframe(iframeDoc, selectionModeStyles);
      }
    }, 100);
  }, []);

  const handleCancelSelecting = useCallback(() => {
    setIsSelecting(false);
    if (iframeRef.current && iframeRef.current.contentDocument) {
      const iframeDoc = iframeRef.current.contentDocument;
      iframeDoc.body.classList.remove('selecting');
      removeInjectedStylesFromIframe(iframeDoc);
    }
    setShowEditor(false);
    setSelectedElement(null);
    setSelectedElementPath(null);
    console.log('Canceled selection mode (iframe)');
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
    // 保持短延迟以避免闪烁
    setTimeout(() => {
      setSelectedElement(null);
      setSelectedElementPath(null);
    }, 100);
  }, []);

  // --- Apply Changes ---
  const handleApplyChanges = useCallback((newClasses: string) => {
    if (selectedElementPath && iframeRef.current && iframeRef.current.contentDocument) {
      setProcessingFeedback('Applying styles...');
      const iframeDoc = iframeRef.current.contentDocument;

      // Log the path being used
      console.log('handleApplyChanges: Finding element with path:', selectedElementPath);
      
      // Attempt 1: Try direct path first
      let elementInIframe = findElementByPath(selectedElementPath, iframeDoc);
      
      // Attempt 2: Try with freshly generated path
      if (!elementInIframe && selectedElement) {
        console.log('handleApplyChanges: Direct path failed, generating fresh path');
        const freshPath = getElementPath(selectedElement, selectedElement.ownerDocument || document);
        if (freshPath !== selectedElementPath) {
          console.log(`handleApplyChanges: Path changed from "${selectedElementPath}" to "${freshPath}"`);
          elementInIframe = findElementByPath(freshPath, iframeDoc);
        }
      }
      
      // Attempt 3: Try with tag and class fragment
      if (!elementInIframe && selectedElement) {
        console.log('handleApplyChanges: Fresh path failed, trying tag+class fragment');
        const tagName = selectedElement.tagName.toLowerCase();
        const classList = originalClasses.split(' ').filter(cls => cls.trim().length > 0);
        
        // Try with each class from original classes
        for (const cls of classList) {
          if (!cls) continue;
          const query = `${tagName}[class*="${cls}"]`;
          console.log(`handleApplyChanges: Trying query: ${query}`);
          const elements = Array.from(iframeDoc.querySelectorAll(query)) as HTMLElement[];
          
          // If we found elements with this class, use the first one
          if (elements.length > 0) {
            console.log(`handleApplyChanges: Found ${elements.length} elements with class containing '${cls}'`);
            elementInIframe = elements[0];
            break;
          }
        }
      }
      
      // Attempt 4: Last-resort - try to find by tag and similar content/attributes
      if (!elementInIframe && selectedElement) {
        console.log('handleApplyChanges: Class fragment failed, trying content matching');
        const tagName = selectedElement.tagName.toLowerCase();
        const textContent = selectedElement.textContent?.trim().substring(0, 20);
        const sameTags = Array.from(iframeDoc.querySelectorAll(tagName)) as HTMLElement[];
        
        // Try matching by content
        if (textContent && textContent.length > 0) {
          console.log(`handleApplyChanges: Looking for ${tagName} with text "${textContent}..."`);
          const contentMatch = sameTags.find(el => 
            el.textContent?.includes(textContent) ||
            el.innerText?.includes(textContent) ||
            el.innerHTML?.includes(textContent)
          );
          
          if (contentMatch) {
            console.log('handleApplyChanges: Found element with matching content');
            elementInIframe = contentMatch;
          }
        }
        
        // If still not found, try with attributes
        if (!elementInIframe) {
          for (const attr of Array.from(selectedElement.attributes)) {
            if (attr.name !== 'class' && attr.name !== 'style' && attr.value) {
              console.log(`handleApplyChanges: Looking for ${tagName} with attribute ${attr.name}="${attr.value}"`);
              const attrMatch = sameTags.find(el => el.getAttribute(attr.name) === attr.value);
              if (attrMatch) {
                console.log(`handleApplyChanges: Found element with matching ${attr.name}`);
                elementInIframe = attrMatch;
                break;
              }
            }
          }
        }
      }

      if (elementInIframe) {
        // Record change history
        setAppliedChanges((prev) => [
          ...prev,
          { element: selectedElementPath, before: originalClasses, after: newClasses },
        ]);

        try {
          // Apply the changes
          console.log('Applying new class name:', newClasses, 'to element:', elementInIframe);
          elementInIframe.className = newClasses;
          
          // Double-check the class was applied correctly
          console.log('Element class after update:', elementInIframe.className);
          if (elementInIframe.className !== newClasses) {
            console.warn('Class name did not apply correctly, force setting via setAttribute');
            elementInIframe.setAttribute('class', newClasses);
          }

          // Update from iframe
          const updatedHtml = iframeDoc.body.innerHTML;
          
          // Update React state and save
          setLocalHtmlContent(updatedHtml);
          saveHtmlToLocalStorage(updatedHtml);
          
          // Trigger style recalculation
          const tempStyleElement = document.createElement('style');
          iframeDoc.head.appendChild(tempStyleElement);
          setTimeout(() => {
            iframeDoc.head.removeChild(tempStyleElement);
          }, 50);

          // Force re-render
          setRenderKey(prev => prev + 1);

          console.log('Applied changes to iframe element and updated state');
          setProcessingFeedback('Styles applied successfully');

        } catch (error) {
          console.error('Error applying changes to iframe:', error);
          setProcessingFeedback('Error applying styles');
        } finally {
          // Cleanup
          setTimeout(() => setProcessingFeedback(null), 2000);
          setShowEditor(false);
          setSelectedElement(null);
          setSelectedElementPath(null);
          setIsSelecting(false);
        }
      } else {
        console.error('handleApplyChanges: ERROR - Could not find element in iframe with path:', selectedElementPath);
        
        // Special error handling for specific tags that might be problematic
        const tagMatch = selectedElementPath.match(/^([a-z0-9]+)/i);
        const tag = tagMatch ? tagMatch[1].toLowerCase() : 'unknown';
        
        setProcessingFeedback(`Error: Could not find target element (${tag}) to apply changes.`);
        
        // In case of error, try to save the current editor state anyway
        setTimeout(() => {
          setProcessingFeedback(null);
        }, 3000);
      }
    } else {
      console.warn("handleApplyChanges: Cannot apply changes: No element path or iframe not ready.");
      setProcessingFeedback('Cannot apply changes');
      setTimeout(() => setProcessingFeedback(null), 2000);
    }
  }, [selectedElementPath, originalClasses, findElementByPath, selectedElement, getElementPath, setRenderKey]);

  return (
    <div className="article-editor-container border border-neutral-200 rounded-lg shadow-sm bg-base-100 dark:bg-gray-950 dark:border-neutral-800">
      <div className="bg-base-200 dark:bg-gray-900 px-4 py-2 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">文档编辑器</h3>
        <Tabs 
          value={activeTab} 
          onValueChange={(value: string) => setActiveTab(value as "edit" | "preview")}
          className="h-8"
        >
          <TabsList className="h-7">
            <TabsTrigger value="edit" className="text-xs h-6 px-3 gap-1">
              <Edit className="h-3.5 w-3.5" />
              <span>编辑</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs h-6 px-3 gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>预览</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 h-[calc(100%-37px)]">
        <Tabs value={activeTab} className="h-full main-tabs">
          {/* 编辑器标签页内容 */}
          <TabsContent value="edit" className="h-full m-0 p-0">
            <div className="editor-content-area">
              <MarkdownEditor 
                initialContent={initialContent}
                onChange={handleEditorChange}
                onAIAction={onAIAction}
                showAIButton={true}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>

          {/* 预览标签页内容 */}
          <TabsContent value="preview" className="h-full m-0 p-0">
            <div className="h-full preview-content-area flex flex-col">
              <div className="bg-base-200 dark:bg-gray-900 px-4 py-2 border-b flex items-center justify-between sticky top-0 z-10 flex-shrink-0" data-no-select>
                <h3 className="text-sm font-medium" data-no-select>AI 生成预览 (Iframe)</h3>
                <div className="flex items-center space-x-2" data-no-select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-white" title="下载选项" data-no-select>
                        <Download className="h-3.5 w-3.5 mr-1" />
                        <span>下载</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={handleDownloadHtml}>
                        <FileDown className="h-3.5 w-3.5 mr-2" />
                        下载为 HTML
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadImage}>
                        <ImageDown className="h-3.5 w-3.5 mr-2" />
                        下载为图片
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    onClick={handleClearStorage}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    title="清除本地存储"
                    data-no-select
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>清除存储</span>
                  </Button>

                  <Tabs
                    value={activePreviewTab}
                    onValueChange={(value: string) => setActivePreviewTab(value as "ppt" | "html")}
                    className="h-8"
                    data-no-select
                  >
                    <TabsList className="h-7" data-no-select>
                      <TabsTrigger value="ppt" className="text-xs h-6 px-2" data-no-select>
                        PPT
                      </TabsTrigger>
                      <TabsTrigger value="html" className="text-xs h-6 px-2" data-no-select>
                        HTML
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="flex-grow w-full relative overflow-hidden">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50">
                    <div className="flex flex-col items-center p-4 bg-base-100 dark:bg-gray-800 rounded shadow-lg">
                      <RefreshCw className="h-8 w-8 text-neutral-900 animate-spin mb-2 dark:text-neutral-50" />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">正在生成内容...</p>
                    </div>
                  </div>
                ) : (
                  <Tabs value={activePreviewTab} className="h-full">
                    <TabsContent value="ppt" className="h-full m-0 p-0">
                      <div className="h-full flex flex-col">
                        <div className="p-2 border-b flex justify-end flex-shrink-0">
                          {isSelecting ? (
                              <Button onClick={handleCancelSelecting} variant="destructive" size="sm" data-no-select>
                              Cancel Selection
                            </Button>
                          ) : (
                              <Button onClick={handleStartSelecting} variant="default" size="sm" data-no-select>
                              Select Element to Edit
                            </Button>
                          )}
                        </div>
                        <div className="flex-grow relative bg-gray-100 dark:bg-gray-800">
                          <iframe
                            ref={iframeRef}
                            key={`iframe-${renderKey}`}
                            srcDoc={localHtmlContent}
                            title="HTML Preview"
                            className="w-full h-full border-0 relative z-10"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                          />
                          {isSelecting && (
                              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none z-0 border border-blue-500 animate-pulse" data-no-select>
                                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Selection Mode Active</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="html" className="h-full m-0 p-0">
                      <ScrollArea className="h-full w-full">
                        <div className="p-4">
                          <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded p-4">
                                {localHtmlContent}
                              </pre>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {showEditor && selectedElementPath && (
        <FriendlyEditor
          elementPath={selectedElementPath}
          iframeRef={iframeRef}
          position={editorPosition}
          originalClasses={originalClasses}
          onClose={handleCloseEditor}
          onApplyChanges={handleApplyChanges}
          className="z-50 fixed"
        />
      )}

      {processingFeedback && (
        <div className="processing-feedback">
          {processingFeedback}
        </div>
      )}
    </div>
  )
}


