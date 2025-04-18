"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { ElementSelector } from "@/components/element-selector";
import { FriendlyEditor } from "@/app/[locale]/dashboard/components/cssEditor/friendly-editor";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  RefreshCw,
  Edit,
  Eye,
  Code,
  Trash2,
  Download,
  FileDown,
  ImageDown,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkdownEditor from "@/app/[locale]/dashboard/components/common/markdown-editor";
import parse, {
  HTMLReactParserOptions,
  Element as HtmlParserElement,
  domToReact,
  DOMNode,
} from "html-react-parser";
import {
  saveHtmlToLocalStorage,
  loadHtmlFromLocalStorage,
  hasSavedHtml,
  clearSavedHtml,
} from "@/app/[locale]/dashboard/utils/localStorage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from "html2canvas";
import { HtmlPreview } from "@/app/[locale]/dashboard/components/common/html-preview";
import { useTranslations } from 'next-intl';

// ADD Style Injection useEffect
const editorLayoutStyles = `
  .article-editor-container {
    display: flex;
    flex-direction: column;
    height: 100%; /* Crucial for child height */
    min-height: 500px; /* Or adjust as needed */
    overflow: hidden;
    border: 1px solid #e5e7eb; /* Example border */
    border-radius: 0.5rem; /* Example radius */
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1); /* Example shadow */
    background-color: #ffffff; /* Example background */
  }
  .dark .article-editor-container {
    border-color: #374151;
    background-color: #1f2937; /* Example dark background */
  }
  .editor-content-area {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
  }
  .preview-content-area {
    height: 100%;
    overflow: hidden;
  }
  .main-tabs { /* Ensure Tabs container flexes */
      flex: 1;
      display: flex; /* Allow content to take height */
      flex-direction: column;
  }
  .main-tabs > div[role="tabpanel"] { /* Target TabsContent */
       flex-grow: 1; /* Allow TabsContent to grow */
       overflow: auto; /* Add scroll if needed, adjust */
  }
`;
// END ADD

interface ArticleEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onAIAction?: (
    selectedText: string,
    language: string,
    style: string,
    generateType: string
  ) => Promise<void>;
  isGenerating?: boolean;
  generatedComponentCode?: string;
  htmlContent?: string;
  slideData?: {
    id: string;
    title: string;
    content: string;
    style: {
      fontFamily: string;
      fontSize: number;
      color: string;
    };
  };
  folderName?: string;
  onEditModeChange?: (isEditMode: boolean) => void;
}

export default function ArticleEditor({
  initialContent = "",
  onSave,
  onAIAction,
  isGenerating = false,
  generatedComponentCode = "",
  htmlContent = "",
  slideData = {
    id: "slide-1",
    title: "AI Generated Slide",
    content: "Select text and click the AI button to generate content",
    style: {
      fontFamily: "Inter",
      fontSize: 16,
      color: "#000000",
    },
  },
  folderName = "",
  onEditModeChange,
}: ArticleEditorProps) {
  const t = useTranslations('ArticleEditor');

  const [markdownContent, setMarkdownContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // ADD useEffect for styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'article-editor-layout-styles';
    styleElement.textContent = editorLayoutStyles;
    document.head.appendChild(styleElement);

    return () => {
      const existingStyle = document.getElementById('article-editor-layout-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  // END ADD

  // Handle content change from the editor
  const handleEditorChange = useCallback(
    (content: string) => {
      setMarkdownContent(content);
      if (onSave) {
        onSave(content);
      }
    },
    [onSave]
  );

  return (
    <div className="article-editor-container">
      <div className="bg-base-20 px-4 py-2 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">{t('title')}</h3>
        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            setActiveTab(value as "edit" | "preview")
          }
          className="h-8"
        >
          <TabsList className="h-7">
            <TabsTrigger value="edit" className="text-xs h-6 px-3 gap-1">
              <Edit className="h-3.5 w-3.5" />
              <span>{t('tabs.edit')}</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs h-6 px-3 gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{t('tabs.preview')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 h-[calc(100%-37px)]">
        <Tabs value={activeTab} className="h-full main-tabs">
          {/* 编辑器标签页内容 */}
          <TabsContent value="edit" className="h-full m-0 p-0">
            <div className="editor-content-area">
              <MarkdownEditor
                initialContent={markdownContent}
                onChange={handleEditorChange}
                onAIAction={onAIAction}
                showAIButton={true}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>

          {/* 预览标签页内容 */}
          <TabsContent value="preview" className="h-full m-0 p-0">
            <div className="h-full preview-content-area flex flex-col relative">
              {isGenerating ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-20">
                  <div className="flex flex-col items-center p-4 bg-base-100 dark:bg-gray-800 rounded shadow-lg">
                    <RefreshCw className="h-8 w-8 text-neutral-900 animate-spin mb-2 dark:text-neutral-50" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {t('generatingMessage')}
                    </p>
                  </div>
                </div>
              ) : null}
              <HtmlPreview 
                htmlContent={htmlContent} 
                folderName={folderName} 
                onEditModeChange={onEditModeChange} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
