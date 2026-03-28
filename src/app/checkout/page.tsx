"use client"

import dynamic from "next/dynamic"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

// This is the Magic Fix: 'ssr: false' ensures this component NEVER runs on the server 
// during the build, which prevents 'ReferenceError: location is not defined'.
const CheckoutPageContent = dynamic(
  () => import("@/components/checkout/CheckoutPageContent"),
  { 
    ssr: false,
    loading: () => (
      <main className="min-h-screen flex flex-col pt-24 uppercase tracking-[0.2em] font-bold">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent" />
          <span className="text-[10px] gold-text">Initializing Checkout...</span>
        </div>
        <Footer />
      </main>
    )
  }
)

export default function CheckoutPage() {
  return <CheckoutPageContent />
}
