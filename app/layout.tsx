import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/react"
import ClientLayout from "@/components/LayoutClient";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { locales } from "@/i18n/config";
const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// // This adds default SEO tags to all pages in our app.
// // You can override them in each page passing params to getSOTags() function.
// export const metadata = getSEOTags({
// 	title: "Shimeji AI Desktop Pet Generator| Free Trial",
// 	keywords: "YCamie, desktop pets, personalized Shimeji, animated desktop characters, Shimeji customization"
// });

// 使用动态生成metadata
export async function generateMetadata({ params }: { params: { locale: string } }) {
	const locale = params.locale;
	
	// 验证locale有效性
	if (!locales.includes(locale as any)) {
		return {};
	}
	
	// 可以根据不同语言生成不同标题
	return getSEOTags({
		title: locale === 'zh' ? "Shimeji AI 桌面宠物生成器 | 免费试用" : "Shimeji AI Desktop Pet Generator | Free Trial",
		keywords: "YCamie, desktop pets, personalized Shimeji, animated desktop characters, Shimeji customization"
	});
}

export async function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

// 添加主题初始化脚本
const themeScript = `
	let theme = localStorage.getItem('theme');
	if (!theme) {
		theme = '${config.colors.theme}';
		localStorage.setItem('theme', theme);
	}
	document.documentElement.setAttribute('data-theme', theme);
`;

export default async function LocaleLayout({
	children,
	params: { locale }
}: {
	children: ReactNode;
	params: { locale: string };
}) {
	// Validate that the incoming locale is valid
	// if (!locales.includes(locale as any)) {
	// 	notFound();
	// }

	// 启用静态渲染
	setRequestLocale(locale);

	const messages = await getMessages();
	


	return (
		<html suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<link rel="icon" href="/favicon.ico" sizes="any" />
			</head>
			<body className={font.className}>
			<NextIntlClientProvider messages={messages} locale={locale}>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>
					{children}
				</ClientLayout>
			</NextIntlClientProvider>
				<Analytics />
				<GoogleAnalytics gaId="G-4KMJNL5ZMF" />
			</body>
		</html>


	);
}
