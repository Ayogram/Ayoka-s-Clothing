"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Product } from "@/lib/types"

interface CartItem {
  product: Product
  size: string
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, size: string, quantity: number) => void
  removeFromCart: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  totalPrice: number
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("ayoka_cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("ayoka_cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id && item.size === size)
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product, size, quantity }]
    })
  }

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)))
  }

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity < 1) return
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setCart([])

  const totalPrice = cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
