"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { cart } = useCart()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="relative w-8 h-8">
          <Image
            src="/logo.png"        // put your logo in /public/logo.png
            alt="Tunitest logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <span className="font-bold text-lg text-primary hidden sm:inline">
          Tunitest
        </span>
      </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/books" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
            Livres
          </Link>
          <Link href="/about" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
            À propos
          </Link>
          <Link href="/partner" className="text-foreground hover:text-primary transition-colors font-medium text-sm">
            Devenir Partenaire
          </Link>

        </nav>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/cart")}
            className="p-2 hover:bg-muted rounded-lg transition-all duration-200 relative group"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
                {cart.length}
              </span>
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Panier ({cart.length})
            </span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slideInLeft">
          <nav className="px-4 py-4 space-y-3">
            <Link
              href="/books"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Livres
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors font-medium"
            >
              À propos
            </Link>
            <Link
              href="/partner"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Devenir Partenaire
            </Link>
            <Link
              href="/admin"
              className="block px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors font-medium"
            >
              Tableau de Bord
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
