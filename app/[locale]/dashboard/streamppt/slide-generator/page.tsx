"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import ArticleEditor from "@/app/[locale]/dashboard/components/ai/article-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, BookOpen, Award } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from 'next-intl'
import { useChat } from '@ai-sdk/react'
import { toast } from "react-hot-toast"
import { useFolderStore } from "@/app/[locale]/dashboard/store/folderStore"
import { extractHtmlFromMarkdown } from "@/app/[locale]/dashboard/utils/ai-service"
import { parseCompleteContent } from "@/app/[locale]/dashboard/utils/HtmlParser"
import type { Slide } from "@/app/[locale]/dashboard/streamppt/types/slide"
import apiClient from "@/libs/api"
import ReactMarkdown from 'react-markdown'
// 定义特殊幻灯片类型
type SpecialSlideType = 'cover' | 'contents' | 'acknowledgments'

export default function SlideGeneratorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('StreamPpt')
  
  // 获取URL参数
  const folderId = searchParams.get('folderId')
  
  // 使用ref跟踪请求状态，避免竞态条件
  const requestStatusRef = useRef({
    isLoading: false,
    hasInitialLoad: false,
    requestId: 0 // 用于追踪最新请求
  })
  
  // Folder store
  const { 
    folders,
    fetchFolders,
  } = useFolderStore()
  
  // 加载文件夹和幻灯片
  const [folder, setFolder] = useState<any>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<SpecialSlideType | null>(null)
  
  // 状态管理
  const [leftContent, setLeftContent] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [outlineContent, setOutlineContent] = useState('')
  const [activeTabMode, setActiveTabMode] = useState<"edit" | "preview">("preview")
  const [activePreviewTab, setActivePreviewTab] = useState<"html" | "ppt">("html")
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
  const [isEditMode, setIsEditMode] = useState(false)
  const currentStyle = useRef("" as string)
  
  // 用于收集流式内容的引用
  const streamingContentRef = useRef("")
  
  // 跟踪是否已完成生成
  const generationCompletedRef = useRef(false)
  
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

  // useChat hook 用于AI生成
  const { 
    messages,
    append,
    isLoading: isChatLoading,
    stop 
  } = useChat({
    api: '/api/ai/generate',
    experimental_throttle: 50,
    onResponse: (response: Response) => {
      // 重置内容状态，准备接收新的内容
      setHtmlContent("")
      setOutlineContent("")
      streamingContentRef.current = ""
      
      // 重置生成完成标志
      generationCompletedRef.current = false
      
      // 设置预览模式为HTML
      setActiveTabMode("preview")
      setActivePreviewTab("html")
      
      console.log("Started new generation")
    },
    onFinish: () => {
      // 消息完成时更新幻灯片数据
      if (leftContent) {
        const title = leftContent.split('\n')[0].replace(/^#+\s+/, "").trim()
        setSlideData({
          id: `slide-${Date.now()}`,
          title,
          content: leftContent,
          style: slideData.style
        })
      }
    }
  })
  
  // 添加客户端水合状态
  const [hasHydrated, setHasHydrated] = useState(false)
  
  // 确保代码只在客户端执行
  useEffect(() => {
    setHasHydrated(true)
  }, [])
  
  // 监听 messages 变化，解析最新的消息内容
  useEffect(() => {
    if (messages.length === 0) return
    
    // 获取最新的assistant消息
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')
    if (assistantMessages.length === 0) return
    
    const latestMessage = assistantMessages[assistantMessages.length - 1]
    console.log("Processing message ID:", latestMessage.id, "Content length:", latestMessage.content.length)
    
    // 尝试从完整消息中解析内容
    try {
      const parsedContent = parseCompleteContent(latestMessage.content)
      
      // 处理大纲内容
      if (parsedContent.outline) {
        console.log("Setting outline from message content")
        setOutlineContent(parsedContent.outline.content)
      }
      
      // 处理HTML内容
      if (parsedContent.html) {
        console.log("Setting HTML from message content")
        setHtmlContent(parsedContent.html.content)
        
        // 当检测到HTML内容时自动打开右侧面板
        setActiveTabMode("preview")
        setActivePreviewTab("html")
      }
      
      // 如果解析器没有识别到特定格式，尝试使用老方法提取HTML
      if (!parsedContent.html && !parsedContent.outline && htmlContent === "") {
        const extractedHtml = extractHtmlFromMarkdown(latestMessage.content)
        if (extractedHtml) {
          console.log("Using fallback HTML extraction")
          setHtmlContent(extractedHtml)
          
          // 当提取到HTML内容时自动打开右侧面板
          setActiveTabMode("preview")
          setActivePreviewTab("html")
        }
      }
      // 消息完成时更新幻灯片数据
      if (!isChatLoading) {
        setActiveTabMode("preview");
        // 切换到HTML页面
        setActivePreviewTab("ppt");
      }
    } catch (error) {
      console.error("Error processing message content:", error)
    }
  }, [messages, htmlContent,isChatLoading])
  

  // 简化初始化加载过程
  useEffect(() => {
    if (!hasHydrated || !folderId || requestStatusRef.current.isLoading) return
    
    console.log('触发数据加载, folderId =', folderId)
    
    // 开始新的请求
    const currentRequestId = requestStatusRef.current.requestId + 1
    requestStatusRef.current = {
      isLoading: true,
      hasInitialLoad: requestStatusRef.current.hasInitialLoad,
      requestId: currentRequestId
    }
    
    setIsLoading(true)
    
    const loadData = async () => {
      // 检查请求ID是否仍然是最新的
      if (requestStatusRef.current.requestId !== currentRequestId) {
        console.log('请求已过期，中止执行')
        return
      }
      
      try {
        // 确保文件夹信息已加载
        if (folders.length === 0) {
          console.log('加载文件夹列表...')
          await fetchFolders()
        }
        
        // 检查请求是否仍然有效
        if (requestStatusRef.current.requestId !== currentRequestId) return
        
        // 获取文件夹信息
        const currentFolder = folders.find((f: any) => f.id === folderId)
        
        if (!currentFolder) {
          console.error('找不到文件夹:', folderId)
          toast.error(t('folderNotFound'))
          router.push('/dashboard/streamppt')
          return
        }
        
        setFolder(currentFolder)
        
        try {
          console.log('获取幻灯片, folderId =', folderId)
          const response = await apiClient.get("/html-ppt/listHtml", {
            params: { folderId }
          })
          
          // 检查请求是否仍然有效
          if (requestStatusRef.current.requestId !== currentRequestId) return
          
          console.log('幻灯片API响应:', response.status)
          
          const slidesData = response.data?.html || []
          setSlides(slidesData)
          
          console.log('幻灯片加载完成, 数量:', slidesData.length)
        } catch (apiError) {
          console.error('API错误:', apiError)
          toast.error(t('slideFetchError'))
          setSlides([])
        }
      } catch (error) {
        console.error('加载数据错误:', error)
        toast.error(t('generalError'))
      } finally {
        // 仅当这是最新请求时才更新状态
        if (requestStatusRef.current.requestId === currentRequestId) {
          requestStatusRef.current.isLoading = false
          requestStatusRef.current.hasInitialLoad = true
          setIsLoading(false)
        }
      }
    }
    
    loadData()
  }, [folderId, hasHydrated, folders, fetchFolders, router, t])
  
  // 修改AI操作处理函数，使用useChat的append方法
  const handleAIAction = useCallback(async (selectedText: string, language: string, style: string, generateType: string) => {
    let ok = false
    if (style !== currentStyle.current) {
      currentStyle.current = style
      ok = true
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
          previousHtml: ok ? htmlContent : '' // 添加所有的HTML内容
        })
      })
    } catch (error) {
      console.error("Error generating HTML content:", error)
    }
  }, [append, slides, htmlContent])
  
  // 生成特殊幻灯片
  const generateSlide = async (slideType: SpecialSlideType) => {
    if (isChatLoading) {
      toast.error(t('alreadyGenerating'))
      return
    }
    
    setSelectedType(slideType)
    
    try {
      // 准备发送给AI的数据
      const slideTitles = slides.map(slide => slide.title || 'Untitled Slide').filter(Boolean)
      const folderName = folder?.name || 'presentation'
      
      // 根据不同的幻灯片类型设计不同的text内容
      let textContent: any = {
        slideType,
        slideTitles,
        folderName
      }
      const preContent = slides.map((slide: any) => slide.content).join('\n')
      // 为不同类型的幻灯片添加特定的指导内容
      if (slideType === 'cover') {
        textContent = {
          ...textContent,
          instructions: `创建一个专业的封面页，突出显示"${folderName}"作为主标题。分析${slideTitles.length}个幻灯片标题，提取核心主题作为副标题。添加presenter姓名和日期占位符。使用符合主题的渐变背景或简单形状作为视觉元素。整体设计应清晰、现代且专业。`,
          designFocus: "典雅、专业、醒目"
        }
      } else if (slideType === 'contents') {
        textContent = {
          ...textContent,
          instructions: `为"${folderName}"创建一个清晰的目录页。列出所有${slideTitles.length}个幻灯片标题，使用编号和视觉引导元素增强可读性。如果能从标题中分析出相关主题，将它们分组展示。使用排版、间距和对比度创建清晰的层次结构。`,
          designFocus: "结构化、有序、清晰"
        }
      } else if (slideType === 'acknowledgments') {
        textContent = {
          ...textContent,
          instructions: `为"${folderName}"创建一个优雅的致谢页。包含对听众的感谢、对合作者的感谢以及对演讲机会的感谢。将"谢谢"作为视觉焦点。添加演讲者姓名、联系方式等占位符。可选择添加与演示主题相符的引言或结束语。`,
          designFocus: "诚挚、简洁、优雅"
        }
      }
      
      // 使用 useChat 的 append 方法发送消息
      await append({
        role: 'user',
        content: JSON.stringify({
          text: JSON.stringify(textContent),
          language: 'auto', // 可以根据locale自动选择
          style: 'professional',
          generateType: 'PPT',
          previousHtml: preContent
        })
      })
    } catch (error) {
      console.error(`Error generating ${slideType} page:`, error)
      toast.error(t('slideGenerationError', { 
        slideType: t(slideType + 'PageName')
      }))
    }
  }
  
  // 保存生成的幻灯片
  const saveSlide = async () => {
    if (!htmlContent || !folder || !selectedType) return
    
    try {
      // 生成幻灯片标题
      let slideTitle = ''
      if (selectedType === 'cover') {
        slideTitle = t('coverPageName')
      } else if (selectedType === 'contents') {
        slideTitle = t('contentsPageName')
      } else {
        slideTitle = t('acknowledgementsPageName')
      }
      
      // 创建新的幻灯片对象
      const newSlide = {
        title: slideTitle,
        content: htmlContent,
        folder_id: folderId
      }
      
      // 发送请求保存幻灯片
      const response = await apiClient.post("/html-ppt/createHtml", newSlide)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save slide')
      }
      
      toast.success(t('slideSaved'))
      
      // 返回幻灯片列表页面
      router.push(`/dashboard/streamppt?folderId=${folderId}`)
    } catch (error) {
      console.error('Error saving slide:', error)
      toast.error(t('slideSaveError', { 
        error: error instanceof Error ? error.message : String(error)
      }))
    }
  }
  
  // 返回按钮处理函数
  const handleBack = () => {
    router.push(`/dashboard/streamppt?folderId=${folderId}`)
  }
  
  const handleEditModeChange = useCallback((editMode: boolean) => {
    setIsEditMode(editMode)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-base-100 dark:bg-gray-950">
        <div className="flex items-center">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToSlides')}
          </Button>
          <h1 className="text-lg font-medium">
            {t('specialSlidesGenerator')}
            {folder && ` - ${folder.name}`}
          </h1>
        </div>
        
        {htmlContent && (
          <Button
            className="bg-green-600 hover:bg-green-700 transition-colors" 
            onClick={saveSlide}
          >
            {t('saveSlide')}
          </Button>
        )}
      </header>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 p-6 overflow-hidden">
        {/* 左侧：特殊幻灯片生成按钮 */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-gray-900">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold">{t('selectSlideType')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t('slideTypeDescription')}
              </p>
            </div>
            
            <div className="p-4 flex flex-col gap-3">
              <button
                onClick={() => generateSlide('cover')}
                disabled={isChatLoading}
                className="relative flex items-center p-4 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Home className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">
                    {t('generateCoverPage')}
                  </h3>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                    {t('coverPageDescription')}
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => generateSlide('contents')}
                disabled={isChatLoading}
                className="relative flex items-center p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-indigo-700 dark:text-indigo-300">
                    {t('generateContents')}
                  </h3>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">
                    {t('contentsPageDescription')}
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => generateSlide('acknowledgments')}
                disabled={isChatLoading}
                className="relative flex items-center p-4 rounded-lg border border-purple-100 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-purple-700 dark:text-purple-300">
                    {t('generateAcknowledgments')}
                  </h3>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                    {t('acknowledgementsPageDescription')}
                  </p>
                </div>
              </button>
            </div>
          </div>
          {outlineContent && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-neutral-200 dark:border-neutral-800 overflow-auto max-h-[30%]" ref={outlineContainerRef}>
                  <h3 className="text-sm font-medium mb-2">大纲</h3>
                  <div className="markdown-outline prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {outlineContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
        </div>
        
        {/* 右侧：预览区域 */}
        <div className="h-full border border-neutral-200 rounded-xl shadow-sm bg-base-100 dark:bg-gray-950 dark:border-neutral-800 overflow-hidden">
          <ArticleEditor
            initialContent=""
            onSave={() => {}}
            onAIAction={handleAIAction}
            isGenerating={isChatLoading}
            htmlContent={htmlContent}
            slideData={slideData}
            folderName={folderId || ''}
            onEditModeChange={handleEditModeChange}
            stopGeneration={stop}
            activeTabPropforEditOrPreview="preview"
            activePreviewTabProp={activePreviewTab}
            onActivePreviewTabChange={(tab) => {
              setActivePreviewTab(tab);
            }}
          />
        </div>
      </div>
    </div>
  )
} 