import {getRequestConfig} from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locales, defaultLocale } from './config';

export default getRequestConfig(
    async ({ requestLocale }) => {
    // 通常对应于 `[locale]` 段
    const requested = await requestLocale;
    const locale = hasLocale(locales, requested)
      ? requested
      : defaultLocale;

    return {
      locale,
      messages: (await import(`@/messages/${locale}.json`)).default
    };
  }
); 