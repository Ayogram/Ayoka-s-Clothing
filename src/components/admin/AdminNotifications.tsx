"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Mail, MessageSquare, AlertCircle, X, Check, Trash2, ArrowRight } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  sender_email: string
  sender_name: string
  customer_id?: string
  status: string
  created_at: string
}
interface AdminNotificationsProps {
  onUpdate?: () => void
}

const AdminNotifications = ({ onUpdate }: AdminNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread')
  const [isReplying, setIsReplying] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")

  useEffect(() => {
    fetchNotifications()
    
    // Subscribe to ALL notification updates for real-time portal experience
    const channel = supabase
      .channel('notification-updates')
      .on('postgres_changes' as any, { event: '*', table: 'notifications' }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setNotifications(data)
  }

  const markAsRead = async (id: string) => {
    // Optimistic Update: Refresh the local state immediately
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, status: 'read' } : notif))
    
    const res = await fetch('/api/admin/notifications/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markRead', id })
    })
    const data = await res.json()
    if (!res.ok) {
      console.error("Error marking as read:", data.error || data.details)
      fetchNotifications() // Restore on error
    } else {
      if (onUpdate) onUpdate()
    }
  }

  const markAllAsRead = async () => {
    // Optimistic Update: Refresh the local state immediately
    setNotifications(prev => prev.map(notif => ({ ...notif, status: 'read' })))
    
    // Use Secure Admin API to ensure consistency for all users
    const response = await fetch('/api/admin/notifications/mark-all-read', { method: 'POST' })
    const result = await response.json()
    
    if (result.error) {
      console.error("Error marking all as read:", result.error)
      alert("Failed to sync status globally.")
      fetchNotifications() // Restore on error
    } else {
      if (onUpdate) onUpdate()
    }
  }

  const deleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return
    
    // Optimistic Update: Remove from UI immediately
    const previousNotifs = [...notifications]
    setNotifications(notifications.filter(n => n.id !== id))
    setSelectedNotification(null)

    // Use Secure Admin API to bypass RLS for permanent deletion
    const response = await fetch('/api/admin/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const result = await response.json()

    if (result.error) {
       alert("Failed to delete message from server. Restoring...")
       setNotifications(previousNotifs)
    } else {
       if (onUpdate) onUpdate()
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage || !selectedNotification) return
    
    // 1. Persist reply securely using Admin API
    const res = await fetch('/api/admin/notifications/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'sendReply', 
        payload: {
          message: replyMessage,
          customer_id: selectedNotification.customer_id
        }
      })
    })

    if (!res.ok) {
      alert("Failed to persist reply in database.")
      return
    }

    // 2. Trigger Gmail Dispatch via API
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: selectedNotification.sender_email,
        subject: `Response from Ayoka Concierge`,
        html: `
          <div style="font-family: serif; padding: 20px; border: 1px solid #d4af37;">
            <h2 style="font-style: italic;">Response to your Inquiry</h2>
            <p><strong>Original Message:</strong> "${selectedNotification.message}"</p>
            <hr />
            <p style="background: #fdfdfd; padding: 15px; border-left: 4px solid #d4af37;">${replyMessage}</p>
            <p style="font-size: 10px; color: #999;">If you have further questions, please contact our concierge.</p>
          </div>
        `
      })
    })

    // 3. Mirror to Business Gmail for awareness
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'ajumobiayomipo@gmail.com',
        subject: `[SENT] Admin Reply to ${selectedNotification.sender_name}`,
        html: `<p>A reply has been sent out to your client from the concierge portal.</p><p><strong>Client:</strong> ${selectedNotification.sender_name}</p><p><strong>Reply Content:</strong> ${replyMessage}</p>`
      })
    })
    
    alert(`Your masterpiece of a response has been sent to ${selectedNotification.sender_name}!`)
    setIsReplying(false)
    setReplyMessage("")
    markAsRead(selectedNotification.id)
  }

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => n.status === 'unread')
    : notifications

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'contact': return <Mail size={16} className="text-blue-500" />
      case 'complaint': return <AlertCircle size={16} className="text-red-500" />
      case 'order': return <Bell size={16} className="text-green-500" />
      default: return <MessageSquare size={16} className="text-zinc-400" />
    }
  }

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic text-black dark:text-white">Notification Hub</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">— Manage inquiries & system alerts</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={markAllAsRead}
            className="px-6 py-2 border border-black dark:border-white text-[10px] uppercase tracking-[0.2em] font-bold gold-text hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all rounded-lg"
          >
            Mark all as read
          </button>
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all rounded ${activeTab === 'unread' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
            >
              Unread ({notifications.filter(n => n.status === 'unread').length})
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all rounded ${activeTab === 'all' ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm' : 'text-zinc-500'}`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden">
        {/* List View */}
        <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">All clear. No notifications.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layoutId={notif.id}
                onClick={() => setSelectedNotification(notif)}
                className={`p-6 border cursor-pointer transition-all rounded-xl ${
                  selectedNotification?.id === notif.id 
                  ? "border-gold-500 bg-gold-500/5 shadow-lg shadow-gold-500/5 text-black dark:text-white" 
                  : "border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                } ${notif.status === 'unread' ? 'border-l-4 border-l-gold-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(notif.type)}
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">{notif.type}</span>
                  </div>
                  <span className="text-[8px] text-zinc-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold mb-1">{notif.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{notif.message}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail View */}
        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selectedNotification ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 space-y-8 flex flex-col h-full"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(selectedNotification.type)}
                      <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold">{selectedNotification.type}</span>
                    </div>
                    <h3 className="text-3xl font-serif italic text-black dark:text-white">{selectedNotification.title}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => markAsRead(selectedNotification.id)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-green-500 transition-colors"><Check size={18} /></button>
                    <button onClick={() => deleteNotification(selectedNotification.id)} className="p-2 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-full text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-xl shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold border border-gold-500/20">
                    {selectedNotification.sender_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">{selectedNotification.sender_name || 'Ayoka Client'}</p>
                    <p className="text-[10px] text-zinc-500 lowercase tracking-widest">{selectedNotification.sender_email || 'concierge@Ayoka.com'}</p>
                  </div>
                </div>

                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light flex-grow">
                  {selectedNotification.message}
                </div>

                {isReplying ? (
                  <div className="space-y-4 bg-white dark:bg-black p-6 rounded-xl border border-gold-500/30">
                    <textarea 
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your professional response..."
                      className="w-full bg-transparent border-none focus:ring-0 text-xs text-black dark:text-white resize-none h-32"
                    />
                    <div className="flex justify-end space-x-4">
                      <button onClick={() => setIsReplying(false)} className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Cancel</button>
                      <button onClick={handleSendReply} className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-[10px] uppercase tracking-widest font-bold rounded hover:bg-gold-500 hover:text-white transition-all">Send Reply</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsReplying(true)}
                    className="w-full py-5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:border-gold-500 hover:gold-text transition-all flex items-center justify-center space-x-3"
                  >
                    <span>Reply to {selectedNotification.sender_name?.split(' ')[0] || 'Sender'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                    <Mail size={32} />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400">Select a message to read details</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdminNotifications
