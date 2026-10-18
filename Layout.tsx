import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

/**
 * Page shell. Renders <Outlet /> (for nested route trees) when used as
 * a route element on its own, or `children` when wrapped around a page
 * manually (e.g. inside ProtectedRoute).
 */
export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-offwhite)] text-[var(--color-charcoal)]">
      <Header />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  )
}
