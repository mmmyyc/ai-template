import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import FeaturesListicle from '@/components/FeaturesListicle'
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import VideoSection from "@/components/VideoSection";
import WithWithout from '@/components/WithWithout'
import { getSEOTags } from "@/libs/seo";

// 更新metadata生成方法，考虑语言前缀
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  
  return getSEOTags({
    canonicalUrlRelative: locale === 'en' ? "/" : `/${locale}/`,
  });
}

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <Hero />

        {/* Problem Section */}
        <Problem />

        {/* WithWithout Section */}
        <WithWithout/>
        
        {/* FeaturesListicle Section */}
        <FeaturesListicle />

        {/* CTA Section */}
        {/* <CTA /> */}

        {/* Video Section */}
        {/* <VideoSection /> */}
        
        {/* Price Section */}
        <Pricing />


        {/* FAQ Section */}
        <FAQ />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage