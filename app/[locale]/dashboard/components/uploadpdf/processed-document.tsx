"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, FileText, Clock, Layers } from "lucide-react"
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
        <CardTitle>Processed Document</CardTitle>
        <CardDescription>The extracted content from your PDF document.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Extracted Text</TabsTrigger>
            <TabsTrigger value="structure">Document Structure</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(result.text || "")}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <div className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {result.text || "No text content extracted"}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="structure" className="mt-4">
            <div className="p-4 border rounded-md bg-muted/50 max-h-[500px] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: result.markdown || "No structured content available" }} />
            </div>
          </TabsContent>
          <TabsContent value="raw" className="mt-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => copyToClipboard(JSON.stringify(result.raw || result, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <pre className="p-4 border rounded-md bg-muted/50 overflow-x-auto max-h-[500px] overflow-y-auto">
                {JSON.stringify(result.raw || result, null, 2)}
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
            <span className="text-sm text-muted-foreground">{result.metadata?.pageCount || 0} pages</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">
              Processed in {result.metadata?.processingTime || "0s"}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          Print Results
        </Button>
      </CardFooter>
    </Card>
  )
}

