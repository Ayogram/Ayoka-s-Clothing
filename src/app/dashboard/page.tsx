"use client"

import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { motion, AnimatePresence } from "framer-motion"
import { Package, User, MapPin, Settings, LogOut, ChevronRight, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const MOCK_ORDERS = [
  { id: "AYK-8821", date: "Mar 24, 2026", total: 45000, status: "Pending Confirmation", items: 1 },
  { id: "AYK-095", date: "Mar 20, 2026", total: 128000, status: "Shipped", items: 2 },
  { id: "AYK-001", date: "Feb 15, 2026", total: 67500, status: "Delivered", items: 1 },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("orders")

  return (
    <main className="min-h-screen flex flex-col pt-24">
      <Navbar />

      <section className="py-12 md:py-24 bg-gray-50 dark:bg-black flex-grow">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar */}
            <aside className="w-full lg:w-64 space-y-8">
              <div className="bg-white dark:bg-black p-8 border border-gray-100 dark:border-zinc-900 shadow-sm text-center">
                <div className="w-20 h-20 bg-gold-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-serif">
                  JD
                </div>
                <h3 className="text-sm font-serif font-bold uppercase tracking-widest">John Doe</h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Gold Tier Member</p>
              </div>

              <div className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 shadow-sm overflow-hidden">
                {[
                  { id: "orders", label: "My Selections", icon: Package },
                  { id: "profile", label: "Account Info", icon: User },
                  { id: "address", label: "Shipping Hub", icon: MapPin },
                  { id: "settings", label: "Preferences", icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                      activeTab === item.id 
                      ? "bg-black text-white" 
                      : "hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-500"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={16} strokeWidth={1.5} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={14} className={activeTab === item.id ? "opacity-100" : "opacity-0"} />
                  </button>
                ))}
                <button className="w-full flex items-center space-x-3 px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border-t border-gray-50 dark:border-zinc-900">
                  <LogOut size={16} strokeWidth={1.5} />
                  <span>Logout</span>
                </button>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-between items-end mb-4">
                      <h2 className="text-2xl font-serif font-bold italic">My Selections</h2>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">{MOCK_ORDERS.length} Orders</p>
                    </div>

                    <div className="space-y-6">
                      {MOCK_ORDERS.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-black border border-gray-100 dark:border-zinc-900 p-8 shadow-sm group hover:border-gold-500/30 transition-all">
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Order ID: {order.id}</p>
                              <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Ordered on {order.date}</h4>
                              <div className="flex items-center space-x-4 mt-4">
                                <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 flex items-center space-x-1 ${
                                  order.status === 'Delivered' ? 'text-green-500 bg-green-50 dark:bg-green-500/10' :
                                  order.status === 'Shipped' ? 'text-gold-500 bg-gold-50 dark:bg-gold-500/10' :
                                  'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                }`}>
                                  {order.status === 'Delivered' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                  <span>{order.status}</span>
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{order.items} Piece{order.items !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <div className="text-left md:text-right space-y-4">
                              <p className="text-xl font-bold tracking-tighter">₦ {order.total.toLocaleString()}</p>
                              <Link 
                                href={`/track?id=${order.id}`}
                                className="inline-block border border-black dark:border-white px-6 py-2 uppercase tracking-widest text-[9px] font-bold hover:gold-bg hover:border-gold-500 hover:text-white transition-all"
                              >
                                View Track Status
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab !== 'orders' && (
                  <motion.div
                    key="others"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4"
                  >
                    <div className="p-6 bg-gray-100 dark:bg-zinc-900 rounded-full">
                       <Settings className="text-gray-400" size={48} strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-serif italic text-gray-500 uppercase tracking-widest">Section Under Review</h3>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Syncing with our atelier systems...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
