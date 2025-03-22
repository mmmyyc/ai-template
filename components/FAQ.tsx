"use client";

import { useRef, useState } from "react";
import { useTranslations } from 'next-intl';

// Simplified FAQ component that uses translations from i18n

const FaqItem = ({ questionKey, answerKey }: { questionKey: string; answerKey: string }) => {
  const t = useTranslations('FAQ');
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {t(questionKey)}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.raw(answerKey) }} />
      </div>
    </li>
  );
};

const FAQ = () => {
  const t = useTranslations('FAQ');
  
  // 定义FAQ问题的键名列表
  const faqItems = [
    { 
      questionKey: 'items.0.question', 
      answerKey: 'items.0.answer'
    },
    { 
      questionKey: 'items.1.question', 
      answerKey: 'items.1.answer'
    },
    { 
      questionKey: 'items.2.question', 
      answerKey: 'items.2.answer'
    },
    { 
      questionKey: 'items.3.question', 
      answerKey: 'items.3.answer'
    },
    { 
      questionKey: 'items.4.question', 
      answerKey: 'items.4.answer'
    }
  ];

  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          {/* <p className="inline-block font-semibold text-primary mb-4">FAQ</p> */}
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            {t('title')}
          </p>
        </div>

        <ul className="basis-1/2">
          {faqItems.map((item, i) => (
            <FaqItem 
              key={i} 
              questionKey={item.questionKey} 
              answerKey={item.answerKey} 
            />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
