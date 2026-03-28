"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { User, Shield, ShieldAlert, Search, MoreVertical } from "lucide-react"

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      // 1. Fetch Registered Profiles
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      // 2. Fetch ALL Orders for stat aggregation
      const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('customer_id, contact_number, total_amount, created_at')

      if (pError || oError) throw pError || oError

      const profileList = profiles || []
      const customerStats: Record<string, { total: number, count: number }> = {}
      const guestStats: Record<string, { total: number, count: number, created_at: string }> = {}

      const ordersList = (orders || []) as any[]

      ordersList.forEach(o => {
        const amount = Number(o.total_amount || 0)
        if (o.customer_id) {
          if (!customerStats[o.customer_id]) customerStats[o.customer_id] = { total: 0, count: 0 }
          customerStats[o.customer_id].total += amount
          customerStats[o.customer_id].count += 1
        } else if (o.contact_number) {
          if (!guestStats[o.contact_number]) guestStats[o.contact_number] = { total: 0, count: 0, created_at: o.created_at }
          guestStats[o.contact_number].total += amount
          guestStats[o.contact_number].count += 1
        }
      })

      const combined = [
        ...profileList.map(p => ({ 
          ...p, 
          total_spent: customerStats[p.id]?.total || 0, 
          order_count: customerStats[p.id]?.count || 0 
        })),
        ...Object.entries(guestStats).map(([phone, stats]) => ({
          id: `guest_${phone}`,
          full_name: `GUEST: ${phone}`,
          email: 'GUEST / OFFLINE',
          status: 'guest',
          created_at: stats.created_at,
          total_spent: stats.total,
          order_count: stats.count
        }))
      ]
      
      setCustomers(combined)
    } catch (e: any) {
      console.error("Fetch Customers Error:", e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (!error) {
      alert(`Customer status updated to ${newStatus}`)
      fetchCustomers()
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to remove this client? This will delete their profile data permanently.")) return
    
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (!error) {
      alert("Customer record deleted successfully.")
      fetchCustomers()
    } else {
      alert(`Error deleting customer: ${error.message}`)
    }
  }

  const filteredCustomers = customers.filter(c => 
    (c.full_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (c.email?.toLowerCase() || '').includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif italic">Customer Relations</h2>
        <div className="flex space-x-4">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Total Registered</p>
            <p className="text-sm font-bold tracking-widest">{customers.length}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <input 
          type="text" 
          placeholder="SEARCH BY NAME OR EMAIL" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 pl-12 pr-4 py-3 text-[10px] uppercase tracking-widest outline-none focus:border-gold-500 transition-colors"
        />
      </div>

      <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900">
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Client</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Joined</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Status</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan={4} className="p-12 text-center text-zinc-500">Loading customers...</td></tr>
            ) : filteredCustomers.length === 0 ? (
               <tr><td colSpan={4} className="p-12 text-center text-zinc-500">No customers found.</td></tr>
            ) : filteredCustomers.map((c) => (
              <tr key={c.id} className="border-b border-zinc-50 dark:border-zinc-900 last:border-0 group hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold tracking-widest uppercase">{c.full_name || 'Anonymous User'}</span>
                    <span className="text-[10px] text-zinc-500 lowercase tracking-wider">{c.email}</span>
                  </div>
                </td>
                <td className="p-6 text-[10px] uppercase tracking-widest text-zinc-500">
                  {new Date(c.created_at || Date.now()).toLocaleDateString()}
                </td>
                <td className="p-6">
                   <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                     c.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                     c.status === 'suspended' ? 'bg-gold-500/10 text-gold-500' : 'bg-red-500/10 text-red-500'
                   }`}>
                     {c.status}
                   </span>
                </td>
                 <td className="p-6 text-right">
                   <div className="flex items-center justify-end space-x-6">
                     <button 
                       onClick={() => alert(`CUSTOMER PROFILE OVERVIEW\n------------------\nName: ${c.full_name}\nEmail: ${c.email}\nOrders: ${c.order_count || 'N/A'}\nLifetime Value: ₦${c.total_spent?.toLocaleString() || 0}\nJoined: ${new Date(c.created_at).toLocaleDateString()}`)}
                       className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                     >
                       Perf. Modal
                     </button>
                     {c.status !== 'guest' && (
                       c.status === 'active' ? (
                          <div className="flex space-x-4">
                           <button 
                             onClick={() => handleStatusChange(c.id, 'suspended')} 
                             className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 hover:text-gold-500 transition-colors flex items-center space-x-2"
                           >
                             <Shield size={14} />
                             <span className="hidden md:inline">Suspend</span>
                           </button>
                          </div>
                       ) : (
                          <button onClick={() => handleStatusChange(c.id, 'active')} className="text-[9px] uppercase tracking-widest font-bold gold-text flex items-center space-x-2">
                            <ShieldAlert size={14} />
                            <span>Unsuspend</span>
                          </button>
                       )
                     )}
                     <button 
                       onClick={() => handleDeleteCustomer(c.id)}
                       className="text-[9px] uppercase tracking-widest font-bold text-red-100 hover:text-red-500 transition-colors"
                     >
                       Delete
                     </button>
                   </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
