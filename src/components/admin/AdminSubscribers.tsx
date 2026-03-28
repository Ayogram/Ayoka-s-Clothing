"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Mail, Send, Trash2, Search, Bell, Sparkles } from "lucide-react"

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcast, setBroadcast] = useState({ title: "", message: "" })
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('newsletter')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
          if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('does not exist')) {
              console.warn("Newsletter table not found. Please create it in Supabase.")
              setSubscribers([])
          } else {
              throw error
          }
      } else {
        setSubscribers(data || [])
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const deleteSubscriber = async (id: string) => {
    if (!confirm("Remove this diplomat from the Inner Circle?")) return
    const { error } = await supabase.from('newsletter').delete().eq('id', id)
    if (!error) fetchSubscribers()
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcast.title || !broadcast.message) return
    
    setIsBroadcasting(true)
    try {
      // 1. Get all emails from newsletter
      const emails = subscribers.map(s => s.email.toLowerCase())
      
      // 2. Fetch all profiles to find matching portal accounts
      const { data: profiles } = await supabase.from('profiles').select('id, email')
      const profileList = (profiles || []) as any[]
      
      const matchingProfiles = profileList.filter(p => emails.includes(p.email.toLowerCase())) || []

      // 3. Create Notifications for matching users
      const notifications = matchingProfiles.map(p => ({
        type: 'broadcast',
        title: broadcast.title,
        message: broadcast.message,
        customer_id: p.id,
        sender_name: 'Ayoka Concierge',
        sender_email: 'notifications@Ayoka.com',
        status: 'unread'
      }))

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }

      // 4. Send Emails via API
      for (const sub of subscribers) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: sub.email,
              subject: broadcast.title,
              html: `
                <div style="font-family: serif; padding: 40px; border: 1px solid #d4af37; background: #fff; max-width: 600px; margin: 0 auto;">
                  <h2 style="font-style: italic; color: #000; text-align: center;">Ayoka Inner Circle</h2>
                  <h3 style="text-transform: uppercase; letter-spacing: 0.2em; text-align: center; font-size: 14px; color: #d4af37;">${broadcast.title}</h3>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                  <p style="font-size: 16px; line-height: 1.6; color: #333;">${broadcast.message}</p>
                  <div style="margin-top: 40px; text-align: center;">
                    <a href="http://localhost:3000/shop" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; font-weight: bold;">View Selection</a>
                  </div>
                  <p style="font-size: 10px; color: #999; margin-top: 40px; text-align: center;">One Who Brings Joy • Ayoka's Clothing</p>
                </div>
              `
            })
          })
        } catch (e) {
          console.warn(`Failed to send email to ${sub.email}`)
        }
      }

      // 5. Send Summary Email to Admin
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'ajumobiayomipo@gmail.com',
            subject: `[SENT] Broadcast: ${broadcast.title}`,
            html: `<p>A broadcast message was successfully sent to ${subscribers.length} Inner Circle members.</p><hr/><p><strong>Broadcast Content:</strong></p><p>${broadcast.message}</p>`
          })
        })
      } catch (e) {
        console.warn(`Failed to send summary email to admin`)
      }

      alert(`Broadcast successful. Message sent to ${subscribers.length} elite members.`)
      setShowBroadcastModal(false)
      setBroadcast({ title: "", message: "" })
    } catch (e: any) {
      alert(`Broadcast failed: ${e.message}`)
    } finally {
      setIsBroadcasting(false)
    }
  }

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-serif italic text-black dark:text-white">Inner Circle</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Manage newsletter diplomats</p>
        </div>
        <button 
          onClick={() => setShowBroadcastModal(true)}
          className="bg-gold-500 text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-gold-600 transition-all flex items-center space-x-3 shadow-lg shadow-gold-500/20"
        >
          <Send size={14} />
          <span>Send Broadcast</span>
        </button>
      </div>

      <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-8 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH EMAILS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-900 pl-10 py-2 text-[10px] focus:border-gold-500 outline-none transition-all"
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{filteredSubscribers.length} TOTAL SUBSCRIBERS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="h-24 bg-zinc-50 dark:bg-zinc-900 animate-pulse rounded-xl" />)
          ) : filteredSubscribers.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
               <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                  <Mail size={32} />
               </div>
               <p className="text-[10px] uppercase tracking-widest text-zinc-500 italic">No diplomats found in the Inner Circle.</p>
            </div>
          ) : filteredSubscribers.map((sub) => (
            <motion.div 
              key={sub.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group p-6 border border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 rounded-2xl hover:border-gold-500/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500/5 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-4">
                <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <Mail size={14} />
                </div>
                <button 
                  onClick={() => deleteSubscriber(sub.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-xs font-bold text-black dark:text-white truncate" title={sub.email}>{sub.email}</p>
              <p className="text-[8px] uppercase tracking-widest text-zinc-400 mt-1">Joined {new Date(sub.created_at).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-950 p-10 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-900"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                   <div className="flex items-center space-x-2">
                      <Sparkles size={16} className="gold-text" />
                      <h4 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">— Broadcast Centre</h4>
                   </div>
                   <h3 className="text-2xl font-serif italic text-black dark:text-white">Announce to Inner Circle</h3>
                </div>
                <button onClick={() => setShowBroadcastModal(false)} className="text-zinc-400 hover:text-black dark:hover:text-white">
                  <Trash2 size={20} />
                </button>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Subject / Title</label>
                   <input 
                      type="text" 
                      required
                      value={broadcast.title}
                      onChange={(e) => setBroadcast({...broadcast, title: e.target.value})}
                      placeholder="Private Sale: The SS26 Collection"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-xs font-bold text-black dark:text-white"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Message Content</label>
                   <textarea 
                      required
                      value={broadcast.message}
                      onChange={(e) => setBroadcast({...broadcast, message: e.target.value})}
                      placeholder="Share your curated announcement..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-xs font-bold text-black dark:text-white h-48 resize-none"
                   />
                </div>
                <div className="flex items-center space-x-3 text-[9px] text-zinc-400 italic mb-4">
                   <Bell size={12} strokeWidth={3} />
                   <p>This will send a portal notification and an elite email to {subscribers.length} members.</p>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="flex-grow py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isBroadcasting}
                    className="flex-grow bg-black dark:bg-white text-white dark:text-black py-4 text-[10px] uppercase tracking-[0.3em] font-bold rounded-xl hover:bg-gold-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
                  >
                    {isBroadcasting ? "Transmitting..." : "Send Announcement"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminSubscribers
