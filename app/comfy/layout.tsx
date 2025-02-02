import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { MainNav } from './components/main-nav'
import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import React from 'react';
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YCamie - Create AI Desktop Pets & Virtual Companions",
  description: "Generate high-quality AI-powered desktop pets with YCamie. Customize virtual companions featuring intelligent interactions and adorable animations for your workspace.",
}


export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(config.auth.loginUrl);
  }
  return (
    <div className={inter.className}>
      <div className="drawer lg:drawer-open">
        <input id="drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {children}
        </div>
        
        {/* 侧边栏 */}
        <MainNav />
      </div>
    </div>
  )
} 