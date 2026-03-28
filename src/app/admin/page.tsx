"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  LogOut,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Truck,
  Phone,
  User as UserIcon,
  CheckCircle2
} from "lucide-react"
import { MOCK_PRODUCTS } from "@/lib/types"
import { supabase } from "@/lib/supabase"

const AdminSidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Catalog", icon: ShoppingBag },
    { id: "orders", label: "Orders", icon: Package },
    { id: "users", label: "Customers", icon: Users },
    { id: "media", label: "Social Hub", icon: ImageIcon },
    { id: "settings", label: "Store Settings", icon: Settings },
  ]

  return (
    <div className="w-64 bg-black text-white h-screen fixed left-0 top-0 hidden lg:flex flex-col border-r border-zinc-800">
      <div className="p-10 border-b border-zinc-900">
        <Link href="/" className="flex flex-col items-center group">
          <span className="text-2xl font-serif font-bold tracking-[0.3em] gold-text group-hover:scale-105 transition-transform">Ayoka</span>
          <span className="text-[9px] tracking-[0.4em] mt-1 uppercase text-zinc-600 font-bold group-hover:text-zinc-400 transition-colors underline decoration-gold-500/30 underline-offset-4">Studio Panel</span>
        </Link>
      </div>

      <nav className="flex-grow p-6 mt-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-4 px-5 py-4 transition-all duration-500 group relative overflow-hidden ${
              activeTab === item.id 
              ? "text-white" 
              : "text-zinc-500 hover:text-white"
            }`}
          >
            {activeTab === item.id && (
              <motion.div layoutId="activeNav" className="absolute inset-0 bg-gold-500" />
            )}
            <item.icon size={18} strokeWidth={1.5} className="relative z-10" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-red-500 transition-colors">
          <LogOut size={18} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Log Out</span>
        </button>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, trend, icon: Icon }: any) => (
  <div className="luxury-card p-8">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-zinc-50 dark:bg-black border border-zinc-100 dark:border-zinc-900 shadow-sm">
        <Icon size={24} className="gold-text" strokeWidth={1} />
      </div>
      <span className={`text-[10px] font-bold tracking-widest ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend}
      </span>
    </div>
    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2 font-bold">{label}</p>
    <h3 className="text-3xl font-serif font-bold italic tracking-tight">{value}</h3>
  </div>
)

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Real Data State
  const [orders, setOrders] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState("All Orders")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [logisticsData, setLogisticsData] = useState({ driverName: "", driverNumber: "" })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
    }
  }

  const handleUpdateLogistics = async () => {
    if (!selectedOrder) return
    const { error } = await supabase
      .from('orders')
      .update({ 
        driver_name: logisticsData.driverName, 
        driver_number: logisticsData.driverNumber 
      })
      .eq('id', selectedOrder.id)
    
    if (!error) {
      setOrders(orders.map(o => o.id === selectedOrder.id ? { 
        ...o, 
        driver_name: logisticsData.driverName, 
        driver_number: logisticsData.driverNumber 
      } : o))
      setIsUpdateModalOpen(false)
      alert("Logistics updated successfully!")
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black lg:pl-64">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Header */}
      <header className="h-20 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900 flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="space-y-1">
            <h5 className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold opacity-80">Management</h5>
            <h2 className="text-xl font-serif font-bold italic">
              {activeTab === 'dashboard' ? 'Business Overview' : activeTab.replace('-', ' ')}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="relative hidden xl:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Search catalog or orders..." 
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 py-3 pl-12 pr-6 text-[10px] uppercase tracking-[0.2em] font-bold outline-none focus:border-gold-500 w-80 transition-all"
            />
          </div>
          <button className="relative p-2 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
            <Bell size={20} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full border-2 border-white dark:border-black" />
          </button>
          <div className="w-8 h-8 bg-zinc-800 rounded-full" />
        </div>
      </header>

      {/* Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Revenue" value="₦ 4,821,000" trend="+12.5%" icon={DollarSign} />
              <StatCard label="New Orders" value="142" trend="+8.2%" icon={ShoppingCart} />
              <StatCard label="Active Clients" value="892" trend="+15.3%" icon={Users} />
              <StatCard label="Conversion" value="3.4%" trend="-1.2%" icon={TrendingUp} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Recent Selections</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[10px] uppercase tracking-widest gold-text hover:underline">View All</button>
                </div>
                {/* ... (Existing table code) ... */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-100 dark:border-zinc-900">
                      <tr>
                        <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Selection ID</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Customer</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Status</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-zinc-900">
                      {[
                        { id: "AYK-092", user: "Adeola T.", status: "Processing", price: "₦ 45,000" },
                        { id: "AYK-095", user: "Sarah J.", status: "Shipped", price: "₦ 128,000" },
                        { id: "AYK-101", user: "Michael B.", status: "Delivered", price: "₦ 67,500" },
                        { id: "AYK-104", user: "Chidi O.", status: "Pending", price: "₦ 92,000" },
                      ].map((order) => (
                        <tr key={order.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-950 transition-colors">
                          <td className="py-4 text-xs font-bold tracking-tighter">{order.id}</td>
                          <td className="py-4 text-xs">{order.user}</td>
                          <td className="py-4">
                            <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 ${
                              order.status === 'Processing' ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' :
                              order.status === 'Shipped' ? 'text-gold-500 bg-gold-50 dark:bg-gold-500/10' :
                              order.status === 'Delivered' ? 'text-green-500 bg-green-50 dark:bg-green-500/10' :
                              'text-zinc-500 bg-zinc-50 dark:bg-zinc-500/10'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 text-xs font-bold text-right">{order.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-black text-white p-8">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => setActiveTab('products')} className="w-full bg-zinc-900 border border-zinc-800 py-3 text-[10px] uppercase tracking-widest font-bold hover:gold-bg transition-colors">Manage Catalog</button>
                    <button onClick={() => setActiveTab('orders')} className="w-full bg-zinc-900 border border-zinc-800 py-3 text-[10px] uppercase tracking-widest font-bold hover:gold-bg transition-colors">Process Orders</button>
                    <button className="w-full bg-zinc-900 border border-zinc-800 py-3 text-[10px] uppercase tracking-widest font-bold hover:gold-bg transition-colors">Broadcast News</button>
                  </div>
                </div>

                <div className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 p-8 shadow-sm">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold mb-6">Inventory Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-500">Low Stock: Silk Shirt</span>
                      <span className="text-[10px] font-bold">2 Left</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-yellow-500">Out of Stock: Gold Agbada</span>
                      <span className="text-[10px] font-bold">Waitlist: 12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
              <div className="space-y-1">
                <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Catalog</h5>
                <h2 className="text-3xl font-serif font-bold italic">Product Management</h2>
              </div>
              <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 uppercase tracking-widest text-[10px] font-bold hover:gold-bg hover:text-white transition-all">
                Add New Piece
              </button>
            </div>

            <div className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_PRODUCTS.map((product) => (
                  <div key={product.id} className="group relative flex flex-col space-y-4 border border-gray-50 dark:border-zinc-900 p-4 hover:border-gold-500/30 transition-all">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-zinc-900">
                      <img src={product.main_image} alt={product.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute top-2 right-2 flex space-x-1">
                         <span className="bg-white/90 dark:bg-black/90 px-2 py-1 text-[8px] font-bold uppercase tracking-widest">{product.category}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-serif font-bold group-hover:gold-text">{product.name}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1">₦ {product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 bg-gray-50 dark:bg-zinc-900 hover:gold-text transition-colors"><Settings size={14} /></button>
                        <button className="p-2 bg-gray-50 dark:bg-zinc-900 hover:text-red-500 transition-colors"><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1 mb-8">
              <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Fulfillment</h5>
              <h2 className="text-3xl font-serif font-bold italic">Order Processing</h2>
            </div>

            <div className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-gray-50 dark:border-zinc-900">
                  <div className="flex flex-wrap gap-4">
                    {["All Orders", "Pending", "Processing", "Shipped", "Delivered"].map((status) => (
                      <button 
                        key={status} 
                        onClick={() => setFilterStatus(status)}
                        className={`px-6 py-2 border text-[9px] uppercase tracking-widest font-bold transition-all ${
                          filterStatus === status ? "bg-black dark:bg-white text-white dark:text-black" : "border-gray-100 dark:border-zinc-800 text-zinc-500 hover:gold-text"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-900">
                     <tr>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Order ID</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Customer</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Method</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Status</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Logistics</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-zinc-900">
                      {orders.filter(o => filterStatus === 'All Orders' || o.status.includes(filterStatus.toLowerCase())).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-950 transition-colors">
                          <td className="px-8 py-6 text-xs font-bold">{order.transaction_id}</td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{order.customer_name || 'Guest'}</span>
                              <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">{order.customer_email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[10px] uppercase font-bold tracking-tighter">{order.delivery_method}</td>
                          <td className="px-8 py-6">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="bg-transparent text-[9px] uppercase tracking-widest font-bold px-2 py-1 border border-zinc-200 dark:border-zinc-800 outline-none"
                            >
                              <option value="payment_pending">Pending</option>
                              <option value="payment_sent">Payment Sent</option>
                              <option value="payment_received">Payment Received</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-8 py-6">
                            {order.status === 'shipped' ? (
                              <div className="flex flex-col space-y-1">
                                <span className="text-[9px] font-bold uppercase">{order.driver_name || 'No Driver'}</span>
                                <span className="text-[9px] text-zinc-400">{order.driver_number || 'No Number'}</span>
                              </div>
                            ) : (
                              <span className="text-[9px] text-zinc-400 italic">N/A</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button 
                               onClick={() => {
                                 setSelectedOrder(order)
                                 setIsUpdateModalOpen(true)
                               }}
                               className="text-[10px] uppercase tracking-widest gold-text font-bold hover:underline"
                             >
                               Update Logistics
                             </button>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1 mb-8">
              <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Community</h5>
              <h2 className="text-3xl font-serif font-bold italic">Client Management</h2>
            </div>
            
            <div className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-900">
                     <tr>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Client Name</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Email</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Joined</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Orders</th>
                       <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-zinc-900">
                      {[
                        { name: "John Doe", email: "john@example.com", date: "Jan 2026", orders: 3 },
                        { name: "Sarah Smith", email: "sarah@gmail.com", date: "Feb 2026", orders: 1 },
                        { name: "Michael Ade", email: "mike@yahoo.com", date: "Mar 2026", orders: 5 },
                      ].map((user) => (
                        <tr key={user.email} className="hover:bg-gray-50 dark:hover:bg-zinc-950 transition-colors">
                          <td className="px-8 py-6 text-xs font-bold uppercase tracking-widest">{user.name}</td>
                          <td className="px-8 py-6 text-xs text-gray-500">{user.email}</td>
                          <td className="px-8 py-6 text-xs">{user.date}</td>
                          <td className="px-8 py-6 text-xs font-bold">{user.orders}</td>
                          <td className="px-8 py-6 text-right space-x-4">
                             <button className="text-[9px] uppercase tracking-widest gold-text font-bold hover:underline">View Profile</button>
                             <button className="text-[9px] uppercase tracking-widest text-red-500 font-bold hover:underline">Suspend</button>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
              <div className="space-y-1">
                <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Social Content</h5>
                <h2 className="text-3xl font-serif font-bold italic">Media Hub</h2>
              </div>
              <button className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 uppercase tracking-widest text-[10px] font-bold hover:gold-bg hover:text-white transition-all">
                Upload Content
              </button>
            </div>

            <div className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 p-8 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="group relative aspect-square bg-gray-50 dark:bg-zinc-900 overflow-hidden border border-gray-100 dark:border-zinc-800">
                    <img src={`https://images.unsplash.com/photo-15${i}5886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop`} alt="Social Content" className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                       <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:gold-bg transition-colors"><Settings size={14} /></button>
                       <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-1 mb-8">
              <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Configuration</h5>
              <h2 className="text-3xl font-serif font-bold italic">Store Settings</h2>
            </div>
            
            <div className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 p-8 shadow-sm max-w-2xl">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Store Name</label>
                  <input type="text" defaultValue="Ayoka Clothing" className="w-full bg-transparent border-b border-gray-100 dark:border-zinc-800 py-3 text-sm outline-none focus:border-gold-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Contact Email</label>
                  <input type="email" defaultValue="concierge@Ayoka.com" className="w-full bg-transparent border-b border-gray-100 dark:border-zinc-800 py-3 text-sm outline-none focus:border-gold-500" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Base Currency</label>
                    <select className="w-full bg-transparent border-b border-gray-100 dark:border-zinc-800 py-3 text-sm outline-none">
                      <option>NGN (₦)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Tax rate (%)</label>
                    <input type="number" defaultValue="7.5" className="w-full bg-transparent border-b border-gray-100 dark:border-zinc-800 py-3 text-sm outline-none focus:border-gold-500" />
                  </div>
                </div>
                <button className="bg-black dark:bg-white text-white dark:text-black w-full py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:gold-bg hover:text-white transition-all shadow-xl shadow-black/10">
                  Save Configurations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Logistics Update Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpdateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-950 p-10 border border-zinc-100 dark:border-zinc-900 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase tracking-[0.4em] gold-text font-bold">Logistics</h5>
                <h3 className="text-2xl font-serif font-bold italic text-black dark:text-white">Update Personnel</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Assign driver for Selection {selectedOrder?.transaction_id}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Driver Name</label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      value={logisticsData.driverName}
                      onChange={(e) => setLogisticsData({...logisticsData, driverName: e.target.value})}
                      placeholder="e.g. John Driver" 
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border-none py-4 pl-12 pr-4 text-xs outline-none focus:ring-1 ring-gold-500/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Contact Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="tel" 
                      value={logisticsData.driverNumber}
                      onChange={(e) => setLogisticsData({...logisticsData, driverNumber: e.target.value})}
                      placeholder="+234..." 
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border-none py-4 pl-12 pr-4 text-xs outline-none focus:ring-1 ring-gold-500/30"
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col space-y-4">
                  <button 
                    onClick={handleUpdateLogistics}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:gold-bg hover:text-white transition-all flex items-center justify-center space-x-3"
                  >
                    <span>Confirm Logistics</span>
                    <CheckCircle2 size={16} />
                  </button>
                  <button 
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="w-full py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
