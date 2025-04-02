"use client"

import type React from "react"

import { useState } from "react"
import { Upload, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeatureList } from "@/app/[locale]/dashboard/components/uploadpdf/feature-list"
import { ProcessedDocument } from "@/app/[locale]/dashboard/components/uploadpdf/processed-document"
import { LoadingState } from "@/app/[locale]/dashboard/components/uploadpdf/loading-state"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
    } else {
      setFile(null)
      setError("Please select a valid PDF file")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload file
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      const { fileUrl } = await uploadResponse.json()

      // Process document with Mistral AI
      setIsUploading(false)
      setIsProcessing(true)

      const processResponse = await fetch("/api/process-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
      })

      if (!processResponse.ok) {
        throw new Error("Failed to process document")
      }

      const result = await processResponse.json()
      setResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="result" disabled={!result}>
          Result
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF Document</CardTitle>
            <CardDescription>Upload your PDF document to extract text and structured content.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 border-muted-foreground/25">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your PDF file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">PDF files up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={isUploading || isProcessing}
                  >
                    Select File
                  </Button>
                </div>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <File className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}

              {error && <div className="text-sm text-red-500">{error}</div>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <FeatureList />
            <Button onClick={handleUpload} disabled={!file || isUploading || isProcessing}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading..." : isProcessing ? "Processing..." : "Process Document"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="result">
        {isProcessing ? (
          <LoadingState message="Processing your document..." />
        ) : (
          result && <ProcessedDocument result={result} />
        )}
      </TabsContent>
    </Tabs>
  )
}

