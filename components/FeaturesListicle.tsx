"use client";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';

// Define feature keys structure
const featureKeys = [
  {
    key: "aiCreation",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  },
  {
    key: "personalization",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    key: "convenience",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    key: "interactiveExperience",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.998 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
];

const FeaturesListicle = () => {
  const t = useTranslations('FeaturesListicle');
  const featuresEndRef = useRef<null>(null);
  const [selectedFeatureKey, setSelectedFeatureKey] = useState<string>(featureKeys[0].key);
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasClicked) {
        const index = featureKeys.findIndex((feature) => feature.key === selectedFeatureKey);
        const nextIndex = (index + 1) % featureKeys.length;
        setSelectedFeatureKey(featureKeys[nextIndex].key);
      }
    }, 5000);

    try {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            clearInterval(interval);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.5,
        }
      );
      if (featuresEndRef.current) {
        observer.observe(featuresEndRef.current);
      }
    } catch (e) {
      console.error(e);
    }

    return () => clearInterval(interval);
  }, [selectedFeatureKey, hasClicked]);

  // Function to render bullet points from translation
  const renderBulletPoints = (featureKey: string) => {
    const bulletPoints = [0, 1, 2, 3].map(index => {
      return t(`features.${featureKey}.bulletPoints.${index}`);
    });

    return (
      <ul className="space-y-2">
        {bulletPoints.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-[18px] h-[18px] inline shrink-0 opacity-80"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="py-16 bg-base-100 font-sans" id="features">
      <div className="max-w-3xl mx-auto">
        <div className="px-6 md:px-8">
          <TypingAnimation as="h2" className="font-bold text-3xl lg:text-4xl tracking-tight mb-6 text-base-content">
            {t('title')}
          </TypingAnimation>
          <div className="text-base-content/70 leading-relaxed mb-12 lg:text-lg font-normal">
            {t('description')}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 md:px-8 mb-6">
          {featureKeys.map((feature) => (
            <button
              key={feature.key}
              onClick={() => {
                if (!hasClicked) setHasClicked(true);
                setSelectedFeatureKey(feature.key);
              }}
              className={`flex flex-col items-center justify-center gap-2 select-none cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                selectedFeatureKey === feature.key
                  ? "bg-primary/10 shadow-sm"
                  : "hover:bg-base-200"
              }`}
            >
              <span
                className={`transition-colors duration-200 ${
                  selectedFeatureKey === feature.key
                    ? "text-primary"
                    : "text-base-content/40 group-hover:text-base-content/60"
                }`}
              >
                {feature.svg}
              </span>
              <span
                className={`font-medium text-sm transition-colors duration-200 ${
                  selectedFeatureKey === feature.key
                    ? "text-primary"
                    : "text-base-content/50"
                }`}
              >
                {t(`features.${feature.key}.name`)}
              </span>
            </button>
          ))}
        </div>

        <div className="px-6 md:px-8">
          <div
            className="p-6 bg-base-200/50 rounded-2xl animate-opacity"
            key={selectedFeatureKey}
          >
            <h3 className="font-semibold text-base-content text-lg mb-4">
              {t(`features.${selectedFeatureKey}.name`)}
            </h3>
            <div className="text-base-content/70 font-normal">
              {renderBulletPoints(selectedFeatureKey)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesListicle;
