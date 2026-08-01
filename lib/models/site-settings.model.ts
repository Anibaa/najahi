import mongoose, { Schema } from "mongoose"
import { defaultMetaPixelSettings } from "@/lib/analytics/metaPixel"

const MetaPixelEventsSchema = new Schema(
  {
    pageView: { type: Boolean, default: true },
    viewContent: { type: Boolean, default: true },
    addToCart: { type: Boolean, default: true },
    initiateCheckout: { type: Boolean, default: true },
    purchase: { type: Boolean, default: true },
  },
  { _id: false },
)

const MetaPixelSchema = new Schema(
  {
    enabled: { type: Boolean, default: defaultMetaPixelSettings.enabled },
    pixelId: { type: String, default: defaultMetaPixelSettings.pixelId },
    events: {
      type: MetaPixelEventsSchema,
      default: () => ({ ...defaultMetaPixelSettings.events }),
    },
  },
  { _id: false },
)

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "site" },
    metaPixel: {
      type: MetaPixelSchema,
      default: () => ({
        ...defaultMetaPixelSettings,
        events: { ...defaultMetaPixelSettings.events },
      }),
    },
  },
  {
    minimize: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

if ((mongoose as unknown as { models?: Record<string, unknown> }).models?.SiteSettings) {
  delete mongoose.models.SiteSettings
}

const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema)

export default SiteSettings
