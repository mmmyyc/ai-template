import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import FeaturesListicle from '@/components/FeaturesListicle'

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <Hero />

        {/* Problem Section */}
        <Problem />

        {/* Introduction Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-6">
                  遇见您的专属桌面伙伴
                </h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    桌面宠物是一个可爱的虚拟伙伴，它们会在您的屏幕上自由漫步，为您的工作时光带来欢乐。无论是在浏览网页还是处理文档时，它们都会陪伴在您身边。
                  </p>
                  <p>
                    通过我们的应用，您可以：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>观察它们在屏幕上行走、爬行和攀爬</li>
                    <li>与窗口和网页进行互动</li>
                    <li>使用鼠标拖拽它们到任意位置</li>
                    <li>欣赏由艺术家设计的独特动作和行为</li>
                    <li>在各种应用和网站中体验互动乐趣</li>
                  </ul>
                  <p className="italic text-gray-600">
                    让您的数字世界不再孤单，为工作增添一份趣味
                  </p>
                </div>
                <div className="mt-8">
                  <Link 
                    href="/demo"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    观看演示视频
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="relative">
                  <Image
                    src="/desktop-pet-demo.gif"
                    alt="Desktop Pet Demo"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl"
                  />
                  {/* 装饰元素 */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full -z-10"></div>
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-50 rounded-full -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FeaturesListicle Section */}
        <FeaturesListicle />

        {/* CTA Section */}
        <CTA />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default LandingPage