'use client'

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation'
import { Image, Upload } from 'lucide-react'
import { DailyLimit } from './daily-limit'
import ButtonAccount from '@/components/ButtonAccount'
import { useTranslations } from 'next-intl'

export function MainNav() {
  const pathname = usePathname()
  const t = useTranslations()
  
  const apps = [
    { 
      id: 'image-gen', 
      name: t('Navigation.imageGen.title'), 
      icon: Image, 
      href: '/dashboard/generation',
      description: t('Navigation.imageGen.description')
    },
    { 
      id: 'uploadpdf', 
      name: t('Navigation.uploadpdf.title'), 
      icon: Upload, 
      href: '/dashboard/uploadpdf',
      description: t('Navigation.uploadpdf.description')
    },
    // { 
    //   id: 'history', 
    //   name: t('Navigation.history.title'), 
    //   icon: History, 
    //   href: '/dashboard/history',
    //   description: t('Navigation.history.description')
    // },
    // { 
    //   id: 'store', 
    //   name: t('Navigation.store.title'), 
    //   icon: ShoppingBag, 
    //   href: '/store',
    //   description: t('Navigation.store.description')
    // },
    // { id: 'chat', name: 'Chat', icon: Layers, href: '/dashboard/chat' },
    // { id: 'settings', name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  // 启动新手引导函数
  const startTutorial = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('comfyTourComplete');
    // 使用自定义事件触发引导
    const event = new CustomEvent('startComfyTour');
    window.dispatchEvent(event);
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <label 
          htmlFor="drawer" 
          className="btn btn-circle btn-sm btn-ghost lg:hidden fixed top-4 left-4 z-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            className="w-5 h-5"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
      </div> 
      <div className="drawer-side">
        <label htmlFor="drawer" className="drawer-overlay bg-black/30"></label>
        <div className="w-72 min-h-full bg-base-100 shadow-lg flex flex-col">
          {/* 侧边栏头部 */}
          <div className="px-6 py-6 border-b border-base-200">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-base-content/70 hover:text-base-content transition-colors mb-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                  clipRule="evenodd"
                />
              </svg>
              {t('HomePage.back')}
            </Link>
            <h1 className="text-xl font-semibold text-base-content">
              {t('HomePage.title')}
            </h1>
          </div>

          {/* 侧边栏菜单 */}
          <div className="p-3">
            <nav className="space-y-1">
              {apps.map((app) => {
                const isActive = pathname === app.href || 
                  (app.href === '/dashboard/generation' && pathname === '/comfy');
                
                return (
                  <Link 
                    key={app.id}
                    href={app.href}
                    className={`
                      group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-primary/10' 
                        : 'hover:bg-base-200'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-base-200 text-base-content/50 group-hover:text-base-content/70'
                      }
                    `}>
                      <app.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`
                        text-sm font-medium transition-colors
                        ${isActive 
                          ? 'text-primary' 
                          : 'text-base-content/80 group-hover:text-base-content'
                        }
                      `}>
                        {app.name}
                      </div>
                      <div className={`
                        text-xs transition-colors
                        ${isActive 
                          ? 'text-primary/70' 
                          : 'text-base-content/50 group-hover:text-base-content/60'
                        }
                      `}>
                        {app.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
              
              {/* 新手引导按钮
              <button
                onClick={startTutorial}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left hover:bg-base-200"
              >
                <div className="p-2 rounded-lg transition-colors bg-primary/20 text-primary">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-base-content/80 group-hover:text-base-content">
                    Onboarding Tour
                  </div>
                  <div className="text-xs text-base-content/50 group-hover:text-base-content/60">
                    Review feature introduction
                  </div>
                </div>
              </button> */}
            </nav>
          </div>
          {/* Daily AI Limit */}
          <div className="mt-auto">
            <DailyLimit />
          </div>
          <div className="p-3">
            <ButtonAccount extraStyle="border-t border-base-200" />            
          </div>

        </div>
      </div>
    </div>
  )
}
