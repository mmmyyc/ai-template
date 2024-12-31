'use client'
import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState('workflow-1')
  const [result, setResult] = useState<string>('/placeholder.svg?height=512&width=512')

  const handleGenerate = () => {
    // Handle generation logic here
    console.log('Generating with:', { prompt, selectedWorkflow })
    // Simulating image generation with a placeholder
    setResult('/placeholder.svg?height=512&width=512')
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-8 text-center">Image Generation</h1>
      <div className="grid gap-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 space-y-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow">Workflow</Label>
                <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                  <SelectTrigger id="workflow">
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workflow-1">Workflow 1</SelectItem>
                    <SelectItem value="workflow-2">Workflow 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Reference Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={handleGenerate}>
                Generate
              </Button>
            </Card>
          </div>

          <div className="w-full lg:w-2/3">
            <Card className="overflow-hidden">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result}
                  alt="Generated image"
                  className="w-full h-auto aspect-square object-cover"
                />
                <Button
                  className="absolute bottom-4 right-4"
                  onClick={() => {
                    // Implement download logic here
                    console.log('Downloading image:', result)
                  }}
                >
                  Download
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

