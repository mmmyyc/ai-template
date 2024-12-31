'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Image, Layers, Send, Settings } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'

export function MainNav() {
  const pathname = usePathname()
  const { state } = useSidebar()
  
  const apps = [
    { id: 'image-gen', name: 'Image Generation', icon: Image, href: '/comfy/image-generation' },
    { id: 'text-gen', name: 'Text Generation', icon: Layers, href: '/comfy/text-generation' },
    { id: 'chat', name: 'Chat', icon: Send, href: '/comfy/chat' },
    { id: 'settings', name: 'Settings', icon: Settings, href: '/comfy/settings' },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <h1 className="text-xl font-bold">AI Playground</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {apps.map((app) => (
            <SidebarMenuItem key={app.id}>
              <Link href={app.href} passHref>
                <SidebarMenuButton isActive={pathname === app.href || (app.href === '/comfy/image-generation' && pathname === '/comfy')}>
                  <app.icon className="h-4 w-4" />
                  <span>{app.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
