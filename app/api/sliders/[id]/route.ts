import { type NextRequest, NextResponse } from "next/server"
import { getSliderById, updateSlider, deleteSlider } from "@/lib/api"
import { revalidatePath } from "next/cache"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await updateSlider(id, body)
    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: "Promotion non trouvée",
        },
        { status: 404 },
      )
    }

    revalidatePath("/")
    revalidatePath("/admin")

    return NextResponse.json(
      {
        success: true,
        data: updated,
        message: "Promotion mise à jour avec succès",
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update slider",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const ok = await deleteSlider(id)
    if (!ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Promotion non trouvée",
        },
        { status: 404 },
      )
    }

    revalidatePath("/")
    revalidatePath("/admin")

    return NextResponse.json(
      {
        success: true,
        message: "Promotion supprimée avec succès",
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete slider",
      },
      { status: 500 },
    )
  }
}
