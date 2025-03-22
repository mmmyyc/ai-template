import { ReactNode } from "react";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { Suspense } from 'react'
export const metadata = getSEOTags({
  title: `Sign-in to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
