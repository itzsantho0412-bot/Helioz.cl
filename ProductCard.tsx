import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '../lib/types'
import PlaceholderImage from './PlaceholderImage'

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const outOfStock = product.stock <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block focus:outline-none"
        aria-label={`View ${product.name}`}
      >
        <div className="relative overflow-hidden bg-[var(--color-beige)]">
          <div className="transition-transform duration-700 ease-out group-hover:scale-[1.02]">
            <PlaceholderImage
              src={product.image_urls?.[0]}
              alt={product.name}
              aspect="portrait"
              className="transition-opacity duration-500 group-hover:opacity-95"
            />
          </div>
          {outOfStock && (
            <div className="absolute top-3 left-3 bg-[var(--color-offwhite)] px-3 py-1 text-[10px] uppercase tracking-widest text-[var(--color-muted)]">
              Sold out
            </div>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg md:text-xl text-[var(--color-charcoal)] truncate">
            {product.name}
          </h3>
          <p className="font-sans text-sm text-[var(--color-charcoal)] tabular-nums whitespace-nowrap">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-muted)]">
          {product.category}
        </p>
      </Link>
    </motion.div>
  )
}
