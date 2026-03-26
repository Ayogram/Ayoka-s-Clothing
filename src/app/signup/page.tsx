"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Form, 2: Verification Sent
  const router = useRouter()

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate signup
    setTimeout(() => {
      setLoading(false)
      setStep(2)
    }, 1500)
  }

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="flex-grow flex items-center justify-center py-12 md:py-24 px-4 bg-gray-50 dark:bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-black p-8 md:p-12 shadow-2xl shadow-black/5 border border-gray-100 dark:border-zinc-900"
        >
          {step === 1 ? (
            <>
              <div className="text-center mb-10 space-y-2">
                <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Create Account</h5>
                <h1 className="text-3xl font-serif font-bold italic">Join Ayoka</h1>
              </div>

              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-3 pl-10 text-sm transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-3 pl-10 text-sm transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-3 pl-10 text-sm transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.3em] font-bold text-[10px] flex items-center justify-center space-x-3 hover:gold-bg hover:text-white transition-all duration-500 shadow-xl shadow-black/10 disabled:opacity-70 group"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-gray-100 dark:border-zinc-900 text-center text-[10px] uppercase tracking-widest text-gray-500">
                Already have an account? <Link href="/login" className="gold-text font-bold hover:underline">Sign In</Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="text-green-500" size={64} strokeWidth={1} />
              </div>
              <h2 className="text-2xl font-serif font-bold italic">Verify Your Email</h2>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                We've sent a verification link to <span className="font-bold text-black dark:text-white">{email}</span>. 
                Please check your inbox to activate your account.
              </p>
              <button 
                onClick={() => router.push("/login")}
                className="w-full border border-black dark:border-white py-4 uppercase tracking-widest text-[10px] font-bold hover:gold-bg hover:border-gold-500 hover:text-white transition-all"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
