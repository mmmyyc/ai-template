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

interface FriendlyEditorProps {
  element: HTMLElement
  position: { x: number; y: number }
  originalClasses: string
  onClose: () => void
  onApplyChanges: (newClasses: string) => void
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
]
const colorIntensityOptions = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

export function FriendlyEditor({ element, position, originalClasses, onClose, onApplyChanges }: FriendlyEditorProps) {
  const [currentClasses, setCurrentClasses] = useState<string[]>(element.className.split(" ").filter(Boolean))
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editorPosition, setEditorPosition] = useState(position)
  const popupRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // State for various style properties
  const [textColor, setTextColor] = useState<string>("")
  const [textColorIntensity, setTextColorIntensity] = useState<number>(500)
  const [bgColor, setBgColor] = useState<string>("")
  const [bgColorIntensity, setBgColorIntensity] = useState<number>(500)
  const [fontSize, setFontSize] = useState<string>("")
  const [fontWeight, setFontWeight] = useState<string>("")
  const [textAlign, setTextAlign] = useState<string>("")
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

      // Extract text color
      const textColorClass = classes.find(
        (c) =>
          c.startsWith("text-") &&
          !c.startsWith("text-xs") &&
          !c.startsWith("text-sm") &&
          !c.startsWith("text-base") &&
          !c.startsWith("text-lg") &&
          !c.startsWith("text-xl") &&
          !c.startsWith("text-left") &&
          !c.startsWith("text-center") &&
          !c.startsWith("text-right"),
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
      }

      // Extract background color
      const bgColorClass = classes.find((c) => c.startsWith("bg-") && c !== "bg-transparent")
      if (bgColorClass) {
        const parts = bgColorClass.split("-")
        if (parts.length === 3) {
          setBgColor(parts[1])
          setBgColorIntensity(Number.parseInt(parts[2]))
        } else if (parts.length === 2) {
          setBgColor(parts[1])
          setBgColorIntensity(500)
        }
      }

      // Extract font size
      const fontSizeClass = classes.find(
        (c) =>
          c === "text-xs" ||
          c === "text-sm" ||
          c === "text-base" ||
          c === "text-lg" ||
          c === "text-xl" ||
          c === "text-2xl" ||
          c === "text-3xl" ||
          c === "text-4xl" ||
          c === "text-5xl" ||
          c === "text-6xl",
      )
      if (fontSizeClass) {
        setFontSize(fontSizeClass.replace("text-", ""))
      }

      // Extract font weight
      const fontWeightClass = classes.find((c) => c.startsWith("font-"))
      if (fontWeightClass) {
        setFontWeight(fontWeightClass)
      }

      // Extract text alignment
      const textAlignClass = classes.find(
        (c) => c === "text-left" || c === "text-center" || c === "text-right" || c === "text-justify",
      )
      if (textAlignClass) {
        setTextAlign(textAlignClass)
      }

      // Extract padding
      const paddingClass = classes.find((c) => c.startsWith("p-"))
      if (paddingClass) {
        const paddingValue = Number.parseInt(paddingClass.replace("p-", ""))
        if (!isNaN(paddingValue)) {
          setPadding(paddingValue)
        }
      }

      // Extract margin
      const marginClass = classes.find((c) => c.startsWith("m-"))
      if (marginClass) {
        const marginValue = Number.parseInt(marginClass.replace("m-", ""))
        if (!isNaN(marginValue)) {
          setMargin(marginValue)
        }
      }

      // Extract display
      const displayClass = classes.find(
        (c) =>
          c === "block" || c === "inline-block" || c === "inline" || c === "flex" || c === "grid" || c === "hidden",
      )
      if (displayClass) {
        setDisplay(displayClass)
      }

      // Extract flex direction if element is flex
      if (classes.includes("flex")) {
        const flexDirClass = classes.find((c) => c === "flex-row" || c === "flex-col")
        if (flexDirClass) {
          setFlexDirection(flexDirClass)
        }
      }

      // Extract justify content
      const justifyClass = classes.find((c) => c.startsWith("justify-"))
      if (justifyClass) {
        setJustifyContent(justifyClass)
      }

      // Extract align items
      const alignClass = classes.find((c) => c.startsWith("items-"))
      if (alignClass) {
        setAlignItems(alignClass)
      }

      // Extract border radius
      const borderRadiusClass = classes.find((c) => c.startsWith("rounded"))
      if (borderRadiusClass) {
        setBorderRadius(borderRadiusClass)
      }

      // Check if has border
      setHasBorder(classes.includes("border"))

      // Extract shadow
      const shadowClass = classes.find((c) => c.startsWith("shadow"))
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
        !isDragging &&
        !(e.target as HTMLElement).closest("[data-radix-popper-content-wrapper]")
      ) {
        onClose()
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
        setEditorPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

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
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - editorPosition.x,
        y: e.clientY - editorPosition.y,
      })
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
        newClasses = newClasses.filter((c) => !pattern.test(c))
      } else {
        // Remove existing classes with this prefix
        newClasses = newClasses.filter((c) => !c.startsWith(prefix))
      }
      // Add new class if value is provided
      if (value) {
        newClasses.push(value)
      }
    }

    // Update text color
    if (textColor) {
      replaceOrAddClass("text-", `text-${textColor}-${textColorIntensity}`)
    }

    // Update background color
    if (bgColor) {
      replaceOrAddClass("bg-", `bg-${bgColor}-${bgColorIntensity}`)
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
      newClasses = newClasses.filter((c) => !fontSizeClasses.includes(c))
      newClasses.push(`text-${fontSize}`)
    }

    // Update font weight
    if (fontWeight) {
      replaceOrAddClass("font-", fontWeight)
    }

    // Update text alignment
    if (textAlign) {
      replaceOrAddClass("text-left|text-center|text-right|text-justify", textAlign)
    }

    // Update padding
    replaceOrAddClass("p-", padding > 0 ? `p-${padding}` : null)

    // Update margin
    replaceOrAddClass("m-", margin > 0 ? `m-${margin}` : null)

    // Update display
    if (display) {
      const displayClasses = ["block", "inline-block", "inline", "flex", "grid", "hidden"]
      newClasses = newClasses.filter((c) => !displayClasses.includes(c))
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
    onApplyChanges(newClassString)

    // Apply changes to the element directly for immediate feedback
    if (element) {
      element.className = newClassString
    }
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
    textAlign,
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
      className="fixed z-50 w-80 bg-white border rounded-lg shadow-lg"
      style={{ left: editorPosition.x, top: editorPosition.y }}
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

      <ScrollArea className="h-[70vh] max-h-[500px]">
        <div className="p-4 space-y-6">
          <Tabs defaultValue="text" className="w-full">
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
                <Select value={fontSize} onValueChange={setFontSize}>
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
                <Select value={fontWeight} onValueChange={setFontWeight}>
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
                <Select value={textAlign} onValueChange={setTextAlign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
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
                <Label>Display Type</Label>
                <Select value={display} onValueChange={setDisplay}>
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
                    <Select value={flexDirection} onValueChange={setFlexDirection}>
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
                    <Select value={justifyContent} onValueChange={setJustifyContent}>
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
                    <Select value={alignItems} onValueChange={setAlignItems}>
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
                        `bg-${color.value}-500`,
                      )}
                      onClick={() => setTextColor(color.value)}
                    />
                  ))}
                </div>

                {textColor && (
                  <div className="mt-2 space-y-2">
                    <Label>Color Intensity: {textColorIntensity}</Label>
                    <Slider
                      value={[textColorIntensity]}
                      min={100}
                      max={900}
                      step={100}
                      onValueChange={(value) => setTextColorIntensity(value[0])}
                    />
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
                        `bg-${color.value}-500`,
                      )}
                      onClick={() => setBgColor(color.value)}
                    />
                  ))}
                </div>

                {bgColor && (
                  <div className="mt-2 space-y-2">
                    <Label>Color Intensity: {bgColorIntensity}</Label>
                    <Slider
                      value={[bgColorIntensity]}
                      min={100}
                      max={900}
                      step={100}
                      onValueChange={(value) => setBgColorIntensity(value[0])}
                    />
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
                <Select value={borderRadius} onValueChange={setBorderRadius}>
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
                <Select value={shadow} onValueChange={setShadow}>
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

