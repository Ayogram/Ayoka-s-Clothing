"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react"

const AiSupport = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: "bot", content: "Welcome to Ayoka's Clothing. I am your personal style assistant. How may I assist you with your selection or order today?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // AI Response Logic
    setTimeout(() => {
      let botResponse = "I'm sorry, I couldn't quite understand that. Would you like to speak with a human representative?"
      
      const query = input.toLowerCase()
      if (query.includes("status") || query.includes("track")) {
        botResponse = "You can track your order in real-time on our 'Track Selection' page using your unique Tracking ID. Need help finding it?"
      } else if (query.includes("payment") || query.includes("pay")) {
        botResponse = "We currently accept Direct Bank Transfers for all luxury selections. Details are provided during the checkout process. Payment confirmation usually takes under 5 minutes."
      } else if (query.includes("delivery") || query.includes("time") || query.includes("days")) {
        botResponse = "Our pieces are crafted with care. Standard delivery takes 3-7 business days depending on the complexity of the garment. You'll see the exact estimate on your order confirmation."
      } else if (query.includes("hi") || query.includes("hello")) {
        botResponse = "Hello! I am here to help you navigate our collection. Do you have questions about a specific piece or an existing order?"
      }

      setMessages((prev) => [...prev, { role: "bot", content: botResponse }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-black shadow-2xl shadow-black/20 border border-gray-100 dark:border-zinc-900 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">Ayoka Assistant</h4>
                  <p className="text-[8px] uppercase tracking-tighter text-gold-500">AI Concierge • Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-gold-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 hide-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 text-xs leading-relaxed ${
                    msg.role === 'user' 
                    ? "bg-gold-500 text-white rounded-l-2xl rounded-tr-2xl shadow-md border-r-4 border-gold-600" 
                    : "bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 rounded-r-2xl rounded-tl-2xl border border-gray-100 dark:border-zinc-800"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-r-2xl rounded-tl-2xl border border-gray-100 dark:border-zinc-800">
                    <Loader2 className="animate-spin text-gold-500" size={14} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-zinc-900 bg-white dark:bg-black">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inquire about style or order..."
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-gold-500 outline-none py-3 pl-4 pr-12 text-xs transition-all uppercase tracking-widest rounded-full"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full hover:gold-bg hover:text-white transition-all">
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center hover:gold-bg hover:text-white transition-all group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:animate-bounce" />}
      </motion.button>
    </div>
  )
}

export default AiSupport
