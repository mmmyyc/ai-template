'use client'

import React, { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import apiClient from "@/libs/api";
import { AxiosError } from 'axios'
import { useRouter } from "next/navigation";
import config from "@/config";
import toast from "react-hot-toast";
import Image from 'next/image'

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

    setIsGenerating(true)
    
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
    if (!result) return
    
    try {
      // 获取预签名 URL
      const { data: { signedUrl } } = await apiClient.post('/get-signed-url', {
        imageUrl: result
      });

      if (!signedUrl) {
        throw new Error('Failed to get signed URL');
      }
      // 使用预签名 URL 获取图片数据
      const response = await fetch(signedUrl);
      const imageBlob = await response.blob();
      console.log('imageBlob',imageBlob);

      // 创建 FormData
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.png');
      formData.append('type', generationType);
      // 发送切割请求并下载 zip
      const splitResponse = await apiClient.post('/split-image', formData);
      if (!splitResponse.data?.zipBase64) {
        throw new Error('Invalid response format');
      }

      // 将 base64 转换为 Blob
      const binaryString = atob(splitResponse.data.zipBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const zipBlob = new Blob([bytes], { type: 'application/zip' });
      
      // 创建下载链接
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'shime.zip';
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Images downloaded successfully');
    } catch (error) {
      console.error('Error downloading images:', error);
      toast.error('Failed to download images');
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">DeskPet Generation</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧控制面板 */}
        <div className="lg:col-span-1">
          <div className={`card shadow transition-all duration-300`}>
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
                        <Image
                          src={referencePreview}
                          alt="Reference preview"
                          className="w-full h-full object-contain rounded-lg"
                          width={512}
                          height={512}
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
              {/* 图片加载状态 */}
              {isGenerating ? (
                <div className="w-full h-[512px] flex items-center justify-center bg-base-200">
                  <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="text-base-content/60">Generating your image...</p>
                  </div>
                </div>
              ) : result ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <Image
                  src={result}
                  alt="Generated image"
                  className="w-full h-[512px] object-contain rounded-lg"
                  onError={() => {
                    console.error('Image load error')
                    setResult(null)  // 清除错误的图片URL
                  }}
                  width={512}
                  height={512}
                />
              ) : (
                // 默认占位内容
                <div className="w-full h-[512px] flex items-center justify-center bg-base-200">
                  <div className="text-center text-base-content/60">
                    <p>No image generated yet</p>
                    <p className="text-sm mt-2">Enter a prompt and click generate to start</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 flex justify-end">
              <button 
                className="btn btn-primary"
                onClick={handleDownload}
                disabled={!result || isGenerating}
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

