import { Link } from '@/i18n/navigation';
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: YCamie
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: marc@shipfa.st

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
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
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: January 16, 2025

At YCamie, your privacy is important to us. This Privacy Policy outlines the types of personal information we collect and how we use and protect it. By using our website, https://ycamie, you agree to the terms of this Privacy Policy.

Information We Collect

Personal Data: When you make a purchase on our website, we collect your name, email address, and payment information to process your order.
Non-Personal Data: We collect non-personal data through web cookies to enhance your experience on our website.
Purpose of Data Collection The information we collect is used solely for processing orders and providing the services you request.

Data Sharing We do not share your personal data with any third parties. Your information is kept private and secure.

Children's Privacy Our website is not intended for children, and we do not knowingly collect data from children. If we learn that we have collected personal information from a child, we will take steps to delete it.

Data Protection We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure.

Updates to This Privacy Policy We may update this Privacy Policy from time to time. Any changes will be communicated to you via email.

Contact Information If you have any questions about this Privacy Policy or how we handle your data, please contact us at mmmmmyyc@gmail.com.

By using YCamie, you consent to our Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
