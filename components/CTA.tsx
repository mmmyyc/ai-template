import Image from "next/image";
import config from "@/config";
import Link from "next/link";

import ImageMouseTrail from '@/components/animations/mousetrail';

const images = [
  '/shimejis/Slum Dunk.png',
  '/shimejis/neo.png',
  '/shimejis/Herry botter.png',
  '/shimejis/nezha.png',
  '/shimejis/qianyuqianxun.png',
  '/shimejis/Slum Dunk.png',
  '/shimejis/neo.png',
  '/shimejis/Herry botter.png',
  '/shimejis/nezha.png',
  '/shimejis/qianyuqianxun.png',
];

const CTA = () => {
  return (
    <section className="relative hero overflow-hidden min-h-[90vh] bg-gradient-to-br from-base-300 to-base-200">
      {/* 背景图片 - 调整混合模式和不透明度 */}
      <Image
        src="/landing/three_person.webp"
        alt="Happy Work Environment"
        className="object-cover w-full mix-blend-soft-light opacity-75"
        fill
        priority
        sizes="100vw"
      />

      {/* 鼠标轨迹效果 - 降低背景渐变的不透明度 */}
      <div className="absolute inset-0 bg-gradient-to-br from-base-300/60 to-base-200/60">
        <ImageMouseTrail
          items={images}
          maxNumberOfImages={5}
          distance={10}
          imgClass='sm:w-24 w-20 sm:h-32 h-28 rounded-lg'
          className="h-full"
          fadeAnimation={true}
        />
      </div>

      {/* 内容区域 */}
      <div className="relative z-20 hero-content text-center text-base-content p-8">
        <div className="flex flex-col items-center max-w-2xl">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 leading-tight">
            Transform Your Desktop with AI Companions
          </h2>
          
          <p className="text-lg md:text-xl opacity-90 mb-12 max-w-xl leading-relaxed">
            YCamie brings your favorite characters to life on your screen in minutes. No artistic skills needed - just describe or upload an image, and watch your desktop come alive!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/dashboard" 
              className="btn btn-primary btn-lg px-12 rounded-full"
              title={`${config.appName} dashboard`}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Try Now
            </Link>
            
            <Link 
              href="/store" 
              className="btn btn-outline btn-lg px-12 rounded-full"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Explore Store
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 opacity-80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completely Free
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Regular Updates
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Official {config.appName} Product
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
