import Image from "next/image";
import config from "@/config";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 font-sans">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start">
            <h1 className="font-bold text-4xl md:text-6xl tracking-tight mb-8 text-gray-900">
              Create Your Own Desktop Pet
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-normal leading-relaxed mb-12">
              Get high-quality personalized Shimeji desktop pets without spending weeks or hundreds of dollars.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link 
                href="/comfy" 
                className="btn btn-primary btn-lg px-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:from-blue-700 hover:to-purple-700 "
                title={`${config.appName} dashboard`}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Try Now
              </Link>
              <Link 
                href="/demo" 
                className="btn btn-outline btn-lg px-8 rounded-full"
                title={`${config.appName} demo`}
              >
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm opacity-80 mt-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Fully Customizable
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                High Quality
              </div>
            </div>

            {/* <div className="mt-8">
              <TestimonialsAvatars priority={true} />
            </div> */}
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative w-full max-w-lg mx-auto">
              <Image
                src="/landing/three_person.webp"
                alt="Desktop Pet Demo"
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
