"use client"

import { useCallback, useEffect, useState } from "react"
import type { CartItem, Book } from "@/lib/types"

const CART_STORAGE_KEY = "Tunitest_cart"

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to load cart:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      // Notify other listeners in the same window (storage event doesn't fire in same window)
      try {
        const event = new CustomEvent("tunitest_cart_updated", { detail: cart })
        window.dispatchEvent(event)
      } catch (e) {
        // ignore
      }
    }
  }, [cart, isLoading])

  // Listen for storage changes (other tabs) and custom events (same tab)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          setCart(e.newValue ? JSON.parse(e.newValue) : [])
        } catch (err) {
          console.error("Failed to parse cart from storage event:", err)
        }
      }
    }

    const onCustom = (e: Event) => {
      try {
        // CustomEvent with detail contains cart array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ce = e as CustomEvent<any>
        setCart(ce.detail ?? [])
      } catch (err) {
        console.error("Failed to handle custom cart event:", err)
      }
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("tunitest_cart_updated", onCustom)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("tunitest_cart_updated", onCustom)
    }
  }, [])

  const addToCart = useCallback((book: Book, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.book.id === book.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prevCart, { book, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((bookId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.book.id !== bookId))
  }, [])

  const updateQuantity = useCallback(
    (bookId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(bookId)
      } else {
        setCart((prevCart) => prevCart.map((item) => (item.book.id === bookId ? { ...item, quantity } : item)))
      }
    },
    [removeFromCart],
  )

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0)
  const total = subtotal

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    total,
    itemCount: cart.length,
    isLoading,
  }
}
