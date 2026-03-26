"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ShoppingCart, User, Menu, X, Search, Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/lib/CartContext"
import { usePathname } from "next/navigation"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { totalItems } = useCart()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    
    // Theme persistence check
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Media", href: "/media" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center">
          <span className="text-2xl font-serif font-bold tracking-widest gold-text">AYOKA</span>
          <span className="text-[10px] tracking-[0.2em] -mt-1 uppercase">Clothings</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-300 relative py-2 ${
                  isActive ? "gold-text" : "text-zinc-500 hover:gold-text"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] gold-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button className="hover:gold-text transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button onClick={toggleTheme} className="hover:gold-text transition-colors">
            {isDarkMode ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>
          <Link href="/login" className="hidden md:flex items-center space-x-1 hover:gold-text transition-colors">
            <User size={20} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-wider">Login</span>
          </Link>
          <Link href="/cart" className="relative hover:gold-text transition-colors">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-gold-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </Link>
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm uppercase tracking-[0.3em] font-bold py-4 border-b border-gray-50 dark:border-zinc-900 flex justify-between items-center ${
                      isActive ? "gold-text" : "text-zinc-500"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full gold-bg" />}
                  </Link>
                )
              })}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-lg uppercase tracking-widest py-2"
              >
                <User size={20} />
                <span>Account</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
