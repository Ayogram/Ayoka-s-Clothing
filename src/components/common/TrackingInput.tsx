"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const TrackingInput = () => {
  const [trackingId, setTrackingId] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId.trim()) return
    
    setLoading(true)
    // Simulate a brief delay for a premium feel
    setTimeout(() => {
      router.push(`/track?id=${trackingId}`)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleTrack} className="relative group">
        <input
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter Tracking ID (e.g., AYK-123456)"
          className="w-full bg-white/5 dark:bg-zinc-950 backdrop-blur-sm border border-gold-500/20 group-hover:border-gold-500/50 focus:border-gold-500 outline-none rounded-full px-6 py-4 pr-16 text-sm tracking-widest transition-all duration-300 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-gold-500 hover:bg-gold-600 text-white rounded-full px-6 flex items-center justify-center transition-all duration-300 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <div className="flex items-center space-x-2">
              <Search size={16} />
              <span className="text-[10px] uppercase font-bold tracking-tighter">Track</span>
            </div>
          )}
        </button>
      </form>
      <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 mt-4 opacity-70">
        No login required. Real-time updates on your elegance.
      </p>
    </div>
  )
}

export default TrackingInput
