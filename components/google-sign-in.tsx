'use client'

// Sign in with Google, rendered by Google Identity Services.
//
// The browser never sees our backend's secrets: Google hands us a short-lived
// ID token, we post it to /api/auth/google/, and the SERVER verifies it with
// Google before issuing our own JWTs. Nothing here is trusted client-side.
//
// Renders nothing at all when NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset, so the
// site works normally before the client id exists.

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const GSI_SRC = 'https://accounts.google.com/gsi/client'

declare global {
  interface Window {
    google?: any
  }
}

interface GoogleSignInProps {
  /** Where to go after a successful sign-in. */
  redirectTo?: string
  /** Shown above the button, e.g. "or". Omit to render just the button. */
  dividerLabel?: string
}

export function GoogleSignIn({ redirectTo = '/account', dividerLabel }: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) return

    async function handleCredential(response: { credential?: string }) {
      if (!response?.credential) return
      setBusy(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/auth/google/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          setError(data?.detail || 'Google sign-in failed. Please try again.')
          setBusy(false)
          return
        }
        // Same storage keys the password login uses, so the rest of the app
        // (AuthProvider, authFetch, account pages) needs no special casing.
        localStorage.setItem('engmart_tokens', JSON.stringify({
          access: data.access, refresh: data.refresh,
        }))
        localStorage.setItem('engmart_user', JSON.stringify(data.user))
        // Full navigation so every provider re-reads the new tokens.
        window.location.href = redirectTo
      } catch {
        setError('Could not reach the server. Please check your connection.')
        setBusy(false)
      }
    }

    function initialise() {
      if (!window.google?.accounts?.id || !buttonRef.current) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
      })
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        shape: 'rectangular',
      })
    }

    // Load the Google script once, even if both login and register mount it.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
    if (existing) {
      if (window.google?.accounts?.id) initialise()
      else existing.addEventListener('load', initialise)
      return
    }
    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = initialise
    document.head.appendChild(script)
  }, [redirectTo, router])

  // No client id configured yet — render nothing rather than a dead button.
  if (!CLIENT_ID) return null

  return (
    <div className="w-full">
      {dividerLabel && (
        <div className="flex items-center gap-3 my-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {dividerLabel}
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
      )}

      <div className="flex justify-center">
        <div ref={buttonRef} aria-busy={busy} />
      </div>

      {busy && (
        <p className="mt-2 text-center text-xs text-muted-foreground">Signing you in…</p>
      )}
      {error && (
        <p className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
