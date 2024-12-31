'use client'
import { useState } from 'react'
import { Upload } from 'lucide-react'

export default function ImageGenerationClient() {
  const [prompt, setPrompt] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState('workflow-1')
  const [result, setResult] = useState<string>('/placeholder.svg?height=512&width=512')

  const handleGenerate = () => {
    console.log('Generating with:', { prompt, selectedWorkflow })
    setResult('/placeholder.svg?height=512&width=512')
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-8 text-center">Image Generation</h1>
      <div className="grid gap-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Workflow</span>
                  </label>
                  <select 
                    className="select select-bordered w-full" 
                    value={selectedWorkflow}
                    onChange={(e) => setSelectedWorkflow(e.target.value)}
                  >
                    <option value="workflow-1">Workflow 1</option>
                    <option value="workflow-2">Workflow 2</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Prompt</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered min-h-[120px]"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Reference Image</span>
                  </label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <button className="btn btn-outline w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </button>
                  </div>
                </div>

                <button className="btn btn-primary w-full" onClick={handleGenerate}>
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result}
                  alt="Generated image"
                  className="w-full h-auto aspect-square object-cover rounded-t-xl"
                />
                <div className="absolute bottom-4 right-4">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => console.log('Downloading image:', result)}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 