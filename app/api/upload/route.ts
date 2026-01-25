
import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file uploaded" },
                { status: 400 }
            );
        }

        const blob = await put(file.name, file, {
            access: "public",
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { success: false, error: "Upload failed" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const urlToDelete = searchParams.get("url");

        if (!urlToDelete) {
            return NextResponse.json(
                { success: false, error: "Missing url parameter" },
                { status: 400 }
            );
        }

        await del(urlToDelete);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { success: false, error: "Delete failed" },
            { status: 500 }
        );
    }
}
