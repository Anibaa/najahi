"use client"

import Link from "next/link"
import { Star, ShoppingCart, BookOpen } from "lucide-react"
import type { Book } from "@/lib/types"

interface BooksGridProps {
  books: Book[]
  searchQuery?: string
}

export function BooksGrid({ books, searchQuery }: BooksGridProps) {
  if (books.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground mb-4 opacity-40" />
        <h3 className="text-xl md:text-2xl font-semibold text-card-foreground mb-2">
          {searchQuery ? "Aucun Résultat Trouvé" : "Aucun Livre Trouvé"}
        </h3>
        <p className="text-muted-foreground text-sm md:text-base max-w-md">
          {searchQuery ? (
            <>
              Aucun livre ne correspond à votre recherche "<strong className="text-foreground">{searchQuery}</strong>".
              <br />
              Essayez avec d'autres mots-clés ou modifiez vos filtres.
            </>
          ) : (
            "Essayez de modifier vos filtres pour trouver les livres que vous recherchez"
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book, idx) => (
        <div
          key={book.id}
          className="group bg-card rounded-lg md:rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <Link href={`/books/${book.id}`}>
            <div className="relative overflow-hidden bg-muted aspect-[3/4]">
              <img
                src={book.image || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-foreground font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Ajouter</span>
                </button>
              </div>
              <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                {book.language === "ar" ? "Arabe" : book.language === "fr" ? "Français" : "English"}
              </div>
            </div>
          </Link>

          <div className="p-4 md:p-5">
            <Link href={`/books/${book.id}`} className="group/title">
              <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2 group-hover/title:text-primary transition-colors text-sm md:text-base">
                {book.title}
              </h3>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-1">{book.author}</p>



            <div className="flex items-center justify-between gap-2">
              <span className="text-lg md:text-xl font-bold text-primary">{book.price} DT</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {book.level === "college" ? "Collège" : book.level === "lycee" ? "Lycée" : "Préparatoire"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
