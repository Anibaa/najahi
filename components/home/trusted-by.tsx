import { Building2 } from "lucide-react"

const PARTNERS = [
    "Anas School",
    "Manaret El Mourouj",
    "Lamis School",
    "Fatima Zahra",
    "Mongil School",
]

export function TrustedBy() {
    return (
        <section className="border-y border-border/50 bg-gradient-to-b from-muted/20 to-muted/5 py-10 md:py-24 px-4 md:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Title */}
                <div className="mb-6 md:mb-14 text-center">
                    <span className="inline-flex items-center justify-center p-1.5 md:p-2 mb-3 md:mb-4 rounded-full bg-primary/10 text-primary">
                        <Building2 className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                    <h3 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">
                        Ils nous font confiance
                    </h3>
                    <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                        Les établissements d'excellence qui ont choisi nos solutions éducatives
                    </p>
                </div>

                {/* Names */}
                <div
                    className="
                        flex flex-wrap items-center justify-center
                        gap-x-4 gap-y-3 md:gap-x-16 md:gap-y-10
                    "
                >
                    {PARTNERS.map((name) => (
                        <div
                            key={name}
                            className="group relative"
                        >
                            <span
                                className="
                                    text-sm md:text-xl font-medium text-muted-foreground/80
                                    transition-all duration-300 ease-in-out
                                    group-hover:text-primary group-hover:scale-105
                                    cursor-default inline-block
                                "
                            >
                                {name}
                            </span>
                            {/* Subtle underline effect on hover */}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full opacity-50" />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
