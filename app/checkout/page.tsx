"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import type { CheckoutData } from "@/lib/types"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, total, clearCart } = useCart()
  const [formData, setFormData] = useState<CheckoutData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "Card",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-muted/30 flex items-center justify-center">
          <div className="text-center animate-fadeInUp">
            <p className="text-lg text-muted-foreground mb-4">Votre panier est vide</p>
            <Link
              href="/books"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Continuer vos achats
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookIds: cart.map((item) => item.book.id),
          quantities: cart.map((item) => item.quantity),
          totalPrice: total,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
        }),
      })

      if (!response.ok) throw new Error("Échec de la création de la commande")

      setIsSuccess(true)
      clearCart()

      setTimeout(() => {
        router.push("/order-confirmation")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la création de votre commande")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-all duration-200 hover:scale-105 active:scale-95 animate-slideInLeft"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au panier
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 animate-fadeInUp">Passer la commande</h1>

          {isSuccess ? (
            <div className="flex items-center justify-center py-16 animate-scaleIn">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse"></div>
                    <CheckCircle2 className="w-20 h-20 text-green-600 relative animate-scaleIn" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Commande en cours de traitement</h2>
                <p className="text-muted-foreground mb-6">Redirection vers la confirmation...</p>
                <LoadingSpinner />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-soft p-6 md:p-8 animate-fadeInUp">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/30 flex items-start gap-3 animate-slideUp">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Erreur</p>
                          <p className="text-sm mt-1">{error}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nom complet</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        placeholder="Votre nom"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                          placeholder="votre@email.com"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Téléphone</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                          placeholder="+216 XX XXX XXX"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Adresse</label>
                      <textarea
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none"
                        placeholder="Votre adresse complète"
                        disabled={isLoading}
                      />
                    </div>



                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:bg-primary/50 disabled:cursor-not-allowed font-medium hover:shadow-soft-hover hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Traitement...
                        </>
                      ) : (
                        "Confirmer l'achat"
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-soft p-6 sticky top-20 animate-slideInRight">
                  <h2 className="text-lg font-bold text-foreground mb-4">Résumé de la commande</h2>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div
                        key={item.book.id}
                        className="flex justify-between text-sm animate-fadeInUp"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <span className="text-muted-foreground line-clamp-1">
                          {item.book.title} <span className="font-semibold">x{item.quantity}</span>
                        </span>
                        <span className="font-medium flex-shrink-0 ml-2">
                          {(item.book.price * item.quantity).toFixed(2)} DT
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between font-bold text-lg animate-slideUp">
                      <span>Total :</span>
                      <span className="text-primary text-xl">{total.toFixed(2)} DT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
