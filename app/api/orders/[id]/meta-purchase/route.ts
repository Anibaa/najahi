import mongoose from "mongoose"
import { NextResponse } from "next/server"
import { isValidMetaPixelId, type MetaEventPayloads } from "@/lib/analytics/metaPixel"
import dbConnect from "@/lib/db"
import OrderModel from "@/lib/models/order.model"
import { getMetaPixelSettings } from "@/lib/settings"

type MetaPurchaseOrderRecord = {
  _id: string | { toString(): string }
  bookIds?: unknown
  quantities?: unknown
  totalPrice?: unknown
  metaPurchaseEventId?: unknown
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Commande invalide",
      },
      { status: 400 },
    )
  }

  const settings = await getMetaPixelSettings()
  if (!settings.enabled || !isValidMetaPixelId(settings.pixelId) || !settings.events.purchase) {
    return NextResponse.json(
      {
        success: true,
        shouldTrack: false,
        reason: "Meta Pixel Purchase disabled",
      },
      { status: 200 },
    )
  }

  await dbConnect()

  const eventId = `purchase-${id}`
  const order = await OrderModel.findOneAndUpdate(
    {
      _id: id,
      $or: [{ metaPurchaseTrackedAt: { $exists: false } }, { metaPurchaseTrackedAt: null }],
    },
    {
      $set: {
        metaPurchaseTrackedAt: new Date(),
        metaPurchaseEventId: eventId,
      },
    },
    { new: true },
  ).lean<MetaPurchaseOrderRecord | null>()

  if (!order) {
    const existingOrder = await OrderModel.findById(id).select("_id metaPurchaseTrackedAt").lean()

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Commande non trouv\u00e9e",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        shouldTrack: false,
        reason: "Purchase already tracked",
      },
      { status: 200 },
    )
  }

  const contentIds = readStringArray(order.bookIds)
  const quantities = readNumberArray(order.quantities)
  const contents = contentIds.map((bookId, index) => ({
    id: bookId,
    quantity: quantities[index] ?? 1,
  }))
  const value = readNumber(order.totalPrice)
  const payload: MetaEventPayloads["Purchase"] = {
    content_ids: contentIds,
    content_type: "product",
    value,
    currency: "TND",
    order_id: id,
    contents,
  }

  return NextResponse.json(
    {
      success: true,
      shouldTrack: true,
      data: {
        eventId,
        payload,
      },
    },
    { status: 200 },
  )
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter(Boolean)
}

function readNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => readNumber(item)).filter((item) => Number.isFinite(item))
}

function readNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}
