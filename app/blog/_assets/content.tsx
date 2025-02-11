import type { JSX } from "react";
import Image, { StaticImageData } from "next/image";
import mmmyycImg from "@/app/blog/_assets/images/authors/ycamie.png";
import introducingYCamieImg from "@/public/landing/three_person.webp";
import introducingYCamieImgDashboard from "@/public/blog/introducing-ycamie/dashboard.webp";
import introducingYCamieImgInput from "@/public/blog/introducing-ycamie/input.png";
import introducingYCamieImgOutput from "@/public/blog/introducing-ycamie/output.png";
import introducingYCamieImgfile from "@/public/blog/introducing-ycamie/file.png";
import introducingYCamieImgInstallStep1 from "@/public/blog/introducing-ycamie/install1.png";
import introducingYCamieImgInstallStep2 from "@/public/blog/introducing-ycamie/install2.png";
import introducingYCamieImgInstallStep3 from "@/public/blog/introducing-ycamie/specifiedFolder.png";
import introducingYCamieImgInstallStep4 from "@/public/blog/introducing-ycamie/runShimeji.png";

import howToMakeShimejiImg from "@/public/blog/how-to-make-shimeji/shimeji.png";
import Link from "next/link";
// ==================================================================================================================================================================
// BLOG CATEGORIES 🏷️
// 博客分类 🏷️
// ==================================================================================================================================================================


export type categoryType = {
  slug: string;
  title: string;
  titleShort?: string;
  description: string;
  descriptionShort?: string;
};

// These slugs are used to generate pages in the /blog/category/[categoryI].js. It's a way to group articles by category.
// 这些 slug 用于在 /blog/category/[categoryI].js 中生成页面，是一种按类别对文章进行分组的方式。

// All the blog categories data display in the /blog/category/[categoryI].js pages.
// 所有博客分类数据都显示在 /blog/category/[categoryI].js 页面中。

// These slugs are used to generate pages in the /blog/category/[categoryI].js. It's a way to group articles by category.
const categorySlugs: { [key: string]: string } = {
  feature: "feature",
  tutorial: "tutorial",
};

// All the blog categories data display in the /blog/category/[categoryI].js pages.
export const categories: categoryType[] = [
  {
    // The slug to use in the URL, from the categorySlugs object above.
    // 在 URL 中使用的 slug，来自上面的 categorySlugs 对象。
    slug: categorySlugs.feature,
    // The title to display the category title (h1), the category badge, the category filter, and more. Less than 60 characters.
    // 用于显示分类标题(h1)、分类徽章、分类过滤器等的标题。不超过60个字符。
    title: "New Features",
    // A short version of the title above, display in small components like badges. 1 or 2 words
    // 上述标题的简短版本，显示在徽章等小组件中。1-2个词。
    titleShort: "Features",
    // The description of the category to display in the category page. Up to 160 characters.
    // 在分类页面中显示的分类描述。最多160个字符。
    description:
      "Check out the latest Shimeji desktop pets and features we've added to YCamie. We're constantly expanding our collection to bring you more delightful companions.",
    // A short version of the description above, only displayed in the <Header /> on mobile. Up to 60 characters.
    // 上述描述的简短版本，仅在移动端的 <Header /> 中显示。最多60个字符。
    descriptionShort: "Latest Shimeji pets and features on YCamie.",
  },
  {
    slug: categorySlugs.tutorial,
    title: "How Tos & Tutorials",
    titleShort: "Tutorials",
    description:
      "Learn how to customize and get the most out of your YCamie Shimeji desktop pets with our easy-to-follow guides and tutorials.",
    descriptionShort:
      "Learn how to customize your YCamie Shimeji pets.",
  },
];

// ==================================================================================================================================================================
// BLOG AUTHORS 📝
// 博客作者 📝
// ==================================================================================================================================================================

export type authorType = {
  slug: string;
  name: string;
  job: string;
  description: string;
  avatar: StaticImageData | string;
  socials?: {
    name: string;
    icon: JSX.Element;
    url: string;
  }[];
};

// Social icons used in the author's bio.
// 在作者简介中使用的社交图标。
const socialIcons: {
  [key: string]: {
    name: string;
    svg: JSX.Element;
  };
} = {
  twitter: {
    name: "Twitter",
    svg: (
      <svg
        version="1.1"
        id="svg5"
        x="0px"
        y="0px"
        viewBox="0 0 1668.56 1221.19"
        className="w-9 h-9"
        // Using a dark theme? ->  className="w-9 h-9 fill-white"
      >
        <g id="layer1" transform="translate(52.390088,-25.058597)">
          <path
            id="path1009"
            d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.42-367.76L984.48,1104h297.8L874.15,558.3l361.92-390.99   h-87.51l-313.51,338.7l-253.31-338.7H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z"
          />
        </g>
      </svg>
    ),
  },
  linkedin: {
    name: "LinkedIn",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        // Using a dark theme? ->  className="w-6 h-6 fill-white"
        viewBox="0 0 24 24"
      >
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
      </svg>
    ),
  },
  github: {
    name: "GitHub",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        // Using a dark theme? ->  className="w-6 h-6 fill-white"
        viewBox="0 0 24 24"
      >
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
};

// These slugs are used to generate pages in the /blog/author/[authorId].js. It's a way to show all articles from an author.
// 这些 slug 用于在 /blog/author/[authorId].js 中生成页面，用于显示某个作者的所有文章。
const authorSlugs: {
  [key: string]: string;
} = {
  mmmyyc: "mmmyyc",
};

// All the blog authors data display in the /blog/author/[authorId].js pages.
// 所有博客作者数据显示在 /blog/author/[authorId].js 页面中。
export const authors: authorType[] = [
  {
    // The slug to use in the URL, from the authorSlugs object above.
    // 在 URL 中使用的 slug，来自上面的 authorSlugs 对象。
    slug: authorSlugs.mmmyyc,
    // The name to display in the author's bio. Up to 60 characters.
    // 在作者简介中显示的名字。最多60个字符。
    name: "Miyichen",
    // The job to display in the author's bio. Up to 60 characters.
    // 在作者简介中显示的职业。最多60个字符。
    job: "Founder & Developer",
    // The description of the author to display in the author's bio. Up to 160 characters.
    // 在作者简介中显示的描述。最多160个字符。
    description:
      "I'm a recent Computer Science graduate passionate about programming and innovation. Currently developing YCamie, a desktop pet application that aims to bring more joy and companionship to users.",
    // The avatar of the author to display in the author's bio and avatar badge.
    // 在作者简介和头像徽章中显示的作者头像。
    avatar: mmmyycImg,
    // A list of social links to display in the author's bio.
    // 在作者简介中显示的社交链接列表。
    socials: [
      {
        name: socialIcons.twitter.name,
        icon: socialIcons.twitter.svg,
        url: "https://twitter.com/miyichen",
      },
      {
        name: socialIcons.github.name,
        icon: socialIcons.github.svg,
        url: "https://github.com/mmmyyc",
      },
    ],
  },
];

// ==================================================================================================================================================================
// BLOG ARTICLES 📚
// 博客文章 📚
// ==================================================================================================================================================================

export type articleType = {
  slug: string;
  title: string;
  description: string;
  categories: categoryType[];
  author: authorType;
  publishedAt: string;
  image: {
    src?: StaticImageData;
    urlRelative: string;
    alt: string;
  };
  content: JSX.Element;
};

// These styles are used in the content of the articles. When you update them, all articles will be updated.
// 这些样式用于文章内容中。当你更新它们时，所有文章都会被更新。
const styles: {
  [key: string]: string;
} = {
  h2: "text-2xl lg:text-4xl font-bold tracking-tight mb-4 text-base-content",
  h3: "text-xl lg:text-2xl font-bold tracking-tight mb-2 text-base-content",
  p: "text-base-content/90 leading-relaxed",
  ul: "list-inside list-disc text-base-content/90 leading-relaxed",
  li: "list-item",
  // Altnernatively, you can use the library react-syntax-highlighter to display code snippets.
  // 或者，你可以使用 react-syntax-highlighter 库来显示代码片段。
  code: "text-sm font-mono bg-neutral text-neutral-content p-6 rounded-box my-4 overflow-x-scroll select-all",
  codeInline:
    "text-sm font-mono bg-base-300 px-1 py-0.5 rounded-box select-all",
};

// All the blog articles data display in the /blog/[articleId].js pages.
// 所有博客文章数据显示在 /blog/[articleId].js 页面中。
export const articles: articleType[] = [
  {
    slug: "how-to-make-shimeji",
    title: "How to Create Your Own Shimeji Desktop Pet",
    description:
      "A comprehensive guide to creating and customizing your own Shimeji desktop pet. Learn about image requirements, animation basics, and best practices.",
    categories: [
      categories.find((category) => category.slug === categorySlugs.tutorial),
    ],
    author: authors.find((author) => author.slug === authorSlugs.mmmyyc),
    publishedAt: "2024-03-20",
    image: {
      src: howToMakeShimejiImg,
      urlRelative: "/blog/how-to-make-shimeji/shimeji.png",
      alt: "Shimeji Creation Guide",
    },
    content: (
      <div className="space-y-8">
        {/* 开场介绍 */}
        <h2 className={styles.h2}>Introduction to Shimeji Desktop Pets</h2>
        <p className={styles.p}>
          In today's digital workspace, personalizing your environment has become more important than ever. 
          A Shimeji is an interactive desktop pet that brings life and personality to your computer screen through 
          walking, climbing, and various charming animations. Originally created by Yuki Yamada of Group Finity, 
          these digital companions have evolved into a beloved way to make your desktop experience more engaging and fun.
        </p>
        <Image src={howToMakeShimejiImg} alt="Shimeji Creation Guide" title="Kiyotaka Ayanokouji Shimeji" width={700} height={500} className="rounded-box" placeholder="blur" />
        {/* 核心价值 */}
        <h2 className={styles.h2}>Why Choose a Shimeji?</h2>
        <ul className={styles.ul}>
          <li className={styles.li}>Personalized desktop experience with your favorite characters</li>
          <li className={styles.li}>Interactive animations that respond to your activities</li>
          <li className={styles.li}>Stress-reducing companion during long work sessions</li>
          <li className={styles.li}>Customizable behaviors and appearances</li>
        </ul>

        {/* 技术要求 */}
        <h2 className={styles.h2}>Getting Started</h2>
        <h3 className={styles.h3}>Technical Requirements</h3>
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
          <p className="font-medium text-blue-800">
            ✨ Using YCamie? You're all set! No additional setup required - everything is included in our package.
          </p>
        </div>
        <p className={styles.p}>Else you need to install the following requirements</p>
        <ul className={styles.ul}>
          <li className={styles.li}>Java 21 or higher installed on your computer</li>
          <li className={styles.li}>Compatible with Windows, macOS, and Linux</li>
          <li className={styles.li}>Minimum 2GB RAM recommended</li>
          <li className={styles.li}>Internet connection for AI generation</li>
        </ul>

        {/* 图片规格 */}
        <h2 className={styles.h2}>Technical Specifications</h2>
        <h3 className={styles.h3}>Image Requirements</h3>
        <ul className={styles.ul}>
          <li className={styles.li}>Below are common Shimeji images size, you can refer to them when you create your own Shimeji</li>
          <li className={styles.li}>Basic version: 25 frames (with basic movements, idle actions, environmental interactions and special behaviors)</li>
          <li className={styles.li}>Advanced version: 46 frames (with whole functions)</li>
          <li className={styles.li}>Individual frame size: 128x128 pixels</li>
          <li className={styles.li}>Format: PNG with transparent background</li>
        </ul>

        {/* 动画详解 */}
        <h3 className={styles.h3}>Animation Framework</h3>
        <div className="space-y-4">
          <p className={styles.p}>
            Each Shimeji requires a specific set of animations to function properly:
          </p>
          <ul className={styles.ul}>
            <li className={styles.li}>
              <strong>Basic Movements (1-8):</strong> Walking and running sequences
            </li>
            <li className={styles.li}>
              <strong>Idle Actions (9-12):</strong> Sitting and standing poses
            </li>
            <li className={styles.li}>
              <strong>Environmental Interactions (13-20):</strong> Climbing and hanging animations
            </li>
            <li className={styles.li}>
              <strong>Special Behaviors (21+):</strong> Unique character-specific actions
            </li>
          </ul>
        </div>
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
          <p className="font-medium text-blue-800">
            ✨ Using YCamie? Don't worry about these specifications - our AI handles everything automatically for you!
          </p>
        </div>
        {/* YCamie 使用指南 */}
        <h2 className={styles.h2}>Creating with YCamie</h2>
        <p className={styles.p}>
          YCamie revolutionizes the Shimeji creation process through AI-powered automation:
        </p>

        <div className="space-y-4">
          <h3 className={styles.h3}>Step-by-Step Guide</h3>
          <ol className={styles.ul}>
            <li className={styles.li}>
              <strong>Upload:</strong> Provide your character reference image
            </li>
            <li className={styles.li}>
              <strong>Configure:</strong> Select version and customize settings
            </li>
            <li className={styles.li}>
              <strong>Generate:</strong> Let AI create your animation frames
            </li>
            <li className={styles.li}>
              <strong>Download:</strong> Get your complete Shimeji package
            </li>
          </ol>
        </div>
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
          <p className={styles.p}>
          ✨ you can refer to the blog{" "}
            <Link 
              href="/blog/introducing-YCamie"
              className="font-bold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2"
            >
              Introducing YCamie
            </Link>
            {" "}for more details
          </p>
        </div>
        {/* 优化建议 */}
        <h2 className={styles.h2}>Optimization Tips</h2>
        <div className="space-y-4">
          <h3 className={styles.h3}>For Best Results</h3>
          <ul className={styles.ul}>
            <li className={styles.li}>Use high-resolution reference images (1024x1024px recommended)</li>
            <li className={styles.li}>Choose characters with distinct visual features</li>
            <li className={styles.li}>Provide clear, front-facing character poses</li>
            <li className={styles.li}>Consider character proportions for better animations</li>
          </ul>
        </div>

        {/* 安装使用 */}
        <h2 className={styles.h2}>Installation Guide</h2>
        <div className="space-y-4">
          <h3 className={styles.h3}>Quick Setup</h3>
          <ol className={styles.ul}>
            <li className={styles.li}>Download and extract the Shimeji package</li>
            <li className={styles.li}>Verify Java installation on your system</li>
            <li className={styles.li}>Double-click Shimeji-ee.jar to launch</li>
            <li className={styles.li}>Right-click the Shimeji icon for additional options</li>
          </ol>
        </div>

        {/* 结尾号召 */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h2 className={styles.h2}>Ready to Start?</h2>
          <p className={styles.p}>
            Transform your desktop experience with a personalized AI-generated Shimeji companion. 
            Join thousands of users who have already brought their favorite characters to life!
          </p>
          <div className="mt-4">
            <a href="/comfy" className="text-blue-600 font-semibold hover:text-blue-700">
              Create Your Shimeji Now →
            </a>
          </div>
        </div>
      </div>
    )
  },
  {
    // The unique slug to use in the URL. It's also used to generate the canonical URL.
    // 在 URL 中使用的唯一 slug。也用于生成规范 URL。
    slug: "introducing-YCamie",
    // The title to display in the article page (h1). Less than 60 characters. It's also used to generate the meta title.
    // 在文章页面显示的标题(h1)。少于60个字符。也用于生成元标题。
    title: "Getting Started with YCamie to Create your Shimeji",
    // The description of the article to display in the article page. Up to 160 characters. It's also used to generate the meta description.
    // 在文章页面显示的文章描述。最多160个字符。也用于生成元描述。
    description:
      "A beginner's guide to creating your first Shimeji desktop pet with YCamie. Learn the basics in just a few minutes!",
    // An array of categories of the article. It's used to generate the category badges, the category filter, and more.
    // 文章的分类数组。用于生成分类徽章、分类过滤器等。
    categories: [
      categories.find((category) => category.slug === categorySlugs.tutorial),
    ],
    // The author of the article. It's used to generate a link to the author's bio page.
    // 文章的作者。用于生成到作者简介页面的链接。
    author: authors.find((author) => author.slug === authorSlugs.mmmyyc),
    // The date of the article. It's used to generate the meta date.
    // 文章的日期。用于生成元日期。
    publishedAt: "2025-01-27",
    image: {
      // The image to display in <CardArticle /> components.
      // 在 <CardArticle /> 组件中显示的图片。
      src: introducingYCamieImg,
      // The relative URL of the same image to use in the Open Graph meta tags & the Schema Markup JSON-LD. It should be the same image as the src above.
      // 在 Open Graph 元标签和 Schema Markup JSON-LD 中使用的相同图片的相对 URL。应该与上面的 src 是同一张图片。
      urlRelative: "/blog/introducing-ycamie/header.jpg",
      alt: "YCamie desktop pet example",
    },
    // The actual content of the article that will be shown under the <h1> title in the article page.
    // 在文章页面的 <h1> 标题下显示的实际文章内容。
    content: (
      <>
        <Image
          src={introducingYCamieImg}
          alt="YCamie desktop pet example"
          width={700}
          height={500}
          priority={true}
          className="rounded-box"
          placeholder="blur"
        />
        <section>
          <h2 className={styles.h2}>What is YCamie?</h2>
          <p className={styles.p}>
            YCamie is an AI-powered tool that helps you create your own unique Shimeji desktop pets. 
            With YCamie, you can easily generate custom characters that will accompany you on your screen, 
            making your desktop experience more lively and fun!
          </p>
        </section>

        <section>
          <h3 className={styles.h3}>1. Getting Started</h3>
          <p className={styles.p}>
            To begin creating your own Shimeji:
          </p>
          <ul className={styles.ul}>
            <li className={styles.li}>Visit ycamie.com</li>
            <li className={styles.li}>Create an account and log in</li>
            <li className={styles.li}>Click the "Try Now" button to enter the generation interface</li>
            <li className={styles.li}>Then will find the dashboard like the image below</li>
          </ul>
        </section>
        <Image src={introducingYCamieImgDashboard} title="YCamie dashboard" alt="Shimeji Creation Guide" width={700} height={500} className="rounded-box" placeholder="blur" />
        <section>
          <h3 className={styles.h3}>2. Creating Your Shimeji</h3>
          <p className={styles.p}>
            The generation process is simple:
          </p>
          <ul className={styles.ul}>
            <li className={styles.li}>Enter a description of the Shimeji you want to create in the text input box</li>
            <li className={styles.li}>Upload a reference image if you have one</li>
            <li className={styles.li}>Click the generate button and wait for the process to complete</li>
            <li className={styles.li}>Preview your generated Shimeji images on the right side</li>
          </ul>
        </section>
        <Image src={introducingYCamieImgInput} title="YCamie dashboard" alt="Shimeji Creation Guide" width={700} height={500} className="rounded-box" placeholder="blur" />
        <section>
          <h3 className={styles.h3}>3. Using Your Shimeji</h3>
          <p className={styles.p}>

            Once you're happy with your creation:
          </p>
          <ul className={styles.ul}>
            <li className={styles.li}>Click the download button</li>
            <li className={styles.li}>Extract the downloaded zip file</li>
            <li className={styles.li}>Dont need install Java 6 or above on your computer, we will provide the executable file</li>
            <Image
              src={introducingYCamieImgfile}
              alt="YCamie desktop pet file"
              width={700}
              height={500}
              priority={true}
              className="rounded-box"
              placeholder="blur"
            />
            <li className={styles.li}>Run Shimeji_windows-x64_1_0_0.exe to start your desktop pet</li>
            <li className={styles.li}>flow the instruction to install it</li>
            <Image
              src={introducingYCamieImgInstallStep1}
              alt="YCamie desktop pet Install"
              width={700}
              height={500}
              priority={true}
              className="rounded-box"
              placeholder="blur"
            />
            <li className={styles.li}>Click next to continue</li>
            <Image
              src={introducingYCamieImgInstallStep2}
              alt="YCamie desktop pet Install step2"
              width={700}
              height={500}
              priority={true}
              className="rounded-box"
              placeholder="blur"
            />
            <li className={styles.li}>Click finish to complete the installation , then you can see the Shimeji icon on your specified folder</li>
            <Image
              src={introducingYCamieImgInstallStep3}
              alt="YCamie desktop pet Install step3"
              width={700}
              height={500}
              priority={true}
              className="rounded-box"
              placeholder="blur"
            />
            <li className={styles.li}>Run Shimeji.exe to start your desktop pet , and then you can add your Shimeji</li>
            <Image
              src={introducingYCamieImgInstallStep4}
              alt="run shimeji"
              width={700}
              height={500}
              priority={true}
              className="rounded-box"
              placeholder="blur"
            />
          </ul>
        </section>
        <Image src={introducingYCamieImgOutput} alt="Shimeji Creation Guide" title="Shimeji output" width={700} height={500} className="rounded-box" placeholder="blur" />
        <section>
          <h3 className={styles.h3}>Ready to Go!</h3>
          <p className={styles.p}>

            That's all you need to do! Your custom Shimeji will now appear on your screen, 
            ready to keep you company. Feel free to create more characters and build your own 
            collection of unique desktop companions!
          </p>
          <p className={styles.p}>
            <span className={styles.codeInline}>Note</span>: It is best not to install on the C drive, because shimeji may not run.
          </p>
          <p className={styles.p}>
            <span className={styles.codeInline}>Note</span>: Now only support windows, if you want to run it on other platforms, you can refer to my github find the {" "} 
            <Link 
              className="font-bold text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-2"
              href="https://github.com/mmmyyc/ShimejiEE-AI">source code</Link>
          </p>
        </section>
          {/* 结尾号召 */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h2 className={styles.h2}>Ready to Start?</h2>
          <p className={styles.p}>
            Transform your desktop experience with a personalized AI-generated Shimeji companion. 
            Join thousands of users who have already brought their favorite characters to life!
          </p>
          <div className="mt-4">
            <a href="/comfy" className="text-blue-600 font-semibold hover:text-blue-700">
              Create Your Shimeji Now →
            </a>
          </div>
        </div>
      </>

    ),
  },
];
