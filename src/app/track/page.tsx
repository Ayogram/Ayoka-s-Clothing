"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import TrackingInput from "@/components/common/TrackingInput"
import { motion } from "framer-motion"
import { Package, Truck, CheckCircle2, Clock, MapPin, User, Calendar } from "lucide-react"

export default function TrackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const trackingId = searchParams.get("id")

  // Mock order data for tracking
  const orderDetails = trackingId ? {
    id: trackingId,
    status: "Sent Out for Delivery",
    paymentStatus: "Payment Confirmed",
    orderDate: "March 22, 2026",
    estimatedDelivery: "March 28, 2026",
    customer: "John Doe",
    address: "123 Elegance Way, Victoria Island, Lagos",
    items: 3,
    rider: {
      name: "Tunde Williams",
      phone: "+234 812 345 6789"
    }
  } : null

  const steps = [
    { label: "Pending Confirmation", completed: true },
    { label: "Payment Confirmed", completed: true },
    { label: "Sent Out for Delivery", completed: true, active: true },
    { label: "Delivered", completed: false },
    { label: "Completed", completed: false },
  ]

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="py-12 md:py-24 bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          {!trackingId ? (
            <div className="text-center space-y-12 py-20">
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Track Order</h5>
                <h1 className="text-4xl md:text-5xl font-serif font-bold">Where is your Style?</h1>
                <p className="text-gray-500 max-w-sm mx-auto text-sm font-light">
                  Enter your unique tracking ID to see the current status of your selection.
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
                    <h1 className="text-3xl font-serif font-bold italic">{orderDetails?.status}</h1>
                  </div>
                  <div className="bg-gold-500 text-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold">
                    ETA: {orderDetails?.estimatedDelivery}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative pt-8 pb-12">
                  <div className="absolute top-[44px] left-4 right-4 h-[2px] bg-gray-100 dark:bg-zinc-800" />
                  <div 
                    className="absolute top-[44px] left-4 h-[2px] bg-gold-500 transition-all duration-1000" 
                    style={{ width: '50%' }} // Animated based on status
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
                        <p className="text-sm font-light leading-relaxed">{orderDetails?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900"><User size={20} className="gold-text" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Customer</p>
                        <p className="text-sm font-bold uppercase tracking-widest leading-loose">{orderDetails?.customer}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900"><Calendar size={20} className="gold-text" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Order Date</p>
                        <p className="text-sm font-light leading-relaxed">{orderDetails?.orderDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gray-50 dark:bg-zinc-900"><Truck size={20} className="gold-text" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Assigned Rider</p>
                        <p className="text-sm font-bold uppercase tracking-widest leading-loose">{orderDetails?.rider.name}</p>
                        <p className="text-[10px] text-gray-500">{orderDetails?.rider.phone}</p>
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
