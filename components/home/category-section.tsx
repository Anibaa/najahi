"use client"

import Link from "next/link"
import { BookOpen, GraduationCap, BookMarked } from "lucide-react"

export function CategorySection() {
  const categories = [
    {
      id: "primaire",
      label: "Primaire",
      icon: BookMarked,
      description: "Références et livres pour les classes Primaires",
      href: "/books?level=primaire",
    },
    {
      id: "college",
      label: "Collège",
      icon: BookOpen,
      description: "Livres et matériels éducatifs pour le collège",
      href: "/books?level=college",
    },
    {
      id: "lycee",
      label: "Lycée",
      icon: GraduationCap,
      description: "Contenu éducatif complet pour le lycée",
      href: "/books?level=lycee",
    },

  ]

  return (
    <section className="py-8 md:py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3 text-primary animate-fadeInUp">
          Parcourir par Niveau
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto text-sm md:text-base animate-slideUp">
          Découvrez les livres adaptés à votre niveau d'études et trouvez les ressources qui vous conviennent
        </p>

        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group p-2 md:p-7 rounded-lg md:rounded-xl border border-border bg-card hover:shadow-soft-hover hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 mb-0 md:mb-4">
                  <div className="p-2 md:p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3">
                    <IconComponent className="w-5 h-5 md:w-7 md:h-7 text-primary" />
                  </div>
                  <h3 className="text-xs md:text-xl font-semibold text-center md:text-left text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {cat.label}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300 hidden md:block">
                  {cat.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
