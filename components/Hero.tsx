import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 font-sans">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start">
            <h1 className="font-bold text-4xl md:text-6xl tracking-tight mb-8 text-gray-900">
              遇见您的桌面好伙伴
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-normal leading-relaxed mb-12">
              一个可爱的虚拟伙伴，陪伴您的每一刻。让工作学习充满乐趣，为您的数字生活增添一抹温暖的色彩。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                href="/download" 
                className="btn btn-primary btn-lg px-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:from-blue-700 hover:to-purple-700"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                免费下载
              </Link>
              <Link 
                href="/demo" 
                className="btn btn-outline btn-lg px-8 rounded-full"
              >
                观看演示
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm opacity-80 mt-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                完全免费使用
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                开源代码
              </div>
            </div>

            <div className="mt-8">
              <TestimonialsAvatars priority={true} />
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative w-full max-w-lg mx-auto">
              <Image
                src="/hero-pet.png"
                alt="桌面宠物演示"
                className="w-full h-auto rounded-2xl shadow-xl"
                priority={true}
                width={500}
                height={400}
                style={{
                  objectFit: 'contain',
                  maxHeight: '500px'
                }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full -z-10"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-purple-50 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
