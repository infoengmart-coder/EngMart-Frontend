'use client'

// =============================================================
// Sign-in gate for actions that need an account (add to cart).
//
// Wrap an action in `requireAuth(fn)`: if the visitor is signed in it runs
// immediately, otherwise a modal invites them to sign in or create an account
// and the action is remembered, so after signing in they land back where they
// were instead of losing what they were doing.
// =============================================================

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './auth'
import { useScrollLock } from '@/components/confirm-dialog'

type GateCtx = {
  /** Runs `action` if signed in; otherwise opens the sign-in prompt. */
  requireAuth: (action: () => void, opts?: { title?: string; message?: string }) => void
  isAuthenticated: boolean
}

const AuthGateContext = createContext<GateCtx | null>(null)

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [copy, setCopy] = useState<{ title: string; message: string }>({
    title: 'Sign in to add items',
    message: 'Create a free account to build your order, save products, and track deliveries.',
  })

  useScrollLock(open)

  const requireAuth = useCallback((action: () => void, opts?: { title?: string; message?: string }) => {
    if (isLoading) return          // auth still hydrating — don't flash the modal
    if (isAuthenticated) { action(); return }
    if (opts) setCopy(c => ({ ...c, ...opts }))
    // Remember where they were so login can send them back here.
    try { sessionStorage.setItem('engmart_return_to', window.location.pathname + window.location.search) } catch {}
    setOpen(true)
  }, [isAuthenticated, isLoading])

  // Close on Escape, and whenever they navigate away.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <AuthGateContext.Provider value={{ requireAuth, isAuthenticated }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-gate-title"
        >
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} />

          <div className="relative w-full sm:max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Accent header */}
            <div className="relative px-6 pt-7 pb-6 bg-gradient-to-br from-primary to-[color-mix(in_srgb,var(--primary)_70%,#000)] text-primary-foreground">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-3">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </div>
              <h2 id="auth-gate-title" className="text-lg font-black tracking-tight">{copy.title}</h2>
              <p className="text-xs text-primary-foreground/85 mt-1 leading-relaxed">{copy.message}</p>
            </div>

            <div className="p-6">
              <ul className="space-y-2.5 mb-6">
                {[
                  'Track every order from your account',
                  'Save products and reorder in one click',
                  'Request quotes on bulk quantities',
                ].map(line => (
                  <li key={line} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link href="/login" className="btn-primary flex-1 justify-center text-xs">
                  Sign In
                </Link>
                <Link href="/register" className="btn-secondary flex-1 justify-center text-xs">
                  Create Account
                </Link>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full mt-3 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGateContext.Provider>
  )
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  // Falling back to "just run it" keeps any component that renders outside the
  // provider working rather than crashing the page.
  if (!ctx) return { requireAuth: (action: () => void) => action(), isAuthenticated: false }
  return ctx
}
