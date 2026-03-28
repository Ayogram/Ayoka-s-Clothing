"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/product/ProductCard"
import { Product } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { Filter, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

const categories = ["All", "Shirts", "Traditional", "Trousers", "Outerwear"]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [sortBy, setSortBy] = useState("default")
  const [showSort, setShowSort] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
      
      if (data) {
        setProducts(data)
      }
      setIsLoading(false)
    }

    fetchProducts()
  }, [])

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const filteredProducts = products.filter(p => {
    const categoryMatch = activeCategory === "All" || p.category === activeCategory
    const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(p.availability)
    const sizeMatch = selectedSizes.length === 0 || (p.sizes && p.sizes.some(s => selectedSizes.includes(s)))
    return categoryMatch && statusMatch && sizeMatch
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price
    if (sortBy === "price_desc") return b.price - a.price
    return 0
  })

  return (
    <main className="min-h-screen flex flex-col pt-24 text-black dark:text-white">
      <Navbar />

      <header className="page-banner overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 md:px-8 py-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h5 className="text-[10px] md:text-xs uppercase tracking-[0.5em] gold-text font-bold">Ayo Selection</h5>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-bold">The Collection</h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto leading-loose">
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

            <div className="flex items-center space-x-12 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-3 hover:gold-text transition-colors ${showFilters ? 'gold-text' : ''}`}
              >
                <Filter size={16} strokeWidth={1.5} />
                <span>Filter</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowSort(!showSort)}
                  className={`flex items-center space-x-3 hover:gold-text transition-colors ${showSort ? 'gold-text' : ''}`}
                >
                  <span>By Price</span>
                  <ChevronDown size={16} strokeWidth={1.5} className={`transition-transform duration-300 ${showSort ? 'rotate-180' : ''}`} />
                </button>

                {showSort && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-4 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-2xl z-50 py-2"
                  >
                    {[
                      { label: "Recommended", value: "default" },
                      { label: "Price: Low to High", value: "price_asc" },
                      { label: "Price: High to Low", value: "price_desc" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value)
                          setShowSort(false)
                        }}
                        className={`w-full text-left px-6 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                          sortBy === option.value ? 'gold-text' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Sidebar Overlay (Simple) */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end"
              onClick={() => setShowFilters(false)}
            >
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                className="w-full max-w-md bg-white dark:bg-black h-full p-12 shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-2xl font-serif italic">Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="text-zinc-500 hover:text-black dark:hover:text-white uppercase tracking-widest text-[10px] font-bold">Close</button>
                </div>

                <div className="space-y-12">
                  <div>
                    <h5 className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold mb-6">Availability</h5>
                    <div className="space-y-4">
                      {["In Stock", "Pre-order", "Out of Stock"].map((status) => (
                        <label 
                          key={status} 
                          className="flex items-center space-x-4 cursor-pointer group"
                          onClick={() => toggleStatus(status)}
                        >
                          <div className={`w-4 h-4 border border-zinc-200 dark:border-zinc-800 group-hover:border-gold-500 transition-colors flex items-center justify-center ${selectedStatus.includes(status) ? 'bg-gold-500 border-gold-500' : ''}`}>
                            {selectedStatus.includes(status) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className={`text-xs uppercase tracking-widest transition-colors ${selectedStatus.includes(status) ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold mb-6">Size</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <button 
                          key={size} 
                          onClick={() => toggleSize(size)}
                          className={`border py-4 text-[10px] font-bold transition-all ${
                            selectedSizes.includes(size) 
                            ? "border-gold-500 gold-text bg-gold-500/5 shadow-lg shadow-gold-500/10" 
                            : "border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:border-gold-500"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-20">
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-5 uppercase tracking-[0.3em] text-[10px] font-bold hover:gold-bg hover:text-white transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

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
