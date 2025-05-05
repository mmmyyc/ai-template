"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Slide } from "../types/slide"
import { cn } from "@/lib/utils"
import React from "react"
// 定义过渡动画类型
type TransitionType =
  | 'slide-horizontal'
  | 'slide-vertical'
  | 'fade'
  | 'zoom'
  | 'rotate'
  | 'flip'
  | 'cube'

interface SlideViewerProps {
  slides: Slide[]
  currentSlideIndex: number
  onSlideChange: (index: number) => void
}

type FrameState = {
  key: string;
  src: string | null;
  html: string | null;
  title: string;
  isLoaded: boolean;
  isActive: boolean;
  slideIndex: number;
  ref: React.RefObject<HTMLIFrameElement | null>;
  className?: string;
  style?: React.CSSProperties;
};

// 添加一个处理HTML内容的函数，提取第一个div并全屏显示
const processHtmlContent = (html: string): string => {
  if (!html) return '';

  try {
    // 创建一个临时DOM解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 查找body中的第一个div
    const firstDiv = doc.body.querySelector('div');
    
    if (!firstDiv) {
      console.warn('处理HTML时未找到body中的第一个div');
      return html; // 如果没找到，返回原始HTML
    }
    
    // 提取第一个div的内容，保持它的完整HTML结构
    const divContent = firstDiv.outerHTML;
    
    // 保留原始head内容
    const headContent = doc.head.innerHTML;
    
    // 保留所有的scripts，包括内联和外部脚本
    const scripts = Array.from(doc.querySelectorAll('script'));
    let scriptContent = '';
    scripts.forEach(script => {
      // 复制script标签到新HTML
      scriptContent += script.outerHTML;
    });
    
    // 提取body的所有属性
    const bodyAttributes = Array.from(doc.body.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(' ');
    
    // 创建新的HTML，添加缩放容器，并将body的属性应用到缩放容器
    return `
      <!DOCTYPE html>
      <html>
      <head>
        ${headContent}
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          /* 外部缩放容器 - 不影响原始div的任何样式 */
          .zoom-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            transform-origin: center;
            /* 初始比例为1，将由JS计算精确值 */
            transform: scale(1);
          }
          
          /* 不再使用媒体查询中的经验值，全部由JS精确计算 */
        </style>
        <script>
          // 页面加载完成后精确计算缩放比例
          document.addEventListener('DOMContentLoaded', function() {
            // 等待字体和其他资源加载完成
            setTimeout(calculateAndApplyScale, 50);
            
            // 当窗口大小改变时重新计算
            window.addEventListener('resize', function() {
              calculateAndApplyScale();
            });
          });
          
          // 精确计算缩放比例的函数
          function calculateAndApplyScale() {
            const container = document.querySelector('.zoom-container');
            if (!container || !container.firstElementChild) return;
            
            const originalContent = container.firstElementChild;
            
            // 首先重置容器缩放，以获取内容的真实尺寸
            container.style.transform = 'scale(1)';
            
            // 获取内容的精确尺寸（等待一帧以确保正确测量）
            requestAnimationFrame(function() {
              // 获取原始div的自然尺寸
              const contentWidth = originalContent.getBoundingClientRect().width;
              const contentHeight = originalContent.getBoundingClientRect().height;
              
              // 如果尺寸无效，则不进行操作
              if (contentWidth <= 10 || contentHeight <= 10) return;
              
              // 获取视口尺寸
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              
              // 不再使用边距，直接使用完整视口尺寸
              // 计算精确的缩放比例
              const scaleX = viewportWidth / contentWidth;
              const scaleY = viewportHeight / contentHeight;
              
              // 使用较小的值确保内容完全在视口内
              let scale = Math.min(scaleX, scaleY);
              
              // 限制缩放范围，避免过度缩放或过度放大
              scale = Math.max(0.1, Math.min(scale, 2.0));
              
              // 将精确计算的缩放值应用到容器（保留4位小数）
              scale = Math.round(scale * 10000) / 10000; // 精确到万分位
              container.style.transform = 'scale(' + scale + ')';
              
              // 输出计算过程，方便调试
              console.log('Content size:', contentWidth, 'x', contentHeight);
              console.log('Viewport size:', viewportWidth, 'x', viewportHeight);
              console.log('Scale factors - X:', scaleX, 'Y:', scaleY);
              console.log('Applied scale:', scale);
            });
          }
        </script>
      </head>
      <body ${bodyAttributes}>
        <!-- 只用一个外部容器包裹原始div，不修改原始div的结构，同时应用body的属性 -->
        <div class="zoom-container" >
          ${divContent}
        </div>
        <!-- 保留页面上的所有脚本 -->
        ${scriptContent}
      </body>
      </html>
    `;
  } catch (error) {
    console.error('处理HTML内容时出错:', error);
    return html; // 出错时返回原始HTML
  }
};

export function SlideViewer({ slides, currentSlideIndex, onSlideChange }: SlideViewerProps) {
  const iframeRefA = useRef<HTMLIFrameElement>(null);
  const iframeRefB = useRef<HTMLIFrameElement>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('fade'); // 初始使用淡入淡出
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev'>('next');
  const slideCache = useRef<Map<string, boolean>>(new Map()); // Keep cache for loaded check
  const prevSlideIndexRef = useRef<number>(currentSlideIndex); // Ref to track previous index for direction
  const [initialized, setInitialized] = useState(true); // 默认已初始化
  const [initialLoading, setInitialLoading] = useState(false); // 默认不显示加载状态
  const [isFirstLoad, setIsFirstLoad] = useState(false); // 默认不是首次加载

  // 过渡时间设置（毫秒）- 不再需要特殊处理初始加载
  const transitionDuration = 800;

  const [frameA, setFrameA] = useState<FrameState>({
    key: `frame-a-${slides[currentSlideIndex]?.id || 'initial'}`,
    src: null, // No longer using path directly
    html: slides[currentSlideIndex]?.content || null,
    title: slides[currentSlideIndex]?.title || 'Frame A',
    isLoaded: true, // 直接标记为已加载
    isActive: true,
    slideIndex: currentSlideIndex,
    ref: iframeRefA,
    className: 'opacity-100', // 确保立即可见
    style: { backgroundColor: 'white' },
  });

  const [frameB, setFrameB] = useState<FrameState>({
    key: `frame-b-initial`,
    src: null, // Start empty
    html: null, // Start with no HTML content
    title: 'Frame B',
    isLoaded: false,
    isActive: false, // Start with Frame B inactive
    slideIndex: -1, // Indicates no slide initially
    ref: iframeRefB,
    className: '',
    style: { opacity: 0 }, // 默认不可见
  });

  // 随机选择过渡动画
  const selectRandomTransition = useCallback((): TransitionType => {
    const transitions: TransitionType[] = [
      'slide-horizontal', 'slide-vertical', 'fade', 'zoom', 'rotate', 'flip', 'cube'
    ];
    return transitions[Math.floor(Math.random() * transitions.length)];
  }, []);

  // 强制重新缩放
  const forceRescale = useCallback((iframeElement: HTMLIFrameElement | null) => {
    if (iframeElement?.contentWindow) {
      iframeElement.contentWindow.postMessage({ type: 'force-scale' }, '*');
    }
  }, []);

  // 应用样式
  const applyIframeStyles = useCallback((iframeElement: HTMLIFrameElement | null) => {
    if (!iframeElement?.contentDocument) return;
    const doc = iframeElement.contentDocument;
    if (doc.getElementById('ppt-viewer-styles')) return;

    const style = doc.createElement('style');
    style.id = 'ppt-viewer-styles';
    style.textContent = `
      body { overflow: hidden !important; margin: 0; padding: 0; height: 100vh; width: 100vw; }
      .slide-content { overflow: hidden !important; }
      ::-webkit-scrollbar { display: none !important; }
      * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    `;
    requestAnimationFrame(() => {
      doc.head?.appendChild(style);
    });
  }, []);

  // 发送视口尺寸
  const sendViewportSizeToIframe = useCallback((iframeElement: HTMLIFrameElement | null) => {
    if (iframeElement?.contentWindow) {
      const message = {
        type: "resize",
        width: window.innerWidth,
        height: window.innerHeight,
      };
      iframeElement.contentWindow.postMessage(message, "*");
    }
  }, []);

  // 触发PPT内部动画
  const triggerPptAnimation = useCallback((iframeElement: HTMLIFrameElement | null) => {
    setTimeout(() => {
      if (iframeElement?.contentWindow) {
        console.log(`Triggering PPT animation for frame:`, iframeElement);
        iframeElement.contentWindow.postMessage({ type: 'ppt-animation-start' }, '*');
      }
    }, 100); // Short delay
  }, []);

  // 处理 iframe 加载完成
  const handleIframeLoad = useCallback((frameId: 'A' | 'B') => {
    console.log(`Frame ${frameId} loaded`);
    const frameSetter = frameId === 'A' ? setFrameA : setFrameB;
    const frameRef = frameId === 'A' ? iframeRefA : iframeRefB;

    frameSetter(prev => {
      if (!prev.src || !frameRef.current) {
        console.warn(`Frame ${frameId} ref not ready or no src.`);
        return { ...prev, isLoaded: false };
      }

      // 标记已加载
      slideCache.current.set(prev.src, true);

      try {
        // Pass the actual element after checking it exists
        applyIframeStyles(frameRef.current);
        sendViewportSizeToIframe(frameRef.current);
        const rescaleTimes = [50, 150, 300];
        rescaleTimes.forEach(delay => {
          setTimeout(() => forceRescale(frameRef.current), delay);
        });
      } catch (e) {
        console.error(`Could not modify Frame ${frameId} content:`, e);
      }

      // Only trigger PPT animation if this frame is active and we are not transitioning
      if (!transitioning && prev.isActive) {
        triggerPptAnimation(frameRef.current);
      }

      return { ...prev, isLoaded: true };
    });
  }, [transitioning, applyIframeStyles, sendViewportSizeToIframe, forceRescale, triggerPptAnimation]);

  // 核心切换逻辑
  useEffect(() => {
    // 如果是首次加载，跳过切换逻辑
    if (isFirstLoad) {
      return;
    }

    const targetSlide = slides[currentSlideIndex];
    if (!targetSlide) return; // No slides to display

    // Determine which frame is currently active and which is inactive
    const activeFrame = frameA.isActive ? frameA : frameB;
    const inactiveFrame = frameA.isActive ? frameB : frameA;
    const activeFrameSetter = frameA.isActive ? setFrameA : setFrameB;
    const inactiveFrameSetter = frameA.isActive ? setFrameB : setFrameA;
    const inactiveFrameId = frameA.isActive ? 'B' : 'A';

    // Skip if target slide is already in the active frame
    if (activeFrame.slideIndex === currentSlideIndex) {
        console.log("Target slide already active, skipping transition.");
        prevSlideIndexRef.current = currentSlideIndex; // Update previous index nonetheless
        return;
    }

    // Determine direction based on previous index
    const direction: 'next' | 'prev' = currentSlideIndex > prevSlideIndexRef.current ? 'next' : 'prev';
    setTransitionDirection(direction);

    // Check if the target slide is already loaded in the inactive frame
     if (inactiveFrame.slideIndex !== currentSlideIndex) {
        console.log(`Loading target slide ${currentSlideIndex + 1} into inactive frame ${inactiveFrameId}.`);
        // Load the target slide into the inactive frame
        inactiveFrameSetter(prev => ({
            ...prev,
            key: `frame-${inactiveFrameId}-${targetSlide.id}-${Date.now()}`, // Add timestamp for uniqueness
            src: null, // No longer using path directly
            html: targetSlide.content || null,
            title: targetSlide.title || `Frame ${inactiveFrameId}`,
            isLoaded: slideCache.current.has(targetSlide.id), // Use ID for cache instead of path
            slideIndex: currentSlideIndex,
            isActive: false,
            className: '',
            style: { opacity: 0 }, // Initially hidden
        }));
     } else {
         console.log("Target slide already in inactive frame, initiating transition.");
         // Ensure the slideIndex is correct even if reusing the frame
         if (inactiveFrame.slideIndex !== currentSlideIndex) {
             inactiveFrameSetter(prev => ({ ...prev, slideIndex: currentSlideIndex }));
         }
     }

    // Start the transition
    setTransitioning(true);
    const newTransitionType = selectRandomTransition();
    setTransitionType(newTransitionType);

    // Apply transition classes after a frame
    requestAnimationFrame(() => {
      // Ensure the state update for src loading has rendered before applying classes
      requestAnimationFrame(() => {
          const { enterClass, exitClass, initialEnterClass } = getTransitionClasses(newTransitionType, direction);

          // Set initial state for entering frame (before animation starts)
          inactiveFrameSetter(prev => ({
              ...prev,
              className: `${initialEnterClass}`,
              style: { ...prev.style, opacity: 1 } // Make it opaque for transition
          }));

          // Apply target state classes in the next frame to trigger transition
          requestAnimationFrame(() => {
              // Active frame transitions out
              activeFrameSetter(prev => ({
                  ...prev,
                  className: `${exitClass} transition-all ease-in-out gpu-accelerated`,
                  style: { transitionDuration: `${transitionDuration}ms`, zIndex: 10 }
              }));
              // Inactive frame transitions in
              inactiveFrameSetter(prev => ({
                  ...prev,
                  className: `${enterClass} transition-all ease-in-out gpu-accelerated`,
                  style: { transitionDuration: `${transitionDuration}ms`, zIndex: 20, opacity: 1 }
              }));
          });
      });
    });

    // After the transition duration
    const timer = setTimeout(() => {
      const newActiveFrame = inactiveFrame; // The one that just transitioned in
      const newActiveFrameRef = inactiveFrame.ref;
      const oldActiveFrameSetter = activeFrameSetter;
      const oldActiveFrameId = activeFrame.ref === iframeRefA ? 'A' : 'B';

      // Reset old active frame state
      oldActiveFrameSetter(prev => ({
        ...prev,
        isActive: false,
        isLoaded: false, // Mark as unloaded as it's going to background
        className: '',
        style: { opacity: 0, zIndex: 0 }, // Hide and move to back
        src: null, // Clear src to free resources if needed, or keep for faster prev navigation
        slideIndex: -1,
      }));

      // Finalize new active frame state
      inactiveFrameSetter(prev => ({ ...prev, isActive: true, className: '', style: {}}));

      setTransitioning(false);
      prevSlideIndexRef.current = currentSlideIndex; // Update previous index ref

      // Trigger PPT animation for the newly active frame if it's loaded
      if (newActiveFrame.isLoaded) {
          triggerPptAnimation(newActiveFrameRef.current);
      } else {
          console.log("New active frame not loaded yet, PPT animation will trigger on load.");
      }

      // Preload logic can be added here if needed (e.g., load index+1 into the now inactive frame)
      // Example: Preload next slide into the now inactive frame (old active one)
      const nextIndexToPreload = (currentSlideIndex + 1) % slides.length;
      const nextSlideToPreload = slides[nextIndexToPreload];
      if (nextIndexToPreload !== currentSlideIndex && nextSlideToPreload) { // Ensure it's a different slide
         console.log(`Preloading next slide: ${nextIndexToPreload + 1}`);
          oldActiveFrameSetter(prev => ({
            ...prev,
            key: `frame-${oldActiveFrameId}-${nextSlideToPreload.id}-preload-${Date.now()}`,
            src: null, // No longer using path
            html: nextSlideToPreload.content || null,
            title: nextSlideToPreload.title || `Frame ${oldActiveFrameId}`,
            isLoaded: slideCache.current.has(nextSlideToPreload.id),
            slideIndex: nextIndexToPreload,
            isActive: false,
            className: '',
            style: { opacity: 0, zIndex: -1 }, // Hide behind current slides
          }));
      }

    }, transitionDuration);

    return () => clearTimeout(timer);

  }, [currentSlideIndex, slides, frameA.isActive, selectRandomTransition, triggerPptAnimation, isFirstLoad]); // Dependencies

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      if (iframeRefA.current) sendViewportSizeToIframe(iframeRefA.current);
      if (iframeRefB.current) sendViewportSizeToIframe(iframeRefB.current);
       setTimeout(() => {
         if (iframeRefA.current) forceRescale(iframeRefA.current);
         if (iframeRefB.current) forceRescale(iframeRefB.current);
       }, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sendViewportSizeToIframe, forceRescale]); // Use the memoized helpers

  // Get transition CSS classes (Revised)
  const getTransitionClasses = (type: TransitionType, direction: 'next' | 'prev'): { enterClass: string, exitClass: string, initialEnterClass: string } => {
      const isNext = direction === 'next';
      // Target state for the element entering
      const enterClass = 'opacity-100 transform translate-x-0 translate-y-0 scale-100 rotate-0 rotateY-0';
      // Target state for the element exiting
      let exitClass = '';
      // Initial state for the element entering (starts from here)
      let initialEnterClass = '';

      switch (type) {
          case 'slide-horizontal':
              exitClass = isNext ? '-translate-x-full opacity-100' : 'translate-x-full opacity-100';
              initialEnterClass = isNext ? 'translate-x-full' : '-translate-x-full';
              break;
          case 'slide-vertical':
              exitClass = isNext ? '-translate-y-full opacity-100' : 'translate-y-full opacity-100';
              initialEnterClass = isNext ? 'translate-y-full' : '-translate-y-full';
              break;
          case 'fade':
              exitClass = 'opacity-0';
              initialEnterClass = 'opacity-0';
              break;
          case 'zoom':
              exitClass = isNext ? 'scale-50 opacity-0' : 'scale-150 opacity-0';
              initialEnterClass = isNext ? 'scale-150 opacity-0' : 'scale-50 opacity-0';
              break;
          case 'rotate':
               exitClass = isNext ? '-rotate-90 scale-75 opacity-0' : 'rotate-90 scale-75 opacity-0';
               initialEnterClass = isNext ? 'rotate-90 scale-75 opacity-0' : '-rotate-90 scale-75 opacity-0';
              break;
           case 'flip':
               exitClass = isNext ? '-rotateY-90 opacity-0' : 'rotateY-90 opacity-0';
               initialEnterClass = isNext ? 'rotateY-90 opacity-0' : '-rotateY-90 opacity-0';
              break;
          case 'cube':
              // For cube, the exiting element needs different transforms based on direction
              exitClass = isNext ? 'translate-x-full rotate-y-90 opacity-100' : '-translate-x-full -rotate-y-90 opacity-100';
              initialEnterClass = isNext ? '-translate-x-full rotate-y-90' : 'translate-x-full -rotate-y-90'; // Starts rotated from the opposite side
              break;
          default:
              exitClass = 'opacity-0';
              initialEnterClass = 'opacity-0';
      }

      return { enterClass: `transform ${enterClass}`, exitClass: `transform ${exitClass}`, initialEnterClass: `transform ${initialEnterClass}` };
  };

  // Navigation handlers
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0 && !transitioning) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1 && !transitioning) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (transitioning) return;
      if (e.key === 'ArrowRight' || e.key === ' ') goToNextSlide();
      else if (e.key === 'ArrowLeft') goToPrevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, transitioning]); // Keep dependencies simple

  // 创建直接使用内容的iframe渲染函数
  const renderDirectContent = useCallback(() => {
    if (!slides.length || !slides[currentSlideIndex]?.content) return null;
    
    // 直接返回iframe，不使用任何transition或动画
    return (
      <iframe
        ref={iframeRefA}
        id={`slide-frame-direct-${currentSlideIndex}`}
        className="w-full h-full border-none bg-white"
        title={slides[currentSlideIndex]?.title || 'Slide'}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        srcDoc={processHtmlContent(slides[currentSlideIndex]?.content || '')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          zIndex: 20
        }}
      />
    );
  }, [slides, currentSlideIndex]);

  // --- Render ---

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-lg text-gray-500">请添加幻灯片开始演示</p>
      </div>
    );
  }

  // 首页幻灯片使用直接渲染模式，跳过所有的动画和过渡效果
  if (currentSlideIndex === 0) {
    return (
      <div className="slide-container w-full h-full relative bg-white overflow-hidden">
        {/* 直接渲染内容，没有任何transition或动画 */}
        {renderDirectContent()}
        
        {/* 导航按钮，保留 */}
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 opacity-70 hover:opacity-100 transition-opacity">
          <Button
            variant="default" size="icon"
            className={cn("h-10 w-10 rounded-full shadow-lg bg-black/50 text-white hover:bg-black/70",
              currentSlideIndex === slides.length - 1 || transitioning ? "opacity-50 cursor-not-allowed" : "")}
            onClick={() => onSlideChange(1)} // 直接跳到第二张
            disabled={slides.length <= 1}
          >
            <ChevronRight className="h-5 w-5" /><span className="sr-only">下一页</span>
          </Button>
        </div>

        {/* 幻灯片计数器 */}
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 text-xs bg-black/30 px-2 py-0.5 rounded-full opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-white">
            {currentSlideIndex + 1}/{slides.length}
          </span>
        </div>
        
        {/* 点击覆盖层以前进到下一页 */}
        <div
          className="absolute inset-0 z-30"
          onClick={(e) => {
            if (slides.length > 1) {
              onSlideChange(1); // 点击直接跳到第二张
            }
          }}
          style={{ cursor: slides.length > 1 ? 'pointer' : 'default' }}
        />
      </div>
    );
  }

  return (
    <div className={cn(
        "slide-container w-full h-full flex items-center justify-center relative bg-white overflow-hidden perspective-1000",
        transitioning && transitionType === 'cube' ? 'transform-style-3d' : ''
    )}>
        {/* Frame A - 确保不透明 */}
        <div
            className={cn(
                "absolute inset-0 bg-white", // 添加白色背景确保可见
                transitioning ? frameA.className : (frameA.isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'),
                "gpu-accelerated"
            )}
            style={{
                ...frameA.style,
                 transitionProperty: transitioning ? 'transform, opacity' : 'none',
                 transitionDuration: transitioning ? `${transitionDuration}ms` : '0ms',
                 zIndex: frameA.isActive ? 20 : (transitioning ? frameA.style?.zIndex ?? 10 : 0),
                 backgroundColor: 'white' // 确保有背景色
            }}
        >
            {frameA.html ? (
                <iframe
                    ref={iframeRefA}
                    id={`slide-frame-${frameA.slideIndex}`}
                    className={`slide-${frameA.slideIndex} w-full h-full border-none bg-white`}
                    title={frameA.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    onLoad={() => handleIframeLoad('A')}
                    srcDoc={processHtmlContent(frameA.html)}
                />
            ) : frameA.src ? (
                <iframe
                    ref={iframeRefA}
                    id={`slide-frame-${frameA.slideIndex}`}
                    className={`slide-${frameA.slideIndex} w-full h-full border-none bg-white`}
                    src={frameA.src}
                    title={frameA.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    onLoad={() => handleIframeLoad('A')}
                />
            ) : null}
        </div>

        {/* Frame B - 同样确保不透明 */}
        <div
             className={cn(
                "absolute inset-0 bg-white", // 添加白色背景确保可见
                transitioning ? frameB.className : (frameB.isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'),
                "gpu-accelerated"
            )}
            style={{
                ...frameB.style,
                 transitionProperty: transitioning ? 'transform, opacity' : 'none',
                 transitionDuration: transitioning ? `${transitionDuration}ms` : '0ms',
                 zIndex: frameB.isActive ? 20 : (transitioning ? frameB.style?.zIndex ?? 10 : 0),
                 backgroundColor: 'white' // 确保有背景色
            }}
        >
             {frameB.html ? (
                <iframe
                    ref={iframeRefB}
                    id={`slide-frame-${frameB.slideIndex}`}
                    className={`slide-${frameB.slideIndex} w-full h-full border-none bg-white`}
                    title={frameB.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    onLoad={() => handleIframeLoad('B')}
                    srcDoc={processHtmlContent(frameB.html)}
                />
            ) : frameB.src ? (
                <iframe
                    ref={iframeRefB}
                    id={`slide-frame-${frameB.slideIndex}`}
                    className={`slide-${frameB.slideIndex} w-full h-full border-none bg-white`}
                    src={frameB.src}
                    title={frameB.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    onLoad={() => handleIframeLoad('B')}
                />
            ) : null}
        </div>

        {/* Click overlay */}
         <div
            className="absolute inset-0 z-30"
            onClick={(e) => {
                 if (!transitioning) goToNextSlide();
            }}
            style={{ cursor: transitioning ? 'default' : 'pointer' }}
        />

        {/* Navigation Buttons (z-index 50) */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 opacity-70 hover:opacity-100 transition-opacity">
            <Button
                variant="default" size="icon"
                className={cn("h-10 w-10 rounded-full shadow-lg bg-black/50 text-white hover:bg-black/70",
                    currentSlideIndex === 0 || transitioning ? "opacity-50 cursor-not-allowed" : "")}
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0 || transitioning}
            >
                <ChevronLeft className="h-5 w-5" /><span className="sr-only">上一页</span>
            </Button>
        </div>
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 opacity-70 hover:opacity-100 transition-opacity">
            <Button
                variant="default" size="icon"
                 className={cn("h-10 w-10 rounded-full shadow-lg bg-black/50 text-white hover:bg-black/70",
                     currentSlideIndex === slides.length - 1 || transitioning ? "opacity-50 cursor-not-allowed" : "")}
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1 || transitioning}
            >
                <ChevronRight className="h-5 w-5" /><span className="sr-only">下一页</span>
            </Button>
        </div>

        {/* 简化后的幻灯片计数器，确保文字颜色正确 */}
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 text-xs bg-black/30 px-2 py-0.5 rounded-full opacity-70 hover:opacity-100 transition-opacity">
            <span className="text-white">
                {currentSlideIndex + 1}/{slides.length}
            </span>
        </div>

        {/* 预渲染隐藏的内容，确保内容立即可见 */}
        {isFirstLoad && slides[0]?.content && (
            <div className="hidden">
                <div dangerouslySetInnerHTML={{ __html: slides[0]?.content || '' }} />
            </div>
        )}
    </div>
  );
}

