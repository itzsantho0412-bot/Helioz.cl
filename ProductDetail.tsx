import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react'
import { useProducts } from '../lib/useProducts'
import type { OrderSelection } from '../lib/types'
import PlaceholderImage from '../components/PlaceholderImage'
import OrderModal from '../components/OrderModal'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { products, loading } = useProducts()

  const product = useMemo(() => products.find((p) => p.id === id), [products, id])
  const current = product! // narrowed after the not-found early-return below

  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [modalSelection, setModalSelection] = useState<OrderSelection | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    // Reset selection when product changes.
    if (product) {
      setActiveImage(0)
      setSize(product.sizes?.[0] ?? null)
      setColor(product.colors?.[0] ?? null)
      setQty(1)
      setValidationError(null)
    }
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const related = useMemo(() => {
    if (!product) return []
    return products.filter((p) => p.id !== product.id).slice(0, 3)
  }, [products, product])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-24 text-center text-sm text-[var(--color-muted)]">
        Loading…
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-32 text-center">
        <p className="font-display text-4xl text-[var(--color-charcoal)]">Not found</p>
        <p className="mt-3 text-sm text-[var(--color-muted)]">This piece is no longer available.</p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--color-charcoal)] underline underline-offset-4"
        >
          Back to shop
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock <= 0

  function handleBuyNow() {
    if (!current) return
    if (outOfStock) {
      setValidationError('This piece is currently out of stock.')
      return
    }
    if (!size) {
      setValidationError('Please select a size.')
      return
    }
    if (!color) {
      setValidationError('Please select a colour.')
      return
    }
    if (qty < 1) {
      setValidationError('Please choose at least one piece.')
      return
    }
    setValidationError(null)
    setModalSelection({
      product: current,
      size,
      color,
      quantity: Math.min(qty, Math.max(1, current.stock)),
    })
  }

  const images = (product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : [null]) as Array<string | null>

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 md:px-10 pt-10 md:pt-16 pb-16 md:pb-24">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-[var(--color-beige)] overflow-hidden"
            >
              <PlaceholderImage
                src={images[activeImage] || null}
                alt={product.name}
                aspect="portrait"
              />
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`w-16 h-20 overflow-hidden border transition-colors ${
                      i === activeImage
                        ? 'border-[var(--color-charcoal)]'
                        : 'border-transparent hover:border-[var(--color-muted)]'
                    }`}
                  >
                    <PlaceholderImage src={src || null} alt="" aspect="portrait" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:pt-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
              {product.category}
            </p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-[var(--color-charcoal)]">
              {product.name}
            </h1>
            <p className="mt-4 text-lg text-[var(--color-charcoal)] tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            {product.description && (
              <p className="mt-6 max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
                {product.description}
              </p>
            )}

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div className="mt-8">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Size {size && <span className="text-[var(--color-charcoal)]">· {size}</span>}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const active = size === s
                    return (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`min-w-[3rem] px-3 py-2.5 text-xs uppercase tracking-[0.18em] border transition-colors ${
                          active
                            ? 'border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-offwhite)]'
                            : 'border-[var(--color-beige)] text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div className="mt-7">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Colour {color && <span className="text-[var(--color-charcoal)]">· {color}</span>}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.map((c) => {
                    const active = color === c
                    return (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`px-3.5 py-2.5 text-xs uppercase tracking-[0.18em] border transition-colors ${
                          active
                            ? 'border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-offwhite)]'
                            : 'border-[var(--color-beige)] text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]'
                        }`}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Quantity</p>
              <div className="mt-3 inline-flex items-center border border-[var(--color-beige)]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-3 text-[var(--color-charcoal)] hover:bg-[var(--color-beige)]/40"
                  disabled={qty <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="px-5 py-2 text-sm tabular-nums min-w-[3rem] text-center border-l border-r border-[var(--color-beige)]">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(Math.max(1, product.stock), q + 1))
                  }
                  aria-label="Increase quantity"
                  className="px-3.5 py-3 text-[var(--color-charcoal)] hover:bg-[var(--color-beige)]/40"
                  disabled={outOfStock || qty >= Math.max(1, product.stock)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                {outOfStock ? 'Currently out of stock.' : `${product.stock} in stock.`}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className={`mt-9 w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-xs uppercase tracking-[0.22em] transition-opacity ${
                outOfStock
                  ? 'bg-[var(--color-beige)] text-[var(--color-muted)] cursor-not-allowed'
                  : 'bg-[var(--color-charcoal)] text-[var(--color-offwhite)] hover:opacity-90'
              }`}
            >
              {outOfStock ? 'Sold out' : 'Buy Now'}
              {!outOfStock && <ArrowRight size={14} />}
            </button>

            {validationError && (
              <p className="mt-3 text-xs text-[var(--color-charcoal)] text-center">
                {validationError}
              </p>
            )}

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Order via WhatsApp · No payment online
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 md:px-10 pb-20">
          <div className="divider mb-12" />
          <h2 className="font-display text-2xl md:text-3xl mb-10 text-[var(--color-charcoal)]">
            You may <span className="font-display-italic">also</span> like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <OrderModal selection={modalSelection} onClose={() => setModalSelection(null)} />
    </>
  )
}
