'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/libs/api';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import toast from "react-hot-toast";
import { downloadGeneratedImage } from "@/app/comfy/utils/download";

interface ImageGeneration {
  id: string;
  prompt: string;
  result: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<ImageGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/generate/history');
        setGenerations(response.data.generations);
      } catch (err) {
        setError('Failed to load generation history');
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDownload = async (result: string, id: string) => {
    if (!result) return;
    setDownloading(id);
    toast.success('Downloading images');   
    
    try {
      await downloadGeneratedImage({
        imageUrl: result,
        fileName: 'shime.zip'
      });
    } catch (error) {
      // 错误已经在工具函数中处理
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
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
                  </figure>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleDownload(gen.result, gen.id)}
                      disabled={downloading === gen.id}
                      className="btn btn-circle btn-sm bg-base-100 hover:bg-base-200"
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
                <p className="font-medium">{gen.prompt}</p>
                {gen.error && (
                  <p className="text-sm text-error">{gen.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 