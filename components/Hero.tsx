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

            {/* Product Hunt Badge */}
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
