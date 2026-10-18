export type ProductCategory = 'Ready-made' | 'Custom Print' | 'Essentials'

export interface Product {
  id: string
  name: string
  price: number // in INR (whole rupees)
  description: string
  category: ProductCategory
  sizes: string[]
  colors: string[]
  stock: number
  image_urls: string[]
  created_at?: string
  updated_at?: string
}

export interface OrderSelection {
  product: Product
  size: string
  color: string
  quantity: number
}

export interface CustomInquiry {
  name: string
  phone: string
  email?: string
  quantity: number
  details: string
}
