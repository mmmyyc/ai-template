import type { JSX } from "react";
import Image, { StaticImageData } from "next/image";
import mmmyycImg from "@/app/blog/_assets/images/authors/ycamie.png";
import introducingYCamieImg from "@/public/landing/three_person.webp";
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
      src: introducingYCamieImg,
      urlRelative: "/landing/three_person.webp",
      alt: "Shimeji Creation Guide",
    },
    content: (
      <div className="space-y-8">
        <h2 className={styles.h2}>What is a Shimeji?</h2>
        <p className={styles.p}>
          A Shimeji is an interactive desktop pet that can walk, climb, and perform various animations on your computer screen. Originally created by Yuki Yamada of Group Finity, Shimejis have become popular digital companions that add a fun and playful element to your desktop environment.
        </p>

        <h2 className={styles.h2}>System Requirements</h2>
        <ul className={styles.ul}>
          <li className={styles.li}>Java 6 or higher installed on your computer</li>
          <li className={styles.li}>Compatible with Windows, macOS, and Linux</li>
          <li className={styles.li}>Basic image editing skills (for customization)</li>
        </ul>

        <h2 className={styles.h2}>Image Requirements</h2>
        <p className={styles.p}>
          To create a Shimeji, you'll need to prepare a sprite sheet with specific dimensions:
        </p>
        <ul className={styles.ul}>
          <li className={styles.li}>Basic version: 640x640 pixels (5x5 grid)</li>
          <li className={styles.li}>Advanced version: 640x1280 pixels (10x5 grid)</li>
          <li className={styles.li}>Each frame should be 128x128 pixels</li>
          <li className={styles.li}>Transparent background (PNG format recommended)</li>
        </ul>

        <h2 className={styles.h2}>Animation Frames</h2>
        <p className={styles.p}>
          Your Shimeji needs different animation frames for various actions:
        </p>
        <ul className={styles.ul}>
          <li className={styles.li}>Walking/Running (frames 1-8)</li>
          <li className={styles.li}>Sitting (frames 9-12)</li>
          <li className={styles.li}>Climbing (frames 13-20)</li>
          <li className={styles.li}>Special actions (frames 21-25 for basic, 21-46 for advanced)</li>
        </ul>

        <h2 className={styles.h2}>Using YCamie to Create Your Shimeji</h2>
        <p className={styles.p}>
          YCamie simplifies the Shimeji creation process:
        </p>
        <ol className={styles.ul}>
          <li className={styles.li}>Upload your character image</li>
          <li className={styles.li}>Choose between basic or advanced version</li>
          <li className={styles.li}>Let AI generate all required animation frames</li>
          <li className={styles.li}>Download your customized Shimeji</li>
        </ol>

        <h2 className={styles.h2}>Tips for Better Results</h2>
        <ul className={styles.ul}>
          <li className={styles.li}>Use clear, high-quality character images</li>
          <li className={styles.li}>Ensure your character has a distinct silhouette</li>
          <li className={styles.li}>Test different poses to find what works best</li>
          <li className={styles.li}>Consider the character's personality in animations</li>
        </ul>

        <h2 className={styles.h2}>Running Your Shimeji</h2>
        <p className={styles.p}>
          After downloading your Shimeji:
        </p>
        <ol className={styles.ul}>
          <li className={styles.li}>Extract the ZIP file</li>
          <li className={styles.li}>Run the Shimeji-ee.jar file</li>
          <li className={styles.li}>Your desktop pet will appear and start interacting with your screen</li>
        </ol>

        <p className={styles.p}>
          Ready to create your own Shimeji? Try YCamie now and bring your characters to life on your desktop!
        </p>
      </div>
    ),
  },
  {
    // The unique slug to use in the URL. It's also used to generate the canonical URL.
    // 在 URL 中使用的唯一 slug。也用于生成规范 URL。
    slug: "introducing-YCamie",
    // The title to display in the article page (h1). Less than 60 characters. It's also used to generate the meta title.
    // 在文章页面显示的标题(h1)。少于60个字符。也用于生成元标题。
    title: "Getting Started with YCamie Desktop Pets",
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
          </ul>
        </section>

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

        <section>
          <h3 className={styles.h3}>3. Using Your Shimeji</h3>
          <p className={styles.p}>
            Once you're happy with your creation:
          </p>
          <ul className={styles.ul}>
            <li className={styles.li}>Click the download button</li>
            <li className={styles.li}>Extract the downloaded files</li>
            <li className={styles.li}>Click "Replace All Files" when prompted</li>
            <li className={styles.li}>Make sure you have Java 6 or above installed on your computer</li>
            <li className={styles.li}>Run shimeji.jar to start your desktop pet</li>
          </ul>
        </section>

        <section>
          <h3 className={styles.h3}>Ready to Go!</h3>
          <p className={styles.p}>
            That's all you need to do! Your custom Shimeji will now appear on your screen, 
            ready to keep you company. Feel free to create more characters and build your own 
            collection of unique desktop companions!
          </p>
          <p className={styles.p}>
            <span className={styles.codeInline}>Note</span>: Make sure you have Java installed 
            on your computer (minimum Java 6) to run the Shimeji application.
          </p>
        </section>
      </>
    ),
  },
];
