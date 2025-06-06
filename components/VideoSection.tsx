import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function VideoSection() {
  const t = useTranslations("VideoSection");
  const locale = useLocale();
  return (
    <section className="relative py-20 bg-gradient-to-b from-base-200/50 to-base-100">
      <div className="container mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-base-content/60 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* 视频容器 */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-base-300">
            {/* 16:9 宽高比容器 */}
            <div className="relative pt-[56.25%]">
              {locale == "zh" ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="//player.bilibili.com/player.html?isOutside=true&aid=114398634968321&bvid=BV1mqLHzhEKd&cid=29607788929&p=1"
                  title={t("videoTitle")}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/fcTK8jw9fq4?si=sNOkr1v9XtTlaVfd"
                  title={t("videoTitle")}
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>

          {/* 视频下方的行动号召 */}
          <div className="text-center mt-8">
            <Link
              href="/dashboard"
              className="btn btn-primary btn-lg px-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:from-blue-700 hover:to-purple-700"
            >
              {t("tryNowButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
