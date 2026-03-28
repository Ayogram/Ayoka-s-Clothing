"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import AdminProducts from "@/components/admin/AdminProducts"
import AdminCustomers from "@/components/admin/AdminCustomers"
import AdminMedia from "@/components/admin/AdminMedia"
import AdminNotifications from "@/components/admin/AdminNotifications"
import AdminSubscribers from "@/components/admin/AdminSubscribers"
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, ChevronRight, Eye, Search, X, Share2, Sun, Moon, Bell, UserPlus, Mail, Shield, DollarSign, Trash2, RotateCcw, Sparkles } from "lucide-react"

// Safety wrapper for Icons to prevent crashes if an icon is missing from the library version
const SafeIcon = ({ icon: IconComponent, size = 16, strokeWidth = 1.5, className = "" }: any) => {
  if (!IconComponent) return <div className={`w-[${size}px] h-[${size}px] bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center ${className}`}><span className="text-[6px]">?</span></div>;
  try {
    return <IconComponent size={size} strokeWidth={strokeWidth} className={className} />;
  } catch (e) {
    return <div className={`w-[${size}px] h-[${size}px] bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center ${className}`}><span className="text-[6px]">!</span></div>;
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // 1. All State Hooks
  const [activeView, setActiveView] = useState("overview")
  const [notifCount, setNotifCount] = useState(0)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [adminProfiles, setAdminProfiles] = useState<any[]>([])
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderSearch, setOrderSearch] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [driverInfo, setDriverInfo] = useState({ name: "", number: "" })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [viewFilter, setViewFilter] = useState<'active'|'trash'>('active')

  // 2. Helper Functions
  const fetchData = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('is_deleted', viewFilter === 'trash')
        .order('created_at', { ascending: false })
      
      // Fetch profiles via secure Admin API to bypass RLS restrictions
      const profResponse = await fetch('/api/admin/customers')
      const profiles = await profResponse.json()
      
      const profileMap = Object.fromEntries(Array.isArray(profiles) ? profiles.map(p => [p.id, p]) : [])
      const emailToProfile = Object.fromEntries(Array.isArray(profiles) ? profiles.map(p => [p.email?.toLowerCase(), p]) : [])

      if (orderError) console.error("Order fetch error:", orderError);
      if (orderData) {
        setOrders(orderData.map(o => {
          // Priority 1: Match by customer_id
          let profile = profileMap[o.customer_id]
          
          // Priority 2: Match by customer_email (after SQL sync)
          if (!profile && o.customer_email) {
            profile = emailToProfile[o.customer_email.toLowerCase()]
          }

          return {
            id: (o.id || "").slice(0, 8),
            realId: o.id,
            transaction_id: o.transaction_id,
            customer: profile?.full_name || o.customer_email || 'Anonymous Patron',
            customer_id: o.customer_id || profile?.id,
            customer_email: o.customer_email || profile?.email || '',
            contact_number: o.contact_number,
          delivery_method: o.delivery_method,
          shipping_address: o.shipping_address,
          items: Array.isArray(o.items) ? `${o.items.length} items` : 'Multiple pieces',
          total: Number(o.total_amount || 0),
          status: o.status,
          driver_name: o.driver_name,
          driver_number: o.driver_number,
          payment_receipt: o.payment_receipt,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'
          }
        }))
      }
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer')
      if (count !== null) setCustomerCount(count)
      const { count: nCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'unread')
      if (nCount !== null) setNotifCount(nCount)
      const { data: admins } = await supabase.from('profiles').select('*').eq('role', 'admin')
      if (admins) setAdminProfiles(admins)
    } catch (e: any) {
      setErrorStatus(`Data Fetch Error: ${e.message || "Unknown Error"}`)
    }
  }

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdateLoading(true)
    const updateData: any = { status: newStatus }
    if (newStatus === 'shipped') {
      if (driverInfo.name) updateData.driver_name = driverInfo.name
      if (driverInfo.number) updateData.driver_number = driverInfo.number
    }
    
    try {
      // 1. Update Order in DB securely via API
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', orderId, payload: updateData })
      });
      if (!res.ok) throw new Error(await res.text());

      // 2. Fetch Latest Customer Email if needed
      let targetEmail = selectedOrder?.customer_email || 'customer@example.com'
      if (selectedOrder?.customer_id) {
        const { data: profile } = await supabase.from('profiles').select('email').eq('id', selectedOrder.customer_id).single()
        if (profile?.email) targetEmail = profile.email
      }

      // 3. Notify Customer via Portal & Email
      if (selectedOrder?.customer_id) {
        await supabase.from('notifications').insert([{
          type: newStatus === 'shipped' ? 'logistics' : 'order',
          title: `Order Update: ${newStatus.replace('_', ' ').toUpperCase()}`,
          message: `Your Ayoka Selection #${selectedOrder.transaction_id || selectedOrder.id} is now ${newStatus.replace('_', ' ')}. ${newStatus === 'shipped' ? `Driver: ${driverInfo.name || 'Assigned'}` : ''}`,
          customer_id: selectedOrder.customer_id,
          status: 'unread',
          sender_name: 'Ayoka Concierge',
          sender_email: 'concierge@Ayoka.com'
        }])

        // 4. Trigger Instant Email Alert
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: targetEmail,
              subject: `Update on your Ayoka Selection: ${newStatus.replace('_', ' ')}`,
              html: `<div style="font-family: serif; padding: 30px; border: 1px solid #d4af37; background: #fff;">
                      <h2 style="font-style: italic; color: #000;">Elite Order Notification</h2>
                      <p>Your piece #${selectedOrder.transaction_id || selectedOrder.id} has been transitioned to: <strong>${newStatus.replace('_', ' ').toUpperCase()}</strong>.</p>
                      <p>Log in to your <a href="http://localhost:3000/portal" style="color: #d4af37;">Concierge Portal</a> to track your delivery in real-time.</p>
                    </div>`
            })
          })
        } catch (e) {
          console.warn("Gmail alert dispatch failed.")
        }

        // 5. Mirror to Admin
        try {
          await fetch('/api/send-email', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               to: 'ajumobiayomipo@gmail.com',
               subject: `[LOG] Order Status Changed: ${newStatus}`,
               html: `<p>Order #${selectedOrder.transaction_id || selectedOrder.id} has been transitioned to <strong>${newStatus.replace('_', ' ').toUpperCase()}</strong>.</p>`
             })
          })
        } catch (e) {}
      }

      await fetchData()
      const updated = orders.find(o => o.realId === orderId)
      if (updated) setSelectedOrder({...updated, ...updateData})
      alert(`Status Updated Successfully. (Status: ${newStatus})`)
    } catch (error: any) {
      console.error("Update Error:", error)
      alert(`Error: ${error.message || "Failed to reach database"}`)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleToggleDelete = async (orderId: string, isDelete: boolean) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleDelete', orderId, payload: { is_deleted: isDelete } })
      });
      if (!res.ok) throw new Error(await res.text());

      alert(isDelete ? "Order moved to Trash." : "Order restored to Active.")
      await fetchData()
    } catch (e: any) {
      alert(`Operation failed: ${e.message}`)
    }
  }

  // 3. Effects
  useEffect(() => {
    fetchData()
  }, [viewFilter])
  useEffect(() => {
    setHasMounted(true)
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
    if (isDark) document.body.classList.add('dark-theme-active')
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    } else if (status === "authenticated" && (session?.user as any)?.role !== 'admin') {
      router.push("/portal")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session) {
      fetchData()
      
      // Real-time listener for notification count and other updates
      const channel = supabase
        .channel('admin-dashboard-sync')
        .on('postgres_changes' as any, { event: '*', table: 'notifications' }, () => {
          fetchData()
        })
        .on('postgres_changes' as any, { event: '*', table: 'orders' }, () => {
          fetchData()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [session])

  // 4. Content Rendering
  const filteredOrders = orders.filter(o => 
    o.transaction_id?.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.id.includes(orderSearch) || 
    o.customer.toLowerCase().includes(orderSearch.toLowerCase())
  )

  const renderContent = () => {
    switch(activeView) {
      case "products": return <AdminProducts />
      case "customers": return <AdminCustomers />
      case "media": return <AdminMedia />
      case "notifications": return <AdminNotifications onUpdate={fetchData} />
      case "subscribers": return <AdminSubscribers />
      case "admins": return (
        <div className="space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif italic text-black dark:text-white">Admin Access</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Grant portal permissions to staff</p>
            </div>
            <SafeIcon icon={Shield} size={48} className="text-gold-500/10" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="luxury-card p-10 space-y-8">
              <h4 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Invite New Admin</h4>
              <div className="flex space-x-4">
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email address" className="flex-grow bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 text-xs font-bold" />
                <button onClick={async () => {
                  if (!inviteEmail) return
                  setIsInviting(true)
                  try {
                    const res = await fetch('/api/admin/invite', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: inviteEmail })
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || data.details || "Failed to invite.")
                    alert(data.message || `Access granted to ${inviteEmail}.`)
                    setInviteEmail("")
                  } catch (e: any) {
                    alert(`Error: ${e.message}`)
                  } finally {
                    setIsInviting(false)
                    fetchData()
                  }
                }} disabled={isInviting} className="bg-gold-500 text-white px-8 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-gold-600 transition-all">Grant</button>
              </div>
            </div>
          </div>
        </div>
      )
      case "settings": return <div className="p-12 text-center text-[10px] uppercase tracking-widest text-zinc-500">Portal Settings Coming Soon</div>
      default: return (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Total Revenue", value: `₦ ${(orders.reduce((acc, o) => acc + (o.total || 0), 0) || 0).toLocaleString()}`, change: "+12.5%", icon: DollarSign },
              { label: "Active Orders", value: orders.length.toString(), change: "+4 this week", icon: ShoppingBag },
              { label: "Total Customers", value: (customerCount || 0).toLocaleString(), change: "Live", icon: Users },
            ].map((stat) => (
              <motion.div key={stat.label} whileHover={{ y: -5 }} className="bg-white dark:bg-black p-8 border border-zinc-100 dark:border-zinc-900 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">{stat.label}</p>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-serif italic">{stat.value}</p>
                  <SafeIcon icon={stat.icon} className="text-gold-500/20" />
                </div>
                <p className="text-[9px] uppercase tracking-widest gold-text font-bold">{stat.change}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-12 transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
              <div className="flex items-center space-x-12">
                <div className="space-y-1">
                  <h3 className="text-xl font-serif italic">Management Workflow</h3>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">Handle fulfillment & logistics</p>
                </div>
                <div className="flex bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-xl">
                  <button onClick={() => setViewFilter('active')} className={`px-6 py-2 text-[9px] uppercase tracking-widest font-bold rounded-lg transition-all ${viewFilter === 'active' ? 'bg-white dark:bg-zinc-800 shadow-sm text-gold-500' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Active</button>
                  <button onClick={() => setViewFilter('trash')} className={`px-6 py-2 text-[9px] uppercase tracking-widest font-bold rounded-lg transition-all ${viewFilter === 'trash' ? 'bg-white dark:bg-zinc-800 shadow-sm text-red-500' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Trash</button>
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input type="text" placeholder="SEARCH ORDERS..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="w-full bg-transparent border-b border-zinc-100 dark:border-zinc-900 pl-10 py-2 text-[10px] focus:border-gold-500 outline-none transition-colors" />
              </div>
            </div>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? <div className="py-20 text-center uppercase tracking-widest text-[10px] text-zinc-500">No active orders found.</div> : filteredOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-6 border-b border-zinc-50 dark:border-zinc-900 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all px-4 rounded-xl group">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-12 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[8px] font-bold px-2 text-center leading-tight">
                      {order.transaction_id || `#${order.id}`}
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest">{order.customer}</p>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400">{order.items} • {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${order.status === 'pending' ? 'bg-gold-500/10 text-gold-500' : order.status === 'delivered' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>{order.status}</span>
                    <button onClick={() => setSelectedOrder(order)} className="text-xs font-bold gold-text flex items-center space-x-2 group-hover:underline"><Eye size={16} /> <span className="hidden md:inline">View Details</span></button>
                    {viewFilter === 'active' ? (
                      <button onClick={() => handleToggleDelete(order.realId, true)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    ) : (
                      <button onClick={() => handleToggleDelete(order.realId, false)} className="p-2 text-zinc-300 hover:text-green-500 transition-colors"><RotateCcw size={16} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  }

  // 5. Early Returns
  if (!hasMounted) return null
  if (errorStatus) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8 text-center space-y-6">
      <h1 className="text-3xl font-serif italic">System Interruption</h1>
      <p className="text-xs font-mono text-zinc-400 bg-zinc-900 p-4 rounded max-w-md mx-auto">{errorStatus}</p>
      <button onClick={() => window.location.reload()} className="gold-text text-[10px] uppercase tracking-widest font-bold border-b border-gold-500 pb-1">Attempt Recovery</button>
    </div>
  )
  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent animate-spin rounded-full" /></div>
  )
  if (!session || (session.user as any)?.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-8 text-center space-y-6">
      <div className="space-y-4">
         <h1 className="text-4xl font-serif italic text-white">Access Restrained</h1>
         <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Administrator Credentials Required</p>
      </div>
      <button onClick={() => router.push('/')} className="gold-text text-[10px] uppercase tracking-widest font-bold border-b border-gold-500 pb-1">Return to Boutique</button>
    </div>
  )

  // 6. Main Return
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex transition-colors duration-500">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print, .no-print * { display: none !important; }
          .print-area { width: 100% !important; border: none !important; position: absolute !important; top: 0 !important; left: 0 !important; margin: 0 !important; padding: 40px !important; }
          aside, header, .sidebar-active { display: none !important; }
          .modal-overlay { background: white !important; }
        }
      `}} />
      <aside className="w-64 bg-white dark:bg-black border-r border-zinc-100 dark:border-zinc-900 flex flex-col pt-12 no-print">
        <div className="px-8 mb-12">
          <Link href="/" className="flex flex-col">
            <span className="text-2xl font-serif italic font-bold gold-text">Ayoka</span>
            <span className="text-[10px] tracking-[0.3em] -mt-1 uppercase text-zinc-500">Concierge</span>
          </Link>
        </div>
        <nav className="flex-grow px-4 space-y-2">
          {[
            { id: "overview", label: "Dashboard", icon: LayoutDashboard },
            { id: "products", label: "Products", icon: ShoppingBag },
            { id: "customers", label: "Customers", icon: Users },
            { id: "media", label: "Media Center", icon: Share2 },
            { id: "notifications", label: "Inbox", icon: Bell, badge: notifCount },
            { id: "subscribers", label: "Inner Circle", icon: Sparkles },
            { id: "admins", label: "Admin Access", icon: UserPlus },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center justify-between px-4 py-4 text-[10px] uppercase tracking-widest font-bold transition-all relative ${activeView === item.id ? 'gold-text bg-zinc-50 dark:bg-zinc-900/50' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>
              <div className="flex items-center space-x-4">
                <SafeIcon icon={item.icon} size={16} strokeWidth={1.5} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="bg-gold-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-full flex items-center space-x-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
            <SafeIcon icon={LogOut} size={16} /><span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-grow p-12 overflow-y-auto relative">
        <header className="flex justify-between items-end mb-16 px-4 no-print">
          <div className="space-y-2">
            <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">— {activeView === 'overview' ? 'Portal Overview' : `Management / ${activeView}`}</h5>
            <h1 className="text-4xl font-serif italic capitalize">{activeView === 'overview' ? 'Administrator Workspace' : `${activeView} Centre`}</h1>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={toggleTheme} className="p-3 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-full text-zinc-400 hover:text-gold-500 transition-all shadow-sm">
              <SafeIcon icon={isDarkMode ? Sun : Moon} size={18} />
            </button>
            <div className="text-right border-l border-zinc-100 dark:border-zinc-900 pl-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Authorized Session</p>
              <p className="text-xs font-bold tracking-widest">{session.user?.name || "Administrator"}</p>
            </div>
          </div>
        </header>

        {renderContent()}

        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm modal-overlay">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-white dark:bg-zinc-950 p-12 shadow-2xl relative border border-zinc-100 dark:border-zinc-900 print-area">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-zinc-400 hover:text-black dark:hover:text-white no-print"><X size={24} /></button>
                <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold mb-4">— Order Details</h5>
                <h2 className="text-3xl font-serif italic mb-12">Reference {selectedOrder.transaction_id || `#${selectedOrder.id}`}</h2>
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Client</p>
                    <p className="text-sm font-bold tracking-widest">{selectedOrder.customer}</p>
                    {selectedOrder.customer_email && <p className="text-[10px] text-zinc-400 font-mono lower-case">{selectedOrder.customer_email}</p>}
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Support Contact</p>
                    <p className="text-sm font-bold tracking-widest">{selectedOrder.contact_number || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Items</p>
                    <p className="text-sm font-bold tracking-widest">{selectedOrder.items}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Total Amount</p>
                    <p className="text-sm font-bold tracking-widest gold-text">₦ {selectedOrder.total.toLocaleString()}</p>
                    {selectedOrder.payment_receipt && (
                      <a 
                        href={selectedOrder.payment_receipt} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block text-[8px] uppercase tracking-widest font-bold border-b border-gold-500/40 hover:border-gold-500 transition-all text-zinc-500 hover:text-gold-500 mt-2"
                      >
                        View Payment Receipt
                      </a>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2 pt-6 border-t border-zinc-50 dark:border-zinc-900">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Delivery Address / Destination</p>
                    <p className="text-sm font-light leading-relaxed max-w-lg">{selectedOrder.shipping_address}</p>
                  </div>
                </div>
                <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-12 space-y-8 no-print">
                   <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-widest text-gold-500 font-bold">Update Logistics Status</p>
                      <select value={selectedOrder.status} onChange={(e) => handleUpdateStatus(selectedOrder.realId, e.target.value)} disabled={updateLoading} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-[10px] uppercase tracking-[0.2em] font-bold outline-none focus:border-gold-500">
                         <option value="payment_pending">Payment Pending</option>
                         <option value="payment_received">Payment Received</option>
                         <option value="processing">Processing Order</option>
                         <option value="shipped">Order Sent Out (Shipped)</option>
                         <option value="delivered">Delivered to Location</option>
                         <option value="received">Received by Customer</option>
                      </select>
                   </div>
                   {selectedOrder.status === 'shipped' && (
                     <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="Driver Name" defaultValue={selectedOrder.driver_name} onChange={(e) => setDriverInfo({...driverInfo, name: e.target.value})} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-[10px]" />
                           <input type="text" placeholder="Driver Phone" defaultValue={selectedOrder.driver_number} onChange={(e) => setDriverInfo({...driverInfo, number: e.target.value})} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-[10px]" />
                        </div>
                        <button onClick={() => handleUpdateStatus(selectedOrder.realId, 'shipped')} className="w-full gold-bg text-white py-3 text-[10px] uppercase tracking-widest font-bold rounded-xl">Update Driver Info</button>
                     </div>
                   )}
                </div>
                <div className="flex gap-4 no-print">
                  <button onClick={() => window.print()} className="flex-grow bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-widest text-[10px] font-bold">Print Logistics Invoice</button>
                  <button onClick={() => setSelectedOrder(null)} className="flex-grow border border-zinc-100 dark:border-zinc-900 py-4 uppercase tracking-widest text-[10px] font-bold text-zinc-500">Close View</button>
                </div>
                <div className="hidden print:block mt-24 border-t border-zinc-100 pt-8 text-center">
                    <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-500">Ayoka's Clothing • Premium Hand-Tailored Luxury</p>
                    <p className="text-[8px] text-zinc-400 mt-2">Generated by Ayoka Concierge Portal • {new Date().toLocaleString()}</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
