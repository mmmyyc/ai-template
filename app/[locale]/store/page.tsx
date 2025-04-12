'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/libs/api';
import Image from 'next/image';
import { downloadGeneratedImage } from "@/app/[locale]/dashboard/utils/download";
import { useRouter } from '@/i18n/navigation';
// import { getSEOTags } from "@/libs/seo";
// import config from "@/config";

// export const metadata = getSEOTags({
//   title: `AI Desktop Pets Store | ${config.appName}`,
//   description: "Browse and download high-quality Shimeji desktop pets created with AI. Personalize your PC with adorable animated characters that interact with your desktop.",
//   keywords: ["desktop pets", "shimeji", "AI pets", "digital companions", "desktop customization"],
//   canonicalUrlRelative: "/store",
//   openGraph: {
//     title: `AI Desktop Pets Store | ${config.appName}`,
//     description: "Browse and download high-quality Shimeji desktop pets created with AI. Personalize your PC with adorable animated characters that interact with your desktop.",
//     url: `https://${config.domainName}/store`,
//   }
// });
interface SharedGeneration {
  id: string;
  prompt: string;
  result: string;
  created_at: string;
  user_name: string;
  type: string;
}

export default function StorePage() {
  const [sharedItems, setSharedItems] = useState<SharedGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isAnyDownloading, setIsAnyDownloading] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9; // 每页显示9个项目，符合3列布局
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const router = useRouter();
  
  useEffect(() => {
    const fetchSharedItems = async () => {
      try {
        setLoading(true);
        // 添加分页参数
        const response = await apiClient.get('/generate/shared', {
          params: {
            page: currentPage,
            limit: itemsPerPage
          }
        });
        
        if (response.data) {
          setSharedItems(response.data.shared_items || []);
          // 如果后端返回了总数，使用它
          if (response.data.total !== undefined) {
            setTotalItems(response.data.total);
          } else {
            // 否则假设当前返回的是所有项目
            setTotalItems(response.data.shared_items?.length || 0);
          }
        }
      } catch (err) {
        setError('Failed to load shared items');
        console.error('Error fetching shared items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItems();
  }, [currentPage]); // 页码变化时重新获取数据

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

  // 分页控件函数
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 滚动到顶部
  };

  // 生成页码按钮
  const renderPagination = () => {
    // 如果总页数小于2，不显示分页
    if (totalPages <= 1) return null;

    const pages = [];
    // 确定显示哪些页码按钮 (最多显示5个)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 调整以确保显示5个按钮(如果有足够的页数)
    if (endPage - startPage < 4 && totalPages > 5) {
      startPage = Math.max(1, endPage - 4);
    }

    // 添加首页按钮
    if (startPage > 1) {
      pages.push(
        <button 
          key="first" 
          onClick={() => handlePageChange(1)}
          className="btn btn-sm btn-ghost"
        >
          1
        </button>
      );
      // 添加省略号
      if (startPage > 2) {
        pages.push(<span key="dots1" className="px-2">...</span>);
      }
    }

    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`btn btn-sm ${currentPage === i ? 'btn-primary' : 'btn-ghost'}`}
        >
          {i}
        </button>
      );
    }

    // 添加尾页按钮
    if (endPage < totalPages) {
      // 添加省略号
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="px-2">...</span>);
      }
      pages.push(
        <button 
          key="last" 
          onClick={() => handlePageChange(totalPages)}
          className="btn btn-sm btn-ghost"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-1 mt-8">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-sm btn-ghost"
        >
          &laquo;
        </button>
        {pages}
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-sm btn-ghost"
        >
          &raquo;
        </button>
      </div>
    );
  };

  const handleCardClick = (id: string) => {
    router.push(`/store/${id}`);
  };
  
  if (loading && currentPage === 1) {
    return (
      <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Shimeji Store</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl">
                <div className="skeleton h-64 w-full" />
                <div className="card-body">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
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

  if (sharedItems.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Shimeji Store</h1>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No shared creations yet</h3>
          <p className="text-gray-600">Be the first to share your creations in the store!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()} 
            className="btn btn-circle btn-ghost"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Shimeji Store</h1>
        </div>
        <p className="text-gray-600 mb-8">Download amazing Shimeji creations shared by our community members.</p>
        
        {loading && <div className="text-center py-4"><span className="loading loading-spinner loading-md"></span></div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedItems.map((item) => (
            <div 
              key={item.id} 
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => handleCardClick(item.id)}
            >
              <figure className="relative h-64">
                <Image
                  src={item.result}
                  alt={item.prompt}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`badge ${item.type === 'advanced' ? 'badge-warning' : 'badge-primary'} badge-sm`}>
                    {item.type === 'advanced' ? 'Advanced' : 'Basic'}
                  </span>
                </div>
              </figure>
              <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item.result, item.id, item.type);
                  }}
                  disabled={downloading === item.id || isAnyDownloading}
                  className="btn btn-circle btn-sm bg-base-100 hover:bg-base-200 download-btn"
                >
                  {downloading === item.id ? (
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
              <div className="card-body">
                <p className="font-medium prompt-text">{item.prompt}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm opacity-70">
                    Shared by: {item.user_name || 'Anonymous'}
                  </p>
                  <p className="text-sm opacity-70">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 分页控件 */}
        {renderPagination()}
      </div>
    </div>
  );
}