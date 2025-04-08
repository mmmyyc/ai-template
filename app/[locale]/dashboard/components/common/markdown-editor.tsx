"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Sparkles,
  RefreshCw,
  Upload,
  Settings,
} from "lucide-react"
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import 'katex/dist/katex.min.css'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// --- Define AI Style Options --- 
const aiStyleOptions = [
  { value: "Default", label: "默认", description: "默认: 通用、平衡的默认风格" },
  { value: "Concise", label: "简洁", description: "简洁: 清晰、直接、去除多余元素" },
  { value: "Professional", label: "专业", description: "专业: 正式、商务、注重结构和可信度" },
  { value: "Creative", label: "创意", description: "创意: 独特、新颖、强调视觉冲击力" },
  { value: "Neobrutalism", label: "新野兽派", description: "新野兽派: 粗犷原始，高对比度，清晰边框" },
  { value: "Bento Grid Design", label: "便当盒", description: "便当盒: 模块化网格布局，信息块清晰" },
  { value: "Apple Design", label: "苹果设计", description: "苹果设计: 简洁、优雅、注重细节和用户体验" },
  { value: "Material Design", label: "材料设计", description: "材料设计: 谷歌规范，基于物理世界的阴影和动态效果" },
  { value: "Flat Design", label: "扁平化", description: "扁平化: 去除纹理、阴影和渐变，纯色块" },
  { value: "Neumorphism", label: "新拟物", description: "新拟物: 柔和的凸起和凹陷效果，低对比度" },
  { value: "Glassmorphism", label: "玻璃态", description: "玻璃态: 模糊背景、半透明和清晰边框" },
  { value: "Skeuomorphism", label: "拟物化", description: "拟物化: 模仿现实物体的外观和质感" },
  { value: "Minimalism", label: "极简主义", description: "极简主义: 最少元素，大量留白，功能至上" },
  { value: "Retro/Vintage", label: "复古", description: "复古: 模仿特定历史时期的设计风格" },
  { value: "Cyberpunk", label: "赛博朋克", description: "赛博朋克: 高科技、霓虹灯、未来都市感" },
  { value: "Memphis Design", label: "孟菲斯", description: "孟菲斯: 80年代风格，几何图形，大胆色彩" },
  { value: "Bauhaus", label: "包豪斯", description: "包豪斯: 功能主义，几何形式，简洁线条" },
  { value: "Brutalism", label: "野兽派", description: "野兽派: 原始、未加工、强调功能性" },
  { value: "Y2K Aesthetic", label: "千禧年", description: "千禧年: 2000年代初风格，科技感，乐观主义" },
  { value: "Vaporwave", label: "蒸汽波", description: "蒸汽波: 80/90年代复古，网络文化，故障艺术" },
  { value: "Corporate Memphis", label: "企业孟菲斯", description: "企业孟菲斯: 科技公司常用，扁平插画，抽象人物" },
  { value: "Dark Mode", label: "暗黑模式", description: "暗黑模式: 深色背景，减少眼部疲劳" },
  { value: "Claymorphism", label: "粘土态", description: "粘土态: 柔和3D效果，类似粘土模型" },
  { value: "Swiss/International Style", label: "瑞士国际风格", description: "瑞士国际风格: 网格系统，无衬线字体，客观清晰" },
  { value: "Atomic Design", label: "原子设计", description: "原子设计: 模块化设计系统，从原子到页面" },
  { value: "Monochrome", label: "单色", description: "单色: 使用单一颜色的不同色调" },
  { value: "Isometric", label: "等距", description: "等距: 2.5D视角，展示物体三维感" },
  { value: "Gradient", label: "渐变", description: "渐变: 平滑的色彩过渡效果" },
  { value: "Animated UI", label: "动画界面", description: "动画界面: 使用动效增强用户体验" },
  { value: "3D Design", label: "三维", description: "三维: 使用三维模型和渲染效果" },
  { value: "Handcrafted/Doodle", label: "手绘", description: "手绘: 模仿手绘或涂鸦的风格" },
  { value: "Micro-interactions", label: "微交互", description: "微交互: 小型动画反馈，提升交互感" },
  { value: "Asymmetrical Layouts", label: "不对称布局", description: "不对称布局: 打破平衡，创造视觉动感" },
  { value: "Organic Design", label: "有机设计", description: "有机设计: 模仿自然形态和曲线" },
];

export interface MarkdownEditorProps {
  initialContent?: string
  placeholder?: string
  onChange?: (content: string) => void
  onAIAction?: (selectedText: string, language: string, style: string) => void
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
  // 只用一个状态来存储编辑器实例，更接近官方示例
  const [vd, setVd] = useState<Vditor>()
  const [isTextSelected, setIsTextSelected] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  // Add state for AI settings
  const [aiLanguage, setAiLanguage] = useState("Chinese")
  // Initialize aiStyle with the description of the default option
  const [aiStyle, setAiStyle] = useState(aiStyleOptions[0].description) 
  
  // 使用useCallback确保函数不会频繁重建
  const handleContentChange = useCallback((value: string) => {
        if (onChange) {
      onChange(value)
    }
  }, [onChange])
  
  // 处理文件上传
  const handleUploadMd = useCallback(() => {
    console.log("上传按钮被点击")
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md'
    input.onchange = async (event) => {
      console.log("文件已选择")
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        console.log("开始读取文件:", file.name)
        const reader = new FileReader()
      reader.onload = (e) => {
          console.log("文件读取完成")
          const content = e.target?.result as string
          if (vd && content) {
            console.log("设置编辑器内容")
            vd.setValue(content)
          if (onChange) {
              onChange(content)
            }
          } else {
            console.warn("编辑器实例或内容不存在", { vd: !!vd, contentLength: content?.length })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }, [vd, onChange])
  
  // 严格遵循官方示例的初始化模式，最小化依赖项
  useEffect(() => {
    // 唯一的编辑器ID
    const editorId = `vditor-${Math.random().toString(36).substring(2, 9)}`
    if (containerRef.current) {
      // 设置ID以便Vditor可以找到容器
      containerRef.current.id = editorId
      
      // 初始化编辑器，符合官方示例模式
      const vditor = new Vditor(editorId, {
        mode: 'wysiwyg',
        placeholder,
        height: typeof height === 'number' ? height : '100%',
        toolbar: [
          'emoji', 'headings', 'bold', 'italic', 'strike', 'line', 'quote', '|', 
          'list', 'ordered-list', 'check', 'outdent', 'indent', '|', 
          'code', 'inline-code', '|', 
          'upload', 'link', 'table', '|',
          'undo', 'redo', '|',
          'edit-mode', 'content-theme', 'export'
        ],
        // 使用after回调而不是直接设置值
        after: () => {
          // 设置初始内容
          if (initialContent) {
            vditor.setValue(initialContent)
          }
          // 保存实例引用
          setVd(vditor)
          
          // 添加自定义事件处理
          const element = document.querySelector(`#${editorId}`) as HTMLElement
          if (element) {
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                  const text = vditor.getValue()
                  handleContentChange(text)
                }
              })
            })
            
            // 监听编辑器内容变化
            observer.observe(element, { 
              subtree: true, 
              childList: true, 
              characterData: true 
            })
            
            // 监听选择变化
            element.addEventListener('mouseup', () => {
              const selection = vditor.getSelection()
              setIsTextSelected(!!selection && selection.length > 0)
            })
            element.addEventListener('keyup', () => {
              const selection = vditor.getSelection()
              setIsTextSelected(!!selection && selection.length > 0)
            })
          }
        },
        input: (value) => {
          // 注意：这个回调可能导致重渲染
          // 但我们仍需要，所以使用最小依赖的useCallback包装handleContentChange
          handleContentChange(value)
        },
        preview: {
          hljs: {
            style: 'github',
            lineNumber: true,
          },
          math: {
            inlineDigit: true,
            macros: {},
            engine: 'KaTeX',
          },
        },
        cache: {
          enable: false,
        },
        upload: {
          accept: 'image/*',
          handler: async (files) => {
            console.warn("Vditor upload handler is not implemented.", files)
            return JSON.stringify({
              msg: 'Upload not implemented',
              code: 1,
              data: { errFiles: files.map(f => f.name), succMap: {} }
            })
          },
        },
      })
    }
    
    // 清理函数，符合官方示例
    return () => {
      if (vd) {
        try {
          vd.destroy()
          setVd(undefined)
        } catch (error) {
          console.error("Error destroying Vditor:", error)
        }
      }
    }
  // 空依赖数组确保只初始化一次，完全遵循官方示例
  }, [])

  // 处理AI操作
  const handleAIAction = useCallback(() => {
    if (vd && onAIAction) {
      const selectedText = vd.getSelection()
      if (selectedText) {
        // Pass language and style
        onAIAction(selectedText, aiLanguage, aiStyle) 
      }
    }
  }, [vd, onAIAction, aiLanguage, aiStyle]);
  
  // 禁用AI按钮逻辑
  const isAIButtonDisabled = isGenerating || !isTextSelected
  
  // 右键菜单事件处理
  const handleContextMenu = useCallback(() => {
    if (vd) {
      const selection = vd.getSelection();
      setIsTextSelected(!!selection && selection.length > 0);
    }
  }, [vd]);

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ height }}>
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-end gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleUploadMd}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>上传 Markdown</span>
        </Button>
        
        {/* Settings Popover */}
          <Popover>
            <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">AI 设置</span>
              </Button>
            </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">AI 设置</h4>
                <p className="text-sm text-muted-foreground">
                  配置 AI 生成语言和风格
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="ai-language">语言</Label>
                  <Select 
                    value={aiLanguage} 
                    onValueChange={setAiLanguage}
                  >
                    <SelectTrigger id="ai-language" className="col-span-2 h-8">
                      <SelectValue placeholder="选择语言" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chinese">中文</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="ai-style">风格</Label>
                  <Select 
                    value={aiStyle} 
                    onValueChange={setAiStyle}
                  >
                    <SelectTrigger id="ai-style" className="col-span-2 h-8">
                      <SelectValue placeholder="选择风格" />
                    </SelectTrigger>
                    <SelectContent>
                      <TooltipProvider>
                        {/* Map over the aiStyleOptions array */} 
                        {aiStyleOptions.map((option) => (
                          <Tooltip key={option.value} delayDuration={100}>
                            <TooltipTrigger asChild>
                              {/* Set value to description */}
                              <SelectItem value={option.description}>
                                {option.label}
                              </SelectItem>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="start" style={{backgroundColor: "white"}}>
                              <p>{option.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
      {/* Vditor编辑器容器 - 使用ContextMenu包装 */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div 
            ref={containerRef}
            className="vditor flex-1 overflow-hidden relative"
            onContextMenu={handleContextMenu}
          />
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-white">
          <ContextMenuItem 
            disabled={isGenerating || !isTextSelected}
            onClick={handleAIAction}
          >
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            <span>{isGenerating ? "生成中..." : "AI 生成"}</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleUploadMd}>
            <Upload className="h-3.5 w-3.5 mr-2" />
            <span>上传 Markdown 文档</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      {/* 悬浮上传按钮，在移动设备上更容易点击 */}
      <div className="absolute bottom-20 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 shadow-md bg-background"
          onClick={handleUploadMd}
          title="上传Markdown文档"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// 获取Markdown内容的辅助函数
export function getMarkdownContent(editor: Vditor | null | undefined): string {
  if (editor) {
    try {
      return editor.getValue();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error getting Vditor value:", error);
      return "";
    }
  }
  return "";
}

// 获取HTML内容的辅助函数
export function getHTMLContent(editor: Vditor | null | undefined): string {
  if (editor) {
    try {
      return editor.getHTML();
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error getting Vditor HTML:", error);
      return "";
    }
  }
  return "";
}
