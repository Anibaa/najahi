export type Category = "primary" | "secondary" | "university"
export type Level = "primary" | "secondary" | "university"
export type Language = "ar" | "fr" | "en"

export type BookStatus = "En stock" | "Hors stock" | "Préparation" | "Livraison" | "Livré"
export type OrderStatus = "Préparation" | "Livraison" | "Livré"

export interface Book {
  id: string
  title: string
  author: string
  category: Category
  level: Level
  language: Language
  price: number
  image: string
  images: string[] // Multiple images for gallery
  description: string
  rating: number
  reviews: number
  status: BookStatus
  specifications?: Record<string, string>
  descriptionImage?: string // Added descriptive image
  createdAt?: string
}

export interface SliderItem {
  id: string
  title: string
  subtitle: string
  image: string
  cta: string
  link: string
}

export interface Slider {
  id: string
  title: string
  subtitle: string
  imageWeb: string
  imageMobile: string
  cta: string
  link: string
  order: number
}

export interface Partner {
  id: string
  name: string
  email: string
  phone: string
  bookTitle: string
  category: Category
  level: Level
  language: Language
  description: string
  createdAt: Date
}

export interface Order {
  id: string
  bookIds: string[] // Changed to support multiple books
  quantities: number[] // Parallel quantities array
  totalPrice: number
  customerName: string
  customerEmail: string
  customerPhone: string // Added phone
  address: string // Added address
  paymentMethod: "Cash" | "Card" // Added payment method
  status: OrderStatus // Added status
  createdAt: Date
}

export interface CartItem {
  book: Book
  quantity: number
}

export interface CheckoutData {
  name: string
  email: string
  phone: string
  address: string
  paymentMethod: "Cash" | "Card"
}

export interface AdminUser {
  id: string
  username: string
  password: string // In real app, this would be hashed
}
