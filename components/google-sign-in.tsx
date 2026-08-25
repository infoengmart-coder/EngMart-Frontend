'use client'

// "Continue with Google", brokered by Clerk.
//
// Clerk runs the Google OAuth flow and hands back a short-lived session token.
// That token is posted to /api/auth/clerk/, where the SERVER verifies its
// signature against Clerk's public keys and reads the customer's verified email
// from Clerk's Backend API before issuing our own JWTs. Nothing here is trusted
// client-side, and no secret ever reaches the browser.
//
// The Clerk session is signed out immediately after the exchange: Django stays
// the single source of truth for who is logged in, so there is never a second
// session to keep in sync. See app/sso-callback/page.tsx for the other half.
//
// Renders nothing when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is unset, so the site
// works normally before Clerk is configured.

import { useState } from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

interface GoogleSignInProps {
  /** Where to go after a successful sign-in. */
  redirectTo?: string
  /** Shown above the button, e.g. "or". Omit to render just the button. */
  dividerLabel?: string
}

/** Google's mark. Inline so the button paints with the page, no network fetch. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}

/**
 * Public entry point.
 *
 * The key check MUST live out here, in a component that calls no Clerk hooks.
 * `useSignIn()` throws when there is no ClerkProvider above it, and because
 * hooks cannot be called conditionally, a guard placed after the hook runs too
 * late — it took the whole production build down with a prerender error on
 * /login, not just this button.
 */
export function GoogleSignIn(props: GoogleSignInProps) {
  if (!PUBLISHABLE_KEY) return null
  return <GoogleSignInButton {...props} />
}

function GoogleSignInButton({ redirectTo = '/account', dividerLabel }: GoogleSignInProps) {
  // Clerk v7's hook returns a signal: `signIn` is null until Clerk has loaded,
  // and sso() reports failure by returning an error rather than throwing.
  const { signIn } = useSignIn()
  const { isSignedIn, signOut } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (!signIn) return
    setBusy(true)
    setError('')
    try {
      // A Clerk session can survive an abandoned or failed attempt. Starting a
      // new sign-in on top of one makes Clerk reject it with a 400 on
      // /client/sign_ins — which reads as a fresh bug rather than leftover
      // state. Clear it first so every click starts from the same place.
      if (isSignedIn) {
        await signOut().catch(() => {})
      }
      // Absolute URLs: Clerk hands these to Google, which rejects relative ones.
      const origin = window.location.origin

      // Mark that a sign-in is genuinely in flight. /sso-callback uses this to
      // tell a real return-from-Google apart from someone opening that URL
      // directly — in which case Clerk renders its own generic sign-in card
      // over our page. sessionStorage, so it dies with the tab.
      try { sessionStorage.setItem('engmart_sso_pending', '1') } catch {}
      const { error: ssoError } = await signIn.sso({
        strategy: 'oauth_google',
        // Where Clerk returns the browser to once Google is done.
        redirectCallbackUrl: `${origin}/sso-callback`,
        // Final destination. The app's own target rides along in ?next= because
        // this navigates away from the page entirely.
        redirectUrl: `${origin}/sso-callback?next=${encodeURIComponent(redirectTo)}`,
      })
      if (ssoError) {
        setError('Could not start Google sign-in. Please try again.')
        setBusy(false)
      }
      // On success control does not return here — the browser goes to Google.
    } catch {
      setError('Could not start Google sign-in. Please try again.')
      setBusy(false)
    }
  }

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

      <button
        type="button"
        onClick={handleClick}
        disabled={!signIn || busy}
        aria-busy={busy}
        className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-border
                   bg-card px-4 py-2.5 min-h-11 text-sm font-semibold text-foreground
                   transition-colors hover:bg-secondary
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                   disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        <GoogleMark />
        {busy ? 'Redirecting to Google…' : 'Continue with Google'}
      </button>

      {error && (
        <p className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
