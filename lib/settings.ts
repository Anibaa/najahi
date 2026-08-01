import { revalidateTag, unstable_cache } from "next/cache"
import { defaultMetaPixelSettings, normalizeMetaPixelSettings } from "@/lib/analytics/metaPixel"
import dbConnect from "@/lib/db"
import SiteSettingsModel from "@/lib/models/site-settings.model"
import type { MetaPixelSettings, PublicMetaPixelSettings } from "@/lib/types"

export const SITE_SETTINGS_KEY = "site"
export const META_PIXEL_SETTINGS_CACHE_TAG = "meta-pixel-settings"

type SiteSettingsRecord = {
  metaPixel?: unknown
}

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

export async function getMetaPixelSettings(): Promise<MetaPixelSettings> {
  try {
    await dbConnect()
    const settings = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY }).lean<SiteSettingsRecord | null>()
    return normalizeMetaPixelSettings(settings?.metaPixel)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Failed to load Meta Pixel settings; using defaults: ${getErrorMessage(error)}`)
    }
    return normalizeMetaPixelSettings(defaultMetaPixelSettings)
  }
}

export const getPublicMetaPixelSettings = unstable_cache(
  async (): Promise<PublicMetaPixelSettings> => getMetaPixelSettings(),
  ["public-meta-pixel-settings"],
  {
    revalidate: 300,
    tags: [META_PIXEL_SETTINGS_CACHE_TAG],
  },
)

export async function updateMetaPixelSettings(settings: MetaPixelSettings): Promise<MetaPixelSettings> {
  const normalized = normalizeMetaPixelSettings(settings)

  await dbConnect()
  const updated = await SiteSettingsModel.findOneAndUpdate(
    { key: SITE_SETTINGS_KEY },
    {
      $set: {
        metaPixel: normalized,
      },
      $setOnInsert: {
        key: SITE_SETTINGS_KEY,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean<SiteSettingsRecord | null>()

  revalidateTag(META_PIXEL_SETTINGS_CACHE_TAG, "max")

  return normalizeMetaPixelSettings(updated?.metaPixel)
}
