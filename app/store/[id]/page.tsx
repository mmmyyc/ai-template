'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/libs/api';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadGeneratedImage } from "@/app/dashboard/utils/download";
// import config from "@/config";
// import { getSEOTags } from "@/libs/seo";

// export const metadata = async ({ params }: { params: { id: string } }) => {
//   // 可以根据ID从数据库获取产品信息，这里简化处理
//   const productId = params.id;
  
//   return getSEOTags({
//     title: `Shimeji Pet Details | Download AI Desktop Pet | ${config.appName}`,
//     description: "View and download this unique AI-generated desktop pet. Get your own interactive Shimeji companion that brings life to your desktop environment.",
//     keywords: ["shimeji download", "AI pet", "desktop companion", "interactive pet", "desktop customization"],
//     // 为每个产品页面设置唯一的规范链接
//     canonicalUrlRelative: `/store/${productId}`,
//     openGraph: {
//       title: `Shimeji Pet Details | Download AI Desktop Pet | ${config.appName}`,
//       description: "View and download this unique AI-generated desktop pet. Get your own interactive Shimeji companion that brings life to your desktop environment.",
//       url: `https://${config.domainName}/store/${productId}`,
//     }
//   });
// };
interface SharedGeneration {
  id: string;
  prompt: string;
  result: string;
  created_at: string;
  user_name: string;
  type: string;
}

interface TwitterShareProps {
  isOpen: boolean;
  onClose: () => void;
  generation: SharedGeneration | null;
  pageUrl: string;
}

// Twitter分享弹窗组件
const TwitterShareModal = ({ isOpen, onClose, generation, pageUrl }: TwitterShareProps) => {
  const [tweetText, setTweetText] = useState('');
  const [tags, setTags] = useState<string[]>(['Shimeji', 'AI', 'YCamie']);
  
  useEffect(() => {
    if (generation) {
      setTweetText(`Just Created: ${generation.prompt} as Your Desktop Companion!`);
      
      // Extract possible tags from prompt
      const promptWords = generation.prompt.split(' ');
      const possibleTags = promptWords
        .filter(word => word.length > 3)
        .slice(0, 2)
        .map(word => word.replace(/[^\w]/g, ''));
      
      setTags(['Shimeji', 'AI', 'YCamie', ...possibleTags]);
    }
  }, [generation]);
  
  const handleTweetTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweetText(e.target.value);
  };
  
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value.replace(/[^\w]/g, '');
    setTags(newTags);
  };
  
  const addTag = () => {
    setTags([...tags, '']);
  };
  
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  
  const generateTweet = () => {
    let formattedTweet = tweetText + '\n\n';
    
    formattedTweet += 'Try it yourself: ' + pageUrl + '\n\n';
    
    formattedTweet += tags.map(tag => `#${tag}`).join(' ');
    
    return formattedTweet;
  };
  
  const handleShareToTwitter = () => {
    const formattedTweet = generateTweet();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(formattedTweet)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };
  
  const previewTweet = generateTweet().split('\n').map((line, i) => (
    <div key={i} className={line.startsWith('#') ? 'text-blue-500' : ''}>
      {line || <br />}
    </div>
  ));
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Share to Twitter</h3>
            <button onClick={onClose} className="btn btn-sm btn-circle">✕</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="font-medium block mb-2">Main Text:</label>
                <textarea 
                  value={tweetText} 
                  onChange={handleTweetTextChange}
                  className="w-full border rounded p-2 h-64"
                  placeholder="Write your tweet text..."
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="font-medium block mb-2">Hashtags:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex items-center">
                      <span className="mr-1">#</span>
                      <input 
                        type="text" 
                        value={tag} 
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        className="border rounded p-1 w-24"
                      />
                      <button 
                        onClick={() => removeTag(index)}
                        className="ml-1 text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addTag}
                    className="btn btn-sm btn-outline btn-xs"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-bold">YCamie</div>
                    <div className="text-gray-500">@ycamie</div>
                  </div>
                </div>
                <div className="tweet-preview mb-3">
                  {previewTweet}
                </div>
                {generation?.result && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={generation.result}
                      alt={generation.prompt || "Shimeji preview"}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Twitter doesn't support direct image uploads from websites. For best results, download the image first, then attach it to your tweet manually.</span>
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                onClick={() => {
                  if (generation?.result) {
                    const link = document.createElement('a');
                    link.href = generation.result;
                    link.download = 'shimeji-image.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                className="btn btn-outline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Image
              </button>
              
              <div>
                <button 
                  onClick={onClose}
                  className="btn btn-outline mr-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleShareToTwitter}
                  className="btn btn-primary"
                >
                  Share to Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ShimejiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [generation, setGeneration] = useState<SharedGeneration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [isTwitterModalOpen, setIsTwitterModalOpen] = useState(false);

  useEffect(() => {
    // Get the current page URL for sharing
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }

    const fetchGenerationDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/generate/shared`, {
          params: { id }
        });
        
        if (response.data) {
          setGeneration(response.data);
        } else {
          setError('Unable to fetch generation details');
        }
      } catch (err) {
        console.error('Failed to fetch generation details:', err);
        setError('Failed to fetch generation details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGenerationDetails();
    }
  }, [id]);

  const handleDownload = async () => {
    if (!generation?.result) return;
    
    setDownloading(true);
    try {
      await downloadGeneratedImage({
        imageUrl: generation.result,
        fileName: 'shime.zip',
        type: generation.type
      });
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenTwitterModal = () => {
    setIsTwitterModalOpen(true);
  };

  const handleCloseTwitterModal = () => {
    setIsTwitterModalOpen(false);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={handleBack} className="btn btn-ghost mb-6">
            &larr; Back to Store
          </button>
          <div className="card bg-base-100 shadow-xl">
            <Skeleton className="h-96 w-full" />
            <div className="card-body">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={handleBack} className="btn btn-ghost mb-6">
            &larr; Back to Store
          </button>
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error || 'Shimeji not found'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={handleBack} className="btn btn-ghost mb-6">
          &larr; Back to Store
        </button>
        
        <div className="card bg-base-100 shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="relative h-96">
                <Image
                  src={generation.result}
                  alt={generation.prompt}
                  fill
                  className="object-contain bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4"
                />
              </div>
            </div>
            <div className="md:w-1/2 p-6">
              <div className="mb-4">
                <span className={`badge ${generation.type === 'advanced' ? 'badge-warning' : 'badge-primary'}`}>
                  {generation.type === 'advanced' ? 'Advanced Mode' : 'Basic Mode'}
                </span>
              </div>
              
              <h2 className="text-xl font-bold mb-4">Prompt</h2>
              <p className="mb-6">{generation.prompt}</p>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm opacity-70">
                    Shared by: {generation.user_name || 'Anonymous'}
                  </p>
                  <p className="text-sm opacity-70">
                    Created on: {new Date(generation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn btn-primary w-full"
                >
                  {downloading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                        />
                      </svg>
                      Download this Shimeji
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleOpenTwitterModal}
                  className="btn btn-outline btn-info w-full"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Share on Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <TwitterShareModal 
        isOpen={isTwitterModalOpen}
        onClose={handleCloseTwitterModal}
        generation={generation}
        pageUrl={pageUrl}
      />
    </div>
  );
} 