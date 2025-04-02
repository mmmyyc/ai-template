"use client"

import { useEffect, useState, useRef } from "react"

interface ElementSelectorProps {
  onSelectElement: (element: HTMLElement, position: { x: number; y: number }) => void
  targetContainer?: HTMLElement | null
}

export function ElementSelector({ onSelectElement, targetContainer }: ElementSelectorProps) {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // 保存目标容器引用
    containerRef.current = targetContainer || null;
    
    const handleMouseOver = (e: MouseEvent) => {
      e.stopPropagation()
      const target = e.target as HTMLElement

      // Don't highlight our own UI elements
      if (target.closest("[data-selector-ui]") || target.closest("[data-no-select]")) {
        return
      }

      setHoveredElement(target)

      // Add highlight
      target.style.outline = "2px solid #3b82f6"
      target.style.outlineOffset = "2px"
    }

    const handleMouseOut = (e: MouseEvent) => {
      e.stopPropagation()
      const target = e.target as HTMLElement

      if (hoveredElement === target) {
        // Remove highlight
        target.style.outline = ""
        target.style.outlineOffset = ""
        setHoveredElement(null)
      }
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const target = e.target as HTMLElement

      // Don't select our own UI elements
      if (target.closest("[data-selector-ui]") || target.closest("[data-no-select]")) {
        return
      }

      // Remove highlight
      target.style.outline = ""
      target.style.outlineOffset = ""

      // Calculate position for the popup
      const rect = target.getBoundingClientRect()

      // Position the editor to the right of the element by default
      const position = {
        x: rect.right + 10,
        y: rect.top,
      }

      // If the popup would go off the right edge of the screen,
      // position it to the left of the element instead
      if (position.x + 350 > window.innerWidth) {
        position.x = Math.max(10, rect.left - 360)
      }

      // If the popup would go off the bottom of the screen,
      // adjust the y position
      if (position.y + 500 > window.innerHeight) {
        position.y = Math.max(10, window.innerHeight - 510)
      }

      onSelectElement(target, position)
    }

    // 选择要添加事件监听器的元素
    const eventTarget = containerRef.current || document;

    eventTarget.addEventListener("mouseover", handleMouseOver, true)
    eventTarget.addEventListener("mouseout", handleMouseOut, true)
    eventTarget.addEventListener("click", handleClick, true)

    return () => {
      // 清理事件监听器
      eventTarget.removeEventListener("mouseover", handleMouseOver, true)
      eventTarget.removeEventListener("mouseout", handleMouseOut, true)
      eventTarget.removeEventListener("click", handleClick, true)

      // Remove any lingering highlights
      if (hoveredElement) {
        hoveredElement.style.outline = ""
        hoveredElement.style.outlineOffset = ""
      }
    }
  }, [hoveredElement, onSelectElement, targetContainer])

  return (
    <div
      data-selector-ui="true"
      className="absolute bottom-4 right-4 p-4 bg-blue-600 text-white rounded-md shadow-lg z-50"
    >
      <p className="font-medium">Selection Mode Active</p>
      <p className="text-sm opacity-80 mt-1">Click on any element to edit its style</p>
    </div>
  )
}

