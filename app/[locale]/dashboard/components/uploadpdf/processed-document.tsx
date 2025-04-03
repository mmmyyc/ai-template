"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, FileText, Image, Layers } from "lucide-react"
import { LoadingState } from "@/components/loading-state"

interface ProcessedDocumentProps {
  result: any
  isLoading?: boolean
}

export function ProcessedDocument({ result, isLoading = false }: ProcessedDocumentProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return <LoadingState message="Processing your document..." />
  }

  if (!result) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>处理后的文档</CardTitle>
        <CardDescription>从PDF文档中提取的结构化内容</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="document">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document">完整文档</TabsTrigger>
            <TabsTrigger value="structure">文档结构</TabsTrigger>
            <TabsTrigger value="raw">原始数据</TabsTrigger>
          </TabsList>
          <TabsContent value="document" className="mt-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(result.combinedMarkdown || "")}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "已复制!" : "复制"}
              </Button>
              <div className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {result.combinedMarkdown || "未提取到文本内容"}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="structure" className="mt-4">
            <div className="p-4 border rounded-md bg-muted/50 max-h-[500px] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: result.combinedMarkdown || "无可用的结构化内容" }} />
            </div>
          </TabsContent>
          <TabsContent value="raw" className="mt-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "已复制!" : "复制"}
              </Button>
              <pre className="p-4 border rounded-md bg-muted/50 overflow-x-auto max-h-[500px] overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">{result.metadata?.documentType || "PDF"}</span>
          </div>
          <div className="flex items-center">
            <Layers className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">{result.metadata?.pageCount || 0} 页</span>
          </div>
          <div className="flex items-center">
            <Image className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">{result.metadata?.imageCount || 0} 图片</span>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          打印结果
        </Button>
      </CardFooter>
    </Card>
  )
}

