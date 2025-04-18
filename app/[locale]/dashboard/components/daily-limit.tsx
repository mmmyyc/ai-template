'use client'

import { useEffect, useState } from 'react'
import apiClient from "@/libs/api";
import { useTranslations } from 'next-intl';

export function DailyLimit() {
  const [usedCount, setUsedCount] = useState(0);
  const [maxCount, setMaxCount] = useState(200);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useTranslations('DailyLimit');

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const response = await apiClient.get('/auth/limit');
        setUsedCount(response.data.used || 0);
        setMaxCount(response.data.max || 200);
      } catch (error) {
        console.error('Failed to fetch AI limit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLimit();
  }, []);

  const handleBilling = async () => {
    setIsLoading(true);

    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-portal",
        {
          returnUrl: window.location.href,
        }
      );

      window.location.href = url;
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };
  if (loading) {
    return null;
  }

  return (
    <div className="daily-limit p-4 bg-base-100 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="font-medium text-sm">{t('title')}</span>
      </div>
      
      <div className="text-sm text-base-content/60 mb-3">
        {t('description')}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-base-200 rounded-full h-2 mb-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(usedCount / maxCount) * 100}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {usedCount}/{maxCount}
        </span>
        <button
          onClick={handleBilling}
          className="text-xs text-primary hover:text-primary-focus font-medium hover:bg-primary/10 px-2 py-1 rounded-lg transition-all duration-200"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            t('upgradeButton')
          )}
        </button>
      </div>
    </div>
  );
} 