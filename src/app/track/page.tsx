"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import TrackingInput from "@/components/common/TrackingInput"
import { motion } from "framer-motion"
import { Package, Truck, CheckCircle2, Clock, MapPin, User, Calendar } from "lucide-react"

export default function TrackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const trackingId = searchParams.get("id")

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!trackingId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('transaction_id', trackingId)
          .single()
        
        if (data) setOrder(data)
      } catch (e) {
        console.error("Tracking fetch error:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [trackingId])

  const getStatusIndex = (status: string) => {
    const mapping: Record<string, number> = {
      'payment_pending': 0,
      'payment_sent': 0,
      'payment_received': 1,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'received': 4
    }
    return mapping[status] ?? 0
  }

  const currentStep = order ? getStatusIndex(order.status) : 0

  const steps = [
    { label: "Pending Confirmation", completed: currentStep >= 0, active: currentStep === 0 },
    { label: "Payment Confirmed", completed: currentStep >= 1, active: currentStep === 1 },
    { label: "Sent Out for Delivery", completed: currentStep >= 2, active: currentStep === 2 },
    { label: "Delivered", completed: currentStep >= 3, active: currentStep === 3 },
    { label: "Completed", completed: currentStep >= 4, active: currentStep === 4 },
  ]

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col pt-24">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="py-12 md:py-24 bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          {!order ? (
            <div className="text-center space-y-12 py-20">
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Track Order</h5>
                <h1 className="text-4xl md:text-5xl font-serif font-bold italic">
                  {trackingId ? "Piece Not Found" : "Where is your Style?"}
                </h1>
                <p className="text-gray-500 max-w-sm mx-auto text-sm font-light leading-relaxed uppercase tracking-widest">
                  {trackingId 
                    ? `We couldn't find a record for ${trackingId}. Please check the ID and try again.` 
                    : "Enter your unique tracking ID to see the current status of your selection."}
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <TrackingInput />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Status Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-black p-8 md:p-12 shadow-2xl shadow-black/5 border border-gray-100 dark:border-zinc-900"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Tracking ID: {trackingId}</p>
                    <h1 className="text-3xl font-serif font-bold italic capitalize">{order.status.replace('_', ' ')}</h1>
                  </div>
                  <div className="bg-gold-500 text-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold">
                    ETA: {order.delivery_days ? `In ${order.delivery_days} Days` : 'Processing'}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative pt-8 pb-12">
                  <div className="absolute top-[44px] left-4 right-4 h-[2px] bg-gray-100 dark:bg-zinc-800" />
                  <div 
                    className="absolute top-[44px] left-4 h-[2px] bg-gold-500 transition-all duration-1000" 
                    style={{ width: `${(currentStep / 4) * 100}%` }} 
                  />
                  
                  <div className="flex justify-between items-start relative z-10">
                    {steps.map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center max-w-[80px] text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 border-2 transition-colors duration-500 ${
                          step.completed ? "bg-gold-500 border-gold-500 text-white" : "bg-white dark:bg-black border-gray-200 dark:border-zinc-800"
                        }`}>
                          {step.completed ? <CheckCircle2 size={16} /> : <Clock size={16} className="text-gray-300" />}
                        </div>
                        <span className={`text-[9px] uppercase tracking-widest leading-tight ${step.active ? "gold-text font-bold" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-gray-100 dark:border-zinc-900 mt-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900"><MapPin size={20} className="gold-text" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Delivery Address</p>
                        <p className="text-sm font-light leading-relaxed">{order.shipping_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900"><User size={20} className="gold-text" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Items</p>
                        <p className="text-sm font-bold uppercase tracking-widest leading-loose">
                          {Array.isArray(order.items) ? `${order.items.length} Pieces` : '1 Piece'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900"><Calendar size={20} className="gold-text" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Order Date</p>
                        <p className="text-sm font-light leading-relaxed">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900"><Truck size={20} className="gold-text" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Logistics Status</p>
                        <p className="text-sm font-bold uppercase tracking-widest leading-loose">
                          {order.driver_name ? `Assigned: ${order.driver_name}` : 'Awaiting Logistics Assignment'}
                        </p>
                        {order.driver_number && <p className="text-[10px] text-gray-500">{order.driver_number}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="text-center py-12">
                <button 
                  onClick={() => router.push("/")}
                  className="text-[10px] uppercase tracking-[0.4em] gold-text hover:underline font-bold"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
