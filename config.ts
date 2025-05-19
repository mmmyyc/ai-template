import themes from "daisyui/src/theming/themes";
import { ConfigProps } from "./types/config";

const config = {
  // REQUIRED
  appName: "SlidesCraft",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "SlidesCraft is a professional AI presentation tool offering fine-grained content control, deep customization, data visualization, and online presentation features to help you quickly create high-quality professional PPTs.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  // domainName: "SlidesCraft.com",
  domainName: "slidescraft.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "efb4d315-770c-47b4-a1c3-1cfce1e74ba0",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_456"
            : "price_456",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Free",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "providing high-quality desktop pets consisting of 25 high-quality pictures",
        // The price you want to display, the one user will be charged on Stripe.
        price: 0,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 5,
        features: [
          {
            name: "Usage Limit 3 generations per month",
          },
          {
            name: "AI assistant",
          },
          {
            name: "Shimeji Customization",
          },
          { name: "HD Animated Images" },
          { name: "Fun Interaction" },
          { name: "Real-time Response" },
          { name: "25-frame Animation Set" },
          { name: "Human Character Customization" },
        ],
      },
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1RCzzGQeZYgpkJjDh6vG3ToI"
            : "price_1RFRqNQWD2AXxLGF0V1jROBr",
        cnPriceId:
          process.env.NODE_ENV === "development"
            ? "price_1RQLiwQWD2AXxLGFQxLd5nio"
            : "price_1RQLiwQWD2AXxLGFQxLd5nio",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Basic",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "providing high-quality desktop pets consisting of 25 high-quality pictures",
        // The price you want to display, the one user will be charged on Stripe.
        price: 3,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 5,
        features: [
          {
            name: "Usage Limit 50 generations per month",
          },
          {
            name: "AI assistant",
          },
          {
            name: "Shimeji Customization",
          },

          { name: "HD Animated Images" },
          { name: "Fun Interaction" },
          { name: "Real-time Response" },

          { name: "25-frame Animation Set" },
          { name: "Human Character Customization" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `SlidesCraft <noreply@resend.ycamie.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `SlidesCraft at SlidesCraft <mmmmmyyc@resend.ycamie.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "mmmmmyyc@ycamie.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "cupcake",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["cupcake"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
