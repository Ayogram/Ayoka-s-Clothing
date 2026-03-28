"use client"
export const dynamic = "force-dynamic"

import { useCart } from "@/lib/CartContext"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Truck, MapPin, Phone, User, ArrowRight, CheckCircle2, Copy, Check, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Success
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState("")

  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    fullName: session?.user?.name || "",
    phone: "",
    address: "",
    deliveryMethod: 'delivery' as 'pickup' | 'delivery'
  })

  if (cart.length === 0 && step !== 3) {
    router.push("/cart")
    return null
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const handlePaymentConfirm = async () => {
    if (!receiptFile) {
      alert("Please upload your payment receipt first.")
      return
    }

    setLoading(true)
    const trackingId = `AYK-${Math.floor(10000000 + Math.random() * 90000000)}`
    
    try {
      let receiptUrl = ""
      
      // 1. Upload receipt to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${trackingId}-${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile)

      if (uploadError) {
        // Fallback to 'avatars' bucket if 'receipts' doesn't exist yet, 
        // though we should ideally create it.
        const { data: fallbackData, error: fallbackError } = await supabase.storage
          .from('avatars')
          .upload(`receipts/${fileName}`, receiptFile)
        
        if (fallbackError) throw fallbackError
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`receipts/${fileName}`)
        receiptUrl = publicUrl
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName)
        receiptUrl = publicUrl
      }

      // 2. Create Order
      const { error } = await supabase.from('orders').insert([{
        customer_id: (session?.user as any)?.id,
        customer_email: session?.user?.email, 
        total_amount: totalPrice,
        status: 'payment_sent',
        items: cart,
        shipping_address: formData.deliveryMethod === 'delivery' ? formData.address : 'Store Pickup',
        delivery_method: formData.deliveryMethod,
        contact_number: formData.phone,
        transaction_id: trackingId,
        payment_receipt: receiptUrl
      }])

      if (error) throw error

      setOrderId(trackingId)
      setStep(3)
      clearCart()
    } catch (error: any) {
      console.error("Order error:", error)
      alert(`There was an issue processing your selection: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const copyAccount = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-16 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  step >= s ? "bg-gold-500 text-white" : "bg-white dark:bg-black border border-gray-200 dark:border-zinc-800"
                }`}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-2">
                  <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Step 01</h5>
                  <h1 className="text-4xl font-serif font-bold">Shipping Details</h1>
                </div>

                <form onSubmit={handleNext} className="max-w-xl mx-auto space-y-8">
                  {/* Delivery Method Toggle */}
                  <div className="grid grid-cols-2 gap-4 pb-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, deliveryMethod: 'delivery'})}
                      className={`py-4 px-6 border text-[10px] uppercase tracking-widest font-bold transition-all ${
                        formData.deliveryMethod === 'delivery' ? 'border-gold-500 bg-gold-500/5 gold-text' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Home Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, deliveryMethod: 'pickup'})}
                      className={`py-4 px-6 border text-[10px] uppercase tracking-widest font-bold transition-all ${
                        formData.deliveryMethod === 'pickup' ? 'border-gold-500 bg-gold-500/5 gold-text' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Store Pickup
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          required
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full bg-transparent border border-gray-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-4 pl-12 rounded-none text-sm"
                          placeholder="Receiver's name"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Contact Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-transparent border border-gray-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-4 pl-12 rounded-none text-sm"
                          placeholder="+234..."
                        />
                      </div>
                    </div>

                    {formData.deliveryMethod === 'delivery' ? (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Full Delivery Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                          <textarea
                            required
                            rows={4}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-transparent border border-gray-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-4 pl-12 rounded-none text-sm resize-none"
                            placeholder="Complete street address, city, and state"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold gold-text mb-2">Ayoka Studio HQ</p>
                        <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-widest">34, Aderibigbe street, Surulere, Lagos</p>
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-5 uppercase tracking-[0.3em] font-bold text-xs flex items-center justify-center space-x-3 hover:gold-bg hover:text-white transition-all duration-500 mt-8"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-2">
                  <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Step 02</h5>
                  <h1 className="text-4xl font-serif font-bold">Payment Method</h1>
                  <p className="text-xs uppercase tracking-widest text-gray-500">Bank Transfer Only</p>
                </div>

                <div className="max-w-xl mx-auto space-y-8">
                  <div className="bg-gray-50 dark:bg-black p-8 border border-gold-500/20 rounded-none relative">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm uppercase tracking-widest font-bold gold-text">Business Account</h4>
                      <CreditCard className="text-gold-500" size={24} strokeWidth={1} />
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyAccount("0156789173")}>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Account Number</p>
                          <p className="text-xl font-bold tracking-tighter">0156789173</p>
                        </div>
                        <div className="p-2 hover:bg-gold-500/10 rounded-full transition-colors flex items-center space-x-2">
                          <span className="text-[10px] uppercase font-bold tracking-tighter text-gray-400 group-hover:text-gold-500 transition-colors">Copy</span>
                          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Bank Name</p>
                          <p className="text-sm font-bold uppercase tracking-widest leading-loose">GT Bank (Guarantee Trust)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Account Name</p>
                          <p className="text-sm font-bold uppercase tracking-widest leading-loose">Ogunlana Dammie Omolara</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gold-500/5 p-6 border-l-2 border-gold-500">
                    <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 italic">
                      "Please upload your proof of payment once the transfer is completed. 
                      Payment confirmation may take up to 5 minutes."
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <p className="text-center text-[10px] uppercase tracking-widest text-gray-500 mb-4">Total Amount to Pay</p>
                    <p className="text-center text-4xl font-bold tracking-tighter mb-8 italic">₦ {totalPrice.toLocaleString()}</p>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Upload Proof of Payment</label>
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-zinc-100 dark:file:bg-zinc-900 file:text-black dark:file:text-white cursor-pointer hover:file:bg-gold-500 hover:file:text-white transition-all" 
                      />
                      {receiptFile && <p className="text-[9px] text-zinc-400 italic">Selected: {receiptFile.name}</p>}
                    </div>

                    <button
                      onClick={handlePaymentConfirm}
                      disabled={loading}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-5 uppercase tracking-[0.3em] font-bold text-xs flex items-center justify-center space-x-3 hover:gold-bg hover:text-white transition-all duration-500 disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                          <span>I Have Paid</span>
                          <CheckCircle2 size={16} />
                        </>
                      )}
                    </button>
                    
                    <button onClick={() => setStep(1)} className="w-full text-[10px] uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white mt-4">
                      Modify Shipping Info
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 space-y-8"
              >
                <div className="relative w-32 h-32 mx-auto mb-10">
                  <div className="absolute inset-0 bg-gold-500 rounded-full animate-ping opacity-20" />
                  <div className="relative bg-gold-500 w-full h-full rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={64} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Success</h5>
                  <h1 className="text-4xl font-serif font-bold italic">Selection Confirmed</h1>
                  <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed font-light">
                    Your order has been placed successfully. A tracking ID has been generated for your selection.
                  </p>
                </div>

                 <div 
                  className="max-w-xs mx-auto bg-white dark:bg-zinc-950 p-6 border border-dashed border-gold-500/40 mt-8 group cursor-pointer hover:border-gold-500 transition-all relative"
                  onClick={() => {
                    navigator.clipboard.writeText(orderId)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                 >
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Your Tracking ID</p>
                  <div className="flex items-center justify-center space-x-3">
                    <p className="text-xl font-bold tracking-widest text-gold-500">{orderId}</p>
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gold-500/40 group-hover:text-gold-500 transition-colors" />}
                  </div>
                  <AnimatePresence>
                    {copied && (
                      <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] uppercase font-bold text-green-500">
                        Copied to Clipboard
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
                  <Link
                    href={`/portal?tab=orders&search=${orderId}`}
                    className="w-full sm:w-auto border border-black dark:border-white py-4 px-10 uppercase tracking-widest text-[10px] font-bold hover:gold-bg hover:border-gold-500 hover:text-white transition-all shadow-xl shadow-black/5"
                  >
                    Track Status
                  </Link>
                  <Link
                    href="/"
                    className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black py-4 px-10 uppercase tracking-widest text-[10px] font-bold hover:gold-bg hover:text-white transition-all shadow-xl shadow-black/10"
                  >
                    Return Home
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      <Footer />
    </main>
  )
}
