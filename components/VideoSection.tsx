import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function VideoSection() {
  const t = useTranslations('VideoSection');
  
  return (
    <section className="relative py-20 bg-gradient-to-b from-base-200/50 to-base-100">
      <div className="container mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        
        {/* 视频容器 */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-base-300">
            {/* 16:9 宽高比容器 */}
            <div className="relative pt-[56.25%]">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src={t('videoUrl')}
                title={t('videoTitle')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
            </div>
          </div>
          
          {/* 视频下方的行动号召 */}
          <div className="text-center mt-8">
            <Link 
              href="/dashboard" 
              className="btn btn-primary btn-lg px-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:from-blue-700 hover:to-purple-700"
            >
              {t('tryNowButton')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 