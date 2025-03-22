import { Link } from '@/i18n/navigation';
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: YCamie
// - Contact information: marc@shipfa.st
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://shipfa.st/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: January 16, 2025

Welcome to YCamie! These Terms & Services ("Terms") govern your use of our website, https://ycamie, and the services we provide. By accessing or using our website and services, you agree to these Terms.

Description of Services YCamie provides high-quality Shimeji desktop pets. Users can create their own table pets without spending excessive time on customization or large sums of money.

Ownership Upon purchasing the service, you own the code of the Shimeji desktop pet you create. You also have the right to enable business transactions related to the pet.

Refund Policy You can request a full refund within 7 days of purchase. To request a refund, please contact us at mmmmmyyc@gmail.com.

User Data Collection We collect personal information including your name, email address, and payment information to process your orders.

Non-Personal Data Collection We use web cookies to collect non-personal data for enhancing the user experience on our website.

Privacy Policy For details on how we handle your personal data, please review our Privacy Policy.

Governing Law These Terms are governed by and construed in accordance with the laws of Hong Kong.

Updates to Terms We may update these Terms from time to time. Any updates will be communicated to you via email.

Contact Information If you have any questions or concerns regarding these Terms, please contact us at mmmmmyyc@gmail.com.

By using YCamie, you acknowledge that you have read, understood, and agree to these Terms.
        `}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
