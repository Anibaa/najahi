"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Package, Truck, ShieldCheck, Zap } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { saveFavorite, isFavorited } from "@/lib/personalization"
import { BookGallery } from "./book-gallery"
import type { Book } from "@/lib/types"

interface BookDetailsProps {
  book: Book
}

export function BookDetails({ book }: BookDetailsProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsFavorite(isFavorited(book.id))
  }, [book.id])

  const handleAddToCart = () => {
    addToCart(book, quantity)
    toast({
      title: "Succès",
      description: `${quantity} exemplaire(s) de "${book.title}" ajouté(e)(s) au panier`,
    })
  }

  const handleBuyNow = async () => {
    setIsLoading(true)
    addToCart(book, quantity)
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.push("/checkout")
  }

  const handleToggleFavorite = () => {
    saveFavorite(book.id)
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Supprimé des favoris" : "Ajouté aux favoris",
      description: book.title,
    })
  }

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const text = `Découvrez ${book.title} sur Najahi`

    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: text,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers",
      })
    }
  }

  // Use images array if available, otherwise fall back to single image
  const galleryImages = book.images && book.images.length > 0 ? book.images : [book.image]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 animate-fadeInUp">
      {/* Gallery */}
      <div>
        <BookGallery images={galleryImages} title={book.title} />
      </div>

      {/* Details */}
      <div>
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs md:text-sm text-white bg-primary px-3 py-1 rounded-full font-semibold">
            {book.level === "primary"
              ? "Niveau Primaire"
              : book.level === "secondary"
                ? "Niveau Secondaire"
                : "Niveau Université"}
          </span>
          <span className="text-xs md:text-sm text-foreground bg-accent px-3 py-1 rounded-full font-semibold">
            {book.language === "ar" ? "Arabe" : book.language === "fr" ? "Français" : "English"}
          </span>
          <span className="text-xs md:text-sm text-foreground bg-secondary px-3 py-1 rounded-full font-semibold">
            {book.category === "primary" ? "Primaire" : book.category === "secondary" ? "Secondaire" : "Université"}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-3 md:mb-4 text-balance">{book.title}</h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 font-medium">Par: {book.author}</p>

        {/* Description */}
        {book.description && (
          <div className="mb-8 p-6 md:p-7 bg-primary/5 border border-primary/20 rounded-lg md:rounded-xl hover:border-primary/40 transition-colors">
            <h3 className="font-semibold text-card-foreground mb-3 text-base md:text-lg">Description</h3>
            <p className="text-muted-foreground text-pretty text-sm md:text-base leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {book.language && (
            <div className="p-4 md:p-5 border border-border rounded-lg md:rounded-xl hover:border-primary/50 transition-colors">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">Langue</p>
              <p className="font-semibold text-card-foreground text-sm md:text-base">
                {book.language === "ar" ? "Arabe" : book.language === "fr" ? "Français" : "Anglais"}
              </p>
            </div>
          )}
          {book.category && (
            <div className="p-4 md:p-5 border border-border rounded-lg md:rounded-xl hover:border-primary/50 transition-colors">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">Catégorie</p>
              <p className="font-semibold text-card-foreground text-sm md:text-base">
                {book.category === "primary" ? "Primaire" : book.category === "secondary" ? "Secondaire" : "Université"}
              </p>
            </div>
          )}
        </div>

        {/* Price and Actions */}
        <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg md:rounded-xl hover:border-primary/40 transition-colors">
          <div className="text-4xl md:text-5xl font-bold text-primary mb-6">{book.price} DT</div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-lg hover:bg-muted transition-all duration-200 hover:scale-110 active:scale-95 font-semibold"
            >
              −
            </button>
            <span className="text-xl md:text-2xl font-bold text-card-foreground min-w-12 md:min-w-16 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 md:px-4 py-2 md:py-3 border border-border rounded-lg hover:bg-muted transition-all duration-200 hover:scale-110 active:scale-95 font-semibold"
            >
              +
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleBuyNow}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-accent-foreground font-bold rounded-lg transition-all duration-200 hover:shadow-soft-hover hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
              {isLoading ? "Traitement..." : "Acheter maintenant"}
            </button>
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-soft-hover hover:scale-105 active:scale-95 text-sm md:text-base"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              Ajouter au Panier
            </button>
          </div>

          {/* Trust Badges */}
          <div className="space-y-2 text-sm md:text-base">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Truck className="w-5 h-5 text-accent" />
              <span>Livraison rapide et sécurisée</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Package className="w-5 h-5 text-accent" />
              <span>Livres garantis d'origine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
