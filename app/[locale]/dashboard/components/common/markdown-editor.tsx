"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { Markdown } from 'tiptap-markdown'

export interface MarkdownEditorProps {
  initialContent?: string
  placeholder?: string
  onChange?: (content: string) => void
  onAIAction?: (selectedText: string) => void
  showAIButton?: boolean
  isGenerating?: boolean
  className?: string
  height?: string | number
}

export default function MarkdownEditor({
  initialContent = "",
  placeholder = "Write something or select text to use AI...",
  onChange,
  onAIAction,
  showAIButton = false,
  isGenerating = false,
  className = "",
  height = "100%",
}: MarkdownEditorProps) {
  const [markdownContent, setMarkdownContent] = useState("")

  // 初始化Tiptap编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded-md p-2 dark:bg-gray-800',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      Link.configure({
        openOnClick: false,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // 使用tiptap-markdown获取Markdown内容
      if (editor.storage.markdown) {
        const markdown = editor.storage.markdown.getMarkdown();
        setMarkdownContent(markdown);
        if (onChange) {
          onChange(markdown);
        }
      }
    },
  })

  // Handle AI action on selected text
  const handleAIAction = useCallback(() => {
    if (editor && onAIAction) {
      const { from, to } = editor.state.selection
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, ' ')
        if (selectedText) {
          onAIAction(selectedText)
        }
      }
    }
  }, [editor, onAIAction])

  // Add global styles to prevent focus outline
  useEffect(() => {
    // Add a style tag to remove focus outlines for contentEditable elements
    const style = document.createElement("style")
    style.innerHTML = `
    .ProseMirror {
      outline: none !important;
      width: 100%;
      height: 100%;
      min-height: 100%;
      line-height: 1.5;
      color: inherit;
    }
    .ProseMirror p {
      margin: 0.75em 0;
    }
    .ProseMirror h1 {
      font-size: 1.75em;
      font-weight: 700;
      margin: 1em 0 0.5em 0;
      color: inherit;
    }
    .ProseMirror h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0 0.5em 0;
      color: inherit;
    }
    .ProseMirror h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0 0.5em 0;
      color: inherit;
    }
    .ProseMirror blockquote {
      border-left: 3px solid #ddd;
      padding-left: 1em;
      margin-left: 0;
      margin-right: 0;
      font-style: italic;
      color: inherit;
    }
    .ProseMirror pre {
      background: #0d0d0d;
      color: #fff;
      font-family: 'JetBrainsMono', monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    .ProseMirror code {
      background-color: rgba(97, 97, 97, 0.1);
      color: #616161;
      font-family: monospace;
      padding: 0.25em;
      border-radius: 0.25em;
    }
    .ProseMirror ul, .ProseMirror ol {
      padding-left: 2em;
      margin: 0.5em 0;
    }
    .ProseMirror a {
      color: #1f6feb;
      text-decoration: underline;
    }
    .ProseMirror img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em 0;
    }
    [data-active="true"] {
      background-color: rgba(0, 0, 0, 0.1);
    }
    .dark [data-active="true"] {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .editor-content-wrapper {
      height: 100%;
      overflow-y: auto;
    }
    .editor-scroll-container {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b overflow-x-auto bg-base-200 dark:bg-gray-900">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          data-active={editor.isActive('heading', { level: 1 })}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          data-active={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          data-active={editor.isActive('heading', { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-neutral-200 mx-1 dark:bg-neutral-800" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleCode().run()}
          data-active={editor.isActive('code')}
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-neutral-200 mx-1 dark:bg-neutral-800" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-active={editor.isActive('blockquote')}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-neutral-200 mx-1 dark:bg-neutral-800" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        {showAIButton && (
          <>
            <div className="h-6 w-px bg-neutral-200 mx-1 dark:bg-neutral-800" />
            <Button
              variant="default"
              size="sm"
              className="h-8 ml-auto gap-1"
              onClick={handleAIAction}
              disabled={isGenerating || (editor.state.selection.from === editor.state.selection.to)}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI 生成</span>
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative editor-content-wrapper">
        <ScrollArea className="h-full w-full">
          <div className="editor-scroll-container p-6">
            <EditorContent editor={editor} className="prose prose-sm dark:prose-invert" />
          </div>
        </ScrollArea>

        {/* Bubble menu */}
        {editor && onAIAction && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex items-center gap-1 rounded-md border bg-base-100 p-1 shadow-md dark:bg-gray-800 dark:border-gray-700">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleBold().run()}
                data-active={editor.isActive('bold')}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                data-active={editor.isActive('italic')}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleCode().run()}
                data-active={editor.isActive('code')}
              >
                <Code className="h-4 w-4" />
              </Button>
              <div className="h-6 w-px bg-neutral-200 mx-1 dark:bg-neutral-800" />
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1"
                onClick={handleAIAction}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>AI</span>
              </Button>
            </div>
          </BubbleMenu>
        )}
      </div>
    </div>
  )
}

// Export the raw Markdown content from the editor for external use
export function getMarkdownContent(editor: any): string {
  if (editor?.storage?.markdown) {
    return editor.storage.markdown.getMarkdown();
  }
  return "";
}
