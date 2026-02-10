"use client"

import Link from "next/link"
import { BookOpen, GraduationCap, BookMarked } from "lucide-react"

export function CategorySection() {
  const categories = [
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
    {
      id: "preparatoire",
      label: "Préparatoire",
      icon: BookMarked,
      description: "Références et livres pour les classes préparatoires",
      href: "/books?level=preparatoire",
    },
  ]

  return (
    <section className="py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-primary animate-fadeInUp">
          Parcourir par Niveau
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-sm md:text-base animate-slideUp">
          Découvrez les livres adaptés à votre niveau d'études et trouvez les ressources qui vous conviennent
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group p-6 md:p-7 rounded-lg md:rounded-xl border border-border bg-card hover:shadow-soft-hover hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 md:p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3">
                    <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {cat.label}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300">
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
