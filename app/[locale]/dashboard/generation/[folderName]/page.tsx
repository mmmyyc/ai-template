"use client"

import { useState, useCallback, useEffect } from "react"
import ArticleEditor from "@/app/[locale]/dashboard/components/ai/article-editor"
import MarkdownEditor from "@/app/[locale]/dashboard/components/common/markdown-editor"
import { generateSlideComponent } from "@/app/[locale]/dashboard/utils/ai-service"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from "react-resizable-panels"
import { useTranslations } from 'next-intl';
// Define the expected structure of the params prop
interface GenerationPageProps {
  params: {
    folderName: string; // Make sure 'folderId' matches the name in your directory brackets []
    locale: string;   // Locale is also usually available via params in this structure
  };
}

export default function Home({ params }: GenerationPageProps) {
  const t = useTranslations('GenerationPage');
  const { folderName } = params; // Destructure folderId from params

  const [leftContent, setLeftContent] = useState(``)

  const [rightContent, setRightContent] = useState(``)

  const [isGenerating, setIsGenerating] = useState(false)
  const [htmlContent, setHtmlContent] = useState("")
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

  const handleAIAction = useCallback(async (selectedText: string, language: string, style: string, generateType: string) => {
    try {
      setIsGenerating(true)
      const { htmlContent: newHtmlContent, slideData: newSlideData } = await generateSlideComponent(selectedText, language, style, generateType)
      setHtmlContent(newHtmlContent)
      setSlideData({
        ...newSlideData,
        style: slideData.style
      })
    } catch (error) {
      console.error("Error generating HTML content:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [slideData.style])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-base-100 dark:bg-gray-950">
        {/* You could display the folder ID or name here if needed */}
        <h1 className="text-lg font-medium">{t('header')} (Folder: {folderName})</h1>
      </header>

      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={5}>
            <div className="h-full border border-neutral-200 rounded-lg shadow-sm bg-base-100 dark:bg-gray-950 dark:border-neutral-800 overflow-hidden">
              <MarkdownEditor
                initialContent={leftContent}
                onChange={setLeftContent}
                onAIAction={handleAIAction}
                showAIButton={true}
                isGenerating={isGenerating}
              />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 group relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-neutral-200 dark:bg-neutral-800 group-hover:bg-blue-500 group-active:bg-blue-600 transition-colors" />
          </PanelResizeHandle>
          
          <Panel defaultSize={50} minSize={30}>
            <ArticleEditor
              initialContent={rightContent}
              onSave={setRightContent}
              onAIAction={handleAIAction}
              isGenerating={isGenerating}
              htmlContent={htmlContent}
              slideData={slideData}
              folderName={folderName}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

