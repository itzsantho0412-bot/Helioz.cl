import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useAdminAuth } from '../lib/useAdminAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function AdminLogin() {
  const { session, loading, signIn, error } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--color-muted)] text-sm uppercase tracking-widest">
        Checking session…
      </div>
    )
  }

  if (session) {
    return <Navigate to={location.state?.from || '/admin'} replace />
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    setBusy(true)
    const ok = await signIn(email, password)
    setBusy(false)
    if (ok) navigate(location.state?.from || '/admin', { replace: true })
  }

  return (
    <section className="mx-auto max-w-md px-6 md:px-10 pt-16 md:pt-24 pb-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
      >
        <ArrowLeft size={14} /> Back to site
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-10"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Admin</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-[var(--color-charcoal)]">
          Sign in
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
          Manage products, upload images and update the store.
        </p>
      </motion.div>

      {!isSupabaseConfigured && (
        <div className="mt-8 border border-[var(--color-beige)] bg-[var(--color-beige)]/30 p-4 text-xs leading-relaxed text-[var(--color-muted)]">
          <p className="uppercase tracking-[0.18em] text-[var(--color-charcoal)]">Demo mode</p>
          <p className="mt-2">
            Supabase isn&rsquo;t configured. Sign in with any credentials to access the local
            demo admin. Products and images are stored in your browser only. See{' '}
            <span className="text-[var(--color-charcoal)]">SETUP.md</span> to enable a real
            backend.
          </p>
        </div>
      )}

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 space-y-6"
        noValidate
      >
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="mt-2 w-full bg-transparent border-b border-[var(--color-beige)] focus:border-[var(--color-charcoal)] py-3 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="mt-2 w-full bg-transparent border-b border-[var(--color-beige)] focus:border-[var(--color-charcoal)] py-3 outline-none"
          />
        </label>

        {error && (
          <p className="text-xs text-[var(--color-charcoal)] border-l-2 border-[var(--color-charcoal)] pl-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-3 bg-[var(--color-charcoal)] px-6 py-4 text-xs uppercase tracking-[0.22em] text-[var(--color-offwhite)] hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
          {!busy && <ArrowRight size={14} />}
        </button>
      </motion.form>
    </section>
  )
}
