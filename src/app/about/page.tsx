"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import Image from "next/image"

export default function AboutPage() {
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
            <h5 className="text-[10px] uppercase tracking-[0.5em] gold-text font-bold">Our Heritage</h5>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-bold">Crafted to Bring You Joy</h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-300 font-medium max-w-2xl mx-auto leading-loose">
              Traditional techniques. Modern elegance. <br className="hidden md:block" /> Timeless style.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="bg-white dark:bg-black py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
                <blockquote className="text-3xl md:text-4xl font-serif italic text-zinc-900 dark:text-white leading-tight">
                  "Ayoka was born from a vision to redefine luxury African fashion. We combine traditional craftsmanship with modern silhouettes to create timeless pieces that tell a story of elegance and pride."
                </blockquote>
                <p className="mt-8 text-[10px] uppercase tracking-[0.4em] font-bold gold-text">— Ogunlana Dammie Omolara, Creative Director</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] bg-gray-100 dark:bg-zinc-900 overflow-hidden shadow-2xl shadow-black/10"
            >
              <Image 
                src="/owner.png" 
                alt="Ogunlana Dammie Omolara - Ayoka Designer" 
                fill 
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 text-center space-y-16">
          <h2 className="text-3xl font-serif italic gold-text">The Pillars of Ayoka</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Artisan Quality", desc: "Each piece is hand-finished by master tailors with decades of experience in bespoke couture." },
              { title: "Noble Fabrics", desc: "We source only the finest silks, brocades, and hand-woven Aso-Oke from verified heritage mills." },
              { title: "Joyful Service", desc: "Our concierge team ensures your experience is as premium as the garments we deliver." },
            ].map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="space-y-4"
              >
                <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-gold-500">{pillar.title}</h4>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
