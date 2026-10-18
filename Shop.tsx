import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useProducts } from '../lib/useProducts'
import ProductCard from '../components/ProductCard'
import type { ProductCategory } from '../lib/types'

const CATEGORIES: Array<ProductCategory | 'All'> = ['All', 'Ready-made', 'Custom Print', 'Essentials']

export default function Shop() {
  const { products, loading } = useProducts()
  const [filter, setFilter] = useState<ProductCategory | 'All'>('All')

  const visible = useMemo(() => {
    if (filter === 'All') return products
    return products.filter((p) => p.category === filter)
  }, [products, filter])

  return (
    <section className="mx-auto max-w-6xl px-6 md:px-10 pt-12 md:pt-20 pb-20">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Shop</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl tracking-tight text-[var(--color-charcoal)]">
            The collection
          </h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => {
            const active = filter === c
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] border transition-colors ${
                  active
                    ? 'border-[var(--color-charcoal)] text-[var(--color-charcoal)]'
                    : 'border-[var(--color-beige)] text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]'
                }`}
              >
                {c}
              </button>
            )
          })}
        </nav>
      </motion.header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[5/6] w-full bg-[var(--color-beige)]/60 animate-pulse" />
              <div className="mt-4 h-4 w-2/3 bg-[var(--color-beige)]/60 animate-pulse" />
              <div className="mt-2 h-3 w-1/3 bg-[var(--color-beige)]/60 animate-pulse" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-[var(--color-beige)] py-24 text-center">
          <p className="font-display text-2xl text-[var(--color-charcoal)]">Nothing here yet</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            The owner will add new pieces shortly. Please check back.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
