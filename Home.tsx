import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useProducts } from '../lib/useProducts'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { products, loading } = useProducts()
  const featured = products.slice(0, 6)

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 pt-16 md:pt-28 pb-20 md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]"
        >
          Ready-made · Custom-printed
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.02] tracking-tight text-[var(--color-charcoal)] max-w-5xl"
        >
          Quietly considered tees,
          <br className="hidden sm:block" />
          <span className="font-display-italic">made for everyday.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-[var(--color-muted)]"
        >
          A small, intentional collection of premium T-shirts. Plain essentials and custom prints,
          made in considered cuts and quiet colours.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-3 bg-[var(--color-charcoal)] px-7 py-4 text-xs uppercase tracking-[0.22em] text-[var(--color-offwhite)] hover:opacity-90"
          >
            Shop Now
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link
            to="/custom"
            className="inline-flex items-center gap-2 border border-[var(--color-charcoal)]/80 px-7 py-4 text-xs uppercase tracking-[0.22em] text-[var(--color-charcoal)] hover:bg-[var(--color-charcoal)] hover:text-[var(--color-offwhite)]"
          >
            Custom Orders
          </Link>
        </motion.div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 pb-16 md:pb-24">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <h2 className="font-display text-3xl md:text-4xl text-[var(--color-charcoal)]">
            <span className="font-display-italic">New</span> this season
          </h2>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <GridSkeleton />
        ) : featured.length === 0 ? (
          <div className="border border-dashed border-[var(--color-beige)] py-16 text-center">
            <p className="text-sm text-[var(--color-muted)]">
              The collection is being prepared. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Quiet note */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28 text-center">
        <div className="divider mb-12" />
        <p className="font-display-italic text-2xl md:text-3xl text-[var(--color-charcoal)] max-w-2xl mx-auto leading-relaxed">
          &ldquo;We make fewer things, and we make them well.&rdquo;
        </p>
        <div className="divider mt-12" />
      </section>
    </>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[5/6] w-full bg-[var(--color-beige)]/60 animate-pulse" />
          <div className="mt-4 h-4 w-2/3 bg-[var(--color-beige)]/60 animate-pulse" />
          <div className="mt-2 h-3 w-1/3 bg-[var(--color-beige)]/60 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
