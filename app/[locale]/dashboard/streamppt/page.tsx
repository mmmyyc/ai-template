"use client"

import { useState, useEffect } from "react"
import { PresentationLayout } from "./components/presentation-layout"
import { SlideViewer } from "./components/slide-viewer"
import { LoadingOverlay } from "./components/loading-overlay"
import { defaultSlides } from "./lib/default-slides"
import type { Slide } from "./types/slide"
import { SlideInjector } from "./components/slide-injector"
import apiClient from "@/libs/api"
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from "next/navigation"
import { FolderManager } from "./components/folder-manager"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [slideHtml, setSlideHtml] = useState<string[]>([])
  const [isPresenting, setIsPresenting] = useState(false)
  
  const searchParams = useSearchParams()
  const folderId = searchParams.get('folderId')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  
  const router = useRouter()
  const [hasHydrated, setHasHydrated] = useState(false)
  const t = useTranslations('StreamPpt')

  useEffect(() => {
    setHasHydrated(true)
    if (folderId) {
      setSelectedFolderId(folderId)
      setIsPresenting(false)
    } else {
      setSelectedFolderId(null)
    }
  }, [folderId])

  useEffect(() => {
    if (!hasHydrated) return

    if (!selectedFolderId) {
      console.log("没有选择文件夹，不加载任何幻灯片");
      setSlides([])
      setSlideHtml([])
      setLoading(false)
      return
    }

    const fetchSlides = async () => {
      console.log(`获取文件夹ID的幻灯片: ${selectedFolderId}`);
      setLoading(true)
      try {
        console.log('发送API请求参数:', { folderId: selectedFolderId });
        
        const response = await apiClient.get("/html-ppt/listHtml", {
          params: {
            folderId: selectedFolderId
          }
        })

        console.log('API响应结果:', response.data);
        console.log('响应状态:', response.status);
        
        const slidesData = response.data?.html || [];
        console.log('解析后的幻灯片数据:', slidesData);
        
        if (slidesData && slidesData.length > 0) {
          console.log("幻灯片获取成功:", slidesData.length);
          setSlides(slidesData)
          setSlideHtml(slidesData.map((slide: Slide) => slide.content || ''))
        } else {
          console.log("文件夹中没有找到幻灯片，使用默认幻灯片");
          console.log("响应数据:", response.data);
          setSlides(defaultSlides)
          setSlideHtml(defaultSlides.map((slide) => slide.content || ''))
        }
      } catch (error) {
        console.error("获取幻灯片时出错:", error)
        setSlides(defaultSlides)
        setSlideHtml(defaultSlides.map((slide) => slide.content || ''))
      } finally {
        setLoading(false)
        setCurrentSlideIndex(0)
      }
    }

    fetchSlides()
  }, [selectedFolderId, hasHydrated])

  useEffect(() => {
    if (!hasHydrated) return

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [hasHydrated]);

  const handleStartPresentation = () => {
    setIsPresenting(true)
  }

  const handleExitPresentation = () => {
    setIsPresenting(false)
  }

  const handleSelectFolder = () => {
    setSelectedFolderId(null)
    setIsPresenting(false)
    router.replace('/dashboard/streamppt')
  }

  const handlePresentFolder = async (folderId: string) => {
    try {
      setLoading(true);
      setSelectedFolderId(folderId);
      router.push(`/dashboard/streamppt?folderId=${folderId}`, { scroll: false });
      
      // API call is already handled by the useEffect that watches selectedFolderId
      // After slides are loaded, start presentation mode
      setTimeout(() => {
        setIsPresenting(true);
        setCurrentSlideIndex(0);
      }, 1000); // Give time for slides to load
    } catch (error) {
      console.error("启动演示模式失败", error);
    } finally {
      setLoading(false);
    }
  }

  if (!hasHydrated) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>
  }

  if (hasHydrated && !selectedFolderId) {
    return (
      <div className="container mx-auto py-8 px-4">        
        <FolderManager onPresentFolder={handlePresentFolder} />
        
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-semibold mb-2">提示</h3>
          <p className="text-muted-foreground">
            选择一个文件夹查看其中的幻灯片。您也可以创建新的文件夹来组织您的演示文稿。
            <br />
            <strong className="text-blue-600">注意:</strong> 默认情况下，FolderManager会导航到生成页面，如需返回此页面，请使用上方的"返回仪表盘"按钮。
          </p>
        </div>
      </div>
    );
  }

  const handleSlideUpload = (newSlides: Slide[]) => {
    setSlides((prevSlides) => [...prevSlides, ...newSlides])
    const newIndex = slides.length
    if (newIndex < slides.length + newSlides.length) {
      setCurrentSlideIndex(newIndex)
    }
    setSlideHtml((prev) => [...prev, ...newSlides.map((slide) => slide.content || '')])
  }

  const handleSlideChange = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index)
    }
  }

  const handleSlidesReorder = (reorderedSlides: Slide[]) => {
    setSlides(reorderedSlides)
    setSlideHtml(reorderedSlides.map((slide) => slide.content || ''))
  }

  const handleSlideDelete = (slideId: string) => {
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    if (slideIndex === -1) return;
    
    const updatedSlides = slides.filter(slide => slide.id !== slideId);
    
    setSlides(updatedSlides);
    
    setSlideHtml(updatedSlides.map(slide => slide.content || ''));
    
    if (updatedSlides.length === 0) {
      setCurrentSlideIndex(0);
    }
    else if (slideIndex === currentSlideIndex) {
      if (slideIndex >= updatedSlides.length) {
        setCurrentSlideIndex(updatedSlides.length - 1);
      }
    }
    else if (slideIndex < currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }

  const handleFolderSelected = (folderId: string) => {
    setSelectedFolderId(folderId)
    router.push(`/dashboard/streamppt?folderId=${folderId}`, { scroll: false })
  }

  const startPresentation = () => {
    setIsPresenting(true)
  }

  return (
    <main className="min-h-screen h-screen max-h-screen bg-background overflow-hidden">
      <LoadingOverlay isLoading={loading} />
      
      {/* 未选择文件夹时显示文件夹管理器 */}
      {!selectedFolderId && (
        <div className="container mx-auto py-8 px-4">        
          <FolderManager onPresentFolder={handlePresentFolder} />
          
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold mb-2">提示</h3>
            <p className="text-muted-foreground">
              选择一个文件夹查看其中的幻灯片。您也可以创建新的文件夹来组织您的演示文稿。
            </p>
          </div>
        </div>
      )}
      
      {/* 选择文件夹后显示幻灯片内容 */}
      {selectedFolderId && !isPresenting && (
        <div className="flex flex-col h-full">
          {/* 顶部导航栏 */}
          <div className="h-14 border-b flex items-center px-4 justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSelectFolder}
                className="text-primary mr-4"
              >
                &larr; 返回文件夹选择
              </Button>
              <h2 className="text-lg font-medium">PPT演示</h2>
            </div>
            {slides.length > 0 && (
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90" 
                onClick={startPresentation}
              >
                开始演示
              </Button>
            )}
          </div>
          
          {/* 集成幻灯片管理和查看 */}
          <div className="flex-1 overflow-y-auto p-6">
            <FolderManager 
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSlideChange={handleSlideChange}
              onSlideUpload={handleSlideUpload}
              onSlidesReorder={handleSlidesReorder}
              onSlideDelete={handleSlideDelete}
              onSelectFolder={handleFolderSelected}
              onPresentFolder={handlePresentFolder}
            />
          </div>
        </div>
      )}
      
      {/* 演示模式 - 全屏显示幻灯片 */}
      {selectedFolderId && isPresenting && (
        <div className="flex flex-col h-full">
          {/* 演示模式顶部导航栏 */}
          <div className="h-14 border-b flex items-center px-4 justify-between bg-primary text-primary-foreground">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExitPresentation}
                className="text-primary-foreground mr-4 hover:bg-primary/90"
              >
                &larr; 退出演示
              </Button>
              <h2 className="text-lg font-medium">演示模式</h2>
            </div>
            <div className="text-sm">
              幻灯片 {currentSlideIndex + 1}/{slides.length}
            </div>
          </div>
          
          {/* 演示区域 - 全屏幻灯片查看 */}
          <div className="flex-1 relative overflow-hidden">
            <SlideViewer 
              slides={slides} 
              currentSlideIndex={currentSlideIndex} 
              onSlideChange={handleSlideChange} 
            />
          </div>
        </div>
      )}
      
      {selectedFolderId && <SlideInjector slides={slideHtml} />}
    </main>
  )
}

