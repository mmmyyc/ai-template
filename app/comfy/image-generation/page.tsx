'use client'

import React, { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import apiClient from "@/libs/api";
import { AxiosError } from 'axios'
import { useRouter } from "next/navigation";
import config from "@/config";
import toast from "react-hot-toast";
import Image from 'next/image'
import { downloadGeneratedImage } from "@/app/comfy/utils/download";

export default function ImageGenerationPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<string | null>(null)
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

  // 轮询任务状态
  const pollStatus = async (taskId: string, maxAttempts = 20) => {
    let attempts = 0;
    await new Promise(resolve => setTimeout(resolve, 40000)); 
    while (attempts < maxAttempts) {
      try {
        const statusResponse = await apiClient.get(`/generate/status?taskId=${taskId}`);
        const status = statusResponse.data.status;

        if (status === 'completed') {
          return {
            success: true,
            result: statusResponse.data.result
          };
        }

        if (status === 'failed') {
          return {
            success: false,
            error: statusResponse.data.error || 'Generation failed'
          };
        }
        // 使用指数退避增加轮询间隔
        const backoffTime = Math.min(1000 * Math.pow(2, attempts), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        attempts++;
      } catch (error) {
        console.error('Status check error:', error);
        return {
          success: false,
          error: 'Failed to check generation status'
        };
      }
    }

    return {
      success: false,
      error: 'Generation timed out'
    };
  };

  // 处理图片生成
  const handleGenerate = async (type: 'basic' | 'advanced' = 'basic') => {
    if (!prompt) {
      toast.error('Please enter a prompt')
      return
    }

    if (isGenerating) {
      toast.error('Please wait for the current generation to complete')
      return
    }

    setIsGenerating(true)
    setGenerationType(type)
    
    try {
      // 清除之前的结果
      if (result) {
        URL.revokeObjectURL(result)
        setResult(null)
      }

      const formData = new FormData()
      formData.append('prompt', prompt)
      if (referenceImage) {
        formData.append('reference_image', referenceImage)
      }
      
      formData.append('type', type);
      toast.success(type + ' Generation started');
      const response = await apiClient.post('/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.taskId) {
        // 开始轮询检查任务状态
        const pollResult = await pollStatus(response.data.taskId);
        
        if (pollResult.success) {
          setResult(pollResult.result);
          toast.success(`${type === 'advanced' ? 'Advanced' : 'Basic'} image generated successfully`);
        } else {
          toast.error(pollResult.error);
        }
      } else {
        throw new Error('Invalid response format')
      }

    } catch (error) {
      console.error('Generation error:', error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          router.push(config.auth.loginUrl)
          return
        }
        const errorMessage = error.response?.data instanceof Blob 
          ? await error.response.data.text() 
          : error.response?.data?.error || 'Failed to generate image'
        console.error('Error details:', errorMessage)
        toast.error(errorMessage)
      } else {
        toast.error('Failed to generate image. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (result) {
        URL.revokeObjectURL(result)
      }
    }
  }, [result])

  // 下载生成的图片
  const handleDownload = async () => {
    if (!result) return;
    
    try {
      await downloadGeneratedImage({
        imageUrl: result,
        type: generationType,
        fileName: 'shime.zip'
      });
    } catch (error) {
      // 错误已经在工具函数中处理
      console.error('Download failed:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            DeskPet Generation
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Create your unique desktop companion with AI</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧控制面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm hover:shadow transition-all duration-300">
              <div className="p-4 space-y-4">
                {/* Prompt 输入框 */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${
                    generationType === 'advanced' ? 'text-amber-600' : 'text-gray-700'
                  }`}>
                    {generationType === 'advanced' ? '✨ Advanced Prompt' : 'Prompt'}
                  </label>
                  <textarea
                    className={`w-full rounded-lg transition-all duration-200 min-h-[100px] p-3 text-sm ${
                      generationType === 'advanced' 
                        ? 'border-2 border-amber-400 focus:border-amber-500 focus:ring-amber-500'
                        : 'border border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder={generationType === 'advanced' 
                      ? "Describe your dream pet in detail..."
                      : "Describe your pet idea..."}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                {/* 参考图片上传 */}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${
                    generationType === 'advanced' ? 'text-amber-600' : 'text-gray-700'
                  }`}>
                    {generationType === 'advanced' ? '✨ Reference Image' : 'Reference Image'}
                  </label>
                  <div className={`rounded-lg transition-all duration-200 ${
                    generationType === 'advanced'
                      ? 'border-2 border-dashed border-amber-400'
                      : 'border-2 border-dashed border-gray-200'
                  }`}>
                    {referencePreview ? (
                      <div className="p-3 space-y-3">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={referencePreview}
                            alt="Reference preview"
                            className="object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            className={`flex-1 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                              generationType === 'advanced'
                                ? 'text-amber-600 border border-amber-400 hover:bg-amber-50'
                                : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={handleClearImage}
                          >
                            Remove
                          </button>
                          <label className={`flex-1 py-1.5 text-center rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                            generationType === 'advanced'
                              ? 'text-amber-600 border border-amber-400 hover:bg-amber-50'
                              : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                      <label className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                        <Upload className={`h-6 w-6 mb-2 ${
                          generationType === 'advanced' ? 'text-amber-500' : 'text-gray-400'
                        }`} />
                        <span className={`text-sm ${
                          generationType === 'advanced' ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          Upload Reference Image
                        </span>
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
                  <button 
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isGenerating
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={() => {
                      if (isGenerating) {
                        toast.error('Please wait for the current generation to complete');
                        return;
                      }
                      setGenerationType('basic');
                      handleGenerate('basic');
                    }}
                    disabled={isGenerating}
                  >
                    {isGenerating && generationType === 'basic' ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Pet'
                    )}
                  </button>

                  {userPlan === 'advanced' && (
                    <button 
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isGenerating && generationType === 'advanced'
                          ? 'bg-amber-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white'
                      }`}
                      onClick={() => {
                        if (isGenerating) {
                          toast.error('Please wait for the current generation to complete');
                          return;
                        }
                        setGenerationType('advanced');
                        handleGenerate('advanced');
                      }}
                      disabled={isGenerating}
                    >
                      {isGenerating && generationType === 'advanced' ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        <>✨ Advanced Generate</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧图片显示区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm hover:shadow transition-all duration-300 overflow-hidden">
              <div className="w-full aspect-[4/3] relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="inline-block animate-bounce bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm font-medium">Creating your perfect pet...</p>
                      <p className="text-gray-400 text-xs mt-1">This may take a minute</p>
                    </div>
                  </div>
                ) : result ? (
                  <Image
                    src={result}
                    alt="Generated pet"
                    className="object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="inline-block bg-gray-100 rounded-full p-3 mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm font-medium">Ready to create your pet</p>
                      <p className="text-gray-400 text-xs mt-1">Enter a prompt and click generate to start</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 下载按钮 */}
              <div className="p-4 border-t border-gray-100">
                <button 
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !result || isGenerating
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  }`}
                  onClick={handleDownload}
                  disabled={!result || isGenerating}
                >
                  {!result ? 'Generate a pet first' : 'Download Your Pet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

