'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Image, Layers, Menu, Send, Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const apps = [
    { id: 'image-gen', name: 'Image Generation', icon: Image, href: '/comfy/image-generation' },
    { id: 'text-gen', name: 'Text Generation', icon: Layers, href: '/comfy/text-generation' },
    { id: 'chat', name: 'Chat', icon: Send, href: '/comfy/chat' },
    { id: 'settings', name: 'Settings', icon: Settings, href: '/comfy/settings' },
  ]

  const navContent = (
    <>
      <div className="navbar bg-base-100 border-b">
        <div className="flex-1">
          <h1 className="text-xl font-bold px-4">AI Playground</h1>
        </div>
      </div>
      <ul className="menu menu-lg bg-base-100 w-full p-4">
        {apps.map((app) => {
          const isActive = pathname === app.href || 
            (app.href === '/comfy/image-generation' && pathname === '/comfy')
          return (
            <li key={app.id}>
              <Link
                href={app.href}
                className={cn(
                  isActive && "active"
                )}
              >
                <app.icon className="h-4 w-4" />
                {app.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )

  return (
    <>
      <button
        className="btn btn-ghost btn-circle fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 移动端背景遮罩 */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* 导航栏 */}
      <div
        className={cn(
          "drawer-side fixed top-0 bottom-0 left-0 z-40 w-72 bg-base-100 transition-transform duration-200 ease-in-out md:sticky md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </div>
    </>
  )
} 