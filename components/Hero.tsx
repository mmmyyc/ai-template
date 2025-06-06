import Image from "next/image";
import config from "@/config";
import { Link } from "@/i18n/navigation";
import { AuroraText } from "@/components/magicui/aurora-text";
import { useTranslations } from "next-intl";
import TestimonialsAvatars from "@/components/TestimonialsAvatars";
const Hero = () => {
  const t = useTranslations("HomePage.hero");

  return (
    <section className="relative pt-32 pb-24 font-sans">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start">
            <AuroraText
              className="font-bold text-4xl md:text-6xl tracking-tight mb-8 text-base-content"
              as="h1"
            >
              {t("title")}
            </AuroraText>
            <p className="text-xl md:text-2xl text-base-content/70 font-normal leading-relaxed mb-12">
              {t("subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="btn btn-primary btn-lg px-8 rounded-full"
                title={`${config.appName} dashboard`}
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {t("tryButton")}
              </Link>
              {/* <Link 
                href="/blog/introducing-SlidesCraft" 
                className="btn btn-outline btn-lg px-8 rounded-full"
                title={`${config.appName} demo`}
              >
                {t('watchButton')}
              </Link> */}
            </div>

            {/* Product Hunt Badge
            <div className="mt-8">
              <a
                href="https://www.producthunt.com/posts/slidescraft?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-slidescraft"
                target="_blank"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=961442&theme=light&t=1747810831156"
                  alt="SlidesCraft - SlidesCraft&#0058;Create&#0032;presentations&#0032;with&#0032;scalpel&#0045;like&#0032;precision | Product Hunt"
                  style={{ width: "250px", height: "54px" }}
                  width="250"
                  height="54"
                />
              </a>
            </div> */}

            {/* Social Media Badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="https://www.producthunt.com/posts/slidescraft?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-slidescraft"
                target="_blank"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=961442&theme=light&t=1747810831156"
                  alt="SlidesCraft - SlidesCraft&#0058;Create&#0032;presentations&#0032;with&#0032;scalpel&#0045;like&#0032;precision | Product Hunt"
                  style={{ width: "250px", height: "54px" }}
                  width="250"
                  height="54"
                />
              </a>
              {/* X (Twitter) Badge */}
              <a
                href="https://x.com/ycm17455"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Discord Badge */}
              <a
                href="https://discord.gg/Cfmc3KvX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white rounded-full hover:bg-[#4752C4] transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
            
            <div className="mt-8">
                <TestimonialsAvatars priority={true} />
            </div>
            {/* <div className="flex items-center gap-8 text-sm text-base-content/70 mt-8">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Fully Customizable
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                High Quality
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Easy to Use
              </div>
            </div> */}
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative w-full max-w-lg mx-auto">
              <Image
                src="/display.gif"
                alt="Desktop Pet Demo"
                className="w-full h-auto rounded-2xl shadow-xl"
                priority={true}
                width={600}
                height={500}
                style={{
                  objectFit: "contain",
                  maxHeight: "500px",
                }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full -z-10"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-secondary/10 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
