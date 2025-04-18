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
import { notFound } from "next/navigation";
const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

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
}: {
	children: ReactNode;
}) {
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
