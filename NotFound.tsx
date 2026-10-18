import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-offwhite)] text-[var(--color-charcoal)] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">404</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight">Page not found</h1>
        <p className="mt-4 max-w-md mx-auto text-sm text-[var(--color-muted)]">
          The link you followed may be broken, or the page may have been removed.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] underline underline-offset-4"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
