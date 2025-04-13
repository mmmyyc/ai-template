import { ReactNode } from "react";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { locales } from "@/i18n/config";
import { notFound } from "next/navigation";

// 使用动态生成metadata
export async function generateMetadata({ params }: { params: { locale: string } }) {
	const locale = params.locale;
	
	// 验证locale有效性
	if (!locales.includes(locale as any)) {
		return {};
	}
	
	// 可以根据不同语言生成不同标题
	return getSEOTags({
		title: locale === 'zh' ? "SlidesCraft AI PPT生成 | 免费试用" : "SlidesCraft AI PPT Generator | Free Trial",
		keywords: "SlidesCraft, slides, ppt, ai, generator, free trial"
	});
}

export async function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params: { locale }
}: {
	children: ReactNode;
	params: { locale: string };
}) {
	// Validate that the incoming locale is valid
	if (!locales.includes(locale as any)) {
		notFound();
	}

	// 启用静态渲染
	setRequestLocale(locale);

	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages} locale={locale}>
			{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
			<ClientLayout>
				{children}
			</ClientLayout>
		</NextIntlClientProvider>
	);
}
