import Image from "next/image"

const PARTNERS = [
  { name: "Ministère de l'Éducation", logo: "/logo.png" },
  { name: "CNP", logo: "/placeholder.svg" },
  { name: "Université de Tunis", logo: "/placeholder.svg" },
  { name: "Institut Français", logo: "/placeholder.svg" },

]

export function TrustedBy() {
  return (
    <section className="border-y border-border/50 bg-muted/10 py-10">
      <div className="mx-auto max-w-7xl px-4">

        {/* Title */}
        <div className="mb-6 text-center">
          <h3 className="text-sm font-semibold tracking-wide text-foreground">
            Ils nous font confiance
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Institutions et partenaires officiels
          </p>
        </div>

        {/* Logos – single row, shrink to fit, no scroll */}
        <ul
          role="list"
          className="
            flex items-center justify-center
            gap-4
            flex-wrap-0
            flex-shrink-0
          "
        >
          {PARTNERS.map((partner) => (
            <li
              key={partner.name}
              className="
                relative
                flex-1 min-w-[60px] max-w-[120px] h-8
              "
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="(max-width: 640px) 120px, 120px"
                className="
                  object-contain
                  grayscale opacity-60
                  transition
                  hover:grayscale-0 hover:opacity-100
                "
              />
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
