"use client"

import type React from "react"

import { useRef, type ReactNode } from "react"

interface SlideUploaderProps {
  children: ReactNode
  onUpload: (files: FileList | null) => void
  disabled?: boolean
}

export function SlideUploader({ children, onUpload, disabled = false }: SlideUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpload(e.target.files)
    // Reset the input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div 
      className={`relative ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`} 
      onClick={handleClick}
    >
      {children}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".html" 
        multiple 
        onChange={handleChange} 
        className="hidden" 
        disabled={disabled} 
      />
    </div>
  )
}

