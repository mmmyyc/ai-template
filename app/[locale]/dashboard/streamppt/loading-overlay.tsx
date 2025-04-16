"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface LoadingOverlayProps {
  isLoading: boolean
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  const t = useTranslations('StreamPpt')
  if (!isLoading) return null

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <h2 className="text-xl font-bold mb-2">{t('loadingTitle')}</h2>
      <p className="text-muted-foreground">{t('loadingDescription')}</p>
    </div>
  )
}

