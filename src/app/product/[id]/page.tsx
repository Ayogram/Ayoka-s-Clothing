"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { supabase } from "@/lib/supabase"
import { Product } from "@/lib/types"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, ChevronLeft, ChevronRight, Truck, ShieldCheck, RefreshCcw, Check, Lock } from "lucide-react"
import { useCart } from "@/lib/CartContext"

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCart()

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setProduct(data)
        if (!data.sizes || data.sizes.length === 0) {
          setSelectedSize('Standard')
        }
      }
      setIsLoading(false)
    }
    if (id) fetchProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-pulse space-y-8 text-center">
           <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
           <p className="text-[10px] uppercase tracking-[0.4em] gold-text">Authenticating Piece...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif italic text-black dark:text-white">Piece Not Found</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest pb-4">This masterpiece may have been moved or archived.</p>
          <button onClick={() => router.push("/shop")} className="text-gold-500 uppercase tracking-widest text-xs border-b border-gold-500 pb-1">
            Return to Collection
          </button>
        </div>
      </div>
    )
  }

  const allImages = [product.main_image, ...(product.images || [])].filter(Boolean)

  const handleAddToCart = () => {
    if (!session) {
      router.push(`/login?callbackUrl=/product/${id}`)
      return
    }

    if (!selectedSize) {
      alert("Please select a size before adding to cart.")
      return
    }
    
    addToCart(product, selectedSize, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Left: Image Gallery */}
            <div className="space-y-6">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={allImages[activeImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-2 rounded-full hover:gold-text transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-2 rounded-full hover:gold-text transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 aspect-[3/4] border-2 transition-all shrink-0 ${
                      activeImage === idx ? "border-gold-500" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              <div className="mb-10 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-400">{product.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gold-500" />
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${product.availability === 'In Stock' ? 'text-green-600' : 'text-gold-500'}`}>
                    {product.availability}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">{product.name}</h1>
                <p className="text-2xl font-bold tracking-tighter">₦ {product.price.toLocaleString()}</p>
                <div className="h-px w-full bg-gray-100 dark:bg-zinc-900 pt-4" />
              </div>

              <div className="space-y-8 flex-grow">
                {/* Description */}
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold mb-4">Description</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>

                {/* Size Selection */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold">Select Size</h4>
                    <button className="text-[10px] uppercase tracking-widest border-b border-gray-300 dark:border-zinc-700 hover:gold-text transition-colors">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                      product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[3.5rem] h-14 px-4 flex items-center justify-center border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                            selectedSize === size
                              ? "border-gold-500 bg-gold-500 text-white shadow-lg shadow-gold-500/20"
                              : "border-gray-200 dark:border-zinc-800 text-zinc-500 hover:border-gold-500"
                          }`}
                        >
                          {size}
                        </button>
                      ))
                    ) : (
                      <button
                        onClick={() => setSelectedSize('Standard')}
                        className={`px-8 h-14 flex items-center justify-center border text-[10px] uppercase tracking-widest transition-all duration-300 ${
                          selectedSize === 'Standard'
                            ? "border-gold-500 bg-gold-500 text-white shadow-lg shadow-gold-500/20 font-bold"
                            : "border-gray-200 dark:border-zinc-800 text-zinc-500 hover:border-gold-500"
                        }`}
                      >
                        Standard Size
                      </button>
                    )}
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 flex items-center justify-center border border-gray-200 dark:border-zinc-800">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2">-</button>
                      <span className="px-4 text-sm font-bold">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="p-2">+</button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={added}
                      className={`col-span-3 py-5 uppercase tracking-widest text-sm font-bold flex items-center justify-center space-x-3 transition-all duration-500 ${
                        added 
                        ? "bg-green-600 text-white" 
                        : "bg-black dark:bg-white text-white dark:text-black hover:gold-bg hover:text-white"
                      }`}
                    >
                      {added ? (
                        <>
                          <Check size={18} />
                          <span>Added to Bag</span>
                        </>
                      ) : !session ? (
                        <>
                          <Lock size={18} />
                          <span>Login to Order</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={18} />
                          <span>Add to Shopping Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                  {!session && (
                    <p className="text-[10px] uppercase tracking-[0.3em] text-center text-zinc-500 font-bold animate-pulse pt-2">
                       Exclusive Piece - Authentication Required
                    </p>
                  )}
                </div>

                {/* Shipping info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100 dark:border-zinc-900">
                  <div className="flex items-center space-x-3">
                    <Truck size={20} className="gold-text" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tighter">Delivery</p>
                      <p className="text-[10px] text-gray-500">{product.delivery_days || 3} Business Days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ShieldCheck size={20} className="gold-text" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tighter">Authentic</p>
                      <p className="text-[10px] text-gray-500">100% Guaranteed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RefreshCcw size={20} className="gold-text" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tighter">Returns</p>
                      <p className="text-[10px] text-gray-500">7 Day Exchange</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
