// 支持的语言列表
export const locales = ['en', 'zh'] as const;

// 默认语言
export const defaultLocale = 'en' as const;

// 自定义类型
export type Locale = (typeof locales)[number];
