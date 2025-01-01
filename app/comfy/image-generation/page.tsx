'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState('workflow-1')
  const [result, setResult] = useState<string>('/placeholder.svg?height=512&width=512')

  const handleGenerate = () => {
    console.log('Generating with:', { prompt, selectedWorkflow })
    setResult('/placeholder.svg?height=512&width=512')
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">DeskPet Generation</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow">
            <div className="card-body space-y-4">

              {/* Prompt 输入框 */}
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

              {/* 参考图片上传 */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Reference Image</span>
                </label>
                <div className="border-2 border-dashed border-base-300 rounded-lg p-4">
                  <button className="btn btn-outline w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </button>
                </div>
              </div>

              {/* 生成按钮 */}
              <button 
                className="btn btn-primary w-full"
                onClick={handleGenerate}
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* 右侧图片显示区域 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow">
            <div className="card-body p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result}
                alt="Generated image"
                className="w-full h-[512px] object-contain rounded-lg"
              />
            </div>
            <div className="p-4 flex justify-end">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  console.log('Downloading image:', result)
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

