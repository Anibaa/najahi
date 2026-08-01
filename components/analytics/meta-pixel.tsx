"use client"

import { useEffect, useMemo, useState } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import {
  isValidMetaPixelId,
  setMetaPixelConfig,
  trackMetaEvent,
} from "@/lib/analytics/metaPixel"
import type { PublicMetaPixelSettings } from "@/lib/types"

type MetaPixelProps = {
  settings: PublicMetaPixelSettings
  hasMarketingConsent?: boolean
}

export function MetaPixel({ settings, hasMarketingConsent = true }: MetaPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isBootstrapped, setIsBootstrapped] = useState(false)

  const isAdminPath = pathname?.startsWith("/admin") ?? false
  const safePixelId = isValidMetaPixelId(settings.pixelId) ? settings.pixelId : ""
  const shouldLoad = settings.enabled && Boolean(safePixelId) && hasMarketingConsent && !isAdminPath
  const search = searchParams?.toString()
  const routeKey = pathname ? (search ? `${pathname}?${search}` : pathname) : ""

  const bootstrapScript = useMemo(() => {
    if (!safePixelId) return ""

    return `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${safePixelId}');
    `
  }, [safePixelId])

  useEffect(() => {
    setMetaPixelConfig(settings, {
      hasMarketingConsent: hasMarketingConsent && !isAdminPath,
    })

    if (shouldLoad && typeof window !== "undefined" && typeof window.fbq === "function") {
      setIsBootstrapped(true)
    }
  }, [hasMarketingConsent, isAdminPath, settings, shouldLoad])

  useEffect(() => {
    if (!shouldLoad || !isBootstrapped || !routeKey || !settings.events.pageView) return

    trackMetaEvent("PageView", undefined, {
      dedupeKey: `PageView:${routeKey}`,
      dedupeWindowMs: 2000,
    })
  }, [isBootstrapped, routeKey, settings.events.pageView, shouldLoad])

  if (!shouldLoad || !bootstrapScript) {
    return null
  }

  return (
    <Script
      id="meta-pixel-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: bootstrapScript }}
      onReady={() => setIsBootstrapped(true)}
    />
  )
}
