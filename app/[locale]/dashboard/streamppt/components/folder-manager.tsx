"use client"

import { useState, useEffect } from "react"
import { File, FileText, Folder, ImageIcon, Music, Plus, X, FileUp, Trash2, GripVertical, Video, Play } from "lucide-react"
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

type ContentItem = {
  id: string
  name: string
  type: "image" | "document" | "video" | "audio" | "other"
  createdAt: Date
  size: string
}

// Sample content for each folder
const folderContents: Record<string, ContentItem[]> = {
  "1": [
    { id: "doc-1", name: "工作报告.docx", type: "document", createdAt: new Date("2023-12-15"), size: "2.4 MB" },
    { id: "doc-2", name: "会议记录.pdf", type: "document", createdAt: new Date("2023-12-10"), size: "1.8 MB" },
    { id: "doc-3", name: "项目计划.xlsx", type: "document", createdAt: new Date("2023-11-28"), size: "3.2 MB" },
    { id: "doc-4", name: "合同.pdf", type: "document", createdAt: new Date("2023-11-15"), size: "4.5 MB" },
  ],
  "2": [
    { id: "img-1", name: "家庭照片.jpg", type: "image", createdAt: new Date("2023-12-25"), size: "3.8 MB" },
    { id: "img-2", name: "旅行照片.png", type: "image", createdAt: new Date("2023-12-20"), size: "2.7 MB" },
    { id: "img-3", name: "截图.png", type: "image", createdAt: new Date("2023-12-18"), size: "1.2 MB" },
    { id: "img-4", name: "头像.jpg", type: "image", createdAt: new Date("2023-12-05"), size: "0.8 MB" },
    { id: "img-5", name: "风景照.jpg", type: "image", createdAt: new Date("2023-11-30"), size: "4.2 MB" },
  ],
  "3": [
    { id: "file-1", name: "软件安装包.exe", type: "other", createdAt: new Date("2023-12-22"), size: "45.6 MB" },
    { id: "file-2", name: "音乐文件.mp3", type: "audio", createdAt: new Date("2023-12-15"), size: "8.3 MB" },
    { id: "file-3", name: "视频文件.mp4", type: "video", createdAt: new Date("2023-12-10"), size: "125.7 MB" },
  ],
}

// 从sidebar.tsx提取的可排序幻灯片组件
interface SortableSlideItemProps {
  slide: Slide
  index: number
  isActive: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent, slideId: string) => void
}

function SortableSlideItem({ slide, index, isActive, onClick, onDelete }: SortableSlideItemProps) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: slide.id });

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
      className={`p-3 mb-2 rounded cursor-grab active:cursor-grabbing transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      } ${isDragging ? 'border border-primary/30 shadow-lg' : ''}`}
    >
      <div className="flex items-center">
        <div 
          className="flex-1" 
          onClick={(e) => {
            // Prevent click event when dragging
            if (!isDragging) {
              e.stopPropagation();
              onClick();
            }
          }}
        >
          <div className="slide-preview mb-2">
            <div className="bg-gray-200 dark:bg-gray-700 w-full h-24 flex items-center justify-center">
              <FileUp className="text-gray-400 dark:text-gray-500 h-8 w-8" />
            </div>
          </div>
          <div className="text-sm truncate">{slide.title}</div>
        </div>
        <button
          onClick={(e) => onDelete(e, slide.id)}
          className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
          title="删除幻灯片"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
  onSelectFolder,
  onPresentFolder
}: {
  slides?: Slide[];
  currentSlideIndex?: number;
  onSlideChange?: (index: number) => void;
  onSlideUpload?: (slides: Slide[]) => void;
  onSlidesReorder?: (newSlides: Slide[]) => void;
  onSlideDelete?: (slideId: string) => void;
  onSelectFolder?: (folderId: string) => void;
  onPresentFolder?: (folderId: string) => void;
}) {
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
  const router = useRouter()
  const t = useTranslations('Dashboard')

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
      const folder = folders.find(folder => folder.id === id)
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


  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId)

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
                ({slides.length} 个幻灯片)
              </span>
            </div>
            
            {/* 幻灯片上传按钮 */}
            {onSlideUpload && (
              <SlideUploader onUpload={handleFileUpload} disabled={!selectedFolderId}>
                <Button 
                  className="bg-primary hover:bg-primary/90" 
                  size="sm"
                  disabled={!selectedFolderId}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  添加幻灯片
                </Button>
              </SlideUploader>
            )}
          </div>

          {slides.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">此文件夹还没有幻灯片</p>
              {onSlideUpload && (
                <SlideUploader onUpload={handleFileUpload} disabled={!selectedFolderId}>
                  <Button 
                    className="mt-4 bg-primary/80 hover:bg-primary"
                    disabled={!selectedFolderId}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    上传HTML幻灯片
                  </Button>
                </SlideUploader>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="text-sm font-medium mb-4 text-gray-500">幻灯片列表</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  {isLoading ? t('loading') : t('createButton')}
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
              <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
            ) : folders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('noFoldersMessage')}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) => (
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
                          演示
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
