import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { formatCustomInquiry, whatsappUrl } from '../lib/whatsapp'
import type { CustomInquiry } from '../lib/types'

export default function CustomOrders() {
  const [form, setForm] = useState<CustomInquiry>({
    name: '',
    phone: '',
    email: '',
    quantity: 10,
    details: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CustomInquiry, string>>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function validate(): boolean {
    const e: Partial<Record<keyof CustomInquiry, string>> = {}
    if (!form.name.trim()) e.name = 'Please tell us your name.'
    if (!form.phone.trim()) e.phone = 'A phone number is required.'
    else if (!/^[+\d\s()-]{7,}$/.test(form.phone)) e.phone = 'That phone number looks off.'
    if (!form.quantity || form.quantity < 1) e.quantity = 'Enter the quantity you need.'
    if (!form.details.trim() || form.details.trim().length < 10)
      e.details = 'A few words about what you need — design, colours, deadline.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (!validate()) return
    setSending(true)
    // Small grace period so the user perceives the action.
    window.setTimeout(() => {
      const url = whatsappUrl(formatCustomInquiry(form))
      const win = window.open(url, '_blank', 'noopener,noreferrer')
      setSending(false)
      setSent(Boolean(win) || true)
    }, 400)
  }

  if (sent) {
    return (
      <section className="mx-auto max-w-2xl px-6 md:px-10 pt-24 pb-32 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-charcoal)]"
        >
          <Check size={22} strokeWidth={1.5} className="text-[var(--color-charcoal)]" />
        </motion.div>
        <p className="mt-7 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Inquiry ready
        </p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl text-[var(--color-charcoal)] leading-tight">
          Opening WhatsApp to send your inquiry.
        </h1>
        <p className="mt-5 max-w-md mx-auto text-sm leading-relaxed text-[var(--color-muted)]">
          Your details are prefilled. Tap send on WhatsApp to share them with us. Until the owner
          replies with a quote, this is just a request.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-10 inline-flex items-center gap-2 border border-[var(--color-beige)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
        >
          Submit another
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-6 md:px-10 pt-12 md:pt-20 pb-24">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Custom</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-[var(--color-charcoal)]">
          Bulk & custom printing
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-base leading-relaxed text-[var(--color-muted)]">
          For teams, events, gifting or your own label. Tell us a little about what you need and
          we&rsquo;ll reply with options.
        </p>
      </motion.header>

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-12 md:mt-16 space-y-7"
        noValidate
      >
        <Field
          label="Your name"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          error={errors.name}
        />
        <div className="grid sm:grid-cols-2 gap-7">
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            error={errors.phone}
            inputMode="tel"
          />
          <Field
            label="Email (optional)"
            type="email"
            value={form.email || ''}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            inputMode="email"
          />
        </div>
        <Field
          label="Quantity"
          type="number"
          min={1}
          value={String(form.quantity)}
          onChange={(v) => setForm((f) => ({ ...f, quantity: Math.max(1, Number(v) || 1) }))}
          error={errors.quantity}
        />
        <Area
          label="What do you need?"
          value={form.details}
          onChange={(v) => setForm((f) => ({ ...f, details: v }))}
          error={errors.details}
          placeholder="Describe the design, colours, sizes, deadline — anything that helps us quote accurately."
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={sending}
            className="w-full inline-flex items-center justify-center gap-3 bg-[var(--color-charcoal)] px-6 py-4 text-xs uppercase tracking-[0.22em] text-[var(--color-offwhite)] hover:opacity-90 disabled:opacity-60"
          >
            {sending ? 'Preparing…' : 'Send via WhatsApp'}
            {!sending && <ArrowRight size={14} />}
          </button>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            WhatsApp opens with your message prefilled.
          </p>
        </div>
      </motion.form>
    </section>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  min?: number
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  error?: string
  placeholder?: string
}
function Field({ label, value, onChange, type = 'text', min, inputMode, error, placeholder }: FieldProps) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full bg-transparent border-b ${error ? 'border-[var(--color-charcoal)]' : 'border-[var(--color-beige)]'} focus:border-[var(--color-charcoal)] py-3 outline-none text-[var(--color-charcoal)] placeholder:text-[var(--color-muted)]/70`}
      />
      {error && <span className="mt-1 block text-xs text-[var(--color-charcoal)]">{error}</span>}
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">{label}</span>
      <textarea
        rows={5}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 w-full bg-transparent border-b ${error ? 'border-[var(--color-charcoal)]' : 'border-[var(--color-beige)]'} focus:border-[var(--color-charcoal)] py-3 outline-none resize-none text-[var(--color-charcoal)] placeholder:text-[var(--color-muted)]/70`}
      />
      {error && <span className="mt-1 block text-xs text-[var(--color-charcoal)]">{error}</span>}
    </label>
  )
}
