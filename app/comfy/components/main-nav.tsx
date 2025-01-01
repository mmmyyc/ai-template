'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Image, Layers, Send, Settings } from 'lucide-react'

export function MainNav() {
  const pathname = usePathname()
  
  const apps = [
    { id: 'image-gen', name: 'DeskPet Generation', icon: Image, href: '/comfy/image-generation' },
    { id: 'text-gen', name: 'Text Generation', icon: Layers, href: '/comfy/text-generation' },
    { id: 'chat', name: 'Chat', icon: Send, href: '/comfy/chat' },
    { id: 'settings', name: 'Settings', icon: Settings, href: '/comfy/settings' },
  ]

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <label htmlFor="drawer" className="btn btn-primary drawer-button lg:hidden fixed top-2 left-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div> 
      <div className="drawer-side">
        <label htmlFor="drawer" className="drawer-overlay"></label>
        <div className="menu w-72 min-h-full bg-base-200 text-base-content">
          {/* 侧边栏头部 */}
          <div className="px-6 py-4 border-b border-base-300">
            <h1 className="text-[20px] font-bold">AI Playground</h1>
          </div>
          {/* 侧边栏菜单 */}
          <ul className="menu menu-md py-4">
            {apps.map((app) => (
              <li key={app.id}>
                <Link 
                  href={app.href}
                  className={`flex items-center gap-3 text-[16px] ${
                    pathname === app.href || (app.href === '/comfy/image-generation' && pathname === '/comfy') 
                      ? 'active' 
                      : ''
                  }`}
                >
                  <app.icon className="h-4 w-4 shrink-0" />
                  {app.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
