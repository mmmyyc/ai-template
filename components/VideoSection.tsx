import React from 'react';

export default function VideoSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-base-200/50 to-base-100">
      <div className="container mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See How It Works
          </h2>
          <p className="text-base-content/60 max-w-2xl mx-auto">
            Watch our quick tutorial to learn how to create your own desktop pet in minutes
          </p>
        </div>
        
        {/* 视频容器 */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-base-300">
            {/* 16:9 宽高比容器 */}
            <div className="relative pt-[56.25%]">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/yR0b9UopUSM?si=uOIXDfMwwMiCw8mJ" 
                title="Getting Started with YCamie" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
            </div>
          </div>
          
          {/* 视频下方的行动号召 */}
          <div className="text-center mt-8">
            <a 
              href="/comfy" 
              className="btn btn-primary btn-lg px-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:from-blue-700 hover:to-purple-700"
            >
              Try It Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 