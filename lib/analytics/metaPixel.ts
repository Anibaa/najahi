import type { MetaPixelEventSettings, MetaPixelSettings, PublicMetaPixelSettings } from "@/lib/types"

export type MetaStandardEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase"

export type MetaPixelPayloadScalar = string | number | boolean | null
export type MetaPixelPayloadValue =
  | MetaPixelPayloadScalar
  | MetaPixelPayloadScalar[]
  | Array<Record<string, MetaPixelPayloadScalar>>

export type MetaPixelPayload = Record<string, MetaPixelPayloadValue>

export type MetaEventPayloads = {
  PageView: MetaPixelPayload
  ViewContent: MetaPixelPayload & {
    content_ids: string[]
    content_name: string
    content_type: "product"
    value: number
    currency: "TND"
    content_category?: string
  }
  AddToCart: MetaPixelPayload & {
    content_ids: string[]
    content_name: string
    content_type: "product"
    value: number
    currency: "TND"
    quantity: number
  }
  InitiateCheckout: MetaPixelPayload & {
    content_ids: string[]
    content_type: "product"
    num_items: number
    value: number
    currency: "TND"
  }
  Purchase: MetaPixelPayload & {
    content_ids: string[]
    content_type: "product"
    value: number
    currency: "TND"
    order_id: string
  }
}

export type MetaTrackOptions = {
  dedupeKey?: string
  dedupeWindowMs?: number
  eventId?: string
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

export const META_PIXEL_MAX_ID_LENGTH = 32

export const defaultMetaPixelSettings: MetaPixelSettings = {
  enabled: false,
  pixelId: "",
  events: {
    pageView: true,
    viewContent: true,
    addToCart: true,
    initiateCheckout: true,
    purchase: true,
  },
}

export const metaPixelEventSettingKeys: Record<MetaStandardEvent, keyof MetaPixelEventSettings> = {
  PageView: "pageView",
  ViewContent: "viewContent",
  AddToCart: "addToCart",
  InitiateCheckout: "initiateCheckout",
  Purchase: "purchase",
}

export const metaPixelEventOptions: Array<{
  event: MetaStandardEvent
  key: keyof MetaPixelEventSettings
}> = [
  { event: "PageView", key: "pageView" },
  { event: "ViewContent", key: "viewContent" },
  { event: "AddToCart", key: "addToCart" },
  { event: "InitiateCheckout", key: "initiateCheckout" },
  { event: "Purchase", key: "purchase" },
]

let activeMetaPixelSettings: PublicMetaPixelSettings = cloneMetaPixelSettings(defaultMetaPixelSettings)
let activeMarketingConsent = true

const recentTrackedEvents = new Map<string, number>()
const DEFAULT_DEDUPE_WINDOW_MS = 1500

export function cloneMetaPixelSettings(settings: MetaPixelSettings): MetaPixelSettings {
  return {
    enabled: settings.enabled,
    pixelId: settings.pixelId,
    events: { ...settings.events },
  }
}

export function isValidMetaPixelId(pixelId: string): boolean {
  return new RegExp(`^\\d{1,${META_PIXEL_MAX_ID_LENGTH}}$`).test(pixelId)
}

export function normalizeMetaPixelSettings(value: unknown): MetaPixelSettings {
  const record = asRecord(value)

  if (!record) {
    return cloneMetaPixelSettings(defaultMetaPixelSettings)
  }

  const eventsRecord = asRecord(record.events)
  const pixelId = typeof record.pixelId === "string" ? record.pixelId.trim() : ""

  return {
    enabled: typeof record.enabled === "boolean" ? record.enabled : defaultMetaPixelSettings.enabled,
    pixelId: /^\d*$/.test(pixelId) && pixelId.length <= META_PIXEL_MAX_ID_LENGTH ? pixelId : "",
    events: {
      pageView: readBoolean(eventsRecord, "pageView", defaultMetaPixelSettings.events.pageView),
      viewContent: readBoolean(eventsRecord, "viewContent", defaultMetaPixelSettings.events.viewContent),
      addToCart: readBoolean(eventsRecord, "addToCart", defaultMetaPixelSettings.events.addToCart),
      initiateCheckout: readBoolean(
        eventsRecord,
        "initiateCheckout",
        defaultMetaPixelSettings.events.initiateCheckout,
      ),
      purchase: readBoolean(eventsRecord, "purchase", defaultMetaPixelSettings.events.purchase),
    },
  }
}

export function setMetaPixelConfig(
  settings: PublicMetaPixelSettings,
  options: { hasMarketingConsent?: boolean } = {},
): void {
  activeMetaPixelSettings = normalizeMetaPixelSettings(settings)
  activeMarketingConsent = options.hasMarketingConsent ?? true
}

export function getActiveMetaPixelSettings(): PublicMetaPixelSettings {
  return cloneMetaPixelSettings(activeMetaPixelSettings)
}

export function canTrackMetaEvent(event: MetaStandardEvent): boolean {
  if (!activeMarketingConsent) return false
  if (!activeMetaPixelSettings.enabled) return false
  if (!isValidMetaPixelId(activeMetaPixelSettings.pixelId)) return false

  const settingKey = metaPixelEventSettingKeys[event]
  return activeMetaPixelSettings.events[settingKey] === true
}

export function trackMetaEvent<EventName extends MetaStandardEvent>(
  event: EventName,
  payload?: MetaEventPayloads[EventName],
  options: MetaTrackOptions = {},
): boolean {
  if (typeof window === "undefined") return false
  if (!canTrackMetaEvent(event)) return false

  const fbq = window.fbq
  if (typeof fbq !== "function") return false
  if (options.dedupeKey && hasRecentEvent(options.dedupeKey, options.dedupeWindowMs)) return false

  try {
    const args: unknown[] = ["track", event]
    const hasPayload = payload && Object.keys(payload).length > 0

    if (hasPayload) {
      args.push(payload)
    }

    if (options.eventId) {
      if (!hasPayload) {
        args.push({})
      }
      args.push({ eventID: options.eventId })
    }

    fbq(...args)
    if (options.dedupeKey) {
      markRecentEvent(options.dedupeKey)
    }
    return true
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug("Meta Pixel event ignored", error)
    }
    return false
  }
}

function hasRecentEvent(dedupeKey: string, dedupeWindowMs = DEFAULT_DEDUPE_WINDOW_MS): boolean {
  const now = Date.now()
  const previous = recentTrackedEvents.get(dedupeKey)
  const purgeBefore = now - Math.max(dedupeWindowMs, 60_000)

  for (const [key, trackedAt] of recentTrackedEvents) {
    if (trackedAt < purgeBefore) {
      recentTrackedEvents.delete(key)
    }
  }

  if (previous && now - previous < dedupeWindowMs) {
    return true
  }

  return false
}

function markRecentEvent(dedupeKey: string): void {
  recentTrackedEvents.set(dedupeKey, Date.now())
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function readBoolean(record: Record<string, unknown> | null, key: keyof MetaPixelEventSettings, fallback: boolean) {
  const value = record?.[key]
  return typeof value === "boolean" ? value : fallback
}
