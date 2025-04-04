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

  // 基本的元素交互函数
  const handleSelectElement = useCallback((element: HTMLElement, position: { x: number; y: number }) => {
    // 跳过不可选择的元素
    if (element.hasAttribute('data-no-select') || element.closest('[data-no-select]')) {
      return;
    }
    
    // 确定最合适的可选择元素
    let bestElement = element;
    
    // 检查是否选择了文本节点或非常小的元素
    const rect = bestElement.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10 || 
        bestElement.tagName === 'SPAN' && bestElement.textContent?.trim().length === 0) {
      console.log('选择了非常小的元素或空文本，使用父元素');
      
      // 尝试选择父元素（不超过3级）
      let parent = bestElement.parentElement;
      let level = 0;
      while (parent && level < 3) {
        if (!parent.classList.contains('content-container') && 
            !parent.hasAttribute('data-no-select') && 
            !parent.closest('[data-no-select]')) {
          bestElement = parent;
          console.log('使用父元素:', parent.tagName, parent.className);
          break;
        }
        parent = parent.parentElement;
        level++;
      }
    }
    
    // 构建元素的路径（使用内联实现，不调用getElementPath函数）
    let elementPath = '';
    let current = bestElement;
    while (current && !current.hasAttribute('data-content-container')) {
      let selector = current.tagName.toLowerCase();
      if (current.className) {
        selector += '.' + current.className.replace(/\s+/g, '.');
      }
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        selector += `:nth-child(${index + 1})`;
      }
      elementPath = selector + (elementPath ? ' > ' + elementPath : '');
      current = current.parentElement as HTMLElement;
    }
    
    // 使用当前元素的实际类名，确保与DOM同步
    const currentClassNames = bestElement.className || "";
    
    // 设置选中元素
    setSelectedElement(bestElement);
    setSelectedElementPath(elementPath);
    setOriginalClasses(currentClassNames);
    setIsSelecting(false);
    
    // 设置编辑器位置
    setEditorPosition({ 
      x: position.x, 
      y: position.y 
    });
    
    // 显示编辑器
    setShowEditor(true);
    
    console.log('选中元素:', {
      path: elementPath,
      tagName: bestElement.tagName,
      className: currentClassNames,
    });
  }, []);

  const handleStartSelecting = useCallback(() => {
    // 先清除可能的旧状态
    setSelectedElement(null);
    setSelectedElementPath(null);
    setShowEditor(false);
    
    // 确保当前DOM与HTML同步
    if (contentContainerRef.current) {
      const container = contentContainerRef.current.querySelector('[data-selector-layer], .html-content-wrapper');
      if (container) {
        // 强制使用最新的HTML内容
        container.innerHTML = localHtmlContent;
      }
    }
    
    // 添加小延时以确保DOM已更新
    setTimeout(() => {
      setIsSelecting(true);
      
      console.log('开始选择模式:', {
        contentContainer: contentContainerRef.current ? true : false,
        selectorReady: true
      });
    }, 100);
  }, [localHtmlContent]);

  const handleCancelSelecting = useCallback(() => {
    setIsSelecting(false);
    
    // 添加小延时确保状态更新
    setTimeout(() => {
      setSelectedElement(null);
      setShowEditor(false);
      
      console.log('取消选择模式');
    }, 50);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
    // Keep a short delay before removing element reference to avoid flicker
    setTimeout(() => {
      setSelectedElement(null);
    }, 100);
  }, []);
  
  // 获取元素的唯一路径，用于后续识别
  const getElementPath = useCallback((element: HTMLElement): string => {
    let path = [];
    let current = element;
    
    // 向上构建路径，直到找到内容容器
    while (current && !current.hasAttribute('data-content-container')) {
      // 构建当前元素的选择器
      let selector = current.tagName.toLowerCase();
      
      // 添加类名（如果有）
      if (current.className) {
        selector += '.' + current.className.replace(/\s+/g, '.');
      }
      
      // 添加元素在父元素中的索引
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        selector += `:nth-child(${index + 1})`;
      }
      
      path.unshift(selector);
      current = current.parentElement as HTMLElement;
    }
    
    return path.join(' > ');
  }, []);
  
  // 根据路径查找元素
  const findElementByPath = useCallback((path: string, container: HTMLElement): HTMLElement | null => {
    try {
      const selectors = path.split(' > ');
      let current = container;
      
      for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        // 分解选择器，提取标签、类名和索引
        const [tagAndClass, nthChild] = selector.split(':');
        const [tag, ...classes] = tagAndClass.split('.');
        
        // 首先找到所有匹配标签的元素
        let candidates = Array.from(current.children).filter(
          child => child.tagName.toLowerCase() === tag
        ) as HTMLElement[];
        
        // 如果有类名，进一步过滤
        if (classes.length > 0) {
          candidates = candidates.filter(el => {
            return classes.every(cls => el.classList.contains(cls));
          });
        }
        
        // 如果有nth-child，使用索引
        if (nthChild) {
          const indexMatch = nthChild.match(/nth-child\((\d+)\)/);
          if (indexMatch && indexMatch[1]) {
            const index = parseInt(indexMatch[1]) - 1;
            if (index >= 0 && index < candidates.length) {
              current = candidates[index];
              continue;
            }
          }
        }
        
        // 如果只有一个候选，使用它
        if (candidates.length === 1) {
          current = candidates[0];
        } else if (candidates.length > 1) {
          // 多个候选时，记录警告并使用第一个
          console.warn(`多个元素匹配选择器 ${selector}，使用第一个`);
          current = candidates[0];
        } else {
          // 没有找到匹配的元素
          console.error(`无法找到匹配选择器 ${selector} 的元素`);
          return null;
        }
      }
      
      return current;
    } catch (error) {
      console.error('根据路径查找元素出错:', error);
      return null;
    }
  }, []);

  // 使用捕获阶段更精确地选择元素
  const renderHtml = useCallback(() => {
    try {
      // 简化结构，不再使用双层
      const wrappedHtml = `
      <div class="${isSelecting ? 'element-selector-wrapper' : 'html-content-wrapper'}" 
           ${isSelecting ? 'data-selector-layer="true"' : ''}>
        ${localHtmlContent}
      </div>
      `;
      const parsed = parse(wrappedHtml);
      
      return (
        <div 
          ref={contentContainerRef}
          className="content-container w-full overflow-hidden" 
          style={{ maxWidth: '100%', position: 'relative' }}
          data-content-container="true"
          onClickCapture={(e) => { 
            if (!isSelecting) return;
            
            // 获取点击的元素
            const target = e.target as HTMLElement;
            
            // 检查是否点击了选择器层
            const isSelectorLayer = target.closest('[data-selector-layer]');
            if (!isSelectorLayer) {
              // 如果不是在选择器层点击，则忽略
              return;
            }
            
            // 忽略容器本身或带有data-no-select属性的元素
            if (target.classList.contains('content-container') ||
                target.hasAttribute('data-no-select') || 
                target.closest('[data-no-select]')) {
              console.log('元素不可选择');
              return;
            }
            
            // 确定最合适的可选择元素
            let bestElement = target;
            
            // 检查是否点击了文本节点或非常小的元素
            const rect = bestElement.getBoundingClientRect();
            if (rect.width < 10 || rect.height < 10 || 
                bestElement.tagName === 'SPAN' && bestElement.textContent?.trim().length === 0) {
              console.log('点击了非常小的元素或空文本，选择父元素');
              
              // 尝试选择父元素（不超过3级）
              let parent = bestElement.parentElement;
              let level = 0;
              while (parent && level < 3) {
                if (!parent.classList.contains('content-container') && 
                    !parent.hasAttribute('data-no-select') && 
                    !parent.closest('[data-no-select]')) {
                  bestElement = parent;
                  console.log('使用父元素:', parent.tagName, parent.className);
                  break;
                }
                parent = parent.parentElement;
                level++;
              }
            }
            
            // 如果元素没有样式类，尝试找到具有样式类的父元素
            if (!bestElement.className && bestElement.parentElement) {
              let styleParent = bestElement.parentElement;
              if (styleParent.className && 
                  !styleParent.classList.contains('content-container') && 
                  !styleParent.hasAttribute('data-no-select')) {
                console.log('选择具有样式类的父元素:', styleParent.tagName, styleParent.className);
                bestElement = styleParent;
              }
            }
            
            // 构建元素的路径
            let elementPath = '';
            let current = bestElement;
            while (current && !current.hasAttribute('data-content-container')) {
              let selector = current.tagName.toLowerCase();
              if (current.className) {
                selector += '.' + current.className.replace(/\s+/g, '.');
              }
              if (current.parentElement) {
                const siblings = Array.from(current.parentElement.children);
                const index = siblings.indexOf(current);
                selector += `:nth-child(${index + 1})`;
              }
              elementPath = selector + (elementPath ? ' > ' + elementPath : '');
              current = current.parentElement as HTMLElement;
            }
            
            // 使用当前实际的类名
            const currentClassNames = bestElement.className || "";
            
            console.log('选中元素路径:', elementPath);
            console.log('最终选中元素:', {
              tagName: bestElement.tagName,
              className: currentClassNames,
              text: bestElement.textContent?.substring(0, 20),
              html: bestElement.outerHTML.substring(0, 100)
            });
            
            // 保存选中元素的路径和元素本身
            setSelectedElementPath(elementPath);
            setSelectedElement(bestElement);
            setOriginalClasses(currentClassNames);
            
            // 获取元素位置
            const elementRect = bestElement.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // 计算最佳位置 - 优先放在元素右侧，如果空间不足则放左侧
            let posX = elementRect.right + 10;
            // 检查是否会超出右边界
            if (posX + 340 > windowWidth) {
              // 如果放右边会超出，尝试放左边
              posX = Math.max(10, elementRect.left - 350);
              // 如果左右都放不下，就居中显示
              if (posX < 0) {
                posX = Math.max(10, (windowWidth - 340) / 2);
              }
            }

            // 计算最佳Y位置 - 尽量与元素顶部对齐，但不超出上下边界
            let posY = elementRect.top;
            // 确保不超出顶部
            posY = Math.max(10, posY);
            // 确保不超出底部(考虑编辑器高度约500px)
            if (posY + 500 > windowHeight) {
              posY = Math.max(10, windowHeight - 520);
            }

            const position = {
              x: posX,
              y: posY
            };
            
            // 设置位置和显示编辑器
            setEditorPosition(position);
            setShowEditor(true);
            setIsSelecting(false);
          }}
          onMouseOverCapture={(e) => { 
            if (!isSelecting) return;
            
            // 只在选择器层中高亮元素
            const target = e.target as HTMLElement;
            const isSelectorLayer = target.closest('[data-selector-layer]');
            if (!isSelectorLayer) return;
            
            if (!target.classList.contains('content-container') && 
                !target.hasAttribute('data-no-select') && 
                !target.closest('[data-no-select]')) {
              // 显示元素轮廓
              target.style.outline = '2px dashed #3b82f6';
              target.style.outlineOffset = '2px';
                target.style.cursor = 'pointer';
            }
          }}
          onMouseOutCapture={(e) => { 
            // 只清除选择器层中的高亮
            const target = e.target as HTMLElement;
            const isSelectorLayer = target.closest('[data-selector-layer]');
            if (!isSelectorLayer) return;
            
            if (!target.classList.contains('content-container')) {
              target.style.outline = '';
              target.style.outlineOffset = '';
              target.style.cursor = '';
            }
          }}
        >
          <div key={`render-key-${renderKey}`}>
          {parsed}
          </div>
        </div>
      );
    } catch (error) {
      console.error("HTML parsing error:", error);
      return <div className="text-red-500">HTML parsing error: {String(error)}</div>;
    }
  }, [localHtmlContent, isSelecting, contentContainerRef, renderKey]);
  
  // 更新为更精确的handleApplyChanges函数，适应单层结构
  const handleApplyChanges = useCallback((newClasses: string) => {
    if (selectedElement && selectedElementPath) {
      setProcessingFeedback('正在应用样式变更...');
      
      // 记录变更历史，使用路径作为元素标识
      setAppliedChanges((prev) => [
        ...prev,
        {
          element: selectedElementPath,
          before: originalClasses,
          after: newClasses,
        },
      ]);
      
      try {
        // 1. 更新当前DOM中的元素
      selectedElement.className = newClasses;
      
        // 2. 更新HTML字符串，使用精确替换
        // 为了保证更新准确性，直接从DOM中获取更新后的HTML
        if (contentContainerRef.current) {
          const container = contentContainerRef.current.querySelector('[data-selector-layer], .html-content-wrapper');
          if (container) {
            // 获取更新后的HTML
            const updatedHtml = container.innerHTML;
            
            // 更新HTML内容状态
          setLocalHtmlContent(updatedHtml);
            // 强制重新渲染
          setRenderKey(prev => prev + 1);
            // 保存到本地存储
          saveHtmlToLocalStorage(updatedHtml);
          
            console.log('通过DOM获取并更新HTML成功');
            setProcessingFeedback('样式应用成功');
        } else {
            console.error('无法找到内容容器');
            setProcessingFeedback('无法找到内容容器');
          }
        } else {
          console.error('无法获取内容容器引用');
          setProcessingFeedback('应用更改失败');
        }
      } catch (error) {
        console.error('更新HTML时出错:', error);
        setProcessingFeedback('应用更改时出错');
      } finally {
        // 清理反馈
        setTimeout(() => setProcessingFeedback(null), 2000);
        // 关闭编辑器
        setShowEditor(false);
        // 重置选择状态
        setSelectedElement(null);
        setSelectedElementPath(null);
      }
    } else {
      console.warn("没有选中元素，无法应用更改");
      setProcessingFeedback('没有选中元素');
    }
  }, [selectedElement, selectedElementPath, originalClasses, contentContainerRef]);

  // 添加一个函数来强制重新渲染HTML内容
  const refreshContent = useCallback(() => {
    if (contentContainerRef.current) {
      // 取消选择模式
      setIsSelecting(false);
      // 强制重新解析和渲染HTML内容
      setRenderKey(prev => prev + 1);
    }
  }, []);
  
  // 每次应用更改后确保重新渲染
  useEffect(() => {
    if (renderKey > 0) {
      // 确保在DOM更新后重新应用事件监听
      const timer = setTimeout(() => {
        // 确保重新初始化所有事件处理和状态
        console.log('重新初始化内容完成，renderKey:', renderKey);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [renderKey]);

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
      // 创建Blob对象，根据当前活动的预览标签页使用不同的样式
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chinese Learning - 中国古代发明</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 1rem;
      max-width: ${activePreviewTab === "ppt" ? "1200px" : "none"};
      margin: 0 auto;
      background-color: #f9f9f9;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
    
    h1, h2, h3 {
      color: #222;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    
    h1 {
      font-size: 2.25rem;
      text-align: center;
      margin-bottom: 1rem;
    }
    
    .content-wrapper {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    /* PPT模式特定样式 */
    ${activePreviewTab === "ppt" ? `
    .flex {
      display: flex;
    }
    
    .justify-between {
      justify-content: space-between;
    }
    
    .items-center {
      align-items: center;
    }
    
    .grid {
      display: grid;
    }
    
    .grid-cols-2, .grid-cols-3, .grid-cols-4 {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    
    .border {
      border: 1px solid #e5e7eb;
    }
    
    .rounded-md {
      border-radius: 0.375rem;
    }
    
    .p-4 {
      padding: 1rem;
    }
    
    .mb-8 {
      margin-bottom: 2rem;
    }
    
    .bg-white {
      background-color: white;
    }
    
    .gap-4 {
      gap: 1rem;
    }
    
    .prose {
      max-width: 65ch;
      color: #374151;
    }
    
    .prose a {
      color: #2563eb;
      text-decoration: underline;
    }
    
    .text-red-500 {
      color: #ef4444;
    }
    
    .text-blue-500 {
      color: #3b82f6;
    }
    
    .text-green-500 {
      color: #10b981;
    }
    
    .text-yellow-500 {
      color: #f59e0b;
    }
    ` : ''}
  </style>
</head>
<body>
  <div class="content-wrapper">
    ${localHtmlContent}
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // 创建下载链接
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      
      // 根据当前标签页设置不同的文件名
      const filePrefix = activePreviewTab === "ppt" ? "presentation" : "article";
      downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.html`;
      
      // 触发下载
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // 清理
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
      
      console.log('成功下载HTML内容');
      setProcessingFeedback('HTML内容已下载');
      setTimeout(() => setProcessingFeedback(null), 2000);
    } catch (error) {
      console.error('下载HTML时出错:', error);
      setProcessingFeedback('下载失败');
      setTimeout(() => setProcessingFeedback(null), 2000);
    }
  };

  // 使用html2canvas下载图片 - 简化版本
  const handleDownloadImage = () => {
    setProcessingFeedback('正在生成图片...');
    
    // 获取要截图的元素
    if (!contentContainerRef.current) {
      setProcessingFeedback('无法找到内容容器');
      setTimeout(() => setProcessingFeedback(null), 2000);
      return;
    }
    
    // 找到具体需要截图的元素
    const contentElement = contentContainerRef.current.querySelector('.prose') as HTMLElement;
    if (!contentElement) {
      setProcessingFeedback('无法找到内容元素');
      setTimeout(() => setProcessingFeedback(null), 2000);
      return;
    }

    try {
      // 简化的html2canvas调用
      html2canvas(contentElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        // 禁用一些高级功能以提高兼容性
        foreignObjectRendering: false
      }).then(canvas => {
        try {
          // 尝试使用toBlob API而不是toDataURL
          canvas.toBlob((blob) => {
            if (!blob) {
              throw new Error('无法创建图片Blob');
            }
            
            // 使用URL.createObjectURL创建链接
            const url = URL.createObjectURL(blob);
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            const filePrefix = activePreviewTab === "ppt" ? "presentation" : "article";
            downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.png`;
            downloadLink.href = url;
            
            // 触发下载
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // 释放URL对象
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            setProcessingFeedback('图片已下载');
            setTimeout(() => setProcessingFeedback(null), 2000);
          }, 'image/png');
        } catch (blobError) {
          console.error('创建Blob时出错:', blobError);
          
          // 如果toBlob失败，回退到toDataURL
          try {
            const imgData = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            const filePrefix = activePreviewTab === "ppt" ? "presentation" : "article";
            downloadLink.download = `${filePrefix}-${new Date().toISOString().slice(0, 10)}.png`;
            downloadLink.href = imgData;
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            setProcessingFeedback('图片已下载');
            setTimeout(() => setProcessingFeedback(null), 2000);
          } catch (dataUrlError) {
            throw new Error(`无法创建下载链接: ${dataUrlError.message}`);
          }
        }
      });
    } catch (error) {
      console.error('下载图片时出错:', error);
      setProcessingFeedback(`下载图片失败: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setProcessingFeedback(null), 3000);
    }
  };

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
            <div className="h-full preview-content-area">
              <div className="bg-base-200 dark:bg-gray-900 px-4 py-2 border-b flex items-center justify-between sticky top-0 z-10" data-no-select>
                <h3 className="text-sm font-medium" data-no-select>AI 生成预览</h3>
                <div className="flex items-center space-x-2" data-no-select>
                  {isSelecting && <ElementSelector onSelectElement={handleSelectElement} data-no-select />}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        title="下载选项"
                        data-no-select
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        <span>下载</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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

              <div className="h-[calc(100%-37px)] w-full preview-content-area">
                {isGenerating ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 text-neutral-900 animate-spin mb-2 dark:text-neutral-50" />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">正在生成组件...</p>
                    </div>
                  </div>
                ) : (
                  <Tabs value={activePreviewTab} className="h-full">
                    <TabsContent value="ppt" className="h-full m-0 p-0 markdown-preview-content">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-8" data-no-select>
                          <h1 className="text-3xl font-bold" data-no-select>Easy Style Editor</h1>
                          {isSelecting ? (
                            <Button onClick={handleCancelSelecting} variant="destructive" data-no-select>
                              Cancel Selection
                            </Button>
                          ) : (
                            <Button onClick={handleStartSelecting} variant="default" data-no-select>
                              Select Element to Edit
                            </Button>
                          )}
                        </div>
                        <div className="border rounded-md p-4 bg-white dark:bg-gray-800 relative" ref={contentContainerRef}>
                          <div 
                            className="prose prose-sm dark:prose-invert max-w-none relative"
                            key={`html-content-${renderKey}`}
                          >
                            {renderHtml()}
                          </div>                          
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="html" className="h-full m-0 p-0">
                      <ScrollArea className="h-full w-full">
                        <div className="p-6">
                          <div className="flex flex-col gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 overflow-auto">
                              <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {localHtmlContent}
                              </pre>
                            </div>
                          </div>
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

      {/* 使用FriendlyEditor */}
      {showEditor && selectedElement && (
        <FriendlyEditor
          element={selectedElement}
          position={editorPosition}
          originalClasses={originalClasses}
          onClose={handleCloseEditor}
          onApplyChanges={handleApplyChanges}
          className="z-50 fixed"
        />
      )}

      {/* 处理反馈提示 */}
      {processingFeedback && (
        <div className="processing-feedback">
          {processingFeedback}
        </div>
      )}
    </div>

  )
}


