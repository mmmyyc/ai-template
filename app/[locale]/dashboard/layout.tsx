import { Inter } from 'next/font/google'
import { MainNav } from './components/main-nav'
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import React from 'react';
import TourProvider from '@/app/[locale]/dashboard/components/TourProvider';
import { getSEOTags } from "@/libs/seo";
const inter = Inter({ subsets: ["latin"] })

export const metadata =  getSEOTags({
  title: "SlidesCraft - AI PPT Generator | Professional Presentation Tool",
  description: "SlidesCraft is a professional AI presentation tool offering fine-grained content control, deep customization, data visualization, and online presentation features to help you quickly create high-quality professional PPTs.",
  openGraph: {
    title: "SlidesCraft - AI PPT Generator | Professional Presentation Tool",
    description: "SlidesCraft is a professional AI presentation tool offering fine-grained content control, deep customization, data visualization, and online presentation features to help you quickly create high-quality professional PPTs.",
    url: `https://${config.domainName}/dashboard`,
  },
  canonicalUrlRelative: "/dashboard",
});


export default async function Layout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({
      href: config.auth.loginUrl,
      locale: params.locale
    });
  }
  return (
    <div className={inter.className}>
      <div className="drawer lg:drawer-open">
        <input id="drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* <TourProvider> */}
            {children}
          {/* </TourProvider> */}
        </div>
        
        {/* 侧边栏 */}
        <MainNav />
      </div>
    </div>
  )
} 