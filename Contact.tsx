import { motion } from 'framer-motion'
import { OWNER_WHATSAPP_DISPLAY } from '../lib/whatsapp'

export default function Contact() {
  return (
    <section className="mx-auto max-w-3xl px-6 md:px-10 pt-20 md:pt-32 pb-24 text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]"
      >
        Contact
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-[var(--color-charcoal)]"
      >
        Let&rsquo;s talk.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12 }}
        className="mt-6 text-base leading-relaxed text-[var(--color-muted)] max-w-md mx-auto"
      >
        For personal orders, custom prints, or any question — reach us on WhatsApp or by email.
        We read every message and reply within a day.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18 }}
        className="mt-12 flex flex-col items-center gap-6"
      >
        <a
          href={`https://wa.me/${OWNER_WHATSAPP_DISPLAY.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-3 bg-[var(--color-charcoal)] px-7 py-4 text-xs uppercase tracking-[0.22em] text-[var(--color-offwhite)] hover:opacity-90"
        >
          WhatsApp {OWNER_WHATSAPP_DISPLAY}
        </a>
        <a
          href="mailto:hello@heliozclothing.com"
          className="text-sm text-[var(--color-charcoal)] underline underline-offset-4"
        >
          hello@heliozclothing.com
        </a>
      </motion.div>
    </section>
  )
}
