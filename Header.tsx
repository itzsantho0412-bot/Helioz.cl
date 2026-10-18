import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV = [
  { to: '/shop', label: 'Shop' },
  { to: '/custom', label: 'Custom' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
        scrolled ? 'bg-[var(--color-offwhite)]/85 backdrop-blur-md border-b border-[var(--color-beige)]' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <Link
          to="/"
          className="font-display text-lg tracking-[0.18em] uppercase text-[var(--color-charcoal)] no-select"
          onClick={() => setOpen(false)}
        >
          Helioz
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `text-sm tracking-wide uppercase transition-colors ${
                  isActive ? 'text-[var(--color-charcoal)]' : 'text-[var(--color-muted)] hover:text-[var(--color-charcoal)]'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <Link
            to="/admin"
            className="text-sm tracking-wide uppercase text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
          >
            Admin
          </Link>
        </div>

        <button
          aria-label="Menu"
          className="md:hidden p-2 -mr-2 text-[var(--color-charcoal)]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed inset-0 top-[68px] z-30 bg-[var(--color-offwhite)]"
          >
            <motion.nav
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
              className="flex flex-col items-start gap-8 px-8 pt-16"
            >
              {NAV.map((n) => (
                <motion.div
                  key={n.to}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <NavLink
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `font-display text-4xl tracking-wide ${
                        isActive ? 'text-[var(--color-charcoal)]' : 'text-[var(--color-muted)]'
                      }`
                    }
                  >
                    {n.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                className="mt-8 pt-8 border-t border-[var(--color-beige)] w-full"
              >
                <NavLink
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="text-sm uppercase tracking-wider text-[var(--color-muted)]"
                >
                  Admin
                </NavLink>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
