"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What features do YCamie Shimeji pets have?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Our AI model is specially trained to generate high-quality desktop pets. Each Shimeji includes:</p>
        <ul className="list-disc list-inside">
          <li>Basic: 25 high-quality animation frames</li>
          <li>Advanced: 46 premium animation frames</li>
          <li>Don't worry about the system requirements, our product handles everything automatically for you!</li>
          <li>Interactive AI Chat</li>
          <li>Character Customization</li>
          <li>Customize the pet's appearance and behavior</li>
          <li>Complete animation system</li>
        </ul>
      </div>
    ),
  },
  {
    question: "What are the system requirements?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>To run YCamie Shimeji pets, you need:</p>
        <ul className="list-disc list-inside">
          <li>Using YCamie? You're all set! No additional setup required - everything is included in our package.</li>
          <li>Don't need to install Java 21 or higher installed on your computer</li>
        </ul>
      </div>
    ),
  },
  {
    question: "How can I get better generation results?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>For best results, we recommend:</p>
        <ul className="list-disc list-inside">
          <li>Use simple and clear descriptions</li>
          <li>Upload a reference image to improve accuracy</li>
          <li>Try regenerating if you're not satisfied with the results</li>
        </ul>
      </div>
    ),
  },
  {
    question: "What's your refund policy?",
    answer: (
      <p>
        We offer a full refund within 7 days of purchase if you're not satisfied with our service. Please contact us at support@ycamie.com
      </p>
    ),
  },
  {
    question: "Need help with something else?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>
          If you have any questions or suggestions, feel free to reach out through:
        </p>
        <ul className="list-disc list-inside">
          <li>Email us at: mmmmmyyc@gmail.com</li>
          <li>Join our community discussions</li>
          <li>Check our documentation</li>
        </ul>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
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
          {item?.question}
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
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          {/* <p className="inline-block font-semibold text-primary mb-4">FAQ</p> */}
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
