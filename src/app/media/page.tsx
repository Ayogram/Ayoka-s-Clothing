"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Image from "next/image"
import { motion } from "framer-motion"
import { Send, ExternalLink, Play } from "lucide-react"

const Instagram = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMedia = async () => {
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setMedia(data)
      setIsLoading(false)
    }
    fetchMedia()
  }, [])
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
            <h5 className="text-[10px] md:text-xs uppercase tracking-[0.5em] gold-text font-bold">Ayoka Feed</h5>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-bold">The Social Hub</h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-300 font-medium max-w-2xl mx-auto leading-loose">
              Glimpses into our atelier, style inspirations, and <br className="hidden md:block" /> stories behind our pieces.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="bg-white dark:bg-black py-20">
        <div className="container mx-auto px-4 md:px-8">

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
              {media.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx % 2 * 0.2 }}
                  className="luxury-card group"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-zinc-950">
                    <Image
                      src={post.url}
                      alt={post.caption}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      {post.type === 'video' && (
                        <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-700">
                          <Play size={36} fill="white" strokeWidth={1} />
                        </div>
                      )}
                    </div>
 
                    {/* Platform Tag */}
                    <a 
                      href={post.link} 
                      target="_blank" 
                      className="absolute top-6 right-6 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-2 flex items-center space-x-3 shadow-xl hover:bg-gold-500 hover:text-white transition-all cursor-pointer group/tag"
                    >
                       <span className="text-[9px] uppercase font-bold tracking-[0.2em]">{post.platform}</span>
                       <ExternalLink size={12} strokeWidth={1} className="group-hover/tag:translate-x-1 transition-transform" />
                    </a>
                  </div>
 
                  <div className="p-8 space-y-6">
                    <p className="text-sm font-light leading-[1.8] text-zinc-600 dark:text-zinc-400 tracking-wide">
                      {post.caption}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-zinc-900">
                      <div className="flex items-center space-x-8 text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400">
                         <a href={post.link} target="_blank" className="hover:gold-text cursor-pointer transition-colors">{post.likes || 0} Likes</a>
                         <a href={post.link} target="_blank" className="hover:gold-text cursor-pointer transition-colors">{post.comments || 0} Comments</a>
                      </div>
                      <button className="gold-text hover:scale-125 transition-all duration-500">
                        <Send size={20} strokeWidth={1} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
 
            {/* Load More/Instagram Link */}
            <div className="text-center mt-32">
              <a 
                href="https://www.instagram.com/Ayoka.Clothing" 
                target="_blank" 
                className="inline-flex items-center space-x-4 bg-black dark:bg-white text-white dark:text-black px-12 py-5 uppercase tracking-[0.4em] text-[10px] font-bold hover:bg-gold-500 hover:text-white transition-all duration-700 shadow-2xl"
              >
                <Instagram size={20} />
                <span>Follow the Journey</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
