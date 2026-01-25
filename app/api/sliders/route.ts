import { type NextRequest, NextResponse } from "next/server"
import { getSliders, createSlider } from "@/lib/api"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    const sliders = await getSliders()

    return NextResponse.json(
      {
        success: true,
        data: sliders,
        count: sliders.length,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sliders",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields: only title and image are required
    if (!body.title || !body.image) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title and image are required",
        },
        { status: 400 },
      )
    }

    const newSlider = await createSlider({
      title: body.title,
      subtitle: body.subtitle || "",
      image: body.image,
      cta: body.cta || "",
      link: body.link || "",
    })

    revalidatePath("/")
    revalidatePath("/admin")

    return NextResponse.json(
      {
        success: true,
        data: newSlider,
        message: "Slider created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create slider",
      },
      { status: 500 },
    )
  }
}
