
import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file uploaded" },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), "public/uploads")
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
        const path = join(uploadDir, filename)

        await writeFile(path, buffer)
        console.log(`Open ${path} to see the uploaded file`)

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { success: false, error: "Upload failed" },
            { status: 500 }
        )
    }
}
