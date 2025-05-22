import { Link } from '@/i18n/navigation';
import Image from "next/image";
import config from "@/config";
import logo from "@/app/apple-icon.png";
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');
  
  return (
    <footer className="bg-base-200 border-t border-base-content/10">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Logo and Description Column */}
          <div className="col-span-2">
            <Link
              href="/"
              aria-current="page"
              className="flex gap-2 items-center"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-extrabold tracking-tight text-lg">
                {config.appName}
              </strong>
            </Link>

            <p className="mt-3 text-sm text-base-content/80">
              {t('description')}
            </p>
            <p className="mt-3 text-sm text-base-content/60">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>
            {/* <p className="mt-2 text-xs text-base-content/40">
              Featured on{" "}
              <a href="https://startupfa.me/s/ycamie.com?utm_source=ycamie.com" target="_blank" className="hover:underline">
                Startup Fame
              </a>
            </p> */}
          </div>

          {/* Product Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-3">{t('categories.product.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-sm text-base-content/70 hover:text-base-content">
                  {t('categories.product.links.0')}
                </Link>
              </li>
              <li>
                <Link href="/store" className="text-sm text-base-content/70 hover:text-base-content">
                  {t('categories.product.links.1')}
                </Link>
              </li>
              <li>
                <Link href="/download" className="text-sm text-base-content/70 hover:text-base-content">
                  {t('categories.product.links.2')}
                </Link>
              </li>
              {config.resend.supportEmail && (
                <li>
                  <a
                    href={`mailto:${config.resend.supportEmail}`}
                    className="text-sm text-base-content/70 hover:text-base-content"
                  >
                    {t('categories.product.links.3')}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-3">{t('categories.resources.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/category/tutorial" className="text-sm text-base-content/70 hover:text-base-content">
                  {t('categories.resources.links.0')}
                </Link>
              </li>
              <li>
                <Link href="/blog/category/feature" className="text-sm text-base-content/70 hover:text-base-content">
                  {t('categories.resources.links.1')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-3">{t('categories.legal.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-sm text-base-content/70 hover:text-base-content">
                  {t('categories.legal.links.0')}
                </Link>
              </li>
              <li>
                <Link href="/tos" className="text-sm text-base-content/70 hover:text-base-content">
                  {t('categories.legal.links.1')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Column */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-3">{t('categories.social.title')}</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/mmmyyc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12"/>
                  </svg>
                  {t('categories.social.links.0')}
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/ycm17455" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-base-content/70 hover:text-base-content flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  {t('categories.social.links.1')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
