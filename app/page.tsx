import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import FeaturesListicle from '@/components/FeaturesListicle'
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <Hero />

        {/* Problem Section */}
        <Problem />

        {/* FeaturesListicle Section */}
        <FeaturesListicle />

        {/* CTA Section */}
        <CTA />

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