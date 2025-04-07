"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import ArticleEditor from "@/app/[locale]/dashboard/components/ai/article-editor"
import MarkdownEditor from "@/app/[locale]/dashboard/components/common/markdown-editor"
import { generateSlideComponent } from "@/app/[locale]/dashboard/utils/ai-service"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from "react-resizable-panels"

export default function Home() {
  const [leftContent, setLeftContent] = useState(`# 中国古代四大发明

中国古代四大发明是指造纸术、指南针、火药和活字印刷术。这些发明对人类文明的进步产生了深远的影响。

## 造纸术

造纸术由蔡伦改进完善于东汉时期。在此之前，人们主要在龟甲、竹简、丝绢等材料上书写，这些材料或是昂贵，或是不便携带。

造纸术的发明和改进具有以下重大意义：
- 大大降低了书写材料的成本
- 使知识传播更加便利
- 推动了教育和文化的发展
- 为活字印刷术的发明奠定了基础

## 指南针

指南针最早出现在战国时期，当时被称为"司南"。经过历代改进，发展成为航海必备的导航工具。

指南针的应用领域：
1. 航海导航
2. 陆地测向
3. 军事指挥
4. 风水勘测

## 火药

火药起源于道士炼丹，在唐朝时期逐渐发展成熟。最初用于烟花爆竹，后来被用于军事。

火药的发展历程：
* 炼丹术的意外产物
* 娱乐用途（烟花爆竹）
* 军事应用
* 工程开发（开山采矿）

## 活字印刷术

活字印刷术由毕昇发明于北宋时期，是一项革命性的发明。

### 主要特点：
1. 可重复使用的单字模块
2. 灵活组合，提高效率
3. 降低印刷成本
4. 有利于文化传播

## 历史意义

这四大发明展现了中国古代科技的高度发展，对世界文明进步做出了重大贡献。它们分别革新了：
- 信息记录方式（造纸术）
- 航海技术（指南针）
- 军事技术（火药）
- 知识传播方式（活字印刷术）

选择任意段落，点击AI按钮来生成演示幻灯片！`)

  const [rightContent, setRightContent] = useState(`# 学习笔记模板

## 今日要点
- 
- 
- 

## 重要概念
1. 
2. 
3. 

## 问题与思考
> 

## 延伸阅读
* 
* 

## 总结`)

  const [isGenerating, setIsGenerating] = useState(false)
  const [htmlContent, setHtmlContent] = useState("")
  const [slideData, setSlideData] = useState({
    id: "slide-1",
    title: "AI Generated Slide",
    content: "Select text and click the AI button to generate content",
    style: {
      fontFamily: "Inter",
      fontSize: 16,
      color: "#000000",
    },
  })

  const handleAIAction = useCallback(async (selectedText: string) => {
    try {
      setIsGenerating(true)
      const { htmlContent: newHtmlContent, slideData: newSlideData } = await generateSlideComponent(selectedText)
      setHtmlContent(newHtmlContent)
      setSlideData({
        ...newSlideData,
        style: slideData.style
      })
    } catch (error) {
      console.error("Error generating HTML content:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [slideData.style])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-base-100 dark:bg-gray-950">
        <h1 className="text-lg font-medium">AI 生成</h1>
      </header>

      <div className="flex-1 p-4 overflow-hidden min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full border border-neutral-200 rounded-lg shadow-sm bg-base-100 dark:bg-gray-950 dark:border-neutral-800 overflow-hidden">
              <MarkdownEditor
                initialContent={leftContent}
                onChange={setLeftContent}
                onAIAction={handleAIAction}
                showAIButton={true}
                isGenerating={isGenerating}
              />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 group relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-neutral-200 dark:bg-neutral-800 group-hover:bg-blue-500 group-active:bg-blue-600 transition-colors" />
          </PanelResizeHandle>
          
          <Panel defaultSize={50} minSize={30}>
            <ArticleEditor
              initialContent={rightContent}
              onSave={setRightContent}
              onAIAction={handleAIAction}
              isGenerating={isGenerating}
              htmlContent={htmlContent}
              slideData={slideData}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

