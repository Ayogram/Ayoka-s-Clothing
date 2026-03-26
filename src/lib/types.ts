export interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
  sizes: string[]
  images: string[]
  mainImage: string
  availability: "In Stock" | "Out of Stock" | "Pre-order"
  deliveryDays: number
  videoUrl?: string
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic Silk Shirt",
    price: 45000,
    description: "Pure mulberry silk shirt with a refined sheen. Perfect for evening elegance.",
    category: "Shirts",
    sizes: ["S", "M", "L", "XL"],
    mainImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop"],
    availability: "In Stock",
    deliveryDays: 3,
  },
  {
    id: "2",
    name: "Golden Embroidery Agbada",
    price: 125000,
    description: "Hand-embroidered traditional Agbada with premium wool fabric and gold thread detailing.",
    category: "Traditional",
    sizes: ["M", "L", "XL"],
    mainImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=1000&auto=format&fit=crop",
    images: [],
    availability: "Pre-order",
    deliveryDays: 7,
  },
  {
    id: "3",
    name: "Linen Summer Trousers",
    price: 32000,
    description: "Breathable Italian linen trousers in a contemporary slim cut.",
    category: "Trousers",
    sizes: ["S", "M", "L", "XL"],
    mainImage: "https://images.unsplash.com/photo-1594932224495-99839ec9dca0?q=80&w=1000&auto=format&fit=crop",
    images: [],
    availability: "In Stock",
    deliveryDays: 2,
  },
  {
    id: "4",
    name: "Velvet Evening Blazer",
    price: 85000,
    description: "Deep emerald velvet blazer with silk lapels and custom gold buttons.",
    category: "Outerwear",
    sizes: ["S", "M", "L"],
    mainImage: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
    images: [],
    availability: "In Stock",
    deliveryDays: 4,
  },
]
