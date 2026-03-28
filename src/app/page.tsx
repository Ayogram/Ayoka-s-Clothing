"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Product } from "@/lib/types"
import ProductCard from "@/components/product/ProductCard"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import TrackingInput from "@/components/common/TrackingInput"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      alert("Please enter a valid elite email address.")
      return
    }
    setIsSubscribing(true)
    try {
      const { error } = await supabase.from('newsletter').insert([{ email }])
      if (error) {
        if (error.code === '23505') alert("You are already part of the Inner Circle.")
        else throw error
      } else {
        alert("Welcome to the Inner Circle. Expect excellence in your inbox.")
        setEmail("")
      }
    } catch (e: any) {
      console.error(e)
      alert("Registration failed. Please try again later.")
    } finally {
      setIsSubscribing(false)
    }
  }

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false })
      if (data) setFeaturedProducts(data)
    }
    fetchFeatured()
  }, [])

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop"
            alt="Hero Background"
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 hero-overlay z-10" />
        </div>

        <div className="container mx-auto px-4 z-20 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
          >
            <h4 className="text-sm md:text-base uppercase tracking-[0.4em] gold-text font-sans">New Collection 2026</h4>
            <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tight mb-4">
              CRAFTED TO <br /> BRING YOU JOY
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-sans tracking-wide max-w-2xl mx-auto mb-8 font-light">
              Experience the pinnacle of luxury fashion with our hand-tailored garments. 
              Designed for those who appreciate the finer things in life.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="bg-gold-500 hover:bg-gold-600 text-white px-10 py-4 rounded-none uppercase tracking-widest text-sm transition-all duration-300 hover:scale-105 w-full md:w-auto"
              >
                Shop Selection
              </Link>
              <Link
                href="/about"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-none uppercase tracking-widest text-sm transition-all duration-300 w-full md:w-auto"
              >
                Discover Story
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-gold-500 to-transparent" />
        </motion.div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2">
              <h5 className="text-xs uppercase tracking-[0.3em] gold-text">Selection</h5>
              <h2 className="text-4xl md:text-5xl font-serif font-bold">Featured Pieces</h2>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-[0.2em] border-b border-gold-500 pb-1 hover:gold-text transition-all">
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {featuredProducts.length > 0 ? featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            )) : (
              [1, 2, 3].map((item) => (
                <div key={item} className="h-96 bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Brand Announcement Bar (Restored Black Line) */}
      <div className="bg-black py-4 overflow-hidden border-y border-zinc-900">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex items-center space-x-12 px-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-white font-bold">Ayoka's Clothing</span>
              <span className="text-[10px] uppercase tracking-[0.5em] gold-text font-bold">One Who Brings Joy</span>
              <span className="text-[10px] uppercase tracking-[0.5em] text-white font-bold">Premium Quality</span>
              <span className="text-[10px] uppercase tracking-[0.5em] gold-text font-bold">Handmade in Nigeria</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Tracking Section */}
      <section className="section-spacing bg-gold-50 dark:bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full -mr-64 -mt-64 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full -ml-64 -mb-64 blur-[120px]" />
        
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-10">
            <h5 className="text-[10px] md:text-xs uppercase tracking-[0.5em] gold-text font-bold">Concierge Service</h5>
            <h2 className="text-5xl md:text-6xl font-serif font-bold italic leading-tight">Track Your Elegance</h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-light max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Stay informed about your order's journey from our atelier to your doorstep. 
              Enter your unique tracking ID below.
            </p>
            <div className="pt-4 max-w-xl mx-auto">
              <TrackingInput />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-spacing border-t border-gray-100 dark:border-zinc-900">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold uppercase tracking-widest">Join the Inner Circle</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm tracking-widest uppercase">
              Be the first to know about new drops and private sales.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-black dark:border-white py-3 px-2 text-sm outline-none focus:border-gold-500 transition-all uppercase tracking-widest"
              />
              <button 
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 uppercase tracking-widest text-xs font-bold hover:gold-bg hover:text-white transition-all w-full md:w-auto disabled:opacity-50"
              >
                {isSubscribing ? "Joining..." : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
