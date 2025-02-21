'use client'

import React, { useState, useEffect } from 'react'
import apiClient from "@/libs/api";
import { AxiosError } from 'axios'
import { useRouter } from "next/navigation";
import config from "@/config";
import toast from "react-hot-toast";
import Image from 'next/image'
import { downloadGeneratedImage } from "@/app/comfy/utils/download";

export default function ImageGenerationPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState<string>("")
  const [result, setResult] = useState<string | null>(null)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [userPlan, setUserPlan] = useState<'free'| 'basic' | 'advanced'>('free')
  const [generationType, setGenerationType] = useState<'basic' | 'advanced'>('basic')

  // 添加验证提示状态
  const [promptError, setPromptError] = useState<string>("")
  const [wordCount, setWordCount] = useState<number>(0)
  const MAX_WORDS = 70

  // 计算单词数
  const countWords = (text: string): number => {
    // 将文本按空格和标点符号分割，过滤掉空字符串
    return text.trim().split(/[\s.,!?()'";\-:&@%]+/).filter(word => word.length > 0).length;
  };

  // 验证输入是否为英文和单词限制
  const validatePrompt = (value: string) => {
    // 更新单词计数
    const words = countWords(value);
    setWordCount(words);
    
    // 检查单词数限制
    if (words > MAX_WORDS) {
      setPromptError(`Word limit exceeded (${words}/${MAX_WORDS})`);
      return false;
    }

    // 英文字符、数字、空格和常用标点符号的正则表达式
    const englishRegex = /^[a-zA-Z0-9\s.,!?()'";\-:&@%]*$/;
    if (!englishRegex.test(value)) {
      setPromptError("Please enter English characters only");
      return false;
    }

    setPromptError("");
    return true;
  };

  // 添加文件大小检查函数
  const checkTotalSize = (text: string, file: File | null): { isValid: boolean; message: string } => {
    const textSize = new Blob([text]).size;
    const fileSize = file ? file.size : 0;
    const totalSize = textSize + fileSize;
    const maxSize = 1024 * 1024; // 1MB in bytes

    if (totalSize > maxSize) {
      const textSizeInKB = (textSize / 1024).toFixed(1);
      const fileSizeInKB = (fileSize / 1024).toFixed(1);
      const totalSizeInKB = (totalSize / 1024).toFixed(1);
      const message = `Total size (${totalSizeInKB}KB) exceeds 1MB limit.\nText: ${textSizeInKB}KB\nImage: ${fileSizeInKB}KB`;
      return { isValid: false, message };
    }
    return { isValid: true, message: '' };
  };

  // 修改handlePromptChange函数
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // 检查单词数
    const words = countWords(value);
    if (words > MAX_WORDS) {
      setPromptError(`Word limit exceeded (${words}/${MAX_WORDS})`);
      return;
    }

    // 检查英文字符
    if (!validatePrompt(value)) {
      setPrompt(value); // 仍然更新值以显示错误状态
      return;
    }

    // 检查总大小
    const sizeCheck = checkTotalSize(value, referenceImage);
    if (!sizeCheck.isValid) {
      toast.error(sizeCheck.message);
      return;
    }

    setPrompt(value);
  };

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

  // 修改handleImageUpload函数
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // 检查总大小
    const sizeCheck = checkTotalSize(prompt, file);
    if (!sizeCheck.isValid) {
      toast.error(sizeCheck.message);
      return;
    }

    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
    }

    setReferenceImage(file);
    setReferencePreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 修改handleDrop函数
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // 检查总大小
    const sizeCheck = checkTotalSize(prompt, file);
    if (!sizeCheck.isValid) {
      toast.error(sizeCheck.message);
      return;
    }

    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
    }

    setReferenceImage(file);
    setReferencePreview(URL.createObjectURL(file));
  };

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

  // 修改handleGenerate函数
  const handleGenerate = async (type: 'basic' | 'advanced' = 'basic') => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!validatePrompt(prompt)) {
      toast.error("Please use English characters only");
      return;
    }

    if (isGenerating) {
      toast.error('Please wait for the current generation to complete');
      return;
    }

    // 最终检查总大小
    const sizeCheck = checkTotalSize(prompt, referenceImage);
    if (!sizeCheck.isValid) {
      toast.error(sizeCheck.message);
      return;
    }

    setIsGenerating(true);
    setGenerationType(type);
    
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
      toast.loading('Starting image generation...', { id: 'generate' });
      const response = await apiClient.post('/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.taskId) {
        // 开始轮询检查任务状态
        toast.loading('Processing your request...', { id: 'generate' });
        const pollResult = await pollStatus(response.data.taskId);
        
        if (pollResult.success) {
          setResult(pollResult.result);
          toast.success(`${type === 'advanced' ? 'Advanced' : 'Basic'} image generated successfully`, { id: 'generate' });
        } else {
          toast.error(pollResult.error, { id: 'generate' });
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
        toast.error(errorMessage, { id: 'generate' })
      } else {
        toast.error('Failed to generate image. Please try again.', { id: 'generate' })
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
        })
    } catch (error) {
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
                    <span className={`ml-2 text-sm ${
                      wordCount > MAX_WORDS ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      ({wordCount}/{MAX_WORDS} words)
                    </span>
                  </label>
                  <textarea
                    className={`w-full rounded-lg transition-all duration-200 min-h-[100px] p-3 text-sm ${
                      generationType === 'advanced' 
                        ? 'border-2 border-amber-400 focus:border-amber-500 focus:ring-amber-500'
                        : 'border border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    } ${promptError ? 'textarea-error' : ''}`}
                    placeholder={generationType === 'advanced' 
                      ? "Describe your dream pet in detail (max 70 words)..."
                      : "Describe your pet idea (max 70 words)..."}
                    value={prompt}
                    onChange={handlePromptChange}
                  />
                  {promptError && (
                    <div className="text-error text-sm mt-1">
                      {promptError}
                    </div>
                  )}
                </div>

                {/* 参考图片上传 */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Reference Image</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-base-300 rounded-lg p-4 text-center hover:border-primary transition-colors min-h-[300px] flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {referencePreview ? (
                      <div className="relative w-full h-[280px] group">
                        <Image
                          src={referencePreview}
                          alt="Reference preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                document.getElementById('file-upload')?.click();
                              }}
                              className="btn btn-sm btn-primary"
                            >
                              Replace
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClearImage();
                              }}
                              className="btn btn-sm btn-error"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="w-full h-full flex flex-col items-center justify-center space-y-4"
                      >
                        <div className="flex justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-base-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-base-content/60">Drag and drop your image here, or click to select</p>
                          <p className="text-sm text-base-content/40 mt-2">Supports: JPG, PNG, WebP (Max: 1MB)</p>
                        </div>
                      </button>
                    )}
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).value = '';
                      }}
                    />
                  </div>
                </div>

                {/* 生成按钮组 */}
                <div className="space-y-2">
                  <button
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !prompt.trim() || !referenceImage || promptError || isGenerating
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isGenerating && generationType === 'basic'
                          ? 'bg-primary cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-focus text-white'
                    }`}
                    onClick={() => {
                      if (!referenceImage) {
                        toast.error('Please upload an image first');
                        return;
                      }
                      if (!prompt.trim()) {
                        toast.error('Please enter a prompt first');
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
                        !prompt.trim() || !referenceImage || promptError || isGenerating
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isGenerating && generationType === 'advanced'
                            ? 'bg-amber-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white'
                      }`}
                      onClick={() => {
                        if (!referenceImage) {
                          toast.error('Please upload an image first');
                          return;
                        }
                        if (!prompt.trim()) {
                          toast.error('Please enter a prompt first');
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="inline-block animate-bounce bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm font-medium">Creating your perfect pet...</p>
                      <p className="text-gray-400 text-xs mt-1">This may take a minute</p>
                      
                      {/* 提示框 */}
                      <div className="mt-6 max-w-[280px] mx-auto bg-blue-50/80 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-medium text-blue-900">Pro Tip</span>
                        </div>
                        <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                          Keep your description simple and focused on core features
                        </p>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center text-green-700 bg-white/50 rounded-md p-1.5">
                            <svg className="w-3 h-3 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <code className="text-green-700">cute chibi fox, simple design</code>
                          </div>
                          <div className="flex items-center text-red-700 bg-white/50 rounded-md p-1.5">
                            <svg className="w-3 h-3 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <code className="text-red-700">full body with background</code>
                          </div>
                        </div>
                      </div>
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

