"use client"

import { useState, useEffect } from "react"
import { User, Shield, ShieldAlert, Search, MoreVertical, Ban, CheckCircle, X } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { getAdminCustomersAction, updateCustomerStatusAction, deleteCustomerAction } from "@/lib/adminCustomersActions"

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setIsLoading(true)
    try {
      // Fetch Profiles and Orders securely as admin
      const { profiles, orders } = await getAdminCustomersAction()

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
        ...profileList.map((p: any) => ({ 
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
    try {
      await updateCustomerStatusAction(id, newStatus)
      alert(`Customer status updated to ${newStatus}`)
      fetchCustomers()
    } catch (error: any) {
      alert(`Error updating customer: ${error.message}`)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to remove this client? This will delete their profile data permanently.")) return
    
    try {
      await deleteCustomerAction(id)
      alert("Customer record deleted successfully.")
      fetchCustomers()
    } catch (error: any) {
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
                  <div className="flex items-center space-x-4">
                    <Avatar src={c.avatar_url} name={c.full_name} size={32} className="hidden sm:flex" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold tracking-widest uppercase">{c.full_name || 'Anonymous User'}</span>
                      <span className="text-[10px] text-zinc-500 lowercase tracking-wider">{c.email}</span>
                    </div>
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
                       onClick={() => setSelectedCustomer(c)}
                       className="text-[9px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                     >
                       Manage
                     </button>
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
      {/* Customer Full Management Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-black w-full max-w-lg p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-2 mb-8">
              <Avatar src={selectedCustomer.avatar_url} name={selectedCustomer.full_name} size={64} className="mb-4 text-xl border-2 border-zinc-100 dark:border-zinc-800" />
              <h3 className="text-2xl font-serif italic mb-1">{selectedCustomer.full_name || 'Anonymous User'}</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">{selectedCustomer.email}</p>
              <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                 selectedCustomer.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                 selectedCustomer.status === 'suspended' ? 'bg-gold-500/10 text-gold-500' : 
                 selectedCustomer.status === 'blocked' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-500/10 text-zinc-500'
               }`}>
                 {selectedCustomer.status}
               </span>
            </div>

            <div className="space-y-4 mb-8 text-[11px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-6">
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span>Joined Date</span>
                <span className="text-black dark:text-white font-bold">{new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span>Total Orders</span>
                <span className="text-black dark:text-white font-bold">{selectedCustomer.order_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Lifetime Value</span>
                <span className="text-black dark:text-white font-bold">₦{selectedCustomer.total_spent?.toLocaleString() || 0}</span>
              </div>
            </div>

            {selectedCustomer.status !== 'guest' && (
              <div className="flex flex-wrap gap-4 justify-center">
                {selectedCustomer.status !== 'blocked' && (
                  <button 
                    onClick={() => { handleStatusChange(selectedCustomer.id, 'blocked'); setSelectedCustomer({...selectedCustomer, status: 'blocked'}) }}
                    className="flex-1 min-w-[120px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors py-3 px-4 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2"
                  >
                    <Ban size={14} /> <span>Block</span>
                  </button>
                )}
                {selectedCustomer.status === 'blocked' && (
                  <button 
                    onClick={() => { handleStatusChange(selectedCustomer.id, 'active'); setSelectedCustomer({...selectedCustomer, status: 'active'}) }}
                    className="flex-1 min-w-[120px] bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors py-3 px-4 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={14} /> <span>Unblock</span>
                  </button>
                )}
                {selectedCustomer.status === 'active' && (
                  <button 
                    onClick={() => { handleStatusChange(selectedCustomer.id, 'suspended'); setSelectedCustomer({...selectedCustomer, status: 'suspended'}) }}
                    className="flex-1 min-w-[120px] bg-gold-500/10 text-gold-500 hover:bg-gold-500 hover:text-white transition-colors py-3 px-4 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2"
                  >
                    <ShieldAlert size={14} /> <span>Suspend</span>
                  </button>
                )}
                {selectedCustomer.status === 'suspended' && (
                  <button 
                    onClick={() => { handleStatusChange(selectedCustomer.id, 'active'); setSelectedCustomer({...selectedCustomer, status: 'active'}) }}
                    className="flex-1 min-w-[120px] bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors py-3 px-4 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={14} /> <span>Unsuspend</span>
                  </button>
                )}
              </div>
            )}
            
            {selectedCustomer.status === 'guest' && (
              <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Actions Limited</p>
                <p className="text-[9px] uppercase tracking-wide text-zinc-400 mt-2">Guest profiles cannot be blocked or suspended</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
