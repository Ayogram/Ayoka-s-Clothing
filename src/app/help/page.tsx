"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { ShieldCheck, Truck, RefreshCcw, HelpCircle } from "lucide-react"

export default function HelpPage() {
  const faqs = [
    { q: "How do I track my order?", a: "Simply enter your Tracking ID on the home page or go to the 'Track' section. Your ID is sent to your email upon payment confirmation." },
    { q: "What is your return policy?", a: "As our pieces are often bespoke or handcrafted, we accept returns only for manufacturing defects within 7 days of delivery. Must be unworn and with tags." },
    { q: "Do you ship internationally?", a: "Yes, Ayoka ships worldwide via DHL. Shipping costs are calculated at checkout based on your delivery destination." },
    { q: "How do I care for my silk pieces?", a: "We recommend dry cleaning only for all our pure silk and hand-embroidered garments to maintain their luxury finish and longevity." },
  ]

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="text-center mb-20 space-y-4">
            <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Ayoka Concierge</h5>
            <h1 className="text-4xl md:text-6xl font-serif font-bold italic">Help & FAQ</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
             <div className="p-8 border border-gray-100 dark:border-zinc-900 space-y-4 hover:shadow-xl transition-shadow">
                <ShieldCheck className="gold-text" size={32} strokeWidth={1} />
                <h4 className="text-sm font-bold uppercase tracking-widest">Secure Payments</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-light">All transfers are verified manually by our finance team to ensure absolute security and joy.</p>
             </div>
             <div className="p-8 border border-gray-100 dark:border-zinc-900 space-y-4 hover:shadow-xl transition-shadow">
                <Truck className="gold-text" size={32} strokeWidth={1} />
                <h4 className="text-sm font-bold uppercase tracking-widest">Master Delivery</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-light">Our delivery partners are vetted for their handle-with-care service standards.</p>
             </div>
          </div>

          <div className="space-y-12">
            <h3 className="text-lg font-serif font-bold uppercase tracking-widest border-b border-gray-100 dark:border-zinc-900 pb-4">Frequent Inquiries</h3>
            <div className="divide-y divide-gray-100 dark:divide-zinc-900">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-8 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-tight flex items-center space-x-3">
                    <HelpCircle size={16} className="gold-text" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-sm text-gray-500 font-light leading-relaxed pl-7">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
