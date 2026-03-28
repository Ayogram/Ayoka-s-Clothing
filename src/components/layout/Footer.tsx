import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

// Custom SVG Icons for social media to avoid lucide-react version issues
const Facebook = ({ size = 20, strokeWidth = 1.5 }: { size?: number, strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Instagram = ({ size = 20, strokeWidth = 1.5 }: { size?: number, strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-widest gold-text">Ayoka</span>
              <span className="text-[10px] tracking-[0.2em] -mt-1 uppercase text-gray-400">Clothing</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light tracking-wide">
              Experience the pinnacle of luxury fashion. Ayoka — Crafted To Bring You Joy.
            </p>
            <div className="flex space-x-4">
              <a href="https://web.facebook.com/profile.php?id=61587011774458" target="_blank" rel="noopener noreferrer" className="hover:gold-text transition-colors">
                <Facebook size={20} strokeWidth={1.5} />
              </a>
              <a href="https://www.instagram.com/Ayoka.Clothing?igsh=N2Q4dXJrNWIybndk" target="_blank" rel="noopener noreferrer" className="hover:gold-text transition-colors">
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a href="https://www.tiktok.com/@ayokaa.clothings" target="_blank" rel="noopener noreferrer" className="hover:gold-text transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] gold-text mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/media" className="hover:text-white transition-colors">Media Feed</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] gold-text mb-6">Customer Care</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/help" className="hover:text-white transition-colors">Help & Support</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-sm uppercase tracking-[0.2em] gold-text mb-6">Connect</h4>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-start space-x-3">
                <Mail size={18} className="gold-text shrink-0" />
                <a href="mailto:dammie2k@gmail.com" className="hover:text-white transition-colors">dammie2k@gmail.com</a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={18} className="gold-text shrink-0" />
                <a href="tel:+2347039426216" className="hover:text-white transition-colors">+234 703 942 6216</a>
              </div>
            </div>
            <div className="mt-8">
              <h5 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subscribe for updates</h5>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-transparent border-b border-gray-800 focus:border-gold-500 outline-none text-sm py-2 w-full transition-colors"
                />
                <button className="gold-text text-sm uppercase tracking-widest px-4 border-b border-gray-800">Join</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-gray-600">
          <p>© {currentYear} Ayoka. Crafted To Bring You Joy.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
