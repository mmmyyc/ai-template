"use client";

import React, { useRef, useState } from "react";
import { FileUp, Layers, CheckCircle, Edit3, Save, Play, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function FourStepsProcess() {
  const t = useTranslations('FourStepsProcess');
  
  // States for tracking active elements
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Refs
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const featureRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Feature navigation
  const navigateFeature = (direction: 'prev' | 'next') => {
    const totalFeatures = advancedFeatures.length;
    
    if (direction === 'prev') {
      setActiveFeature(prev => (prev - 1 + totalFeatures) % totalFeatures);
    } else {
      setActiveFeature(prev => (prev + 1) % totalFeatures);
    }
  };

  // Auto-rotate features on an interval
  React.useEffect(() => {
    const interval = setInterval(() => {
      navigateFeature('next');
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: <FileUp className="h-7 w-7" />,
      titleKey: "steps.upload.title",
      descriptionKey: "steps.upload.description",
    },
    {
      icon: <Layers className="h-7 w-7" />,
      titleKey: "steps.select.title",
      descriptionKey: "steps.select.description",
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      titleKey: "steps.generate.title",
      descriptionKey: "steps.generate.description",
    },
    {
      icon: <Edit3 className="h-7 w-7" />,
      titleKey: "steps.edit.title",
      descriptionKey: "steps.edit.description",
    },
  ];
  
  const advancedFeatures = [
    {
      icon: <Save className="h-7 w-7" />,
      titleKey: "features.save.title",
      descriptionKey: "features.save.description",
    },
    {
      icon: <Play className="h-7 w-7" />,
      titleKey: "features.present.title",
      descriptionKey: "features.present.description",
    },
    {
      icon: <Download className="h-7 w-7" />,
      titleKey: "features.download.title",
      descriptionKey: "features.download.description",
    },
    {
      icon: <FileText className="h-7 w-7" />,
      titleKey: "features.addPages.title",
      descriptionKey: "features.addPages.description",
    },
  ];

  return (
    <div className="w-full">
      {/* First Section - Four Steps Process */}
      <section className="py-20 px-4 bg-base-200/30">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-primary">{t('stepsTitle.part1')}</span>
            <span className="text-base-content">{t('stepsTitle.part2')}</span>
          </h2>
          <p className="text-base-content/70 text-lg md:text-xl mb-16 max-w-2xl mx-auto">
            {t('stepsDescription')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                className={`flex flex-col items-center p-6 bg-base-100 rounded-xl shadow-sm transition-all duration-300 border border-base-300 hover:border-primary/20 ${
                  activeStep === index ? 'shadow-md scale-105' : 'hover:shadow'
                }`}
                onMouseEnter={() => setActiveStep(index)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary/10 mb-5 text-primary">
                  {step.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-medium mb-3 text-base-content">{t(step.titleKey)}</h3>
                <p className="text-base-content/70 text-base md:text-lg text-center">
                  {t(step.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Second Section - Advanced Features */}
      <section className="py-20 px-4 bg-base-100">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('featuresTitle')}
          </h2>
          <p className="text-base-content/70 text-lg md:text-xl mb-16 max-w-2xl mx-auto">
            {t('featuresDescription')}
          </p>
          
          {/* Features Slider */}
          <div className="relative max-w-4xl mx-auto px-10">
            <div className="overflow-hidden">
              <div 
                className="flex flex-row transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeFeature * 100}%)` }}
              >
                {advancedFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    ref={(el) => {
                      featureRefs.current[index] = el;
                    }}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-base-200/50 rounded-xl p-8 md:p-10 h-full flex flex-col items-center text-center transition-all duration-300 hover:bg-base-200/80">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-base-100 mb-5 text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-medium mb-3 text-base-content">{t(feature.titleKey)}</h3>
                      <p className="text-base-content/70 text-base md:text-lg">
                        {t(feature.descriptionKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button 
              onClick={() => navigateFeature('prev')}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-base-100 rounded-full w-12 h-12 flex items-center justify-center shadow-md text-base-content/70 hover:text-primary border border-base-300"
              aria-label={t('prevFeature')}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => navigateFeature('next')}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-base-100 rounded-full w-12 h-12 flex items-center justify-center shadow-md text-base-content/70 hover:text-primary border border-base-300"
              aria-label={t('nextFeature')}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          
          {/* Feature Indicators */}
          <div className="flex justify-center space-x-3 mt-10">
            {advancedFeatures.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`transition-all duration-300 rounded-full ${
                  activeFeature === index 
                    ? 'bg-primary w-6 h-3' 
                    : 'bg-base-300 w-3 h-3 hover:bg-base-content/30'
                }`}
                aria-label={t('goToFeature', { number: index + 1 })}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 