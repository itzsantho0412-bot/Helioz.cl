import { Link } from 'react-router-dom'
import { OWNER_WHATSAPP_DISPLAY } from '../lib/whatsapp'

export default function Footer() {
  return (
    <footer className="mt-24 md:mt-32 border-t border-[var(--color-beige)] bg-[var(--color-offwhite)]">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <p className="font-display text-2xl tracking-[0.2em] uppercase text-[var(--color-charcoal)]">
              Helioz
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
              Quietly considered tees. Ready-made and custom-printed, made with care.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <Link
              to="/shop"
              className="text-[var(--color-muted)] hover:text-[var(--color-charcoal)] uppercase tracking-wider"
            >
              Shop
            </Link>
            <Link
              to="/custom"
              className="text-[var(--color-muted)] hover:text-[var(--color-charcoal)] uppercase tracking-wider"
            >
              Custom Orders
            </Link>
            <Link
              to="/contact"
              className="text-[var(--color-muted)] hover:text-[var(--color-charcoal)] uppercase tracking-wider"
            >
              Contact
            </Link>
          </nav>

          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`https://wa.me/${OWNER_WHATSAPP_DISPLAY.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[var(--color-charcoal)] hover:opacity-70"
            >
              {OWNER_WHATSAPP_DISPLAY}
            </a>
            <a
              href="mailto:hello@heliozclothing.com"
              className="text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
            >
              hello@heliozclothing.com
            </a>
          </div>
        </div>

        <div className="divider mt-12 md:mt-16" />

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">
          <p>© {new Date().getFullYear()} Helioz Clothing.</p>
          <p>Made with intention.</p>
        </div>
      </div>
    </footer>
  )
}
