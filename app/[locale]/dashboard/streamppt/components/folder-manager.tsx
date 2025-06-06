"use client"

import { useState, useEffect } from "react"
import { File, FileText, Folder, ImageIcon, Music, Plus, X, FileUp, Trash2, GripVertical, Video, Play, Edit, ArrowLeft, FileDown, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {useRouter} from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {useFormatter} from 'next-intl';
import { useFolderStore } from "../../store/folderStore"
import { SlideUploader } from "../components/slide-uploader"
import { extractTitleFromHTML } from "../lib/utils"
import type { Slide } from "../types/slide"
import { HtmlPreview } from "@/app/[locale]/dashboard/components/common/html-preview"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import React from "react"
import { toast } from "react-hot-toast"
import { domToPng } from "modern-screenshot"

// 从sidebar.tsx提取的可排序幻灯片组件
interface SortableSlideItemProps {
  slide: Slide
  index: number
  isActive: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent, slideId: string) => void
  onEdit: (e: React.MouseEvent, slide: Slide) => void
}

function SortableSlideItem({ slide, index, isActive, onClick, onDelete, onEdit }: SortableSlideItemProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: slide.id });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Generate preview image from HTML content
  useEffect(() => {
    const generatePreview = async () => {
      try {
        // 创建临时iframe来渲染HTML，与下载PPT中的方法相同
        const tempIframe = document.createElement('iframe');
        tempIframe.style.cssText = 'position:absolute;left:-9999px;width:700px;height:395px;'; // 16:9比例
        document.body.appendChild(tempIframe);
        
        // 设置iframe内容并等待完全加载
        if (tempIframe.contentDocument) {
          tempIframe.contentDocument.open();
          tempIframe.contentDocument.write(slide.content);
          tempIframe.contentDocument.close();
          
          // 等待iframe完全加载并渲染
          await new Promise<void>((resolve) => {
            // 主要加载事件
            const handleLoad = () => {
              tempIframe.removeEventListener('load', handleLoad);
              
              // 确保所有图片都已加载完成
              const imageElements = Array.from(tempIframe.contentDocument?.querySelectorAll('img') || []) as HTMLImageElement[];
              if (imageElements.length === 0) {
                resolve();
                return;
              }
              
              let loadedImages = 0;
              const imageLoaded = () => {
                loadedImages++;
                if (loadedImages === imageElements.length) {
                  resolve();
                }
              };
              
              imageElements.forEach(img => {
                if (img.complete) {
                  imageLoaded();
                } else {
                  img.addEventListener('load', imageLoaded);
                  img.addEventListener('error', imageLoaded);
                }
              });
            };
            
            tempIframe.addEventListener('load', handleLoad);
            
            // 设置超时保护，确保流程不会无限等待
            setTimeout(resolve, 1000);
          });
          
          // 给CSS动画和过渡效果足够时间完成（预览图较小，时间可以短些）
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 获取内容元素
          const contentElement = tempIframe.contentDocument.body.querySelector('div') || tempIframe.contentDocument.body;
          
          // 使用domToPng转换为PNG，确保捕获完整的视觉效果
          const pngDataUrl = await domToPng(contentElement, {
            backgroundColor: getComputedStyle(tempIframe.contentDocument.body).backgroundColor || "#ffffff",
            width: contentElement.scrollWidth,
            height: contentElement.scrollHeight,
            quality: 0.9,
            scale: 1, // 预览图不需要太高清晰度
            debug: false,
            filter: (node) => {
              // 检查是否应该排除某些元素不进行截图
              if (node instanceof HTMLElement && node.classList.contains('no-export')) {
                return false;
              }
              return true;
            }
          });
          
          setPreviewImage(pngDataUrl);
          
          // 清理
          document.body.removeChild(tempIframe);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
        // Set fallback image or placeholder
        setPreviewImage(null);
      }
    };
    
    generatePreview();
  }, [slide.content]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 mb-3 rounded-lg cursor-grab active:cursor-grabbing transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-medium border border-primary/20"
          : "hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100"
      } ${isDragging ? 'border border-primary/30 shadow-lg' : ''}`}
    >
      <div className="flex flex-col">
        {/* Slide Preview */}
        <div 
          className="slide-preview mb-4 rounded-md overflow-hidden border border-gray-200 shadow-sm"
          onClick={(e) => {
            // Prevent click event when dragging
            if (!isDragging) {
              e.stopPropagation();
              onClick();
            }
          }}
        >
          {previewImage ? (
            <div className="aspect-[16/9] bg-gray-50 relative">
              <img 
                src={previewImage} 
                alt={slide.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
              <FileUp className="text-gray-400 h-10 w-10" />
            </div>
          )}
        </div>
        
        {/* Slide Title and Actions */}
        <div className="flex items-center">
          <div 
            className="flex-1 truncate"
            onClick={(e) => {
              if (!isDragging) {
                e.stopPropagation();
                onClick();
              }
            }}
          >
            <div className="text-sm font-medium truncate leading-5">{slide.title}</div>
          </div>
          <button
            onClick={(e) => onEdit(e, slide)}
            className="ml-2 p-1 rounded-full hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
            title="编辑幻灯片"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => onDelete(e, slide.id)}
            className="ml-1 p-1 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
            title="删除幻灯片"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 主组件
export function FolderManager({
  slides = [],
  currentSlideIndex = 0,
  onSlideChange,
  onSlideUpload,
  onSlidesReorder,
  onSlideDelete,
  onSlideUpdate,
  onSelectFolder,
  onPresentFolder
}: {
  slides?: Slide[];
  currentSlideIndex?: number;
  onSlideChange?: (index: number) => void;
  onSlideUpload?: (slides: Slide[]) => void;
  onSlidesReorder?: (newSlides: Slide[]) => void;
  onSlideDelete?: (slideId: string) => void;
  onSlideUpdate?: (slideId: string, content: string) => void;
  onSelectFolder?: (folderId: string) => void;
  onPresentFolder?: (folderId: string) => void;
}) {
  // 添加编辑模式状态
  const [editMode, setEditMode] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  
  // 添加下载状态
  const [isDownloading, setIsDownloading] = useState(false);
  
  // 原有的文件夹store逻辑
  const { 
    folders, 
    selectedFolderId,
    error, 
    isLoading,
    fetchFolders,
    createFolder,
    selectFolder,
    setError
  } = useFolderStore()

  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [activePreviewTab, setActivePreviewTab] = useState<"html" | "ppt">("ppt")
  const router = useRouter()
  const t = useTranslations('StreamPpt')

  // drag-and-drop功能的传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理幻灯片排序完成事件
  const handleDragEnd = (event: DragEndEvent) => {
    if (!onSlidesReorder || !onSlideChange) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((slide) => slide.id === active.id);
      const newIndex = slides.findIndex((slide) => slide.id === over.id);
      
      // 如果幻灯片在移动方向上已经相邻，则不做任何事情
      if (Math.abs(oldIndex - newIndex) === 1 && 
          active.rect.current?.translated && 
          over.rect.top !== undefined &&
          ((oldIndex < newIndex && active.rect.current.translated.top < over.rect.top) ||
           (oldIndex > newIndex && active.rect.current.translated.top > over.rect.top))) {
        return;
      }
      
      const newSlides = arrayMove(slides, oldIndex, newIndex);
      
      // 如果当前显示的幻灯片被移动，直接更新它
      if (oldIndex === currentSlideIndex) {
        onSlideChange(newIndex);
      } else if (
        (oldIndex < currentSlideIndex && newIndex >= currentSlideIndex) ||
        (oldIndex > currentSlideIndex && newIndex <= currentSlideIndex)
      ) {
        // 处理当前幻灯片位置受移动影响的情况
        const newCurrentIndex = oldIndex < currentSlideIndex 
          ? currentSlideIndex - 1 
          : currentSlideIndex + 1;
        onSlideChange(newCurrentIndex);
      }
      
      // 更新幻灯片数组顺序
      onSlidesReorder(newSlides);
    }
  };

  const handleSlideDelete = (e: React.MouseEvent, slideId: string) => {
    if (!onSlideDelete) return;
    e.stopPropagation();
    onSlideDelete(slideId);
  }

  // 处理文件上传
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onSlideUpload) return;

    const newSlides: Slide[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      const title = extractTitleFromHTML(content) || file.name.replace(".html", "");

      newSlides.push({
        id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title,
        content: content,
      });
    }

    onSlideUpload(newSlides);
  };

  const handleSelectFolder = (id: string) => {
    const newSelectedId = id === selectedFolderId ? null : id
    selectFolder(newSelectedId)
    
    if (newSelectedId) {
      const folder = folders.find((folder: any) => folder.id === id)
      if (folder) {
        router.push(`/dashboard/streamppt?folderId=${folder.id}`)
      }
    }
  }

  const handleCreateFolder = () => {
    createFolder(newFolderName)
      .then(() => {
        setIsCreating(false)
        setNewFolderName("")
      })
  }
  
  // Fetch folders on component mount
  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])
  
  const format = useFormatter();
  const formatDate = (date: string) => {    
    return format.dateTime(new Date(date), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }


  const selectedFolder = folders.find((folder: any) => folder.id === selectedFolderId)

  // 处理编辑幻灯片
  const handleEditSlide = (e: React.MouseEvent, slide: Slide) => {
    e.stopPropagation();
    setEditingSlide(slide);
    setEditMode(true);
  };

  // 处理编辑模式变化
  const handleEditModeChange = (isEditMode: boolean) => {
    setEditMode(isEditMode);
    if (!isEditMode) {
      setEditingSlide(null);
    }
  };

  // 处理HTML内容变更
  const handleContentChange = (slideId: string, newContent: string, title: string) => {
    // 更新本地状态
    if (editingSlide && editingSlide.id === slideId) {
      setEditingSlide({
        ...editingSlide,
        content: newContent,
        title: title,
      }); 
    }
    
    // 更新全局slide列表
    if (onSlideUpdate) {
      onSlideUpdate(slideId, newContent);
    }
  };

  // 如果在编辑模式，显示HtmlPreview
  if (editMode && editingSlide) {
    return (
      <div className="fixed inset-0 z-[40] w-full h-full bg-white">
        <div className="absolute top-2 left-4 z-[1001]">
          <Button
            onClick={() => handleEditModeChange(false)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToSlides')}
          </Button>
        </div>
        <HtmlPreview 
          htmlContent={editingSlide.content} 
          folderName={selectedFolder?.name || ''} 
          onEditModeChange={handleEditModeChange}
          actionType="edit"
          htmlId={editingSlide.id}
          defaultHtmlTitle={editingSlide.title}
          onContentChange={handleContentChange}
          activePreviewTabProp={activePreviewTab}
          onActivePreviewTabChange={(tab) => {
            setActivePreviewTab(tab);
          }}
        />
      </div>
    );
  }

  // 下载PPT函数 - 优化版本
  const handleDownloadPpt = async () => {
    if (slides.length === 0) {
      toast.error(t('noSlidesToDownload', { defaultValue: 'No slides to download' }));
      return;
    }

    setIsDownloading(true);
    const processingMessage = toast.loading(t('preparingPpt', { defaultValue: 'Preparing your PPT...' }));

    try {
      const folderName = selectedFolder?.name || 'presentation';
      
      // 使用优化的HTML转PPT处理流程
      const processedSlides = await processHtmlSlides(slides, processingMessage);
      
      // 调用后端API生成PPT
      const response = await fetch('/api/ppt/generate-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: processedSlides,
          folderName,
          options: {
            format: 'pptx',
            quality: 'high',
            preserveAnimations: true,
            optimizeImages: true
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PPT生成失败');
      }
      
      // 下载生成的PPT文件
      await downloadPptFile(response, folderName);
      
      toast.success(t('pptDownloaded', { defaultValue: 'PPT downloaded successfully!' }), { id: processingMessage });
    } catch (error) {
      console.error('Error generating PPT:', error);
      toast.error(
        t('pptGenerationError', { 
          defaultValue: 'Error generating PPT',
          error: error instanceof Error ? error.message : String(error)
        }), 
        { id: processingMessage }
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // 优化的HTML幻灯片处理函数
  const processHtmlSlides = async (slides: Slide[], processingMessage: string) => {
    const processedSlides = [];
    
    for (let i = 0; i < slides.length; i++) {
      try {
        const slide = slides[i];
        
        // 更新处理状态
        toast.loading(`${t('processingSlide', { defaultValue: 'Processing slide' })} ${i+1}/${slides.length}...`, { id: processingMessage });
        
        // 解析HTML内容
        const parsedContent = await parseHtmlContent(slide.content);
        
        // 生成高质量预览图
        const previewImage = await generateSlidePreview(slide.content);
        
        processedSlides.push({
          ...slide,
          parsedContent,
          previewImage,
          metadata: {
            width: 1920,
            height: 1080,
            aspectRatio: '16:9'
          }
        });
        
      } catch (error) {
        console.error(`处理幻灯片 ${i+1} 时出错:`, error);
        // 如果处理失败，使用原始内容
        processedSlides.push(slides[i]);
      }
    }
    
    return processedSlides;
  };

  // HTML内容解析函数
  const parseHtmlContent = async (htmlContent: string): Promise<any> => {
    return new Promise((resolve) => {
      // 创建临时DOM解析HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // 提取结构化内容
      const parsedContent = {
        title: extractTitle(doc),
        textElements: extractTextElements(doc),
        images: extractImages(doc),
        styles: extractStyles(doc),
        layout: analyzeLayout(doc)
      };
      
      resolve(parsedContent);
    });
  };

  // 提取标题
  const extractTitle = (doc: Document): string => {
    const titleElement = doc.querySelector('h1, h2, .title, [data-title]');
    return titleElement?.textContent?.trim() || '';
  };

  // 提取文本元素
  const extractTextElements = (doc: Document) => {
    const textElements: any[] = [];
    const elements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    
    elements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        const computedStyle = window.getComputedStyle(element);
        textElements.push({
          id: `text-${index}`,
          content: text,
          tag: element.tagName.toLowerCase(),
          styles: {
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            color: computedStyle.color,
            fontWeight: computedStyle.fontWeight,
            textAlign: computedStyle.textAlign,
            lineHeight: computedStyle.lineHeight
          },
          position: getElementPosition(element)
        });
      }
    });
    
    return textElements;
  };

  // 提取图片
  const extractImages = (doc: Document) => {
    const images: any[] = [];
    const imgElements = doc.querySelectorAll('img');
    
    imgElements.forEach((img, index) => {
      images.push({
        id: `image-${index}`,
        src: img.src,
        alt: img.alt || '',
        width: img.width || img.naturalWidth,
        height: img.height || img.naturalHeight,
        position: getElementPosition(img)
      });
    });
    
    return images;
  };

  // 提取样式信息
  const extractStyles = (doc: Document) => {
    const bodyStyle = window.getComputedStyle(doc.body);
    return {
      backgroundColor: bodyStyle.backgroundColor,
      backgroundImage: bodyStyle.backgroundImage,
      fontFamily: bodyStyle.fontFamily,
      fontSize: bodyStyle.fontSize,
      color: bodyStyle.color
    };
  };

  // 分析布局
  const analyzeLayout = (doc: Document) => {
    const container = doc.body.firstElementChild as HTMLElement;
    if (!container) return { type: 'simple' };
    
    const computedStyle = window.getComputedStyle(container);
    return {
      type: computedStyle.display === 'flex' ? 'flex' : 'block',
      direction: computedStyle.flexDirection || 'column',
      justifyContent: computedStyle.justifyContent || 'flex-start',
      alignItems: computedStyle.alignItems || 'stretch'
    };
  };

  // 获取元素位置
  const getElementPosition = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  };

  // 生成幻灯片预览图
  const generateSlidePreview = async (htmlContent: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // 创建高分辨率iframe
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;left:-9999px;width:1920px;height:1080px;border:none;';
        document.body.appendChild(iframe);
        
        if (iframe.contentDocument) {
          // 设置HTML内容
          iframe.contentDocument.open();
          iframe.contentDocument.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body>${htmlContent}</body>
            </html>
          `);
          iframe.contentDocument.close();
          
          // 等待内容加载完成
          await new Promise<void>((loadResolve) => {
            const checkLoad = () => {
              if (iframe.contentDocument?.readyState === 'complete') {
                loadResolve();
              } else {
                setTimeout(checkLoad, 100);
              }
            };
            checkLoad();
          });
          
          // 等待图片加载
          const images = Array.from(iframe.contentDocument.querySelectorAll('img'));
          await Promise.all(images.map(img => {
            return new Promise((imgResolve) => {
              if (img.complete) {
                imgResolve(null);
              } else {
                img.onload = () => imgResolve(null);
                img.onerror = () => imgResolve(null);
              }
            });
          }));
          
          // 等待渲染完成
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 使用domToPng生成高质量图片
          const targetElement = iframe.contentDocument.body;
          const dataUrl = await domToPng(targetElement, {
            backgroundColor: '#ffffff',
            width: 1920,
            height: 1080,
            quality: 0.95,
            scale: 2
          });
          
          // 清理iframe
          document.body.removeChild(iframe);
          
          resolve(dataUrl);
        } else {
          reject(new Error('无法访问iframe内容'));
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  // 下载PPT文件
  const downloadPptFile = async (response: Response, folderName: string) => {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}-${new Date().toISOString().slice(0, 10)}.pptx`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="w-full space-y-6">
      {/* 如果已选择文件夹且传入了幻灯片相关属性，则只显示幻灯片管理界面 */}
      {selectedFolder && slides && (onSlideChange || onSlideUpload || onSlidesReorder || onSlideDelete) ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium">{selectedFolder.name}</h3>
              <span className="text-sm text-muted-foreground">
                ({t('slideCount', { count: slides.length })})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 添加下载PPT按钮 */}
              {slides.length > 0 && (
                <Button 
                  onClick={handleDownloadPpt}
                  className="bg-green-600 hover:bg-green-700" 
                  size="sm"
                  disabled={isDownloading || slides.length === 0}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {isDownloading ? 
                    t('downloadingPpt', { defaultValue: 'Downloading...' }) : 
                    t('downloadPpt', { defaultValue: 'Download PPT' })}
                </Button>
              )}
              
              {/* 添加跳转到特殊页面生成器的按钮 */}
              {slides.length > 0 && (
                <Button
                  onClick={() => router.push(`/dashboard/streamppt/slide-generator?folderId=${selectedFolderId}`)}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {t('generateSpecialSlides', { defaultValue: 'Special Pages' })}
                </Button>
              )}
            
            {/* 幻灯片上传按钮 */}
            {onSlideUpload && (
              <SlideUploader onUpload={handleFileUpload} disabled={!selectedFolderId}>
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  size="sm"
                  disabled={!selectedFolderId}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  {t('addSlidesButton')}
                </Button>
              </SlideUploader>
            )}
            </div>
          </div>

          {slides.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t('noSlides')}</p>
              {onSlideUpload && (
                <SlideUploader onUpload={handleFileUpload} disabled={!selectedFolderId}>
                  <Button 
                    className="mt-4 bg-primary/80 hover:bg-primary"
                    disabled={!selectedFolderId}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    {t('addSlidesButton')}
                  </Button>
                </SlideUploader>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="text-sm font-medium mb-4 text-gray-500">{t('slideListTitle')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {onSlideChange && onSlideDelete && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={slides.map(slide => slide.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {slides.map((slide, index) => (
                        <SortableSlideItem
                          key={slide.id}
                          slide={slide}
                          index={index}
                          isActive={index === currentSlideIndex}
                          onClick={() => onSlideChange(index)}
                          onDelete={handleSlideDelete}
                          onEdit={handleEditSlide}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // 未选择文件夹或未传入幻灯片相关属性时，显示文件夹列表
        <>
          {/* Folder management section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('myFoldersTitle')}</h2>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  {t('newFolderButton')}
                </Button>
              )}
            </div>

            {isCreating && (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <Input
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value)
                    setError(null)
                  }}
                  placeholder={t('newFolderNamePlaceholder')}
                  className="h-9"
                  autoFocus
                />
                <Button size="sm" onClick={handleCreateFolder} disabled={isLoading}>
                  {isLoading ? t('loadingInitial') : t('createButton')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false)
                    setNewFolderName("")
                    setError(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t('loadingInitial')}</div>
            ) : folders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('noFoldersMessage')}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder: any) => (
                  <div
                    key={folder.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50",
                      selectedFolderId === folder.id && "border-blue-500 bg-blue-50",
                    )}
                  >
                    <div 
                      className="flex flex-col items-center text-center gap-2"
                      onClick={() => handleSelectFolder(folder.id)}
                    >
                      <Folder className="h-12 w-12 text-blue-500" />
                      <span className="font-medium truncate w-full">{folder.name}</span>
                      <p className="text-xs text-muted-foreground">{formatDate(folder.created_at)}</p>
                    </div>
                    
                    {onPresentFolder && (
                      <div className="mt-3 flex justify-center">
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPresentFolder(folder.id);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {t('presentButton')}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
