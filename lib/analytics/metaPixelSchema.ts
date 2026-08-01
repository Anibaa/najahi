import { z } from "zod"
import { META_PIXEL_MAX_ID_LENGTH } from "@/lib/analytics/metaPixel"

export const metaPixelSettingsSchema = z
  .object({
    enabled: z.boolean(),
    pixelId: z
      .string()
      .trim()
      .max(META_PIXEL_MAX_ID_LENGTH, `Le Pixel ID ne doit pas d\u00e9passer ${META_PIXEL_MAX_ID_LENGTH} chiffres`)
      .regex(/^\d*$/, "Le Pixel ID doit contenir uniquement des chiffres"),
    events: z.object({
      pageView: z.boolean(),
      viewContent: z.boolean(),
      addToCart: z.boolean(),
      initiateCheckout: z.boolean(),
      purchase: z.boolean(),
    }),
  })
  .refine((data) => !data.enabled || data.pixelId.length > 0, {
    message: "Le Meta Pixel ID est obligatoire lorsque le Pixel est activ\u00e9",
    path: ["pixelId"],
  })

export type MetaPixelSettingsInput = z.infer<typeof metaPixelSettingsSchema>
