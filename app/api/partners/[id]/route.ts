import { type NextRequest, NextResponse } from "next/server"
import { deletePartner } from "@/lib/api"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const success = await deletePartner(id)

        if (success) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Partenaire supprimé avec succès",
                },
                { status: 200 },
            )
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: "Partner not found or failed to delete",
                },
                { status: 404 },
            )
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete partner",
            },
            { status: 500 },
        )
    }
}
