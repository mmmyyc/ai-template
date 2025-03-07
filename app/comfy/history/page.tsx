'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/libs/api';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadGeneratedImage } from "@/app/comfy/utils/download";
// import { getSEOTags } from "@/libs/seo";
// import config from "@/config";

// export const metadata = getSEOTags({
//   title: `Your Generated Pets History | ${config.appName}`,
//   description: "View your previously generated AI desktop pets. Browse your creation history and download your favorite Shimeji characters anytime.",
//   keywords: ["pet history", "generated pets", "AI creations", "desktop pets gallery", "shimeji collection"],
//   canonicalUrlRelative: "/comfy/history",
//   openGraph: {
//     title: `Your AI Pet Creation History | ${config.appName}`,
//     description: "Access all your previously generated desktop pets. Download and manage your Shimeji collection.",
//     url: `https://${config.domainName}/comfy/history`,
//   }
// });
interface ImageGeneration {
  id: string;
  prompt: string;
  result: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  type: string;
  is_shared: boolean;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isAnyDownloading, setIsAnyDownloading] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const [unsharing, setUnsharing] = useState<string | null>(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9); // 每页显示9个项目
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/generate/history', {
          params: {
            page: currentPage,
            limit: itemsPerPage
          }
        });
        
        setGenerations(response.data.generations);
        
        // 设置分页信息
        if (response.data.total) {
          setTotalItems(response.data.total);
          // 直接使用后端返回的总页数
          setTotalPages(response.data.totalPages || Math.ceil(response.data.total / itemsPerPage));
        }
      } catch (err) {
        setError('Failed to load generation history');
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage, itemsPerPage]);

  const handleDownload = async (result: string, id: string, type: string) => {
    if (!result) return;
    setDownloading(id);
    setIsAnyDownloading(true);
    
    try {
        await downloadGeneratedImage({
          imageUrl: result,
          fileName: 'shime.zip',
          type: type
        })
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
      setIsAnyDownloading(false);
    }
  };

  const handleShare = async (id: string) => {
    if (sharing) return;
    setSharing(id);
    
    try {
      await apiClient.post(`/generate/share`, { generationId: id });
      // 更新本地状态，标记为已分享
      setGenerations(prev => 
        prev.map(gen => 
          gen.id === id ? { ...gen, is_shared: true } : gen
        )
      );
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setSharing(null);
    }
  };

  const handleCancelShare = async (id: string) => {
    if (unsharing) return;
    setUnsharing(id);
    
    try {
      await apiClient.delete(`/generate/share`, { 
        data: { generationId: id } 
      });
      // Update local state to mark as unshared
      setGenerations(prev => 
        prev.map(gen => 
          gen.id === id ? { ...gen, is_shared: false } : gen
        )
      );
    } catch (error) {
      console.error('Unshare failed:', error);
    } finally {
      setUnsharing(null);
    }
  };

  // 页面导航函数
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 生成页码数组
  const getPaginationNumbers = () => {
    const pages = [];
    const maxDisplayedPages = 5; // 最多显示5个页码
    
    if (totalPages <= maxDisplayedPages) {
      // 如果总页数少于最大显示页码数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 否则，显示当前页码附近的页码
      let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
      let endPage = startPage + maxDisplayedPages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxDisplayedPages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Generation History</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl">
                <Skeleton className="h-64 w-full" />
                <div className="card-body">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Generation History</h1>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No generations yet</h3>
          <p className="text-gray-600">Start generating some images to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Generation History</h1>
        
        {/* 显示总项目数和当前页 */}
        {totalItems > 0 && (
          <div className="text-sm text-gray-500 mb-4">
            Total {totalItems} generated items, current page {currentPage}, total {totalPages}
          </div>
        )}
        
        {loading && currentPage > 1 && (
          <div className="flex justify-center my-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((gen) => (
              <div key={gen.id} className="card bg-base-100 shadow-xl">
                {gen.status === 'completed' ? (
                  <>
                    <figure className="relative h-64">
                      <Image
                        src={gen.result}
                        alt={gen.prompt}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`badge ${gen.type === 'advanced' ? 'badge-warning' : 'badge-primary'} badge-sm`}>
                          {gen.type === 'advanced' ? 'Advanced' : 'Basic'}
                        </span>
                      </div>
                    </figure>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => gen.is_shared ? handleCancelShare(gen.id) : handleShare(gen.id)}
                        disabled={(sharing === gen.id) || (unsharing === gen.id)}
                        title={gen.is_shared ? "Cancel sharing" : "Share to store"}
                        className={`btn btn-circle btn-sm ${gen.is_shared ? 'bg-success text-white' : 'bg-base-100 hover:bg-base-200'}`}
                      >
                        {sharing === gen.id || unsharing === gen.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(gen.result, gen.id, gen.type)}
                        disabled={downloading === gen.id || isAnyDownloading}
                        className="btn btn-circle btn-sm bg-base-100 hover:bg-base-200 download-btn"
                      >
                        {downloading === gen.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4" 
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
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-base-200">
                    {gen.status === 'failed' ? (
                      <span className="text-error">Generation failed</span>
                    ) : (
                      <span className="loading loading-spinner loading-lg"></span>
                    )}
                  </div>
                )}
                <div className="card-body">
                  <p className="text-sm opacity-70">
                    {new Date(gen.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-medium prompt-text">{gen.prompt}</p>
                  {gen.error && (
                    <p className="text-sm text-error">{gen.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 分页控件 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="join">
              <button 
                className="join-item btn btn-sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                «
              </button>
              
              {getPaginationNumbers().map((page) => (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                  onClick={() => goToPage(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              ))}
              
              <button 
                className="join-item btn btn-sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 