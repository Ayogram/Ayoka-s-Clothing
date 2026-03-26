"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/product/ProductCard"
import { MOCK_PRODUCTS } from "@/lib/types"
import { Filter, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

const categories = ["All", "Shirts", "Traditional", "Trousers", "Outerwear"]

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredProducts = activeCategory === "All" 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <header className="page-banner overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h5 className="text-[10px] md:text-xs uppercase tracking-[0.5em] gold-text font-bold">Ayo Selection</h5>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-bold">The Collection</h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-300 font-medium max-w-2xl mx-auto leading-loose">
              Timeless pieces designed for the <br className="hidden md:block" /> modern connoisseur.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="bg-white dark:bg-black py-20">
        <div className="container mx-auto px-4 md:px-8">

          {/* Filters & Sorting */}
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 dark:border-zinc-900 pb-12 mb-20 gap-8">
            <div className="flex flex-wrap items-center justify-center gap-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] uppercase tracking-[0.3em] font-bold pb-2 transition-all relative ${
                    activeCategory === cat ? "gold-text" : "text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div layoutId="activeTag" className="absolute -bottom-[1px] left-0 right-0 h-[2px] gold-bg" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-12 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              <button className="flex items-center space-x-3 hover:gold-text transition-colors">
                <Filter size={16} strokeWidth={1.5} />
                <span>Filter</span>
              </button>
              <button className="flex items-center space-x-3 hover:gold-text transition-colors">
                <span>By Price</span>
                <ChevronDown size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-gray-500 uppercase tracking-widest text-xs">No pieces found in this selection.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
