import Image from "next/image";
import config from "@/config";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative hero overflow-hidden min-h-[90vh]">
      <Image
        src="/cta-pets-bg.jpg"
        alt="快乐的工作环境"
        className="object-cover w-full brightness-50"
        fill
        priority
      />
      <div className="relative hero-overlay bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-2xl">
          <div className="w-20 h-20 mb-8">
            <Image
              src="/mascot.png"
              alt="桌面宠物吉祥物"
              width={80}
              height={80}
              className="w-full h-full object-contain animate-bounce"
            />
          </div>

          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 leading-tight">
            为您的数字生活增添一抹温暖
          </h2>
          
          <p className="text-lg md:text-xl opacity-90 mb-12 max-w-xl leading-relaxed">
            立即下载您的专属桌面伙伴，让工作充满欢乐与温情。数百种可爱的角色等待与您相遇！
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link 
              href="/comfy" 
              className="btn btn-primary btn-lg px-12 rounded-full bg-white hover:bg-blue-50 text-blue-600 border-none"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              立即体验
            </Link>
            
            <Link 
              href="/store" 
              className="btn btn-outline btn-lg px-12 rounded-full text-white hover:bg-white/20 border-2"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              探索商店
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              完全免费使用
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              持续更新内容
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {config.appName} 官方出品
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
