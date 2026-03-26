import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/CartContext";
import AiSupport from "@/components/chat/AiSupport";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ayoka's Clothing | Premium Fashion Store",
  description: "Experience luxury fashion with Ayoka's Clothing. Crafted to Bring You Joy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          {children}
          <AiSupport />
        </CartProvider>
      </body>
    </html>
  );
}
