import { type NextRequest, NextResponse } from "next/server"
import { getBookById } from "@/lib/api"
import dbConnect from "@/lib/db"
import Book from "@/lib/models/book.model"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const book = await getBookById(id)

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: "Livre non trouvé",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: book,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch book",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    // If images array is provided, use first image as primary if primary not specified properly
    if (body.images && body.images.length > 0 && !body.image) {
      body.image = body.images[0]
    }

    const updatedBook = await Book.findByIdAndUpdate(id, body, { new: true, runValidators: true })

    if (!updatedBook) {
      return NextResponse.json(
        {
          success: false,
          error: "Livre non trouvé",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedBook,
        message: "Livre mis à jour avec succès",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Update book error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Impossible de mettre à jour le livre",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const deletedBook = await Book.findByIdAndDelete(id)

    if (!deletedBook) {
      return NextResponse.json(
        {
          success: false,
          error: "Livre non trouvé",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Livre supprimé avec succès",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Delete book error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete book",
      },
      { status: 500 },
    )
  }
}
