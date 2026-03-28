"use client"

import { useCart } from "@/lib/CartContext"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-24">
          <div className="text-center space-y-8 px-4">
            <div className="relative w-24 h-24 mx-auto mb-4 opacity-20">
              <ShoppingBag size={96} strokeWidth={1} />
            </div>
            <h2 className="text-3xl font-serif font-bold uppercase tracking-widest">Your Bag is Empty</h2>
            <p className="text-gray-500 uppercase tracking-widest text-xs max-w-xs mx-auto">
              You haven't added any pieces to your collection yet.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-black dark:bg-white text-white dark:text-black px-12 py-4 uppercase tracking-widest text-xs font-bold hover:gold-bg hover:text-white transition-all shadow-lg shadow-black/5"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Shopping Bag</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold">
              {totalItems} Piece{totalItems !== 1 ? 's' : ''} in Selection
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.product.id}-${item.size}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 border-b border-gray-100 dark:border-zinc-900 pb-8 last:border-0"
                >
                  <div className="relative w-32 aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                    <Image src={item.product.main_image} alt={item.product.name} fill className="object-cover" />
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left space-y-2">
                    <Link href={`/product/${item.product.id}`} className="text-lg font-serif hover:gold-text transition-colors">
                      {item.product.name}
                    </Link>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      <p>Size: <span className="text-black dark:text-white">{item.size}</span></p>
                      <p>Category: <span className="text-black dark:text-white">{item.product.category}</span></p>
                    </div>
                    <p className="text-xs text-gray-400 font-light mt-2 line-clamp-1">{item.product.description}</p>
                  </div>

                  <div className="flex flex-col items-center sm:items-end space-y-4 w-full sm:w-auto">
                    <div className="flex items-center border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="px-4 py-2 hover:gold-text transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="px-4 py-2 hover:gold-text transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id, item.size)}
                      className="text-[10px] uppercase tracking-[0.2em] text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 size={12} />
                      <span>Remove item</span>
                    </button>
                    <p className="text-lg font-bold tracking-tighter">₦ {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-black p-8 sticky top-32 border border-gray-100 dark:border-zinc-900 shadow-xl shadow-black/5">
                <h3 className="text-xl font-serif font-bold uppercase tracking-widest mb-8 border-b border-gray-200 dark:border-zinc-800 pb-4">
                  Selection Summary
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-gray-500">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="text-black dark:text-white font-bold">₦ {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-gray-500">
                    <span>Shipping</span>
                    <span className="text-black dark:text-white font-bold">Calculated at Checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-zinc-800 pt-6 mb-10">
                  <div className="flex justify-between items-end">
                    <span className="text-xs uppercase tracking-[0.3em] gold-text font-bold">Estimated Total</span>
                    <span className="text-2xl font-bold tracking-tighter">₦ {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-5 uppercase tracking-[0.3em] font-bold text-[10px] flex items-center justify-center space-x-3 hover:gold-bg hover:text-white transition-all duration-500 shadow-xl shadow-black/10 group"
                >
                  <span>Proceed to Finalizing</span>
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </Link>
                
                <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-widest leading-loose">
                  Bank Transfer details will be provided at the next step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
