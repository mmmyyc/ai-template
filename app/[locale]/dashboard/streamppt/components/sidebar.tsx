"use client"
import { FileUp, X, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Slide } from "../types/slide"
import { SlideUploader } from "./slide-uploader"
import { extractTitleFromHTML } from "../lib/utils"
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
import { useTranslations } from "next-intl"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
  slides: Slide[]
  currentSlideIndex: number
  onSlideChange: (index: number) => void
  onSlideUpload: (slides: Slide[]) => void
  onSlidesReorder: (newSlides: Slide[]) => void
  onSlideDelete: (slideId: string) => void
  selectedFolderId?: string | null
  onSelectFolder?: () => void
}

interface SortableSlideItemProps {
  slide: Slide
  index: number
  isActive: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent, slideId: string) => void
}

function SortableSlideItem({ slide, index, isActive, onClick, onDelete }: SortableSlideItemProps) {
  const t = useTranslations('Dashboard')
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
            <div className="bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center">
              <FileUp className="text-gray-400 dark:text-gray-500 h-8 w-8" />
            </div>
          </div>
          <div className="text-sm truncate">{slide.title}</div>
        </div>
        <button
          onClick={(e) => onDelete(e, slide.id)}
          className="ml-2 p-1 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
          title={t('deleteSlide')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ 
  open, 
  setOpen, 
  slides, 
  currentSlideIndex, 
  onSlideChange, 
  onSlideUpload,
  onSlidesReorder,
  onSlideDelete,
  selectedFolderId,
  onSelectFolder
}: SidebarProps) {
  const t = useTranslations('Dashboard')
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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newSlides: Slide[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const content = await file.text()
      const title = extractTitleFromHTML(content) || file.name.replace(".html", "")

      newSlides.push({
        id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title,
        content: content,
      })
    }

    onSlideUpload(newSlides)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((slide) => slide.id === active.id);
      const newIndex = slides.findIndex((slide) => slide.id === over.id);
      
      // If the slides are already adjacent in the direction of movement, do nothing
      if (Math.abs(oldIndex - newIndex) === 1 && 
          active.rect.current?.translated && 
          over.rect.top !== undefined &&
          ((oldIndex < newIndex && active.rect.current.translated.top < over.rect.top) ||
           (oldIndex > newIndex && active.rect.current.translated.top > over.rect.top))) {
        return;
      }
      
      const newSlides = arrayMove(slides, oldIndex, newIndex);
      
      // If the currently displayed slide is being moved, update it directly
      // This prevents unnecessary iframe reloading
      if (oldIndex === currentSlideIndex) {
        // Just update index without forcing a reload
        onSlideChange(newIndex);
      } else if (
        // Handle the case where the current slide's position is affected by the move
        (oldIndex < currentSlideIndex && newIndex >= currentSlideIndex) ||
        (oldIndex > currentSlideIndex && newIndex <= currentSlideIndex)
      ) {
        // Calculate the new current slide index
        const newCurrentIndex = oldIndex < currentSlideIndex 
          ? currentSlideIndex - 1 
          : currentSlideIndex + 1;
        // Update index without forcing a reload
        onSlideChange(newCurrentIndex);
      }
      
      // Update the slides array order
      onSlidesReorder(newSlides);
    }
  };

  const handleSlideDelete = (e: React.MouseEvent, slideId: string) => {
    e.stopPropagation();
    onSlideDelete(slideId);
  }

  return (
    <>
      {/* Backdrop overlay when sidebar is open */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}
      
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{t('sidebarTitle')}</h1>
            <p className="text-sm opacity-75">
              {selectedFolderId ? t('currentFolder') : t('noFolderSelected')}
              {selectedFolderId && onSelectFolder && (
                <button 
                  onClick={onSelectFolder} 
                  className="ml-2 text-xs underline hover:opacity-80"
                >
                  {t('changeButton')}
                </button>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="text-primary-foreground hover:bg-primary/90"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">{t('closeSidebar')}</span>
          </Button>
        </div>

        {!selectedFolderId && onSelectFolder && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t('selectFolderPrompt')}
            </p>
            <Button 
              onClick={onSelectFolder}
              variant="outline" 
              className="mt-2 w-full border-yellow-400 bg-white text-yellow-700 hover:bg-yellow-50"
            >
              {t('selectFolderButton')}
            </Button>
          </div>
        )}

        <div className="p-4 bg-white dark:bg-gray-900">
          <SlideUploader onUpload={handleFileUpload} disabled={!selectedFolderId}>
            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={!selectedFolderId}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {t('addSlidesButton')}
            </Button>
          </SlideUploader>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        <div className="p-2 overflow-y-auto max-h-[calc(100vh-180px)] bg-white dark:bg-gray-900">
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
        </div>
      </div>
    </>
  )
}

