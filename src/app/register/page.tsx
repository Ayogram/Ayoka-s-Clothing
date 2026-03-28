"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMsg("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setIsLoading(false)
        return
      }

      setSuccessMsg("Registration successful! Redirecting to login...")
      
      // Give the user a moment to see the success message
      setTimeout(() => {
        router.push("/login")
        router.refresh()
      }, 2000)

    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-12 shadow-2xl"
        >
          <div className="text-center mb-12">
            <h5 className="text-[10px] uppercase tracking-[0.5em] gold-text font-bold mb-4">Join Ayoka</h5>
            <h1 className="text-4xl font-serif italic mb-2">Create Account</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Sign up for luxury access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 outline-none focus:border-gold-500 transition-colors text-sm"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 outline-none focus:border-gold-500 transition-colors text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-3 outline-none focus:border-gold-500 transition-colors text-sm"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-[8px] text-zinc-500 mt-2 uppercase tracking-wide">Must be at least 8 characters</p>
              </div>
            </div>

            {error && <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold text-center">{error}</p>}
            {successMsg && <p className="text-green-500 text-[10px] uppercase tracking-widest font-bold text-center">{successMsg}</p>}

            <button 
              type="submit"
              disabled={isLoading || !!successMsg}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:gold-bg hover:text-white transition-all disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-zinc-100 dark:border-zinc-900 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Already have an account? <a href="/login" className="gold-text font-bold hover:underline">Sign In Here</a>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
