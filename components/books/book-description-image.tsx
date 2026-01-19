
import { Book } from "@/lib/types"

interface BookDescriptionImageProps {
    image?: string
    alt: string
}

export function BookDescriptionImage({ image, alt }: BookDescriptionImageProps) {
    if (!image) return null

    return (
        <div className="mt-8 md:mt-12 rounded-xl overflow-hidden border border-border shadow-soft animate-fadeInUp">
            <div className="bg-muted p-1 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground px-3 py-1 uppercase tracking-wider">
                    Aperçu détaillé
                </p>
            </div>
            <div className="relative aspect-video w-full bg-muted">
                <img
                    src={image}
                    alt={`Description visuelle de ${alt}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                />
            </div>
        </div>
    )
}
