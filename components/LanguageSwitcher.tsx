'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // 使用next-intl的导航API切换语言
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <span className="text-lg">{locale === 'en' ? '🇺🇸' : '🇨🇳'}</span>
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <button 
            className={`${locale === 'en' ? 'active' : ''} w-full text-left`}
            onClick={() => handleLocaleChange('en')}
            disabled={locale === 'en'}
          >
            🇺🇸 English
          </button>
        </li>
        <li>
          <button 
            className={`${locale === 'zh' ? 'active' : ''} w-full text-left`}
            onClick={() => handleLocaleChange('zh')}
            disabled={locale === 'zh'}
          >
            🇨🇳 中文
          </button>
        </li>
      </ul>
    </div>
  );
} 