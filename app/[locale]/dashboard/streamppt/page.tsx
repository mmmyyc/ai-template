"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { SlideViewer } from "./components/slide-viewer"
import { LoadingOverlay } from "./loading-overlay"
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
  const [slideHtml, setSlideHtml] = useState<string[]>([])
  const [isPresenting, setIsPresenting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFetchingSlides, setIsFetchingSlides] = useState(false)
  const presentationRef = useRef<HTMLDivElement>(null)
  
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
      return
    }

    const fetchSlides = async () => {
      console.log(`获取文件夹ID的幻灯片: ${selectedFolderId}`);
      setIsFetchingSlides(true);
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
        setIsFetchingSlides(false);
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
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (presentationRef.current) {
        presentationRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      // Exit fullscreen
      document.exitFullscreen();
    }
  }
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!hasHydrated) {
    return <div className="flex items-center justify-center min-h-screen">{t('loadingInitial')}</div>
  }

  if (hasHydrated && !selectedFolderId) {
    return (
      <div className="container mx-auto py-8 px-4">        
        <Suspense fallback={<LoadingOverlay isLoading={true} />}>
          <FolderManager onPresentFolder={handlePresentFolder} />
        </Suspense>
        
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-semibold mb-2">{t('tipTitle')}</h3>
          <p className="text-muted-foreground">
            {t('tipSelectFolder')}
            <br />
            <strong className="text-blue-600">{t('tipNavigation')}</strong> 
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
      {/* 未选择文件夹时显示文件夹管理器 */}
      {!selectedFolderId && (
        <div className="container mx-auto py-8 px-4">        
          <Suspense fallback={<LoadingOverlay isLoading={true} />}>
            <FolderManager onPresentFolder={handlePresentFolder} />
          </Suspense>
          
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold mb-2">{t('tipTitle')}</h3>
            <p className="text-muted-foreground">
              {t('tipSelectFolder')}
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
                &larr; {t('backToFolders')}
              </Button>
              <h2 className="text-lg font-medium">{t('title')}</h2>
            </div>
            {slides.length > 0 && (
              <Button 
                 className="bg-blue-500 text-white hover:bg-blue-600" 
                 onClick={startPresentation}
              >
                {t('startPresentation')}
              </Button>
            )}
          </div>
          
          {/* 集成幻灯片管理和查看 */}
          <Suspense fallback={<LoadingOverlay isLoading={true} />}>
             <div className="flex-1 overflow-y-auto p-6 relative"> 
               {isFetchingSlides ? (
                 <LoadingOverlay isLoading={true} />
               ) : (
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
               )}
             </div>
           </Suspense>
        </div>
      )}
      
      {/* 演示模式 - 全屏显示幻灯片 */}
      {selectedFolderId && isPresenting && (
        <div className="flex flex-col h-full" ref={presentationRef}>
          {/* 演示模式顶部导航栏 (仅在非全屏时显示) */}
          {!isFullscreen && (
            <div className="h-14 border-b flex items-center px-4 justify-between bg-white text-gray-800">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleExitPresentation}
                  className="text-gray-800 mr-4 hover:bg-gray-100"
                >
                  &larr; {t('exitPresentation')}
                </Button>
                <h2 className="text-lg font-medium">{t('presentationMode')}</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm mr-2">
                  {t('slideCounter', { current: currentSlideIndex + 1, total: slides.length })}
                </div>
              </div>
            </div>
          )}
          
          {/* 演示区域 - 全屏幻灯片查看 */}
          <div className="flex-1 relative overflow-hidden">
            <SlideViewer 
              slides={slides} 
              currentSlideIndex={currentSlideIndex} 
              onSlideChange={handleSlideChange} 
            />
            
            {/* 悬浮全屏按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="absolute bottom-6 right-6 z-50 bg-white/80 hover:bg-white text-black shadow-lg rounded-full w-12 h-12 flex items-center justify-center"
              title={isFullscreen ? t('exitFullscreen') : t('fullscreenMode')}
            >
              {isFullscreen ? t('exitFullscreen').substring(0,2) : t('fullscreenMode').substring(0,2)} 
            </Button>
          </div>
        </div>
      )}
      
      {selectedFolderId && <SlideInjector slides={slideHtml} />}
    </main>
  )
}

