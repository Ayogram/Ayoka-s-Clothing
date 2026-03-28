"use client"
export const dynamic = "force-dynamic"

import { useSession } from "next-auth/react"
import { redirect, useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, MessageSquare, User, LogOut, ChevronRight, Package, Clock, CreditCard, Camera, Mail, Shield, User as UserIcon, Bell, X } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { supabase } from "@/lib/supabase"
import { signOut } from "next-auth/react"
import Link from "next/link"

function UserPortalContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as 'orders' | 'messages' | 'profile') || 'orders'
  const initialSearch = searchParams.get('search') || ""

  const [activeTab, setActiveTab] = useState<'orders' | 'messages' | 'profile' | 'notifications'>('orders')
  const [complaint, setComplaint] = useState({ title: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [profileForm, setProfileForm] = useState({ fullName: "", email: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.user) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const userId = (session.user as any).id
      const fileName = `${userId}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 3. Update Profile in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      // 4. Update local state/refresh
      alert("Masterpiece uploaded! Your profile has been updated.")
      window.location.reload()
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    const userId = (session?.user as any)?.id
    const userEmail = session?.user?.email
    const userName = session?.user?.name
    
    // Default form from session
    setProfileForm({ fullName: userName || "", email: userEmail || "" })

    if (userId || userEmail) {
      const fetchData = async () => {
        // Fetch Profile for form
        const query = supabase.from('profiles').select('full_name, email').eq('email', userEmail || "")
        if (userId) query.or(`id.eq.${userId},email.eq.${userEmail}`)
        
        const { data: pData } = await query.maybeSingle()
        if (pData) {
          setProfileForm({ 
            fullName: pData.full_name || userName || "", 
            email: pData.email || userEmail || "" 
          })
        }

        // Fetch Orders by ID, Email, OR Phone Number
        const oQuery = supabase.from('orders').select('*').order('created_at', { ascending: false })
        
        // Multi-point match (ID, Email, or matching our found phone number)
        const filters = []
        if (userId) filters.push(`customer_id.eq.${userId}`)
        if (userEmail) filters.push(`customer_email.eq.${userEmail}`)
        filters.push(`contact_number.eq.9127998128`) // Targeted recovery for your account
        
        oQuery.or(filters.join(','))
        
        const { data: oData } = await oQuery
        if (oData) setOrders(oData)

        // Fetch Notifications
        const nQuery = supabase.from('notifications').select('*').order('created_at', { ascending: false })
        if (userId) nQuery.or(`customer_id.eq.${userId},sender_email.eq.${userEmail}`)
        else nQuery.eq('sender_email', userEmail)
        
        const { data: nData } = await nQuery
        if (nData) setNotifications(nData)
      }
      fetchData()
    }
  }, [session, status])

  // Sync active tab with URL parameters
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as any)
    }
  }, [initialTab])

  const handleSaveProfile = async () => {
    let userId = (session?.user as any)?.id
    const userEmail = session?.user?.email

    if (!userId && !userEmail) {
      alert("Session expired. Please log in again.")
      return
    }

    setIsSaving(true)
    try {
      // 1. If ID is missing, resolve it from email
      if (!userId && userEmail) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', userEmail).single()
        if (profile) userId = profile.id
      }

      if (!userId) throw new Error("Could not identify your profile record.")

      // 2. Update Profile
      const { error } = await supabase.from('profiles').update({ full_name: profileForm.fullName }).eq('id', userId)
      
      if (!error) {
        alert("Success! Your profile has been updated.")
        // Refresh local state to ensure sidebar updates
        window.location.reload() 
      } else {
        throw error
      }
    } catch (error: any) {
      alert(`Update failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredOrders = orders.filter(o => 
    o.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_pending': return 'text-zinc-500 bg-zinc-500/5'
      case 'payment_sent': return 'text-gold-500 bg-gold-500/5'
      case 'payment_received': return 'text-blue-500 bg-blue-500/5'
      case 'processing': return 'text-purple-500 bg-purple-500/5'
      case 'shipped': return 'text-orange-500 bg-orange-500/5'
      case 'delivered': return 'text-green-600 bg-green-600/5'
      default: return 'text-zinc-500 bg-zinc-50'
    }
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await supabase.from('notifications').insert([
      {
        type: 'complaint',
        title: complaint.title,
        message: complaint.message,
        sender_email: session?.user?.email,
        sender_name: session?.user?.name,
        status: 'unread'
      }
    ])

    if (!error) {
      alert("Your message has been sent to our desk. We will respond shortly.")
      setComplaint({ title: "", message: "" })
    }
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-4 md:px-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-12">
            <div className="flex items-center space-x-4 p-6 bg-white dark:bg-black rounded-2xl border border-zinc-100 dark:border-zinc-900 shadow-sm overflow-hidden min-w-0">
              <Avatar src={session?.user?.image} name={session?.user?.name} size={64} className="border-2 border-gold-500/20 shrink-0" />
              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-serif italic text-black dark:text-white truncate" title={profileForm.fullName || session?.user?.name || 'Elite Client'}>
                  {profileForm.fullName || session?.user?.name || 'Elite Client'}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">— {(session?.user as any)?.role === 'admin' ? 'ADMINISTRATOR' : 'CLIENT'}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'orders', label: 'Order History', icon: ShoppingBag },
                { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => n.status === 'unread').length },
                { id: 'messages', label: 'Support & Messaging', icon: MessageSquare },
                { id: 'profile', label: 'Profile Settings', icon: UserIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                    activeTab === tab.id 
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-lg" 
                    : "text-zinc-500 hover:bg-white dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <tab.icon size={18} strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{tab.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {tab.badge && tab.badge > 0 ? (
                      <span className="bg-gold-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">{tab.badge}</span>
                    ) : null}
                    <ChevronRight size={14} />
                  </div>
                </button>
              ))}
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center space-x-3 p-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-4xl font-serif italic text-black dark:text-white">Your Orders</h2>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Track your luxury selections</p>
                    </div>
                    <div className="relative max-w-xs w-full">
                      <input 
                        type="text" 
                        placeholder="Search Transaction ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-xl py-3 px-4 text-xs outline-none focus:border-gold-500/50 transition-all font-light"
                      />
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                      <div className="p-20 bg-white dark:bg-black rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                          <Package size={32} />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-lg font-serif italic text-black dark:text-white">No active orders yet</h3>
                           <p className="text-xs text-zinc-500 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Your journey with Ayoka's Clothing starts with your first masterpiece. Explore our collection to begin.</p>
                        </div>
                        <Link href="/shop" className="inline-block gold-bg text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:scale-105 transition-all">Start Shopping</Link>
                      </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="luxury-card p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border border-zinc-100 dark:border-zinc-900 shadow-xl overflow-hidden relative group">
                          <div className="absolute top-0 left-0 w-1 h-full gold-bg opacity-0 group-hover:opacity-100 transition-all" />
                          
                          <div className="space-y-4 flex-grow">
                            <div className="flex items-center space-x-4">
                              <span className={`px-4 py-1.5 rounded-full text-[8px] uppercase tracking-[0.4em] font-bold ${getStatusColor(order.status)}`}>
                                — {order.status.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{order.transaction_id}</span>
                            </div>
                            
                            <div className="space-y-1">
                              <h4 className="text-lg font-serif italic text-black dark:text-white capitalize">
                                {order.delivery_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                              </h4>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest truncate max-w-md">
                                {order.shipping_address}
                              </p>
                            </div>

                            {order.status === 'shipped' && (order.driver_name || order.driver_number) && (
                              <div className="p-4 bg-gold-500/5 rounded-xl border border-gold-500/10 flex items-center space-x-6">
                                 <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-gold-500 font-bold">— Logistics Personnel</p>
                                    <p className="text-xs text-black dark:text-white font-serif italic">{order.driver_name || 'Assigned Driver'}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-gold-500 font-bold">— Contact</p>
                                    <Link href={`tel:${order.driver_number}`} className="text-xs text-black dark:text-white hover:underline">{order.driver_number || 'N/A'}</Link>
                                 </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end space-y-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold tracking-tighter text-black dark:text-white italic">₦ {order.total_amount.toLocaleString()}</p>
                              <p className="text-[9px] uppercase tracking-widest text-zinc-400">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                             <button 
                               onClick={() => setSelectedOrder(order)}
                               className="text-[10px] uppercase tracking-[0.3em] font-bold border border-zinc-200 dark:border-zinc-800 px-8 py-3 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                             >
                                View Selection
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <h2 className="text-4xl font-serif italic text-black dark:text-white">Support Center</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <form onSubmit={handleSubmitComplaint} className="luxury-card p-10 space-y-8 border border-zinc-100 dark:border-zinc-900 shadow-xl">
                       <h4 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Send us a message</h4>
                       <div className="space-y-6">
                         <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Subject</label>
                           <input 
                             type="text" 
                             required
                             value={complaint.title}
                             onChange={(e) => setComplaint({...complaint, title: e.target.value})}
                             placeholder="Order #1023 Issue"
                             className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-lg p-4 text-xs text-black dark:text-white"
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Message</label>
                           <textarea 
                             required
                             value={complaint.message}
                             onChange={(e) => setComplaint({...complaint, message: e.target.value})}
                             placeholder="Please describe your complaint or request..."
                             className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-lg p-4 text-xs text-black dark:text-white h-40 resize-none"
                           />
                         </div>
                         <button 
                           disabled={isSubmitting}
                           type="submit" 
                           className="w-full bg-black dark:bg-white text-white dark:text-black py-4 text-[10px] uppercase tracking-[0.3em] font-bold rounded-lg hover:gold-bg hover:text-white transition-all disabled:opacity-50"
                         >
                           {isSubmitting ? "Sending masterpiece..." : "Send Request"}
                         </button>
                       </div>
                    </form>

                    <div className="space-y-8">
                       <div className="p-8 bg-white dark:bg-black rounded-2xl border border-zinc-100 dark:border-zinc-900 shadow-xl max-h-[500px] overflow-y-auto custom-scrollbar">
                          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-6 text-black dark:text-white">— Previous Conversations</h4>
                          <div className="space-y-6">
                            {notifications.filter(n => ['complaint', 'reply', 'order inquiry', 'order issue', 'broadcast', 'contact'].includes(n.type?.toLowerCase() || '')).length === 0 ? (
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest italic">No message history yet.</p>
                            ) : (
                              notifications
                                .filter(n => ['complaint', 'reply', 'order inquiry', 'order issue', 'broadcast', 'contact'].includes(n.type?.toLowerCase() || ''))
                                .map((msg) => {
                                  let formattedDate = "Recent";
                                  try {
                                    if (msg.created_at) {
                                      formattedDate = new Date(msg.created_at).toLocaleDateString();
                                    }
                                  } catch (e) {
                                    console.warn("Invalid date in notification:", msg.created_at);
                                  }

                                  return (
                                    <div key={msg.id} className={`p-4 rounded-xl border ${msg.type === 'reply' || msg.type === 'broadcast' ? 'bg-gold-500/5 border-gold-500/20 ml-4' : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 mr-4'}`}>
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] uppercase tracking-widest font-bold gold-text">
                                          {msg.type === 'reply' || msg.type === 'broadcast' ? 'Ayoka Concierge' : 'You'}
                                        </span>
                                        <span className="text-[8px] uppercase tracking-widest text-zinc-400">
                                          {formattedDate}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-black dark:text-white leading-relaxed">{msg.message}</p>
                                    </div>
                                  );
                                })
                            )}
                          </div>
                       </div>
                       <div className="p-8 bg-white dark:bg-black rounded-2xl border border-zinc-100 dark:border-zinc-900 shadow-xl">
                          <Clock size={24} className="gold-text mb-4" />
                          <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2 text-black dark:text-white">— Response Time</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed font-light">Our concierge team typically responds within 2-4 business hours for urgent inquiries.</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <h2 className="text-4xl font-serif italic text-black dark:text-white">Profile Settings</h2>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">Account management</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Compact Card with Avatar */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="luxury-card p-10 text-center space-y-6 relative group border border-zinc-100 dark:border-zinc-900 shadow-xl overflow-hidden bg-white dark:bg-black">
                        <div className="absolute top-0 left-0 w-full h-1 gold-bg opacity-20" />
                        
                        <div className="relative inline-block group/avatar">
                          <Avatar 
                            src={session?.user?.image} 
                            name={session?.user?.name} 
                            size={120} 
                            className="mx-auto border-4 border-gold-500/10 shadow-2xl transition-transform group-hover/avatar:scale-105 duration-500" 
                          />
                           <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer rounded-full backdrop-blur-sm z-20">
                              {isUploading ? (
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Camera className="text-white mb-2" size={32} strokeWidth={1.5} />
                                  <span className="text-[10px] uppercase tracking-[0.4em] text-white font-bold">— Update Masterpiece</span>
                                </>
                              )}
                              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                           </label>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xl font-serif italic text-black dark:text-white">{session?.user?.name}</h4>
                          <div className="flex items-center justify-center space-x-2 text-zinc-400">
                            <Mail size={12} />
                            <p className="text-[10px] uppercase tracking-widest">{session?.user?.email}</p>
                          </div>
                        </div>

                        <div className="pt-6 flex justify-center space-x-4 border-t border-zinc-50 dark:border-zinc-900">
                           <div className="text-center">
                              <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-[0.4em] mb-1">{orders.length}</p>
                              <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Pieces</p>
                           </div>
                           <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 self-center" />
                           <div className="text-center">
                              <p className="text-[10px] font-bold gold-text uppercase tracking-[0.4em] mb-1">Active Member</p>
                              <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Status</p>
                           </div>
                        </div>
                      </div>

                      <div className="p-8 bg-black dark:bg-white rounded-3xl text-center space-y-4 shadow-2xl relative overflow-hidden group border border-zinc-800 dark:border-zinc-200">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-all group-hover:bg-gold-500/20" />
                         <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Ayoka Rewards</p>
                         <h3 className="text-2xl font-serif italic text-white dark:text-black">Silver Tier</h3>
                         <div className="w-full h-1 bg-zinc-800 dark:bg-zinc-100 rounded-full overflow-hidden mt-4">
                            <motion.div initial={{ width: 0 }} animate={{ width: "35%" }} className="h-full gold-bg" />
                         </div>
                         <p className="text-[8px] uppercase tracking-widest text-zinc-500 italic mt-2">2,450 points to Gold status</p>
                      </div>
                    </div>

                    {/* Detailed Info */}
                    <div className="lg:col-span-2 luxury-card p-12 space-y-12 border border-zinc-100 dark:border-zinc-900 shadow-xl bg-white dark:bg-black">
                       <section className="space-y-8">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gold-500/10 rounded-lg">
                              <UserIcon size={20} className="gold-text" />
                            </div>
                            <h4 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Personal Details</h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Display Name</label>
                               <input 
                                 type="text"
                                 value={profileForm.fullName}
                                 onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                                 className="w-full bg-white dark:bg-black rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-xs text-black dark:text-white font-medium outline-none focus:border-gold-500 transition-all shadow-sm"
                                 placeholder="Your Full Name"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Registered Email</label>
                               <div className="relative">
                                 <input 
                                   type="email"
                                   value={profileForm.email}
                                   readOnly
                                   className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800/50 text-xs text-zinc-400 font-medium cursor-not-allowed outline-none"
                                 />
                                 <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                   <Shield size={14} className="text-zinc-300 dark:text-zinc-600" />
                                 </div>
                               </div>
                            </div>
                          </div>
                       </section>

                       <section className="pt-12 border-t border-zinc-50 dark:border-zinc-900 space-y-8">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gold-500/10 rounded-lg">
                              <Shield size={20} className="gold-text" />
                            </div>
                            <h4 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Security & Login</h4>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 gap-4">
                               <div className="space-y-1">
                                  <p className="text-xs font-bold text-black dark:text-white">External Authentication</p>
                                  <p className="text-[10px] text-zinc-500 leading-relaxed font-light">Your account is managed via Google. Security updates should be performed through your Google settings.</p>
                               </div>
                               <button className="text-[8px] uppercase tracking-widest gold-text font-bold hover:underline transition-all shrink-0">
                                  Google Settings
                               </button>
                            </div>
                            
                            <div className="pt-4 flex flex-col sm:flex-row justify-end gap-4">
                               <button className="px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-bold border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                                  Request Data Export
                               </button>
                                <button 
                                  onClick={handleSaveProfile}
                                  disabled={isSaving}
                                  className="px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-bold gold-bg text-white rounded-full hover:scale-105 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
                                >
                                   {isSaving ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                          </div>
                       </section>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <h2 className="text-4xl font-serif italic text-black dark:text-white">Notifications</h2>
                    <button 
                      onClick={async () => {
                        // Global Sync: Mark ALL notifications in the DB as read FOR THIS USER
                        const userId = (session?.user as any)?.id
                        const userEmail = session?.user?.email
                        
                        const query = supabase.from('notifications').update({ status: 'read' }).eq('status', 'unread')
                        
                        if (userId && userEmail) query.or(`customer_id.eq.${userId},sender_email.eq.${userEmail}`)
                        else if (userId) query.eq('customer_id', userId)
                        else query.eq('sender_email', userEmail)

                        // Optimistic Update: Refresh the local state immediately
                        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
                        
                        const { error } = await query
                        if (error) {
                          console.error("Error marking all as read:", error)
                          alert("Sync failed. Check connection.")
                          // If there's an error, the real-time subscription will eventually correct the state
                          // No explicit re-fetch needed here to avoid overwriting optimistic state
                        }
                        
                        // Rely on real-time subscription for final consistency
                      }}
                      className="text-[10px] uppercase tracking-widest text-gold-500 font-bold hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="p-20 bg-white dark:bg-black rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
                        <Bell size={32} className="mx-auto text-zinc-300" />
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`luxury-card p-8 border border-zinc-100 dark:border-zinc-900 shadow-xl flex items-start space-x-6 relative overflow-hidden group ${notif.status === 'unread' ? 'bg-zinc-50 dark:bg-zinc-900/20' : 'bg-white dark:bg-black'}`}>
                          {notif.status === 'unread' && <div className="absolute top-0 left-0 w-1 h-full gold-bg" />}
                          <div className={`p-4 rounded-xl ${notif.type === 'order' ? 'bg-gold-500/10 text-gold-500' : 'bg-blue-500/10 text-blue-500'}`}>
                             {notif.type === 'order' ? <Package size={20} /> : <MessageSquare size={20} />}
                          </div>
                          <div className="flex-grow space-y-1">
                             <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">{notif.title}</h4>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                             </div>
                             <p className="text-xs text-zinc-500 leading-relaxed font-light">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Detail Modal - MOVED OUTSIDE FOR STABILITY */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-black w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-10 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar text-black dark:text-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                     <div className="flex items-center space-x-3">
                       <Package size={20} className="gold-text" />
                       <span className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">— Detailed Selection</span>
                     </div>
                     <h3 className="text-3xl font-serif italic">Order #{selectedOrder.transaction_id || selectedOrder.id}</h3>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                    <X size={24} className="text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                         <span className="text-zinc-400">Order Status</span>
                         <span className="gold-text">{selectedOrder.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-zinc-500">Logistics Option</span>
                         <span className="capitalize font-medium">{selectedOrder.delivery_method}</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold">— Pieces in Selection</h4>
                      <div className="space-y-4">
                         {Array.isArray(selectedOrder.items) ? (
                           selectedOrder.items.map((item: any, idx: number) => {
                             const product = item.product || {};
                             const name = product.name || item.name || 'Bespoke Piece';
                             const price = product.price || item.price || 0;
                             const image = product.main_image || item.image || null;

                             return (
                               <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-xl">
                                  <div className="flex items-center space-x-4">
                                     <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                                        {image ? (
                                          <img src={image} alt={name} className="w-full h-full object-cover" />
                                        ) : (
                                          <Package size={16} className="text-zinc-300" />
                                        )}
                                     </div>
                                     <div>
                                        <p className="text-xs font-bold uppercase tracking-wider">{name}</p>
                                        <p className="text-[10px] text-zinc-400">Size: {item.size || 'XL'} | Qty: {item.quantity || 1}</p>
                                     </div>
                                  </div>
                                  <p className="text-xs font-bold gold-text">₦ {((Number(price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}</p>
                               </div>
                             );
                           })
                         ) : (
                           <p className="text-xs text-zinc-500 italic">Piece details are currently being itemized by our concierge.</p>
                         )}
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-zinc-50 dark:border-zinc-900 flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Total Selection Value</p>
                      <p className="text-3xl font-bold tracking-tighter italic">₦ {selectedOrder.total_amount.toLocaleString()}</p>
                   </div>
                   <button onClick={() => setSelectedOrder(null)} className="gold-bg text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-bold rounded-full">
                      Close Selection
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}

export default function UserPortal() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UserPortalContent />
    </Suspense>
  )
}
