import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Check } from 'lucide-react'
import type { OrderSelection } from '../lib/types'
import { formatOrderMessage, whatsappUrl } from '../lib/whatsapp'
import PlaceholderImage from './PlaceholderImage'

type Stage = 'review' | 'preparing' | 'ready'

interface Props {
  selection: OrderSelection | null
  onClose: () => void
}

const PREPARE_MS = 1800

export default function OrderModal({ selection, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('review')
  const [opened, setOpened] = useState(false)

  // Reset whenever the modal opens with a new selection.
  useEffect(() => {
    if (selection) {
      setStage('review')
      setOpened(false)
    }
  }, [selection])

  // Lock body scroll while open.
  useEffect(() => {
    if (!selection) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [selection])

  // When we enter "preparing", open WhatsApp after a brief delay.
  useEffect(() => {
    if (stage !== 'preparing' || !selection) return
    const timer = window.setTimeout(() => {
      const url = whatsappUrl(formatOrderMessage(selection))
      const win = window.open(url, '_blank', 'noopener,noreferrer')
      setOpened(Boolean(win))
      setStage('ready')
    }, PREPARE_MS)
    return () => window.clearTimeout(timer)
  }, [stage, selection])

  function handleConfirm() {
    if (!selection) return
    setStage('preparing')
  }

  function handleManualOpen() {
    if (!selection) return
    const url = whatsappUrl(formatOrderMessage(selection))
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpened(true)
    setStage('ready')
  }

  return (
    <AnimatePresence>
      {selection && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-[var(--color-charcoal)]/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="relative w-full max-w-md bg-[var(--color-offwhite)] border border-[var(--color-beige)] p-7 md:p-9 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 p-2 text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
            >
              <X size={18} />
            </button>

            <AnimatePresence mode="wait">
              {stage === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Review your order
                  </p>
                  <h2
                    id="order-modal-title"
                    className="font-display text-3xl md:text-4xl mt-2 text-[var(--color-charcoal)]"
                  >
                    {selection.product.name}
                  </h2>

                  <div className="mt-6 grid grid-cols-[96px_1fr] gap-4 items-start">
                    <div className="bg-[var(--color-beige)] overflow-hidden">
                      <PlaceholderImage
                        src={selection.product.image_urls?.[0]}
                        alt={selection.product.name}
                        aspect="square"
                      />
                    </div>
                    <dl className="text-sm divide-y divide-[var(--color-beige)]">
                      <Row label="Price" value={`₹${selection.product.price.toLocaleString('en-IN')}`} />
                      <Row label="Size" value={selection.size} />
                      <Row label="Color" value={selection.color} />
                      <Row label="Quantity" value={String(selection.quantity)} />
                      <Row
                        label="Total"
                        value={`₹${(selection.product.price * selection.quantity).toLocaleString('en-IN')}`}
                        emphasis
                      />
                    </dl>
                  </div>

                  <p className="mt-6 text-xs leading-relaxed text-[var(--color-muted)]">
                    Your message will open in WhatsApp, prefilled with the details above. Tap send there
                    to send your request — we&rsquo;ll confirm availability by reply.
                  </p>

                  <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 border border-[var(--color-beige)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-charcoal)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-offwhite)] hover:opacity-90"
                    >
                      Confirm on WhatsApp
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {stage === 'preparing' && (
                <motion.div
                  key="preparing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Preparing
                  </p>
                  <p className="font-display text-3xl md:text-4xl mt-3 text-[var(--color-charcoal)]">
                    Your order, neatly composed
                  </p>

                  <div className="mt-10 mb-6 h-12 w-12 relative">
                    <motion.span
                      className="absolute inset-0 rounded-full border border-[var(--color-beige)]"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.span
                      className="absolute inset-0 rounded-full border border-[var(--color-muted)]/40"
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {stage === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center py-2"
                >
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.05 }}
                    className="mt-2 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-charcoal)]"
                  >
                    <Check size={22} strokeWidth={1.5} className="text-[var(--color-charcoal)]" />
                  </motion.div>

                  <p className="mt-7 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Order request ready
                  </p>
                  <p className="font-display text-3xl md:text-4xl mt-3 text-[var(--color-charcoal)] leading-snug">
                    Opening WhatsApp to complete your order.
                  </p>
                  <p className="mt-5 max-w-xs text-xs leading-relaxed text-[var(--color-muted)]">
                    Your details are prefilled. After you tap send on WhatsApp, the owner will
                    confirm by reply. Until then, this is a{' '}
                    <span className="text-[var(--color-charcoal)]">request</span>, not a
                    confirmed order.
                  </p>

                  {opened === false && (
                    <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Popup blocked? Tap below to open WhatsApp manually.
                    </p>
                  )}

                  <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 w-full">
                    <button
                      onClick={onClose}
                      className="flex-1 border border-[var(--color-beige)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleManualOpen}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-charcoal)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-offwhite)] hover:opacity-90"
                    >
                      {opened === false ? 'Open WhatsApp' : 'Open WhatsApp again'}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 gap-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</dt>
      <dd
        className={`text-right tabular-nums ${
          emphasis ? 'text-[var(--color-charcoal)] font-medium' : 'text-[var(--color-charcoal)]'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
