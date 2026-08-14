'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ─── Types ──────────────────────────────────────────────
export type UserProfile = {
  id: number
  username: string
  name: string
  email: string
  first_name: string
  last_name: string
  is_admin: boolean
  date_joined: string
  phone?: string
  company?: string
  role?: 'retail' | 'wholesale'
}

type AuthTokens = {
  access: string
  refresh: string
}

type AuthCtx = {
  user: UserProfile | null
  login: (username: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string; user?: UserProfile }>
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>
  /** Persist name changes to the API (backend only allows first/last name). */
  updateUser: (data: { name?: string; first_name?: string; last_name?: string }) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  getAccessToken: () => string | null
}

type RegisterData = {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

const AuthContext = createContext<AuthCtx | null>(null)

const LS_TOKENS_KEY = 'engmart_tokens'
const LS_USER_KEY = 'engmart_user'

/**
 * "Remember me" decides WHERE the session is kept:
 *
 *   on  -> localStorage   : survives closing the browser (stay signed in)
 *   off -> sessionStorage : cleared when the tab/browser closes
 *
 * Reads check both, so an existing session keeps working either way. Before
 * this, tokens always went to localStorage and the toggle did nothing at all.
 */
function readAny(key: string): string | null {
  try {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key)
  } catch { return null }
}

function getStoredTokens(): AuthTokens | null {
  try {
    const raw = readAny(LS_TOKENS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function getStoredUser(): UserProfile | null {
  try {
    const raw = readAny(LS_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function storeAuth(tokens: AuthTokens, user: UserProfile, remember: boolean = true) {
  const store = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage
  try {
    store.setItem(LS_TOKENS_KEY, JSON.stringify(tokens))
    store.setItem(LS_USER_KEY, JSON.stringify(user))
    // Never leave a copy behind in the other store, or signing out of one
    // would silently restore the session from the other.
    other.removeItem(LS_TOKENS_KEY)
    other.removeItem(LS_USER_KEY)
  } catch { /* private mode — session stays in memory only */ }
}

function clearAuth() {
  // Clear BOTH stores — "remember me" may have written to either.
  for (const store of [localStorage, sessionStorage]) {
    try {
      store.removeItem(LS_TOKENS_KEY)
      store.removeItem(LS_USER_KEY)
    } catch {}
  }
  // Account data cached for the previous session is personal (order numbers,
  // addresses, phone numbers, totals). Clearing tokens alone would leave it
  // readable by the next person to use this browser.
  localStorage.removeItem('engmart_orders')
  localStorage.removeItem('engmart_quotes')
  localStorage.removeItem('engmart_inquiries')
  localStorage.removeItem('engmart_addresses')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredUser()
    const tokens = getStoredTokens()
    if (stored && tokens) {
      setUser(stored)
      // Verify token is still valid in background
      fetch(`${API_BASE}/auth/me/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      })
        .then(res => {
          if (!res.ok) {
            // Try refreshing
            return fetch(`${API_BASE}/auth/token/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: tokens.refresh }),
            }).then(refreshRes => {
              if (refreshRes.ok) return refreshRes.json()
              throw new Error('Refresh failed')
            }).then(data => {
              storeAuth({ access: data.access, refresh: tokens.refresh }, stored)
            }).catch(() => {
              clearAuth()
              setUser(null)
            })
          }
          return res.json().then(userData => {
            setUser(userData)
            localStorage.setItem(LS_USER_KEY, JSON.stringify(userData))
          })
        })
        .catch(() => {
          clearAuth()
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (username: string, password: string, remember: boolean = true) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errMsg = data.non_field_errors?.[0] || data.detail || data.username?.[0] || 'Login failed'
        return { ok: false, error: errMsg }
      }
      storeAuth({ access: data.access, refresh: data.refresh }, data.user, remember)
      setUser(data.user)
      return { ok: true, user: data.user }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' }
    }
  }, [])

  const register = useCallback(async (regData: RegisterData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      })
      const data = await res.json()
      if (!res.ok) {
        const firstErr = Object.values(data).flat()[0]
        return { ok: false, error: (firstErr as string) || 'Registration failed' }
      }
      // Don't auto-login — let the user sign in from the login page.
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' }
    }
  }, [])

  const updateUser = useCallback(async (data: { name?: string; first_name?: string; last_name?: string }) => {
    // Accept a single display name (the profile form has one field) or explicit parts.
    let first = data.first_name ?? ''
    let last = data.last_name ?? ''
    if (data.name !== undefined && data.first_name === undefined && data.last_name === undefined) {
      const parts = data.name.trim().split(/\s+/)
      first = parts[0] || ''
      last = parts.slice(1).join(' ')
    }
    const tokens = getStoredTokens()
    if (!tokens) return { ok: false, error: 'Not signed in' }
    try {
      const res = await fetch(`${API_BASE}/auth/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({ first_name: first, last_name: last }),
      })
      const updated = await res.json().catch(() => null)
      if (!res.ok) {
        const firstErr = updated ? Object.values(updated).flat()[0] : null
        return { ok: false, error: (firstErr as string) || 'Failed to update profile' }
      }
      setUser(prev => {
        if (!prev) return prev
        const next: UserProfile = {
          ...prev,
          ...updated,
          name: `${updated?.first_name ?? first} ${updated?.last_name ?? last}`.trim() || prev.name,
        }
        try { localStorage.setItem(LS_USER_KEY, JSON.stringify(next)) } catch {}
        return next
      })
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' }
    }
  }, [])

  const logout = useCallback(() => {
    const tokens = getStoredTokens()
    if (tokens) {
      // Fire-and-forget logout on backend
      fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({ refresh: tokens.refresh }),
      }).catch(() => {})
    }
    clearAuth()
    setUser(null)
  }, [])

  const getAccessToken = useCallback(() => {
    return getStoredTokens()?.access || null
  }, [])

  const isAuthenticated = user !== null
  const isAdmin = user?.is_admin === true

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, isAuthenticated, isAdmin, isLoading, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
