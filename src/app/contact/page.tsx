"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { Mail, Phone, MessageSquare, Send, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const { data: session } = useSession()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    type: "Order Inquiry",
    message: ""
  })

  // Sync session info if logged in
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: session?.user?.name || "",
        email: session?.user?.email || ""
      }))
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Prepare Concierge Notification Payload
      const payload: any = {
        type: formData.type.includes('Complaint') ? 'complaint' : 
              formData.type.includes('Inquiry') ? 'contact' : 
              formData.type.toLowerCase(),
        title: `Concierge: ${formData.type} from ${formData.fullName}`,
        message: formData.message,
        status: 'unread'
      }

      // 2. These fields require the SQL script to be run in Supabase Dashboard
      const extendedPayload = {
        ...payload,
        sender_name: formData.fullName,
        sender_email: formData.email,
        customer_id: session?.user ? (session.user as any).id : null
      }

      // 3. Save to Database for Inbox
      const { error } = await supabase.from('notifications').insert([extendedPayload])

      if (error) {
        console.error("Supabase Error:", error.message)
        // Check if the error is missing columns
        if (error.message.includes('Could not find') || error.message.includes('column')) {
           alert("DATABASE SYNC REQUIRED: Please run the SQL script provided in the Implementation Plan to unlock the messaging system.")
        } else {
           throw new Error("Failed to reach our concierge database.")
        }
        return
      }

      // 4. Trigger Gmail Notification to Business Owner
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'ajumobiayomipo@gmail.com',
            subject: `Ayoka Concierge [New]: ${formData.fullName}`,
            html: `<p>A new ${formData.type} has arrived from <strong>${formData.fullName}</strong> (${formData.email}).</p><p>Check your Admin Inbox for details.</p>`
          })
        })
      } catch (err) {
        console.warn("Email notification skipped/failed, but message is in inbox.")
      }

      // 5. Trigger Gmail Receipt to Customer
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formData.email,
            subject: `Ayoka Concierge: We've received your message`,
            html: `<div style="font-family: serif; padding: 30px; border: 1px solid #d4af37; background: #fff;"><h2 style="font-style: italic; color: #000;">Message Received</h2><p>Dear ${formData.fullName},</p><p>We have successfully received your ${formData.type}. Our concierge team typically responds within 2-4 business hours.</p><p><br/><strong>Your Message:</strong><br/>${formData.message}</p></div>`
          })
        })
      } catch (err) {
        console.warn("User receipt failed.")
      }

      setSubmitted(true)
    } catch (error: any) {
      console.error("General error:", error)
      alert(error.message || "Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <h5 className="text-[10px] md:text-xs uppercase tracking-[0.5em] gold-text font-bold">Ayoka Concierge</h5>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic font-bold">Contact Our Atelier</h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-zinc-300 font-medium max-w-2xl mx-auto leading-loose">
              We are here to ensure your experience with Ayoka is <br className="hidden md:block" /> nothing short of joyful.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="bg-white dark:bg-black py-20">
        <div className="container mx-auto px-4 md:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 max-w-7xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-16">
              <div className="space-y-12">
                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-gold-50 dark:bg-zinc-950 rounded-full border border-gold-100 dark:border-zinc-900">
                    <Mail className="gold-text" size={28} strokeWidth={1} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3 gold-text">General Inquiry</h4>
                    <p className="text-lg font-serif italic mb-1">ajumobiayomipo@gmail.com</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">24/7 Response Time</p>
                  </div>
                </div>

                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-gold-50 dark:bg-zinc-950 rounded-full border border-gold-100 dark:border-zinc-900">
                    <Phone className="gold-text" size={28} strokeWidth={1} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3 gold-text">Concierge Phone</h4>
                    <p className="text-lg font-serif italic mb-1">+234 703 942 6216</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Mon-Sat: 9am - 7pm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-8">
                  <div className="p-5 bg-gold-50 dark:bg-zinc-950 rounded-full border border-gold-100 dark:border-zinc-900">
                    <MessageSquare className="gold-text" size={28} strokeWidth={1} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-3 gold-text">WhatsApp Direct</h4>
                    <p className="text-lg font-serif italic mb-1">Instant Connection</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Available 24/7</p>
                  </div>
                </div>
              </div>

              <div className="bg-black text-white p-12 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold-500/20 transition-all duration-700" />
                <h4 className="text-2xl font-serif italic text-gold-500">Visit Our Studio</h4>
                <p className="text-sm font-light leading-loose text-zinc-300 uppercase tracking-widest">
                  Experience the fabrics in person. By appointment only. <br />
                  34, Aderibigbe street, Surulere.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="luxury-card p-10 md:p-16">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-4 text-base transition-colors placeholder:text-zinc-300" 
                      placeholder="Your name" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-4 text-base transition-colors placeholder:text-zinc-300" 
                      placeholder="name@example.com" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Message Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer appearance-none"
                    >
                      <option>Order Inquiry</option>
                      <option>Bespoke Request</option>
                      <option>Complaints</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Your Inquiry</label>
                    <textarea 
                      required 
                      rows={5} 
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-4 text-base transition-colors resize-none placeholder:text-zinc-300" 
                      placeholder="How can we bring you joy?" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-6 uppercase tracking-[0.4em] font-bold text-[10px] flex items-center justify-center space-x-4 hover:bg-gold-500 hover:text-white transition-all duration-700 mt-12 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                    <Send size={16} strokeWidth={1.5} />
                  </button>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 space-y-8">
                  <div className="flex justify-center"><CheckCircle2 className="gold-text" size={80} strokeWidth={1} /></div>
                  <h3 className="text-3xl font-serif font-bold italic">Message Received</h3>
                  <p className="text-sm text-zinc-500 font-light leading-loose uppercase tracking-widest max-w-sm mx-auto">
                    A member of our concierge team will respond to your inquiry within 24 hours.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold border-b border-gold-500 pb-1 hover:gold-light transition-all">Send another message</button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
