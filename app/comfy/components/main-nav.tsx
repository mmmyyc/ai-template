'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Image, Layers, Send, Settings } from 'lucide-react'

export function MainNav() {
  const pathname = usePathname()
  
  const apps = [
    { id: 'image-gen', name: 'DeskPet Generation', icon: Image, href: '/comfy/image-generation' },
    // { id: 'text-gen', name: 'Text Generation', icon: Send, href: '/comfy/text-generation' },
    // { id: 'chat', name: 'Chat', icon: Layers, href: '/comfy/chat' },
    // { id: 'settings', name: 'Settings', icon: Settings, href: '/comfy/settings' },
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
          <div className="px-2 py-4 border-b border-base-300">
            <div className="flex items-center mb-8">
              <Link href="/" className="btn btn-ghost btn-sm gap-2 fixed top-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                    clipRule="evenodd"
                  />
                </svg>
                Back Home
              </Link>
            </div>
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
