"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
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

// Helper function copied from article-editor for consistency
const findElementByPath = (path: string, container: Document | HTMLElement): HTMLElement | null => {
  try {
    const root = container instanceof Document ? container.body : container;
    return root.querySelector(path) as HTMLElement | null;
  } catch (error) {
    console.error('FriendlyEditor: Error finding element by path:', path, error);
    return null;
  }
};

interface FriendlyEditorProps {
  elementPath: string
  iframeRef: React.RefObject<HTMLIFrameElement>
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
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  // { value: "white", label: "White" },
  // { value: "black", label: "Black" }
]
const colorIntensityOptions = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

export function FriendlyEditor({ 
  elementPath, 
  iframeRef,
  position, 
  originalClasses, 
  onClose, 
  onApplyChanges,
  html,
  onHtmlChange,
  className
}: FriendlyEditorProps) {
  const [currentClasses, setCurrentClasses] = useState<string[]>(originalClasses.split(" ").filter(Boolean))
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
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
  const [marginTop, setMarginTop] = useState<number>(0);
  const [marginRight, setMarginRight] = useState<number>(0);
  const [marginBottom, setMarginBottom] = useState<number>(0);
  const [marginLeft, setMarginLeft] = useState<number>(0);
  const [paddingTop, setPaddingTop] = useState<number>(0);
  const [paddingRight, setPaddingRight] = useState<number>(0);
  const [paddingBottom, setPaddingBottom] = useState<number>(0);
  const [paddingLeft, setPaddingLeft] = useState<number>(0);
  const [showMarginPreview, setShowMarginPreview] = useState(false);
  const [showPaddingPreview, setShowPaddingPreview] = useState(false);
  const [showRawCss, setShowRawCss] = useState(false);

  // Find the target element inside the iframe
  useEffect(() => {
    console.log("FriendlyEditor: Finding element with path:", elementPath, "Original classes:", originalClasses);
    
    if (iframeRef.current && iframeRef.current.contentDocument && elementPath) {
      const iframeDoc = iframeRef.current.contentDocument;
      const foundElement = findElementByPath(elementPath, iframeDoc);
      if (foundElement) {
        setTargetElement(foundElement);
        // Re-initialize classes from the found element if they differ from originalClasses
        const actualClasses = foundElement.className.split(' ').filter(Boolean);
        setCurrentClasses(actualClasses);
        console.log("FriendlyEditor: Target element found in iframe:", foundElement, "Actual classes:", actualClasses);
      } else {
        console.error("FriendlyEditor: Could not find element in iframe with path:", elementPath);
        // Even if element isn't found, we should still initialize with originalClasses
        setCurrentClasses(originalClasses.split(" ").filter(Boolean));
        setTargetElement(null); // Reset if not found
      }
    } else {
      // Reset if iframe/path is not available
      console.error("FriendlyEditor: iframeRef or elementPath not available", { 
        iframeAvailable: !!iframeRef.current, 
        contentDocAvailable: !!(iframeRef.current && iframeRef.current.contentDocument),
        path: elementPath
      });
      // Still initialize with original classes
      setCurrentClasses(originalClasses.split(" ").filter(Boolean));
      setTargetElement(null);
    }
  }, [elementPath, iframeRef, originalClasses]); // Rerun if path or iframe ref changes

  // Initialize state from current classes or originalClasses
  useEffect(() => {
    const classes = targetElement 
      ? targetElement.className.split(" ").filter(Boolean)
      : currentClasses; // Use currentClasses as fallback which contains originalClasses
      
    console.log("FriendlyEditor: Initializing styles from classes:", classes);
    
    // Initialize all style properties from classes
    initializeStylePropertiesFromClasses(classes);
  }, [targetElement, currentClasses]); // Re-initialize when targetElement or currentClasses change

  // New function to initialize style properties from classes
  const initializeStylePropertiesFromClasses = (classes: string[]) => {
    // Determine default tab based on classes
    let newDefaultTab = "text";
    if (classes.includes("flex") || classes.some((c: string) => c.startsWith("grid"))) {
      newDefaultTab = "layout";
    } else if (
      classes.some((c: string) => c.startsWith("bg-")) ||
      classes.some(
        (c: string) =>
          c.startsWith("text-") &&
          !["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", 
           "left", "center", "right", "justify"].includes(c.substring(5))
      )
    ) {
      newDefaultTab = "colors";
    } else if (classes.some((c: string) => c.startsWith("shadow-")) || classes.some((c: string) => c.startsWith("rounded"))) {
      newDefaultTab = "effects";
    }
    setDefaultTab(newDefaultTab);
    
    // Extract text color
    const textColorClass = classes.find(
      (c: string) =>
        c.startsWith("text-") &&
        !["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", 
         "left", "center", "right", "justify"].includes(c.substring(5))
    )
    if (textColorClass) {
      const parts = textColorClass.split("-")
      if (parts.length === 3) {
        setTextColor(parts[1])
        setTextColorIntensity(Number.parseInt(parts[2]))
      } else if (parts.length === 2) {
        setTextColor(parts[1])
        setTextColorIntensity(500)
      }
    } else {
       setTextColor("")
    }

    // Extract background color
    const bgColorClass = classes.find((c: string) => c.startsWith("bg-"))
    if (bgColorClass) {
      const parts = bgColorClass.split("-")
      if (parts.length === 3) {
        setBgColor(parts[1])
        setBgColorIntensity(Number.parseInt(parts[2]))
      } else if (parts.length === 2) {
        setBgColor(parts[1])
        setBgColorIntensity(500)
      }
    } else {
      setBgColor("")
    }

    // Extract Font Size
    const fontSizeClass = classes.find((c: string) => c.startsWith("text-") && fontSizeOptions.includes(c.substring(5)))
    setFontSize(fontSizeClass ? fontSizeClass.substring(5) : "")

    // Extract Font Weight
    const fontWeightClass = classes.find((c: string) => fontWeightOptions.some(option => option.value === c))
    setFontWeight(fontWeightClass || "")

    // Extract Text Alignment
    const textAlignClass = classes.find((c: string) => textAlignOptions.some(option => option.value === c))
    setTextAlignment(textAlignClass || "")

    // Extract Padding (this logic seems complex, ensure it works)
    const ptClass = classes.find((c: string) => c.startsWith("pt-"));
    setPaddingTop(ptClass ? Number.parseInt(ptClass.substring(3)) : 0);
    const prClass = classes.find((c: string) => c.startsWith("pr-"));
    setPaddingRight(prClass ? Number.parseInt(prClass.substring(3)) : 0);
    const pbClass = classes.find((c: string) => c.startsWith("pb-"));
    setPaddingBottom(pbClass ? Number.parseInt(pbClass.substring(3)) : 0);
    const plClass = classes.find((c: string) => c.startsWith("pl-"));
    setPaddingLeft(plClass ? Number.parseInt(plClass.substring(3)) : 0);
    const pxClass = classes.find((c: string) => c.startsWith("px-"));
    if (pxClass) {
      const val = Number.parseInt(pxClass.substring(3));
      if (!prClass) setPaddingRight(val);
      if (!plClass) setPaddingLeft(val);
    }
    const pyClass = classes.find((c: string) => c.startsWith("py-"));
    if (pyClass) {
      const val = Number.parseInt(pyClass.substring(3));
      if (!ptClass) setPaddingTop(val);
      if (!pbClass) setPaddingBottom(val);
    }
    const pClass = classes.find((c: string) => c.startsWith("p-") && !c.startsWith("pt-") && !c.startsWith("pr-") && !c.startsWith("pb-") && !c.startsWith("pl-") && !c.startsWith("px-") && !c.startsWith("py-"));
    if (pClass) {
      const val = Number.parseInt(pClass.substring(2));
      if (!ptClass && !pyClass) setPaddingTop(val);
      if (!prClass && !pxClass) setPaddingRight(val);
      if (!pbClass && !pyClass) setPaddingBottom(val);
      if (!plClass && !pxClass) setPaddingLeft(val);
    }

    // Extract Margin
    const mtClass = classes.find((c: string) => c.startsWith("mt-"));
    setMarginTop(mtClass ? Number.parseInt(mtClass.substring(3)) : 0);
    const mrClass = classes.find((c: string) => c.startsWith("mr-"));
    setMarginRight(mrClass ? Number.parseInt(mrClass.substring(3)) : 0);
    const mbClass = classes.find((c: string) => c.startsWith("mb-"));
    setMarginBottom(mbClass ? Number.parseInt(mbClass.substring(3)) : 0);
    const mlClass = classes.find((c: string) => c.startsWith("ml-"));
    setMarginLeft(mlClass ? Number.parseInt(mlClass.substring(3)) : 0);
    const mxClass = classes.find((c: string) => c.startsWith("mx-"));
    if (mxClass) {
      const val = Number.parseInt(mxClass.substring(3));
      if (!mrClass) setMarginRight(val);
      if (!mlClass) setMarginLeft(val);
    }
    const myClass = classes.find((c: string) => c.startsWith("my-"));
    if (myClass) {
      const val = Number.parseInt(myClass.substring(3));
      if (!mtClass) setMarginTop(val);
      if (!mbClass) setMarginBottom(val);
    }
    const mClass = classes.find((c: string) => c.startsWith("m-") && !c.startsWith("mt-") && !c.startsWith("mr-") && !c.startsWith("mb-") && !c.startsWith("ml-") && !c.startsWith("mx-") && !c.startsWith("my-"));
    if (mClass) {
      const val = Number.parseInt(mClass.substring(2));
      if (!mtClass && !myClass) setMarginTop(val);
      if (!mrClass && !mxClass) setMarginRight(val);
      if (!mbClass && !myClass) setMarginBottom(val);
      if (!mlClass && !mxClass) setMarginLeft(val);
    }

    // Extract Display
    const displayClass = classes.find((c: string) => displayOptions.some(option => option.value === c))
    setDisplay(displayClass || "")

    // Extract Flex Direction
    const flexDirectionClass = classes.find((c: string) => flexDirectionOptions.some(option => option.value === c))
    setFlexDirection(flexDirectionClass || "")

    // Extract Justify Content
    const justifyContentClass = classes.find((c: string) => justifyOptions.some(option => option.value === c))
    setJustifyContent(justifyContentClass || "")

    // Extract Align Items
    const alignItemsClass = classes.find((c: string) => alignOptions.some(option => option.value === c))
    setAlignItems(alignItemsClass || "")

    // Extract Border Radius
    const borderRadiusClass = classes.find((c: string) => borderRadiusOptions.some(option => option.value === c))
    setBorderRadius(borderRadiusClass || "")

    // Extract Shadow
    const shadowClass = classes.find((c: string) => shadowOptions.some(option => option.value === c))
    setShadow(shadowClass || "")

    // Check for Border
    setHasBorder(classes.includes("border"))
  }

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

  // Update classes based on style changes - memoize to avoid dependency issues
  const updateClasses = useCallback(() => {
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
    replaceOrAddClass("p-", null) // 移除整体的padding
    replaceOrAddClass("pt-", paddingTop > 0 ? `pt-${paddingTop}` : null) // 上内边距
    replaceOrAddClass("pr-", paddingRight > 0 ? `pr-${paddingRight}` : null) // 右内边距
    replaceOrAddClass("pb-", paddingBottom > 0 ? `pb-${paddingBottom}` : null) // 下内边距
    replaceOrAddClass("pl-", paddingLeft > 0 ? `pl-${paddingLeft}` : null) // 左内边距

    // Update margin - 分别处理四个方向
    replaceOrAddClass("m-", null) // 移除整体的margin
    replaceOrAddClass("mt-", marginTop > 0 ? `mt-${marginTop}` : null) // 上边距
    replaceOrAddClass("mr-", marginRight > 0 ? `mr-${marginRight}` : null) // 右边距
    replaceOrAddClass("mb-", marginBottom > 0 ? `mb-${marginBottom}` : null) // 下边距
    replaceOrAddClass("ml-", marginLeft > 0 ? `ml-${marginLeft}` : null) // 左边距

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
  }, [
    currentClasses,
    textColor,
    textColorIntensity,
    bgColor,
    bgColorIntensity,
    fontSize,
    fontWeight,
    textAlignment,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    display,
    flexDirection,
    justifyContent,
    alignItems,
    hasBorder,
    borderRadius,
    shadow
  ])

  const handleApplyChanges = () => {
    const newClassString = updateClasses()
    if (onHtmlChange) {
      onHtmlChange(newClassString)
    }
    if (onApplyChanges) {
      onApplyChanges(newClassString)
    }

    // Apply changes to the element directly for immediate feedback
    if (targetElement) {
      targetElement.className = newClassString
    }
    
    // 自动关闭编辑器
    onClose()
  }

  const handleReset = () => {
    if (!targetElement) return; // Add guard
    console.log("原始CSS类名:", originalClasses)
    setCurrentClasses(originalClasses.split(" ").filter(Boolean));
    // Re-initialize state based on original classes
    const classes = originalClasses.split(" ").filter(Boolean); 
    
    // Extract text color
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
    if (textColorClass) {
      const parts = textColorClass.split("-")
      if (parts.length === 3) {
        setTextColor(parts[1])
        setTextColorIntensity(Number.parseInt(parts[2]))
      } else if (parts.length === 2) {
        setTextColor(parts[1])
        setTextColorIntensity(500) 
      }
    } else {
       setTextColor("")
    }

    // Extract background color
    const bgColorClass = classes.find((c: string) => c.startsWith("bg-"))
    if (bgColorClass) {
      const parts = bgColorClass.split("-")
       if (parts.length === 3) {
        setBgColor(parts[1])
        setBgColorIntensity(Number.parseInt(parts[2]))
      } else if (parts.length === 2) {
        setBgColor(parts[1])
        setBgColorIntensity(500)
      }
    } else {
      setBgColor("")
    }
    
    // Extract Font Size
    const fontSizeClass = classes.find((c: string) => c.startsWith("text-") && fontSizeOptions.includes(c.substring(5)))
    setFontSize(fontSizeClass ? fontSizeClass.substring(5) : "")

    // Extract Font Weight
    const fontWeightClass = classes.find((c: string) => fontWeightOptions.some(option => option.value === c))
    setFontWeight(fontWeightClass || "")

    // Extract Text Alignment
    const textAlignClass = classes.find((c: string) => textAlignOptions.some(option => option.value === c))
    setTextAlignment(textAlignClass || "")
    
    // ... (Reset padding state based on originalClasses parsing) ...
    // Extract individual padding values
    const ptClass = classes.find((c: string) => c.startsWith("pt-"));
    setPaddingTop(ptClass ? Number.parseInt(ptClass.substring(3)) : 0);
    const prClass = classes.find((c: string) => c.startsWith("pr-"));
    setPaddingRight(prClass ? Number.parseInt(prClass.substring(3)) : 0);
    const pbClass = classes.find((c: string) => c.startsWith("pb-"));
    setPaddingBottom(pbClass ? Number.parseInt(pbClass.substring(3)) : 0);
    const plClass = classes.find((c: string) => c.startsWith("pl-"));
    setPaddingLeft(plClass ? Number.parseInt(plClass.substring(3)) : 0);
    const pxClass = classes.find((c: string) => c.startsWith("px-"));
    if (pxClass) {
        const val = Number.parseInt(pxClass.substring(3));
        if (!prClass) setPaddingRight(val);
        if (!plClass) setPaddingLeft(val);
    }
    const pyClass = classes.find((c: string) => c.startsWith("py-"));
    if (pyClass) {
        const val = Number.parseInt(pyClass.substring(3));
        if (!ptClass) setPaddingTop(val);
        if (!pbClass) setPaddingBottom(val);
    }
    const pClass = classes.find((c: string) => c.startsWith("p-") && !c.startsWith("pt-") && !c.startsWith("pr-") && !c.startsWith("pb-") && !c.startsWith("pl-") && !c.startsWith("px-") && !c.startsWith("py-"));
    if (pClass) {
        const val = Number.parseInt(pClass.substring(2));
        if (!ptClass && !pyClass) setPaddingTop(val);
        if (!prClass && !pxClass) setPaddingRight(val);
        if (!pbClass && !pyClass) setPaddingBottom(val);
        if (!plClass && !pxClass) setPaddingLeft(val);
    }
    
    // ... (Reset margin state based on originalClasses parsing) ...
    const mtClass = classes.find((c: string) => c.startsWith("mt-"));
    setMarginTop(mtClass ? Number.parseInt(mtClass.substring(3)) : 0);
    const mrClass = classes.find((c: string) => c.startsWith("mr-"));
    setMarginRight(mrClass ? Number.parseInt(mrClass.substring(3)) : 0);
    const mbClass = classes.find((c: string) => c.startsWith("mb-"));
    setMarginBottom(mbClass ? Number.parseInt(mbClass.substring(3)) : 0);
    const mlClass = classes.find((c: string) => c.startsWith("ml-"));
    setMarginLeft(mlClass ? Number.parseInt(mlClass.substring(3)) : 0);
    const mxClass = classes.find((c: string) => c.startsWith("mx-"));
    if (mxClass) {
        const val = Number.parseInt(mxClass.substring(3));
        if (!mrClass) setMarginRight(val);
        if (!mlClass) setMarginLeft(val);
    }
    const myClass = classes.find((c: string) => c.startsWith("my-"));
    if (myClass) {
        const val = Number.parseInt(myClass.substring(3));
        if (!mtClass) setMarginTop(val);
        if (!mbClass) setMarginBottom(val);
    }
    const mClass = classes.find((c: string) => c.startsWith("m-") && !c.startsWith("mt-") && !c.startsWith("mr-") && !c.startsWith("mb-") && !c.startsWith("ml-") && !c.startsWith("mx-") && !c.startsWith("my-"));
    if (mClass) {
        const val = Number.parseInt(mClass.substring(2));
        if (!mtClass && !myClass) setMarginTop(val);
        if (!mrClass && !mxClass) setMarginRight(val);
        if (!mbClass && !myClass) setMarginBottom(val);
        if (!mlClass && !mxClass) setMarginLeft(val);
    }

    // Extract Display
    const displayClass = classes.find((c: string) => displayOptions.some(option => option.value === c))
    setDisplay(displayClass || "")

    // Extract Flex Direction
    const flexDirectionClass = classes.find((c: string) => flexDirectionOptions.some(option => option.value === c))
    setFlexDirection(flexDirectionClass || "")

    // Extract Justify Content
    const justifyContentClass = classes.find((c: string) => justifyOptions.some(option => option.value === c))
    setJustifyContent(justifyContentClass || "")

    // Extract Align Items
    const alignItemsClass = classes.find((c: string) => alignOptions.some(option => option.value === c))
    setAlignItems(alignItemsClass || "")

    // Extract Border Radius
    const borderRadiusClass = classes.find((c: string) => borderRadiusOptions.some(option => option.value === c))
    setBorderRadius(borderRadiusClass || "")

    // Extract Shadow
    const shadowClass = classes.find((c: string) => shadowOptions.some(option => option.value === c))
    setShadow(shadowClass || "")

    // Check for Border (simplified)
    setHasBorder(classes.includes("border"))

    console.log("重置为原始类名完成");
  };

  // Apply changes immediately when properties change
  useEffect(() => {
    // Only apply immediate changes if the editor is open and element exists
    if (targetElement && popupRef.current) {
      const newClassString = updateClasses()
      targetElement.className = newClassString
    }
  }, [
    // All style properties that affect the generated classes
    textColor,
    textColorIntensity,
    bgColor,
    bgColorIntensity,
    fontSize,
    fontWeight,
    textAlignment,
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    display,
    flexDirection,
    justifyContent,
    alignItems,
    hasBorder,
    borderRadius,
    shadow,
    targetElement,
    updateClasses
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
                <Label htmlFor="text-size">Text Size</Label>
                <Select 
                  value={fontSize || ""}
                  onValueChange={(value) => setFontSize(value)}
                >
                  <SelectTrigger id="text-size" className={fontSize ? "border-blue-300" : ""}>
                    <SelectValue placeholder="Select size">
                      {fontSize ? `Size: ${fontSize}` : "Select size"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-weight">Text Weight</Label>
                <Select
                  value={fontWeight || ""}
                  onValueChange={(value) => setFontWeight(value)}
                >
                  <SelectTrigger id="text-weight" className={fontWeight ? "border-blue-300" : ""}>
                    <SelectValue placeholder="Select weight">
                      {fontWeight ? fontWeightOptions.find(option => option.value === fontWeight)?.label || fontWeight.replace("font-", "") : "Select weight"}
                    </SelectValue>
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
                <Label htmlFor="text-align">Text Alignment</Label>
                <Select
                  value={textAlignment || ""}
                  onValueChange={(value) => setTextAlignment(value)}
                >
                  <SelectTrigger id="text-align" className={textAlignment ? "border-blue-300" : ""}>
                    <SelectValue placeholder="Select alignment">
                      {textAlignment ? textAlignOptions.find(option => option.value === textAlignment)?.label || textAlignment.replace("text-", "") : "Select alignment"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {textAlignOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* LAYOUT TAB */}
            <TabsContent value="layout" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="display">Display Type</Label>
                <Select
                  value={display || ""}
                  onValueChange={(value) => setDisplay(value)}
                >
                  <SelectTrigger id="display" className={display ? "border-blue-300" : ""}>
                    <SelectValue placeholder="Select display">
                      {display ? displayOptions.find(option => option.value === display)?.label || display : "Select display"}
                    </SelectValue>
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
                    <Label htmlFor="flex-direction">Direction</Label>
                    <Select
                      value={flexDirection || ""}
                      onValueChange={(value) => setFlexDirection(value)}
                      disabled={display !== "flex"}
                    >
                      <SelectTrigger id="flex-direction" className={flexDirection ? "border-blue-300" : ""}>
                        <SelectValue placeholder="Select direction">
                          {flexDirection ? flexDirectionOptions.find(option => option.value === flexDirection)?.label || flexDirection.replace("flex-", "") : "Select direction"}
                        </SelectValue>
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
                    <Label htmlFor="justify-content">Horizontal Alignment</Label>
                    <Select
                      value={justifyContent || ""}
                      onValueChange={(value) => setJustifyContent(value)}
                      disabled={display !== "flex"}
                    >
                      <SelectTrigger id="justify-content" className={justifyContent ? "border-blue-300" : ""}>
                        <SelectValue placeholder="Select justify">
                          {justifyContent ? justifyOptions.find(option => option.value === justifyContent)?.label || justifyContent.replace("justify-", "") : "Select justify"}
                        </SelectValue>
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
                    <Label htmlFor="align-items">Vertical Alignment</Label>
                    <Select
                      value={alignItems || ""}
                      onValueChange={(value) => setAlignItems(value)}
                      disabled={display !== "flex"}
                    >
                      <SelectTrigger id="align-items" className={alignItems ? "border-blue-300" : ""}>
                        <SelectValue placeholder="Select alignment">
                          {alignItems ? alignOptions.find(option => option.value === alignItems)?.label || alignItems.replace("items-", "") : "Select alignment"}
                        </SelectValue>
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

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium">Margin</Label>
                  <Button variant="outline" size="sm" onClick={() => setShowMarginPreview(!showMarginPreview)} className="h-6 px-2 text-xs">
                    {showMarginPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
              </div>

                {showMarginPreview && (
                  <div className="mb-4">
                    <div className="relative w-full h-28 bg-gray-100 border rounded-md overflow-hidden">
                      {/* 外部margin预览框 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* 顶部margin区域 */}
                        <div 
                          className="absolute top-0 left-0 right-0 bg-blue-200 opacity-30 flex items-center justify-center text-xs"
                          style={{ height: `${marginTop * 4}px` }}
                        >
                          {marginTop > 0 && `mt-${marginTop}`}
                        </div>
                        
                        {/* 右侧margin区域 */}
                        <div 
                          className="absolute top-0 right-0 bottom-0 bg-blue-200 opacity-30 flex items-center justify-center text-xs"
                          style={{ width: `${marginRight * 4}px` }}
                        >
                          {marginRight > 0 && `mr-${marginRight}`}
                        </div>
                        
                        {/* 底部margin区域 */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-200 opacity-30 flex items-center justify-center text-xs"
                          style={{ height: `${marginBottom * 4}px` }}
                        >
                          {marginBottom > 0 && `mb-${marginBottom}`}
                        </div>
                        
                        {/* 左侧margin区域 */}
                        <div 
                          className="absolute top-0 left-0 bottom-0 bg-blue-200 opacity-30 flex items-center justify-center text-xs"
                          style={{ width: `${marginLeft * 4}px` }}
                        >
                          {marginLeft > 0 && `ml-${marginLeft}`}
                        </div>
                        
                        {/* 内部内容区域 */}
                        <div 
                          className="bg-white border border-gray-300 rounded" 
                          style={{ 
                            width: `calc(100% - ${(marginLeft + marginRight) * 4}px)`, 
                            height: `calc(100% - ${(marginTop + marginBottom) * 4}px)`,
                            padding: `${padding * 4}px`
                          }}
                        >
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xs">
                            Content
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Top: {marginTop}</Label>
                    <Slider value={[marginTop]} min={0} max={12} step={1} onValueChange={(value) => setMarginTop(value[0])} />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Right: {marginRight}</Label>
                    <Slider value={[marginRight]} min={0} max={12} step={1} onValueChange={(value) => setMarginRight(value[0])} />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Bottom: {marginBottom}</Label>
                    <Slider value={[marginBottom]} min={0} max={12} step={1} onValueChange={(value) => setMarginBottom(value[0])} />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Left: {marginLeft}</Label>
                    <Slider value={[marginLeft]} min={0} max={12} step={1} onValueChange={(value) => setMarginLeft(value[0])} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium">Padding</Label>
                  <Button variant="outline" size="sm" onClick={() => setShowPaddingPreview(!showPaddingPreview)} className="h-6 px-2 text-xs">
                    {showPaddingPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
                </div>
                
                {showPaddingPreview && (
                  <div className="mb-4">
                    <div className="relative w-full h-28 bg-gray-100 border rounded-md overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="bg-white border border-gray-300 rounded" 
                          style={{ 
                            width: `calc(100% - ${(marginLeft + marginRight) * 4}px)`, 
                            height: `calc(100% - ${(marginTop + marginBottom) * 4}px)`
                          }}
                        >
                          {/* 顶部padding区域 */}
                          <div 
                            className="absolute top-0 left-0 right-0 bg-green-200 opacity-30 flex items-center justify-center text-xs"
                            style={{ height: `${paddingTop * 4}px` }}
                          >
                            {paddingTop > 0 && `pt-${paddingTop}`}
                          </div>
                          
                          {/* 右侧padding区域 */}
                          <div 
                            className="absolute top-0 right-0 bottom-0 bg-green-200 opacity-30 flex items-center justify-center text-xs"
                            style={{ width: `${paddingRight * 4}px` }}
                          >
                            {paddingRight > 0 && `pr-${paddingRight}`}
                          </div>
                          
                          {/* 底部padding区域 */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-green-200 opacity-30 flex items-center justify-center text-xs"
                            style={{ height: `${paddingBottom * 4}px` }}
                          >
                            {paddingBottom > 0 && `pb-${paddingBottom}`}
                          </div>
                          
                          {/* 左侧padding区域 */}
                          <div 
                            className="absolute top-0 left-0 bottom-0 bg-green-200 opacity-30 flex items-center justify-center text-xs"
                            style={{ width: `${paddingLeft * 4}px` }}
                          >
                            {paddingLeft > 0 && `pl-${paddingLeft}`}
                          </div>
                          
                          {/* 内容区域 */}
                          <div 
                            className="absolute bg-gray-50 flex items-center justify-center text-xs"
                            style={{ 
                              top: `${paddingTop * 4}px`, 
                              right: `${paddingRight * 4}px`, 
                              bottom: `${paddingBottom * 4}px`, 
                              left: `${paddingLeft * 4}px` 
                            }}
                          >
                            Content
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Top: {paddingTop}</Label>
                    <Slider value={[paddingTop]} min={0} max={12} step={1} onValueChange={(value) => setPaddingTop(value[0])} />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Right: {paddingRight}</Label>
                    <Slider value={[paddingRight]} min={0} max={12} step={1} onValueChange={(value) => setPaddingRight(value[0])} />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Bottom: {paddingBottom}</Label>
                    <Slider value={[paddingBottom]} min={0} max={12} step={1} onValueChange={(value) => setPaddingBottom(value[0])} />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Left: {paddingLeft}</Label>
                    <Slider value={[paddingLeft]} min={0} max={12} step={1} onValueChange={(value) => setPaddingLeft(value[0])} />
                  </div>
                </div>
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
                <Label htmlFor="border-radius">Corner Roundness</Label>
                <Select
                  value={borderRadius || ""}
                  onValueChange={(value) => setBorderRadius(value)}
                >
                  <SelectTrigger id="border-radius" className={borderRadius ? "border-blue-300" : ""}>
                    <SelectValue placeholder="Select radius">
                      {borderRadius ? borderRadiusOptions.find(option => option.value === borderRadius)?.label || (borderRadius.replace("rounded", "").replace("-", "") || "Default") : "Select radius"}
                    </SelectValue>
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
                <Label htmlFor="shadow">Shadow</Label>
                <Select
                  value={shadow || ""}
                  onValueChange={(value) => setShadow(value)}
                >
                  <SelectTrigger id="shadow" className={shadow ? "border-blue-300" : ""}>
                    <SelectValue placeholder="Select shadow">
                      {shadow ? shadowOptions.find(option => option.value === shadow)?.label || (shadow.replace("shadow", "").replace("-", "") || "Default") : "Select shadow"}
                    </SelectValue>
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

          <div className="mt-4 pt-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <Label className="font-medium">CSS Classes</Label>
              <Button variant="outline" size="sm" onClick={() => setShowRawCss(!showRawCss)} className="h-6 px-2 text-xs">
                {showRawCss ? "Hide" : "Show"}
              </Button>
            </div>
            
            {showRawCss && (
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Original:</Label>
                  <div className="bg-gray-50 p-2 rounded-md text-xs font-mono overflow-x-auto break-all border border-gray-200">
                    {originalClasses}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Current:</Label>
                  <div className="bg-gray-50 p-2 rounded-md text-xs font-mono overflow-x-auto break-all border border-gray-200">
                    {updateClasses()}
                  </div>
                </div>
                {originalClasses !== updateClasses() && (
                  <div className="text-xs text-blue-600">
                    * Blue highlighted fields indicate properties that have been changed
                  </div>
                )}
              </div>
            )}
          </div>

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

