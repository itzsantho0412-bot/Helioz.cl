import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from './supabase'
import type { Product } from './types'

const LOCAL_KEY = 'helioz.products.v1'
const SEED_FLAG = 'helioz.seeded.v1'

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-001',
    name: 'Heavyweight Tee — Off-white',
    price: 1290,
    description: 'A clean, 240gsm cotton tee in a quiet off-white. Relaxed through the body, soft hand-feel, made to wear often.',
    category: 'Ready-made',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Off-white', 'Charcoal', 'Beige'],
    stock: 18,
    image_urls: [],
    created_at: new Date('2024-10-01').toISOString(),
    updated_at: new Date('2024-10-01').toISOString(),
  },
  {
    id: 'demo-002',
    name: 'Essential Crew — Charcoal',
    price: 990,
    description: 'An everyday crew in deep charcoal. Pre-shrunk cotton, a slightly dropped shoulder, finished with a clean ribbed collar.',
    category: 'Essentials',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Off-white'],
    stock: 24,
    image_urls: [],
    created_at: new Date('2024-10-04').toISOString(),
    updated_at: new Date('2024-10-04').toISOString(),
  },
  {
    id: 'demo-003',
    name: 'Custom Crew — Bulk Print',
    price: 1490,
    description: 'Made to be printed. Heavyweight cotton, full-front print area, custom colours and design — built for teams, weddings and small labels.',
    category: 'Custom Print',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Off-white', 'Beige', 'Charcoal'],
    stock: 60,
    image_urls: [],
    created_at: new Date('2024-10-08').toISOString(),
    updated_at: new Date('2024-10-08').toISOString(),
  },
  {
    id: 'demo-004',
    name: 'Sun-print Tee — Beige',
    price: 1390,
    description: 'A small limited run in warm beige with a soft, hand-printed sun mark. Made in considered quantities.',
    category: 'Custom Print',
    sizes: ['M', 'L'],
    colors: ['Beige', 'Off-white'],
    stock: 6,
    image_urls: [],
    created_at: new Date('2024-10-12').toISOString(),
    updated_at: new Date('2024-10-12').toISOString(),
  },
]

function readLocal(): Product[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as Product[]) : []
  } catch {
    return []
  }
}

function writeLocal(list: Product[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}

function seedIfEmpty() {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(SEED_FLAG)) return
  const existing = readLocal()
  if (existing.length === 0) {
    writeLocal(DEMO_PRODUCTS)
  }
  window.localStorage.setItem(SEED_FLAG, '1')
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: e } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        if (e) throw e
        setProducts((data || []) as Product[])
      } else {
        seedIfEmpty()
        setProducts(readLocal())
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load products'
      setError(msg)
      setProducts(readLocal())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { products, loading, error, refresh, setProducts }
}

export async function uploadProductImage(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${newId()}.${ext}`
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }
  // Local fallback: store as data URL.
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

export async function createProduct(input: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data as Product
  }
  const created: Product = {
    ...input,
    id: newId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const list = readLocal()
  list.unshift(created)
  writeLocal(list)
  return created
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Product
  }
  const list = readLocal()
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Product not found')
  const updated: Product = { ...list[idx], ...patch, updated_at: new Date().toISOString() }
  list[idx] = updated
  writeLocal(list)
  return updated
}

export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return
  }
  const list = readLocal().filter((p) => p.id !== id)
  writeLocal(list)
}
