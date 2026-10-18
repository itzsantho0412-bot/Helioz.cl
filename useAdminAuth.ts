import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, adminEmail } from './supabase'

export interface AdminSession {
  email: string
  // When Supabase is not configured we operate in a local "demo admin" mode.
  mode: 'supabase' | 'local'
}

const LOCAL_KEY = 'helioz.admin.local'

function readLocalSession(): AdminSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as AdminSession) : null
  } catch {
    return null
  }
}

function writeLocalSession(s: AdminSession | null) {
  if (typeof window === 'undefined') return
  if (s) window.localStorage.setItem(LOCAL_KEY, JSON.stringify(s))
  else window.localStorage.removeItem(LOCAL_KEY)
}

// Track whether the signed-in user is whitelisted as an admin. Supabase
// path: query the admins table. Local path: trust the local session only.
async function checkAdminByEmail(email: string): Promise<boolean> {
  if (!supabase) return true
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()
  if (error) return false
  return Boolean(data)
}

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function init() {
      setLoading(true)
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession()
          if (data.session?.user.email) {
            const ok = await checkAdminByEmail(data.session.user.email)
            if (alive) setSession(ok ? { email: data.session.user.email, mode: 'supabase' } : null)
          }
        } else {
          if (alive) setSession(readLocalSession())
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    init()

    if (supabase) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
        if (s?.user.email) {
          const ok = await checkAdminByEmail(s.user.email)
          const next = ok ? { email: s.user.email, mode: 'supabase' as const } : null
          setSession(next)
        } else {
          setSession(null)
        }
      })
      return () => {
        alive = false
        sub.subscription.unsubscribe()
      }
    }
    return () => {
      alive = false
    }
  }, [])

  async function signIn(email: string, password: string) {
    setError(null)
    const e = email.trim().toLowerCase()
    if (!e || !password) {
      setError('Email and password are required.')
      return false
    }
    if (supabase) {
      if (adminEmail && e !== adminEmail) {
        setError('This account is not authorised as an admin.')
        return false
      }
      const { data, error: err } = await supabase.auth.signInWithPassword({ email: e, password })
      if (err) {
        setError(err.message)
        return false
      }
      const ok = await checkAdminByEmail(data.user.email || e)
      if (!ok) {
        await supabase.auth.signOut()
        setError('You are signed in, but not on the admin allowlist.')
        return false
      }
      setSession({ email: data.user.email || e, mode: 'supabase' })
      return true
    }
    // Local mode: any non-empty credentials work, allowing the owner to test
    // the admin flow without a backend. This is shown clearly in the UI.
    const next: AdminSession = { email: e, mode: 'local' }
    writeLocalSession(next)
    setSession(next)
    return true
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut()
    }
    writeLocalSession(null)
    setSession(null)
  }

  return { session, loading, error, signIn, signOut }
}
