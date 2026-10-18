import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAdminAuth } from '../lib/useAdminAuth'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[var(--color-muted)] text-sm uppercase tracking-widest">
        Checking session…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
