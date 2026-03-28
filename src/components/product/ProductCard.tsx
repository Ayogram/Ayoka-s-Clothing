"use client"

import { Product } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, ShoppingBag, Check, Lock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCart } from "@/lib/CartContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { data: session } = useSession()
  const { addToCart } = useCart()
  const router = useRouter()
  const [isAdded, setIsAdded] = useState(false)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push(`/login?callbackUrl=/shop`)
      return
    }

    const defaultSize = product.sizes?.[0] || 'Standard'
    addToCart(product, defaultSize, 1)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="luxury-card group"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-zinc-950">
        <Image
          src={product.main_image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Status Tag */}
        {product.availability !== "In Stock" && (
          <div className="absolute top-6 left-6 bg-gold-500 text-white text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-2 z-20">
            {product.availability}
          </div>
        )}

        {/* Quick Add Button */}
        {session ? (
          <button 
            onClick={handleQuickAdd}
            disabled={isAdded}
            className={`absolute bottom-6 right-6 p-4 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20 shadow-xl ${
              isAdded 
                ? 'bg-green-600 text-white' 
                : 'bg-white dark:bg-black hover:bg-gold-500 hover:text-white'
            }`}
            title="Add to Bag"
          >
            {isAdded ? (
              <Check size={20} strokeWidth={2} />
            ) : (
              <Plus size={20} strokeWidth={1} />
            )}
          </button>
        ) : (
          <Link
            href={`/login?callbackUrl=/shop`}
            className="absolute bottom-6 right-6 p-4 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-20 shadow-xl bg-black/80 backdrop-blur-md text-gold-500 border border-gold-500/30 hover:bg-gold-500 hover:text-white"
            title="Login to Shop Exclusive Pieces"
          >
            <Lock size={20} strokeWidth={1.5} />
          </Link>
        )}
      </Link>

      <div className="p-6 md:p-8 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] gold-text font-bold">{product.category}</p>
          <Link href={`/product/${product.id}`} className="block text-xl font-serif italic hover:gold-text transition-colors truncate">
            {product.name}
          </Link>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-900">
          <span className="text-sm font-bold tracking-widest font-sans">₦ {product.price.toLocaleString()}</span>
          <button className="text-[9px] uppercase tracking-[0.2em] font-bold border-b border-black dark:border-white pb-1 hover:gold-text hover:border-gold-500 transition-all">
            View Piece
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
