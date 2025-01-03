'use client'

import React, { useState, useEffect } from 'react'
import { Upload, ChevronDown } from 'lucide-react'
import apiClient from "@/libs/api";
import { AxiosError } from 'axios'
import { useRouter } from "next/navigation";
import config from "@/config";
import toast from "react-hot-toast";

export default function ImageGenerationPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<string>('/placeholder.svg?height=512&width=512')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [userPlan, setUserPlan] = useState<'free'| 'basic' | 'advanced'>('free')
  const [generationType, setGenerationType] = useState<'basic' | 'advanced'>('basic')

  // 获取用户计划信息
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const { data: profile } = await apiClient.get('/auth/getPlan');
        if(profile.plan === 'basic'){
          setUserPlan('basic');
        }else if(profile.plan === 'advanced'){
          setUserPlan('advanced');
        }else{
          setUserPlan('free');
        }
      } catch (error) {
        console.error('Failed to fetch user plan:', error);
      }
    };
    fetchUserPlan();
  }, []);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceImage(file)
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file)
      setReferencePreview(previewUrl)
    }
  }

  // 清理预览URL
  useEffect(() => {
    return () => {
      if (referencePreview) {
        URL.revokeObjectURL(referencePreview)
      }
    }
  }, [referencePreview])

  // 清除上传的图片
  const handleClearImage = () => {
    setReferenceImage(null)
    if (referencePreview) {
      URL.revokeObjectURL(referencePreview)
      setReferencePreview(null)
    }
  }

  // 处理图片生成
  const handleGenerate = async (type: 'basic' | 'advanced' = 'basic') => {
    if (!prompt) {
      toast.error('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    // setGenerationType(type)  // 设置当前生成类型
    
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      // formData.append('type', type)  // 添加生成类型
      // formData.append('quality', quality)  // 添加质量设置
      if (referenceImage) {
        formData.append('reference_image', referenceImage)
      }

      const response = await apiClient.post('/generate', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data)
        setResult(imageUrl)
        toast.success(`${type === 'advanced' ? 'Advanced' : 'Basic'} image generated successfully`)
      }

    } catch (error) {
      console.error('Generation error:', error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          router.push(config.auth.loginUrl)
          return
        }
        toast.error(error.response?.data?.error || 'Failed to generate image')
      } else {
        toast.error('Failed to generate image. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // 处理图片下载
  const handleDownload = async () => {
    try {
      // 创建一个下载链接
      const link = document.createElement('a')
      link.href = result
      link.download = `generated-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  // 清理生成的图片 URL
  useEffect(() => {
    return () => {
      if (result && result.startsWith('blob:')) {
        URL.revokeObjectURL(result)
      }
    }
  }, [result])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">DeskPet Generation</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-1">
          <div className={`card ${generationType === 'advanced' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200' : 'bg-base-100'} shadow transition-all duration-300`}>
            <div className="card-body space-y-4">
              {/* Prompt 输入框 */}
              <div className="form-control w-full">
                <label className="label">
                  <span className={`label-text ${generationType === 'advanced' ? 'text-black font-semibold' : ''}`}>
                    {generationType === 'advanced' ? '✨ Advanced Prompt' : 'Prompt'}
                  </span>
                </label>
                <textarea
                  className={`textarea textarea-bordered min-h-[120px] ${
                    generationType === 'advanced' ? 'border-[#FFD700] focus:border-[#DAA520]' : ''
                  }`}
                  placeholder={generationType === 'advanced' ? "Enter your advanced prompt here..." : "Enter your prompt here..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* 参考图片上传 */}
              <div className="form-control w-full">
                <label className="label">
                  <span className={`label-text ${generationType === 'advanced' ? 'text-black font-semibold' : ''}`}>
                    {generationType === 'advanced' ? '✨ Reference Image' : 'Reference Image'}
                  </span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 ${
                  generationType === 'advanced' ? 'border-[#FFD700]' : 'border-base-300'
                }`}>
                  {referencePreview ? (
                    <div className="space-y-4">
                      <div className="relative w-full aspect-square">
                        <img
                          src={referencePreview}
                          alt="Reference preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`btn btn-outline btn-sm flex-1 ${
                            generationType === 'advanced' ? 'border-[#FFD700] text-black hover:bg-[#FFD700]' : ''
                          }`}
                          onClick={handleClearImage}
                        >
                          Remove
                        </button>
                        <label className={`btn btn-outline btn-sm flex-1 cursor-pointer ${
                          generationType === 'advanced' ? 'border-[#FFD700] text-black hover:bg-[#FFD700]' : ''
                        }`}>
                          Change
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className={`btn btn-outline w-full cursor-pointer ${
                      generationType === 'advanced' ? 'border-[#FFD700] text-black hover:bg-[#FFD700]' : ''
                    }`}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 生成按钮组 */}
              <div className="space-y-2">
                {/* 基础生成按钮 */}
                <button 
                  className="btn btn-primary w-full"
                  onClick={() => {
                    setGenerationType('basic');
                    handleGenerate('basic');
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating && generationType === 'basic' ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Basic Generate'
                  )}
                </button>

                {/* 高级生成按钮 - 仅对高级用户显示 */}
                {userPlan === 'advanced' && (
                  <button 
                    className={`btn w-full ${
                      generationType === 'advanced' 
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#DAA520] hover:to-[#CD853F]' 
                        : 'bg-[#FFD700] hover:bg-[#DAA520]'
                    } text-black font-bold border-[#FFD700] hover:border-[#DAA520]`}
                    onClick={() => {
                      setGenerationType('advanced');
                      handleGenerate('advanced');
                    }}
                    disabled={isGenerating}
                  >
                    {isGenerating && generationType === 'advanced' ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        Advanced Generate
                      </>
                    )}
                  </button>
                )}
              </div>
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
                onClick={handleDownload}
                disabled={result === '/placeholder.svg?height=512&width=512'}
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

