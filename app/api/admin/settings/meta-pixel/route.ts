import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { metaPixelSettingsSchema } from "@/lib/analytics/metaPixelSchema"
import { isAdminRequest } from "@/lib/admin-auth"
import { getMetaPixelSettings, updateMetaPixelSettings } from "@/lib/settings"

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return unauthorizedResponse()
  }

  try {
    const settings = await getMetaPixelSettings()

    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Impossible de charger les param\u00e8tres Meta Pixel",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()
    const parsed = metaPixelSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Param\u00e8tres Meta Pixel invalides",
          fieldErrors: formatZodErrors(parsed.error),
        },
        { status: 400 },
      )
    }

    const saved = await updateMetaPixelSettings(parsed.data)

    revalidatePath("/")
    revalidatePath("/admin")

    return NextResponse.json(
      {
        success: true,
        data: saved,
        message: "Param\u00e8tres Meta Pixel enregistr\u00e9s avec succ\u00e8s",
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Impossible d'enregistrer les param\u00e8tres Meta Pixel",
      },
      { status: 500 },
    )
  }
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "Acc\u00e8s administrateur requis",
    },
    { status: 401 },
  )
}

function formatZodErrors(error: z.ZodError) {
  const flattened = error.flatten()
  const fieldErrors: Record<string, string> = {}

  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    if (messages?.[0]) {
      fieldErrors[field] = messages[0]
    }
  }

  if (flattened.formErrors[0]) {
    fieldErrors.form = flattened.formErrors[0]
  }

  return fieldErrors
}
