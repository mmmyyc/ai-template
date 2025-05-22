"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import ArticleEditor from "@/app/[locale]/dashboard/components/ai/article-editor"
import MarkdownEditor from "@/app/[locale]/dashboard/components/common/markdown-editor"
import ReactMarkdown from "react-markdown"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle
} from "react-resizable-panels"
import { useTranslations , useLocale } from 'next-intl';
import { useChat, Message, CreateMessage } from '@ai-sdk/react';
import { extractHtmlFromMarkdown } from "@/app/[locale]/dashboard/utils/ai-service";
import { parseStreamContent, parseCompleteContent, MixContent, Html, Outline } from "@/app/[locale]/dashboard/utils/HtmlParser";
import { leftEnglishContent, leftChineseContent } from "./leftContent";
import { saveHtmlToLocalStorage, loadHtmlFromLocalStorage } from "@/app/[locale]/dashboard/utils/localStorage";

// 自定义大纲样式
const outlineStyles = `
.markdown-outline {
  font-size: 0.875rem;
  line-height: 1.5;
}

.markdown-outline h1 {
  font-size: 1.25rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.markdown-outline h2 {
  font-size: 1.1rem;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.markdown-outline h3, .markdown-outline h4 {
  font-size: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.markdown-outline ul, .markdown-outline ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.markdown-outline li {
  margin-bottom: 0.25rem;
}

.markdown-outline p {
  margin: 0.5rem 0;
}

.dark .markdown-outline a {
  color: #60a5fa;
}

.markdown-outline a {
  color: #2563eb;
  text-decoration: none;
}

.markdown-outline a:hover {
  text-decoration: underline;
}

.markdown-outline code {
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.dark .markdown-outline code {
  background-color: rgba(255, 255, 255, 0.1);
}
`;

// Define the expected structure of the params prop
interface GenerationPageProps {
  params: {
    folderName: string; // Make sure 'folderId' matches the name in your directory brackets []
    locale: string;   // Locale is also usually available via params in this structure
  };
}

// Define optional custom chat options with onChunk handler
interface CustomChatOptions {
  onChunk?: (chunk: string, message: Message) => void;
}

export default function Home({ params }: GenerationPageProps) {
  const t = useTranslations('GenerationPage');
  const folderName = decodeURIComponent(params.folderName); // Destructure folderId from params
  const locale = useLocale();
  // 应用自定义样式
  useEffect(() => {
    // 创建样式元素
    const styleElement = document.createElement("style");
    styleElement.innerHTML = outlineStyles;
    styleElement.id = "outline-markdown-styles";
    document.head.appendChild(styleElement);

    // 清理函数
    return () => {
      const existingStyle = document.getElementById("outline-markdown-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  const [leftContent, setLeftContent] = useState(locale === "en" ? leftEnglishContent : leftChineseContent)
  const [rightContent, setRightContent] = useState(``)
  const [slideData, setSlideData] = useState({
    id: "slide-1",
    title: "",
    content: "",
    style: {
      fontFamily: "Inter",
      fontSize: 16,
      color: "#000000",
    },
  })
  const [htmlContent, setHtmlContent] = useState("")
  const [previousHtmlContent, setPreviousHtmlContent] = useState("")
  const [outlineContent, setOutlineContent] = useState("")
  const [outlineTitle, setOutlineTitle] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const currentStyle = useRef("" as string)
  const [folderId, setFolderId] = useState("")

  useEffect(() => {
    const fetchFolderId = async () => {
      const response = await fetch(`/api/html-ppt/getFromIdFormFolderName?name=${folderName}`);
      const data = await response.json();
      setFolderId(data.data.folderId);
    };
    fetchFolderId();
  }, [folderName]);

  // 用于收集流式内容的引用
  const streamingContentRef = useRef("");
  
  // 预览模式控制
  const [activeTabMode, setActiveTabMode] = useState<"edit" | "preview">("preview")
  const [activePreviewTab, setActivePreviewTab] = useState<"html" | "ppt">("html")
  
  // 跟踪是否已完成生成
  const generationCompletedRef = useRef(false)
  
  // 使用 useChat hook
  const { messages, append, isLoading, stop, reload, status,data, setMessages } = useChat({
    api: '/api/ai/generate',
    experimental_throttle: 50,
    onResponse: (response: Response) => {
      // 在生成新内容前保存当前HTML内容
      setPreviousHtmlContent(htmlContent);
      
      // 重置内容状态，准备接收新的内容
      setHtmlContent("");
      setOutlineContent("");
      setOutlineTitle("");
      streamingContentRef.current = "";
      
      // 重置生成完成标志
      generationCompletedRef.current = false;
      
      // 设置预览模式为HTML
      setActiveTabMode("preview");
      setActivePreviewTab("html");
      
      console.log("Started new generation");
    }
  } as any);
  
  // 自定义删除消息的函数
  const removeMessage = useCallback((messageId: string) => {
    setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== messageId));
  }, [setMessages]);
  
  // 监听 messages 变化，解析最新的消息内容
  useEffect(() => {
    if (messages.length === 0) return;
    
    // 获取最新的assistant消息
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length === 0) return;
    
    const latestMessage = assistantMessages[assistantMessages.length - 1];
    console.log("Processing message ID:", latestMessage.id, "Content length:", latestMessage.content.length);
    
    // 尝试从完整消息中解析内容
    try {
      const parsedContent = parseCompleteContent(latestMessage.content);
      
      // 处理大纲内容
      if (parsedContent.outline) {
        // console.log("Setting outline from message content");
        setOutlineContent(parsedContent.outline.content);
        setOutlineTitle(parsedContent.outline.title);
      }
      
      // 处理HTML内容
      if (parsedContent.html) {
        // console.log("Setting HTML from message content");
        setHtmlContent(parsedContent.html.content);
        
        // 当检测到HTML内容时自动打开右侧面板
        setActiveTabMode("preview");
        setActivePreviewTab("html");
      }
      
      // 如果解析器没有识别到特定格式，尝试使用老方法提取HTML
      const hasHtmlContent = parsedContent.html || extractHtmlFromMarkdown(latestMessage.content);
      
      if (!parsedContent.html && !parsedContent.outline && htmlContent === "") {
        const extractedHtml = extractHtmlFromMarkdown(latestMessage.content);
        if (extractedHtml) {
          console.log("Using fallback HTML extraction");
          setHtmlContent(extractedHtml);
          
          // 当提取到HTML内容时自动打开右侧面板
          setActiveTabMode("preview");
          setActivePreviewTab("html");
        }
      }
      
      // 消息完成后，如果没有检测到HTML内容，删除该消息并恢复先前的HTML内容
      if (!isLoading) {
        if (!hasHtmlContent) {
          console.log("No HTML content detected in message, removing message:", latestMessage.id);
          // 删除最新消息
          removeMessage(latestMessage.id);
          // 恢复先前的HTML内容
          setHtmlContent(previousHtmlContent);
          // 显示通知或日志
          console.log("Restored previous HTML content");
          return; // 提前退出以避免更新幻灯片数据
        }
        
        const title = leftContent.split('\n')[0].replace(/^#+\s+/, "").trim();
        setSlideData({
          id: `slide-${Date.now()}`,
          title,
          content: leftContent,
          style: slideData.style
        });
        setActiveTabMode("preview");
        // 切换到HTML页面
        setActivePreviewTab("ppt");
      }
    } catch (error) {
      console.error("Error processing message content:", error);
    }
  }, [messages, isLoading, leftContent, slideData.style, htmlContent, previousHtmlContent, removeMessage]);
  
  // 创建对左侧面板的引用
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  // 创建对右侧面板的引用
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  // 大纲容器引用
  const outlineContainerRef = useRef<HTMLDivElement>(null);
  
  // 监听大纲内容变化，自动滚动到底部
  useEffect(() => {
    if (outlineContainerRef.current && outlineContent) {
      requestAnimationFrame(() => {
        outlineContainerRef.current?.scrollTo({
          top: outlineContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }, [outlineContent]);
  
  const handleEditModeChange = useCallback((editMode: boolean) => {
    setIsEditMode(editMode);
    console.log("编辑模式已切换:", editMode);
    
    // 通过命令式API控制面板大小
    if (leftPanelRef.current) {
      if (editMode) {
        // 在编辑模式下，将左侧面板大小设为0（折叠）
        leftPanelRef.current.resize(0);
      } else {
        // 退出编辑模式时，恢复左侧面板到默认大小
        leftPanelRef.current.resize(50);
      }
    }
  }, []);

  // 修改AI操作处理函数，使用useChat的append方法
  const handleAIAction = useCallback(async (selectedText: string, language: string, style: string, generateType: string) => {
    let ok = false;
    if(style !== currentStyle.current) {
      currentStyle.current = style;
      ok = true;
    }
    
    try {
      // 使用 useChat 的 append 方法发送消息，并包含上一次的HTML内容
      await append({
        role: 'user',
        content: JSON.stringify({
          text: selectedText,
          language,
          style,
          generateType,
          previousHtml: ok ? "" : htmlContent // 添加上一次的HTML内容
        })
      });
    } catch (error) {
      console.error("Error generating HTML content:", error)
    }
  }, [append, htmlContent]); // 将 htmlContent 加入依赖项

  // 将HTML内容保存到localStorage
  useEffect(() => {
    if (htmlContent) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      saveHtmlToLocalStorage(htmlContent, currentPath, folderId);
    }
  }, [htmlContent, folderId]);

  // 初始化时从localStorage加载HTML内容
  useEffect(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const savedHtml = loadHtmlFromLocalStorage(currentPath, folderId);
    if (savedHtml && !htmlContent) {
      setHtmlContent(savedHtml);
      console.log("成功从本地存储加载HTML内容");
    }
  }, [htmlContent, folderId]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-base-100 dark:bg-gray-950">
        {/* You could display the folder ID or name here if needed */}
        <h1 className="text-lg font-medium">{t('header')} (Folder: {folderName})</h1>
      </header>

      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel ref={leftPanelRef} defaultSize={50} minSize={0}>
            <div className="h-full flex flex-col border border-neutral-200 rounded-lg shadow-sm bg-base-100 dark:bg-gray-950 dark:border-neutral-800 overflow-hidden">
              <div className="flex-1 overflow-auto text-editor">
                <MarkdownEditor
                  initialContent={leftContent}
                  onChange={setLeftContent}
                  onAIAction={handleAIAction}
                  showAIButton={true}
                  isGenerating={isLoading}
                  storageKey={`article-editor-${folderName}`}
                />
              </div>
              
              {outlineContent && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-neutral-200 dark:border-neutral-800 overflow-auto max-h-[30%]" ref={outlineContainerRef}>
                  <h3 className="text-sm font-medium mb-2">{t('outline')}</h3>
                  <div className="markdown-outline prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {outlineContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 group relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-neutral-200 dark:bg-neutral-800 group-hover:bg-blue-500 group-active:bg-blue-600 transition-colors" />
          </PanelResizeHandle>
          
          <Panel 
            ref={rightPanelRef}
            defaultSize={50} 
            minSize={0}
          >
            <ArticleEditor
              initialContent={rightContent}
              onSave={setRightContent}
              onAIAction={handleAIAction}
              isGenerating={isLoading}
              htmlContent={htmlContent}
              outlineTitle={outlineTitle}
              slideData={slideData}
              folderName={folderName}
              onEditModeChange={handleEditModeChange}
              stopGeneration={stop}
              reloadGeneration={reload}
              status={status}
              activeTabPropforEditOrPreview={activeTabMode}
              activePreviewTabProp={activePreviewTab}
              onActivePreviewTabChange={(tab) => {
                setActivePreviewTab(tab);
              }}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}