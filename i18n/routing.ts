import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  // 支持的所有语言列表
  locales,
  // 默认语言
  defaultLocale,
  // 仅在需要时显示语言前缀
  localePrefix: 'as-needed'
}); 