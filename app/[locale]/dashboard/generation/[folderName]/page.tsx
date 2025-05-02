"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import ArticleEditor from "@/app/[locale]/dashboard/components/ai/article-editor"
import MarkdownEditor from "@/app/[locale]/dashboard/components/common/markdown-editor"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle
} from "react-resizable-panels"
import { useTranslations } from 'next-intl';
import { useChat } from '@ai-sdk/react';
import { extractHtmlFromMarkdown } from "@/app/[locale]/dashboard/utils/ai-service";

// Define the expected structure of the params prop
interface GenerationPageProps {
  params: {
    folderName: string; // Make sure 'folderId' matches the name in your directory brackets []
    locale: string;   // Locale is also usually available via params in this structure
  };
}

export default function Home({ params }: GenerationPageProps) {
  const t = useTranslations('GenerationPage');
  const folderName = decodeURIComponent(params.folderName); // Destructure folderId from params

  const [leftContent, setLeftContent] = useState(``)
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
  const [isEditMode, setIsEditMode] = useState(false)
  const currentStyle = useRef("" as string)
  // 使用 useChat hook 替代之前的 fetch 调用
  const { messages, append, isLoading, stop } = useChat({
    api: '/api/ai/generate',
    onFinish: (message) => {
      // 从AI响应中提取HTML内容
      const extractedHtml = extractHtmlFromMarkdown(message.content);
      setHtmlContent(extractedHtml);
      
      // 更新幻灯片数据
      const title = leftContent.split('\n')[0].replace(/^#+\s+/, "").trim();
      setSlideData({
        id: `slide-${Date.now()}`,
        title,
        content: leftContent,
        style: slideData.style
      });
    }
  });
  
  // 创建对左侧面板的引用
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  
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
    if(style !== currentStyle.current) {
      currentStyle.current = style;
      setHtmlContent("");
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
          previousHtml: htmlContent // 添加上一次的HTML内容
        })
      });
    } catch (error) {
      console.error("Error generating HTML content:", error)
    }
  }, [append, slideData.style, htmlContent]); // 将 htmlContent 加入依赖项

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-base-100 dark:bg-gray-950">
        {/* You could display the folder ID or name here if needed */}
        <h1 className="text-lg font-medium">{t('header')} (Folder: {folderName})</h1>
      </header>

      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel ref={leftPanelRef} defaultSize={50} minSize={0}>
            <div className="h-full border border-neutral-200 rounded-lg shadow-sm bg-base-100 dark:bg-gray-950 dark:border-neutral-800 overflow-hidden">
              <MarkdownEditor
                initialContent={leftContent}
                onChange={setLeftContent}
                onAIAction={handleAIAction}
                showAIButton={true}
                isGenerating={isLoading}
                storageKey={`article-editor-${folderName}`}
              />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 group relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-neutral-200 dark:bg-neutral-800 group-hover:bg-blue-500 group-active:bg-blue-600 transition-colors" />
          </PanelResizeHandle>
          
          <Panel 
            defaultSize={50} 
            minSize={0}
          >
            <ArticleEditor
              initialContent={rightContent}
              onSave={setRightContent}
              onAIAction={handleAIAction}
              isGenerating={isLoading}
              htmlContent={htmlContent}
              slideData={slideData}
              folderName={folderName}
              onEditModeChange={handleEditModeChange}
              stopGeneration={stop}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

