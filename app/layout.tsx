import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/react"
const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags({
	title: "Shimeji AI Desktop Pet Generator| Free Trial",
	keywords: "YCamie, desktop pets, personalized Shimeji, animated desktop characters, Shimeji customization"
});

// 添加主题初始化脚本
const themeScript = `
	let theme = localStorage.getItem('theme');
	if (!theme) {
		theme = '${config.colors.theme}';
		localStorage.setItem('theme', theme);
	}
	document.documentElement.setAttribute('data-theme', theme);
`;

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<link rel="icon" href="/favicon.ico" sizes="any" />
			</head>
			<body className={font.className}>
				{children}
				<Analytics />
				<GoogleAnalytics gaId="G-4KMJNL5ZMF" />
			</body>
		</html>
	);
}
