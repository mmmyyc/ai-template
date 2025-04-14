import "./styles/globals.css"
import "./styles/custom-animations.css"

import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "./components/theme-provider"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Web PPT Template",
  description: "Create beautiful web presentations with ease",
}

export default function PPTLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </div>
  )
}