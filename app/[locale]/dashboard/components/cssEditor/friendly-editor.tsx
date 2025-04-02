"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Move } from "lucide-react"
import { cn } from "@/lib/utils"
import { getColorValue } from "./colorUtils"

interface FriendlyEditorProps {
  element: HTMLElement
  position: { x: number; y: number }
  originalClasses: string
  onClose: () => void
  onApplyChanges: (newClasses: string) => void
  html?: string
  onHtmlChange?: (html: string) => void
  className?: string
}

// Mapping of friendly names to Tailwind classes
const spacingOptions = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64]
const fontSizeOptions = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"]
const fontWeightOptions = [
  { value: "font-normal", label: "Normal" },
  { value: "font-medium", label: "Medium" },
  { value: "font-semibold", label: "Semi Bold" },
  { value: "font-bold", label: "Bold" },
]
const textAlignOptions = [
  { value: "text-left", label: "Left" },
  { value: "text-center", label: "Center" },
  { value: "text-right", label: "Right" },
  { value: "text-justify", label: "Justify" },
]
const displayOptions = [
  { value: "block", label: "Block" },
  { value: "inline-block", label: "Inline Block" },
  { value: "inline", label: "Inline" },
  { value: "flex", label: "Flex" },
  { value: "grid", label: "Grid" },
  { value: "hidden", label: "Hidden" },
]
const flexDirectionOptions = [
  { value: "flex-row", label: "Row" },
  { value: "flex-col", label: "Column" },
]
const justifyOptions = [
  { value: "justify-start", label: "Start" },
  { value: "justify-center", label: "Center" },
  { value: "justify-end", label: "End" },
  { value: "justify-between", label: "Space Between" },
  { value: "justify-around", label: "Space Around" },
  { value: "justify-evenly", label: "Space Evenly" },
]
const alignOptions = [
  { value: "items-start", label: "Top" },
  { value: "items-center", label: "Center" },
  { value: "items-end", label: "Bottom" },
  { value: "items-stretch", label: "Stretch" },
]
const borderRadiusOptions = [
  { value: "rounded-none", label: "None" },
  { value: "rounded-sm", label: "Small" },
  { value: "rounded", label: "Medium" },
  { value: "rounded-md", label: "Large" },
  { value: "rounded-lg", label: "Extra Large" },
  { value: "rounded-full", label: "Full" },
]
const shadowOptions = [
  { value: "shadow-none", label: "None" },
  { value: "shadow-sm", label: "Small" },
  { value: "shadow", label: "Medium" },
  { value: "shadow-md", label: "Large" },
  { value: "shadow-lg", label: "Extra Large" },
  { value: "shadow-xl", label: "Huge" },
]
const colorOptions = [
  { value: "gray", label: "Gray" },
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  // { value: "purple", label: "Purple" },
  // { value: "pink", label: "Pink" },
  // { value: "white", label: "White" },
  // { value: "black", label: "Black" }
]
const colorIntensityOptions = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

export function FriendlyEditor({ 
  element, 
  position, 
  originalClasses, 
  onClose, 
  onApplyChanges,
  html,
  onHtmlChange,
  className
}: FriendlyEditorProps) {
  const [currentClasses, setCurrentClasses] = useState<string[]>(element.className.split(" ").filter(Boolean))
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editorPosition, setEditorPosition] = useState(position)
  const popupRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  
  // 默认标签页选择（根据元素类型和属性自动选择）
  const [defaultTab, setDefaultTab] = useState<string>("text")

  // State for various style properties
  const [textColor, setTextColor] = useState<string>("")
  const [textColorIntensity, setTextColorIntensity] = useState<number>(500)
  const [bgColor, setBgColor] = useState<string>("")
  const [bgColorIntensity, setBgColorIntensity] = useState<number>(500)
  const [fontSize, setFontSize] = useState<string>("")
  const [fontWeight, setFontWeight] = useState<string>("")
  const [textAlignment, setTextAlignment] = useState<string>("")
  const [padding, setPadding] = useState<number>(0)
  const [margin, setMargin] = useState<number>(0)
  const [display, setDisplay] = useState<string>("")
  const [flexDirection, setFlexDirection] = useState<string>("")
  const [justifyContent, setJustifyContent] = useState<string>("")
  const [alignItems, setAlignItems] = useState<string>("")
  const [borderRadius, setBorderRadius] = useState<string>("")
  const [hasBorder, setHasBorder] = useState(false)
  const [shadow, setShadow] = useState<string>("")

  // Initialize state from current classes
  useEffect(() => {
    if (element) {
      const classes = element.className.split(" ").filter(Boolean)
      setCurrentClasses(classes)

      console.log("初始化元素样式 - 原始类名:", element.className);
      console.log("解析后的类名数组:", classes);

      // 根据元素类型和属性自动选择默认标签页
      if (classes.includes("flex") || classes.some((c: string) => c.startsWith("grid-"))) {
        setDefaultTab("layout")
      } else if (classes.some((c: string) => c.startsWith("bg-")) || classes.some((c: string) => c.startsWith("text-") && 
                !c.startsWith("text-xs") && !c.startsWith("text-sm") &&
                !c.startsWith("text-base") && !c.startsWith("text-lg") && 
                !c.startsWith("text-xl") && !c.startsWith("text-left") && 
                !c.startsWith("text-center") && !c.startsWith("text-right"))) {
        setDefaultTab("colors")
      } else if (classes.some((c: string) => c.startsWith("shadow-")) || classes.some((c: string) => c.startsWith("rounded"))) {
        setDefaultTab("effects")
      } else {
        setDefaultTab("text")
      }

      // Extract text color - 同时支持text-red-500和text-white等简单颜色
      const textColorClass = classes.find(
        (c: string) =>
          c.startsWith("text-") &&
          !c.startsWith("text-xs") &&
          !c.startsWith("text-sm") &&
          !c.startsWith("text-base") &&
          !c.startsWith("text-lg") &&
          !c.startsWith("text-xl") &&
          !c.startsWith("text-left") &&
          !c.startsWith("text-center") &&
          !c.startsWith("text-right") &&
          !c.startsWith("text-justify")
      )
      
      console.log("找到文本颜色类:", textColorClass); // 调试用
      
      if (textColorClass) {
        const parts = textColorClass.split("-")
        if (parts.length === 3) {
          setTextColor(parts[1])
          setTextColorIntensity(Number.parseInt(parts[2]))
        } else if (parts.length === 2) {
          // 处理简单颜色如text-white
          setTextColor(parts[1])
          setTextColorIntensity(500) // 默认强度
        }
      }

      // Extract background color - 同时支持bg-blue-200和bg-black等简单颜色
      const bgColorClass = classes.find((c: string) => c.startsWith("bg-") && c !== "bg-transparent")
      
      console.log("找到背景颜色类:", bgColorClass); // 调试用
      
      if (bgColorClass) {
        const parts = bgColorClass.split("-")
        if (parts.length === 3) {
          setBgColor(parts[1])
          setBgColorIntensity(Number.parseInt(parts[2]))
        } else if (parts.length === 2) {
          // 处理简单颜色如bg-white
          setBgColor(parts[1])
          setBgColorIntensity(500) // 默认强度
        }
      }

      // Extract font size
      const fontSizeClass = classes.find(
        (c: string) =>
          c === "text-xs" ||
          c === "text-sm" ||
          c === "text-base" ||
          c === "text-lg" ||
          c === "text-xl" ||
          c === "text-2xl" ||
          c === "text-3xl" ||
          c === "text-4xl" ||
          c === "text-5xl" ||
          c === "text-6xl"
      )
      
      console.log("找到字体大小类:", fontSizeClass); // 调试用
      
      if (fontSizeClass) {
        setFontSize(fontSizeClass.replace("text-", ""))
        console.log("设置字体大小为:", fontSizeClass.replace("text-", ""));
      } else {
        // 尝试寻找其他可能的文本大小类
        const textSizeRegex = /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/;
        const possibleSizeClass = classes.find((c: string) => textSizeRegex.test(c));
        if (possibleSizeClass) {
          const size = possibleSizeClass.replace("text-", "");
          setFontSize(size);
          console.log("通过正则匹配设置字体大小为:", size);
        } else {
          console.log("未找到字体大小类");
        }
      }

      // Extract font weight
      const fontWeightClass = classes.find((c: string) => c.startsWith("font-"))
      
      console.log("找到字体粗细类:", fontWeightClass); // 调试用
      
      if (fontWeightClass) {
        setFontWeight(fontWeightClass)
      }

      // Extract text alignment
      const textAlignmentClass = classes.find(
        (c: string) =>
          c === "text-left" ||
          c === "text-center" ||
          c === "text-right" ||
          c === "text-justify"
      )
      
      console.log("找到文本对齐类:", textAlignmentClass); // 调试用
      
      if (textAlignmentClass) {
        setTextAlignment(textAlignmentClass.replace("text-", ""))
        console.log("设置文本对齐为:", textAlignmentClass.replace("text-", ""));
      } else {
        // 检查是否有其他文本对齐类
        const alignRegex = /^text-(left|center|right|justify)$/;
        const possibleAlignClass = classes.find(c => alignRegex.test(c));
        if (possibleAlignClass) {
          const align = possibleAlignClass.replace("text-", "");
          setTextAlignment(align);
          console.log("通过正则匹配设置文本对齐为:", align);
        } else {
          console.log("未找到文本对齐类");
          // 默认为left
          setTextAlignment("left");
        }
      }

      // Extract padding - 支持所有方向的内边距
      let paddingValue = 0;
      const paddingClass = classes.find((c: string) => c.startsWith("p-") && c.length <= 4) // 只匹配p-1到p-12这样的类
      const paddingXClass = classes.find((c: string) => c.startsWith("px-"))
      const paddingYClass = classes.find((c: string) => c.startsWith("py-"))
      
      if (paddingClass) {
        paddingValue = Number.parseInt(paddingClass.replace("p-", ""))
      } else if (paddingXClass && paddingYClass) {
        // 如果同时有px和py，取较大值
        const xValue = Number.parseInt(paddingXClass.replace("px-", ""))
        const yValue = Number.parseInt(paddingYClass.replace("py-", ""))
        paddingValue = Math.max(xValue, yValue)
      } else if (paddingXClass) {
        paddingValue = Number.parseInt(paddingXClass.replace("px-", ""))
      } else if (paddingYClass) {
        paddingValue = Number.parseInt(paddingYClass.replace("py-", ""))
      }
      
      console.log("设置内边距值:", paddingValue); // 调试用
      
      if (!isNaN(paddingValue)) {
        setPadding(paddingValue)
      }

      // Extract margin - 支持所有方向的外边距
      let marginValue = 0;
      const marginClass = classes.find((c: string) => c.startsWith("m-") && c.length <= 4) // 只匹配m-1到m-12这样的类
      const marginXClass = classes.find((c: string) => c.startsWith("mx-"))
      const marginYClass = classes.find((c: string) => c.startsWith("my-"))
      
      if (marginClass) {
        marginValue = Number.parseInt(marginClass.replace("m-", ""))
      } else if (marginXClass && marginYClass) {
        // 如果同时有mx和my，取较大值
        const xValue = Number.parseInt(marginXClass.replace("mx-", ""))
        const yValue = Number.parseInt(marginYClass.replace("my-", ""))
        marginValue = Math.max(xValue, yValue)
      } else if (marginXClass) {
        marginValue = Number.parseInt(marginXClass.replace("mx-", ""))
      } else if (marginYClass) {
        marginValue = Number.parseInt(marginYClass.replace("my-", ""))
      }
      
      console.log("设置外边距值:", marginValue); // 调试用
      
      if (!isNaN(marginValue)) {
        setMargin(marginValue)
      }

      // Extract display
      const displayClass = classes.find(
        (c: string) => c === "block" || c === "inline-block" || c === "inline" || c === "flex" || c === "grid" || c === "hidden"
      )
      
      console.log("找到显示类型:", displayClass); // 调试用
      
      if (displayClass) {
        setDisplay(displayClass)
      }

      // Extract flex direction if element is flex
      if (classes.includes("flex")) {
        const flexDirClass = classes.find((c: string) => c === "flex-row" || c === "flex-col")
        
        console.log("找到flex方向:", flexDirClass); // 调试用
        
        if (flexDirClass) {
          setFlexDirection(flexDirClass)
        } else {
          // 默认为row
          setFlexDirection("flex-row")
        }
      }

      // Extract justify content
      const justifyClass = classes.find((c: string) => c.startsWith("justify-"))
      
      console.log("找到justify类:", justifyClass); // 调试用
      
      if (justifyClass) {
        setJustifyContent(justifyClass)
      }

      // Extract align items
      const alignClass = classes.find((c: string) => c.startsWith("items-"))
      
      console.log("找到align类:", alignClass); // 调试用
      
      if (alignClass) {
        setAlignItems(alignClass)
      }

      // Extract border radius
      const borderRadiusClass = classes.find((c: string) => c.startsWith("rounded"))
      
      console.log("找到圆角类:", borderRadiusClass); // 调试用
      
      if (borderRadiusClass) {
        setBorderRadius(borderRadiusClass)
      }

      // Check if has border
      const hasBorderClass = classes.some((c: string) => c === "border" || c.startsWith("border-") && !c.startsWith("border-radius"))
      
      console.log("是否有边框:", hasBorderClass); // 调试用
      
      setHasBorder(hasBorderClass)

      // Extract shadow
      const shadowClass = classes.find((c: string) => c.startsWith("shadow"))
      
      console.log("找到阴影类:", shadowClass); // 调试用
      
      if (shadowClass) {
        setShadow(shadowClass)
      }
    }
  }, [element])

  // Position the editor
  useEffect(() => {
    if (popupRef.current) {
      // Initial positioning
      popupRef.current.style.left = `${editorPosition.x}px`
      popupRef.current.style.top = `${editorPosition.y}px`
    }

    // Close popup when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-radix-popper-content-wrapper]")
      ) {
        // Only close if we're not dragging and not about to start dragging
        if (!isDragging && !(headerRef.current && headerRef.current.contains(e.target as Node))) {
          onClose()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editorPosition, onClose, isDragging])

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && headerRef.current) {
        e.preventDefault(); // Prevent text selection
        
        // Calculate new position
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Update position
        setEditorPosition({
          x: newX,
          y: newY,
        });
        
        // Apply position directly to prevent lag
        if (popupRef.current) {
          popupRef.current.style.left = `${newX}px`;
          popupRef.current.style.top = `${newY}px`;
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        setIsDragging(false);
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging, dragOffset]);

  // Prevent closing when interacting with select dropdowns
  useEffect(() => {
    const handleSelectInteraction = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('[role="combobox"]') ||
        target.closest('[role="option"]') ||
        target.closest("[data-radix-popper-content-wrapper]")
      ) {
        e.stopPropagation()
      }
    }

    document.addEventListener("mousedown", handleSelectInteraction, true)
    return () => {
      document.removeEventListener("mousedown", handleSelectInteraction, true)
    }
  }, [])

  const handleDragStart = (e: React.MouseEvent) => {
    if (headerRef.current) {
      e.preventDefault(); // Prevent text selection during drag
      setIsDragging(true);
      const rect = headerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - editorPosition.x,
        y: e.clientY - editorPosition.y,
      });
    }
  }

  // Update classes based on style changes
  const updateClasses = () => {
    let newClasses = [...currentClasses]

    // Helper function to replace or add a class
    const replaceOrAddClass = (prefix: string, value: string | null) => {
      // Check if prefix is a regex pattern (contains |)
      if (prefix.includes("|")) {
        // Create a regex from the pattern
        const pattern = new RegExp(`^(${prefix})$`)
        // Remove existing classes that match the pattern
        newClasses = newClasses.filter((c: string) => !pattern.test(c))
      } else {
        // Remove existing classes with this prefix
        newClasses = newClasses.filter((c: string) => !c.startsWith(prefix))
      }
      // Add new class if value is provided
      if (value) {
        newClasses.push(value)
      }
    }

    // Update text color
    if (textColor) {
      // 首先检查是否是标准颜色值
      if (textColor === 'white' || textColor === 'black') {
        replaceOrAddClass("text-", `text-${textColor}`);
      } else {
        replaceOrAddClass("text-", `text-${textColor}-${textColorIntensity}`);
      }
    }

    // Update background color
    if (bgColor) {
      // 首先检查是否是标准颜色值
      if (bgColor === 'white' || bgColor === 'black') {
        replaceOrAddClass("bg-", `bg-${bgColor}`);
      } else {
        replaceOrAddClass("bg-", `bg-${bgColor}-${bgColorIntensity}`);
      }
    }

    // Update font size
    if (fontSize) {
      const fontSizeClasses = [
        "text-xs",
        "text-sm",
        "text-base",
        "text-lg",
        "text-xl",
        "text-2xl",
        "text-3xl",
        "text-4xl",
        "text-5xl",
        "text-6xl",
      ]
      newClasses = newClasses.filter((c: string) => !fontSizeClasses.includes(c))
      newClasses.push(`text-${fontSize}`)
    }

    // Update font weight
    if (fontWeight) {
      replaceOrAddClass("font-", fontWeight)
    }

    // Update text alignment
    if (textAlignment) {
      replaceOrAddClass("text-left|text-center|text-right|text-justify", `text-${textAlignment}`)
    }

    // Update padding
    replaceOrAddClass("p-", padding > 0 ? `p-${padding}` : null)

    // Update margin
    replaceOrAddClass("m-", margin > 0 ? `m-${margin}` : null)

    // Update display
    if (display) {
      const displayClasses = ["block", "inline-block", "inline", "flex", "grid", "hidden"]
      newClasses = newClasses.filter((c: string) => !displayClasses.includes(c))
      newClasses.push(display)
    }

    // Update flex direction
    if (display === "flex" && flexDirection) {
      replaceOrAddClass("flex-row|flex-col", flexDirection)
    }

    // Update justify content
    if (display === "flex" && justifyContent) {
      replaceOrAddClass("justify-", justifyContent)
    }

    // Update align items
    if (display === "flex" && alignItems) {
      replaceOrAddClass("items-", alignItems)
    }

    // Update border
    if (hasBorder) {
      if (!newClasses.includes("border")) {
        newClasses.push("border")
      }
    } else {
      newClasses = newClasses.filter((c) => c !== "border")
    }

    // Update border radius
    if (borderRadius) {
      replaceOrAddClass("rounded", borderRadius)
    }

    // Update shadow
    if (shadow) {
      replaceOrAddClass("shadow", shadow)
    }

    return newClasses.join(" ")
  }

  const handleApplyChanges = () => {
    const newClassString = updateClasses()
    if (onHtmlChange) {
      onHtmlChange(newClassString)
    }
    if (onApplyChanges) {
      onApplyChanges(newClassString)
    }

    // Apply changes to the element directly for immediate feedback
    if (element) {
      element.className = newClassString
    }
    
    // 自动关闭编辑器
    onClose()
  }

  const handleReset = () => {
    element.className = originalClasses
    onClose()
  }

  // Apply changes immediately when properties change
  useEffect(() => {
    // Only apply immediate changes if the editor is open and element exists
    if (element && popupRef.current) {
      const newClassString = updateClasses()
      element.className = newClassString
    }
  }, [
    textColor,
    textColorIntensity,
    bgColor,
    bgColorIntensity,
    fontSize,
    fontWeight,
    textAlignment,
    padding,
    margin,
    display,
    flexDirection,
    justifyContent,
    alignItems,
    hasBorder,
    borderRadius,
    shadow,
  ])

  return (
    <div
      ref={popupRef}
      className={cn("absolute z-50 w-80 bg-white border rounded-lg shadow-lg", className)}
      style={{ 
        left: editorPosition.x, 
        top: editorPosition.y, 
        maxHeight: "80vh", // 限制最大高度为视口高度的80%
        overflow: "hidden" // 超出部分隐藏
      }}
      data-selector-ui="true"
    >
      <div
        ref={headerRef}
        className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium">Style Editor</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-[calc(80vh-56px)]">
        <div className="p-4 space-y-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>

            {/* TEXT TAB */}
            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Text Size</Label>
                <Select value={fontSize || undefined} onValueChange={setFontSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="base">Normal</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                    <SelectItem value="2xl">2X Large</SelectItem>
                    <SelectItem value="3xl">3X Large</SelectItem>
                    <SelectItem value="4xl">4X Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Text Weight</Label>
                <Select value={fontWeight || undefined} onValueChange={setFontWeight}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontWeightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Text Alignment</Label>
                <Select value={textAlignment || undefined} onValueChange={setTextAlignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* LAYOUT TAB */}
            <TabsContent value="layout" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Display Type</Label>
                <Select value={display || undefined} onValueChange={setDisplay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display type" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {display === "flex" && (
                <>
                  <div className="space-y-2">
                    <Label>Direction</Label>
                    <Select value={flexDirection || undefined} onValueChange={setFlexDirection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        {flexDirectionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Horizontal Alignment</Label>
                    <Select value={justifyContent || undefined} onValueChange={setJustifyContent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {justifyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Vertical Alignment</Label>
                    <Select value={alignItems || undefined} onValueChange={setAlignItems}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {alignOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Padding: {padding}</Label>
                <Slider value={[padding]} min={0} max={12} step={1} onValueChange={(value) => setPadding(value[0])} />
              </div>

              <div className="space-y-2">
                <Label>Margin: {margin}</Label>
                <Slider value={[margin]} min={0} max={12} step={1} onValueChange={(value) => setMargin(value[0])} />
              </div>
            </TabsContent>

            {/* COLORS TAB */}
            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <div
                      key={color.value}
                      className={cn(
                        "h-8 rounded-md cursor-pointer border-2",
                        textColor === color.value ? "border-black" : "border-transparent",
                        // 为白色添加灰色边框
                        color.value === "white" ? "border border-gray-200" : ""
                      )}
                      style={{ 
                        backgroundColor: getColorValue(color.value, color.value === "white" || color.value === "black" ? 0 : 500)
                      }}
                      onClick={() => setTextColor(color.value)}
                    />
                  ))}
                </div>

                {textColor && textColor !== "white" && textColor !== "black" && (
                  <div className="mt-2 space-y-2">
                    <Label>Color Intensity: {textColorIntensity}</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[textColorIntensity]}
                        min={100}
                        max={900}
                        step={100}
                        onValueChange={(value) => setTextColorIntensity(value[0])}
                        className="flex-1"
                      />
                      <div 
                        className="w-6 h-6 rounded-md border"
                        style={{ backgroundColor: getColorValue(textColor, textColorIntensity) }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <div
                      key={color.value}
                      className={cn(
                        "h-8 rounded-md cursor-pointer border-2",
                        bgColor === color.value ? "border-black" : "border-transparent",
                        // 为白色添加灰色边框
                        color.value === "white" ? "border border-gray-200" : ""
                      )}
                      style={{ 
                        backgroundColor: getColorValue(color.value, color.value === "white" || color.value === "black" ? 0 : 500)
                      }}
                      onClick={() => setBgColor(color.value)}
                    />
                  ))}
                </div>

                {bgColor && bgColor !== "white" && bgColor !== "black" && (
                  <div className="mt-2 space-y-2">
                    <Label>Color Intensity: {bgColorIntensity}</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[bgColorIntensity]}
                        min={100}
                        max={900}
                        step={100}
                        onValueChange={(value) => setBgColorIntensity(value[0])}
                        className="flex-1"
                      />
                      <div 
                        className="w-6 h-6 rounded-md border"
                        style={{ backgroundColor: getColorValue(bgColor, bgColorIntensity) }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* EFFECTS TAB */}
            <TabsContent value="effects" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="border-switch">Border</Label>
                <Switch id="border-switch" checked={hasBorder} onCheckedChange={setHasBorder} />
              </div>

              <div className="space-y-2">
                <Label>Corner Roundness</Label>
                <Select value={borderRadius || undefined} onValueChange={setBorderRadius}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select roundness" />
                  </SelectTrigger>
                  <SelectContent>
                    {borderRadiusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shadow</Label>
                <Select value={shadow || undefined} onValueChange={setShadow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shadow" />
                  </SelectTrigger>
                  <SelectContent>
                    {shadowOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button size="sm" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleApplyChanges}>
              Apply Changes
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

