'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Image, Layers, Send, Settings, History, HelpCircle, ShoppingBag } from 'lucide-react'
import { DailyLimit } from './daily-limit'
import ButtonAccount from '@/components/ButtonAccount'

export function MainNav() {
  const pathname = usePathname()
  
  const apps = [
    { 
      id: 'image-gen', 
      name: 'DeskPet Generation', 
      icon: Image, 
      href: '/comfy/image-generation',
      description: 'Create your unique desktop companion'
    },
    { 
      id: 'history', 
      name: 'Generation History', 
      icon: History, 
      href: '/comfy/history',
      description: 'View your previous generations'
    },
    { 
      id: 'store', 
      name: 'Shimeji Store', 
      icon: ShoppingBag, 
      href: '/store',
      description: 'Download community creations'
    },
    // { id: 'text-gen', name: 'Text Generation', icon: Send, href: '/comfy/text-generation' },
    // { id: 'chat', name: 'Chat', icon: Layers, href: '/comfy/chat' },
    // { id: 'settings', name: 'Settings', icon: Settings, href: '/comfy/settings' },
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
        <div className="w-72 min-h-full bg-white shadow-lg flex flex-col">
          {/* 侧边栏头部 */}
          <div className="px-6 py-6 border-b border-gray-100">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
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
              Back
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              AI Playground
            </h1>
          </div>

          {/* 侧边栏菜单 */}
          <div className="p-3">
            <nav className="space-y-1">
              {apps.map((app) => {
                const isActive = pathname === app.href || 
                  (app.href === '/comfy/image-generation' && pathname === '/comfy');
                
                return (
                  <Link 
                    key={app.id}
                    href={app.href}
                    className={`
                      group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
                      }
                    `}>
                      <app.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`
                        text-sm font-medium transition-colors
                        ${isActive 
                          ? 'text-blue-600' 
                          : 'text-gray-700 group-hover:text-gray-900'
                        }
                      `}>
                        {app.name}
                      </div>
                      <div className={`
                        text-xs transition-colors
                        ${isActive 
                          ? 'text-blue-500' 
                          : 'text-gray-400 group-hover:text-gray-500'
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
                className="group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left hover:bg-gray-50"
              >
                <div className="p-2 rounded-lg transition-colors bg-blue-100 text-blue-600">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Onboarding Tour
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-500">
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
            <ButtonAccount extraStyle="border-t border-gray-100" />            
          </div>

        </div>
      </div>
    </div>
  )
}
