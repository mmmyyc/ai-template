import Image from "next/image";
import config from "@/config";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative hero overflow-hidden min-h-[90vh]">
      <Image
        src="/landing/three_person.webp"
        alt="Happy Work Environment"
        className="object-cover w-full brightness-50"
        fill
        priority
      />
      <div className="relative hero-overlay bg-primary/90"></div>
      <div className="relative hero-content text-center text-primary-content p-8">
        <div className="flex flex-col items-center max-w-2xl">

          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 leading-tight">
            Add a Touch of Warmth to Your Digital Life
          </h2>
          
          <p className="text-lg md:text-xl opacity-90 mb-12 max-w-xl leading-relaxed">
            Download your personal desktop companion now and make work full of joy and warmth. Hundreds of adorable characters are waiting to meet you!
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/comfy" 
              className="btn btn-neutral btn-lg px-12 rounded-full"
              title={`${config.appName} dashboard`}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Try Now
            </Link>
            
            <Link 
              href="/store" 
              className="btn btn-outline btn-lg px-12 rounded-full text-primary-content hover:bg-primary-content/20 border-2"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Explore Store
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6">
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
