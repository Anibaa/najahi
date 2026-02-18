"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Star, ShoppingCart } from "lucide-react"
import { getRecentlyViewed } from "@/lib/personalization"
import type { Book } from "@/lib/types"

export function RecentlyViewed() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function loadRecentlyViewed() {
      const recentIds = getRecentlyViewed()
      if (recentIds.length === 0) return

      const recentBooks: Book[] = []
      for (const id of recentIds.slice(0, 4)) {
        try {
          const res = await fetch(`/api/books/${id}`)
          const data = await res.json()
          if (data.success && data.data) {
            recentBooks.push(data.data)
          }
        } catch (error) {
          console.error("Failed to load book:", id)
        }
      }
      setBooks(recentBooks)
      setIsLoaded(true)
    }

    loadRecentlyViewed()
  }, [])

  if (!isLoaded || books.length === 0) return null

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-card border-t border-border">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Récemment consultés</h2>
        <p className="text-muted-foreground mb-8">Découvrez les livres que vous avez récemment visité</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book, idx) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-card rounded-lg md:rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="relative overflow-hidden bg-muted aspect-[3/4]">
                <img
                  src={book.image || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  {book.language === "ar" ? "العربية" : book.language === "fr" ? "Français" : "English"}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="p-3 rounded-full bg-secondary hover:bg-secondary/90 text-foreground transition-all duration-200 hover:scale-110 shadow-lg">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-5">
                <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm md:text-base">
                  {book.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-1">{book.author}</p>



                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    {book.promoPrice ? (
                      <>
                        <span className="text-lg md:text-xl font-bold text-red-600">{book.promoPrice} DT</span>
                        <span className="text-xs text-muted-foreground line-through">{book.price} DT</span>
                      </>
                    ) : (
                      <span className="text-lg md:text-xl font-bold text-primary">{book.price} DT</span>
                    )}
                  </div>

                  {book.promoPrice ? (
                    <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded-full">
                      -{Math.round(((book.price - book.promoPrice) / book.price) * 100 / 5) * 5}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {book.level === "college" ? "Collège" : book.level === "lycee" ? "Lycée" : "Primaire"}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
