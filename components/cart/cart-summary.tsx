"use client"

import { useCart } from "@/hooks/use-cart"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CartSummary() {
  const { cart, subtotal, deliveryFee, total } = useCart()

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 sticky top-20">
      <h2 className="text-lg font-bold text-foreground mb-6">Résumé du Panier</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Articles ({cart.length})</span>
          <span className="font-semibold text-foreground">{subtotal.toFixed(2)} DT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Livraison</span>
          {deliveryFee === 0 ? (
            <span className="font-semibold text-green-600">Gratuite</span>
          ) : (
            <span className="font-semibold text-foreground">{deliveryFee.toFixed(2)} DT</span>
          )}
        </div>
        {subtotal < 100 && subtotal > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            Ajoutez {(100 - subtotal).toFixed(2)} DT pour la livraison gratuite
          </div>
        )}
        <div className="flex justify-between pt-4 border-t border-border">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-lg text-primary">{total.toFixed(2)} DT</span>
        </div>
      </div>

      {cart.length > 0 ? (
        <Link href="/checkout" className="w-full block">
          <Button className="w-full py-3 rounded-lg font-semibold">Aller au paiement</Button>
        </Link>
      ) : (
        <Button disabled className="w-full py-3 rounded-lg font-semibold">
          Panier vide
        </Button>
      )}

      <Link
        href="/books"
        className="block text-center text-sm text-primary hover:text-primary/80 mt-4 transition-colors"
      >
        Continuer les achats
      </Link>
    </div>
  )
}
