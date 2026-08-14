'use client'

// Where Google sends the customer back to.
//
// Two things happen here, in order:
//
//  1. Clerk finishes the OAuth handshake (AuthenticateWithRedirectCallback).
//  2. Once a Clerk session exists, its token is posted to our backend, which
//     verifies it and returns OUR JWTs. The Clerk session is then signed out.
//
// Step 2 is the important one: Django stays the only session the app has, so
// every existing provider, guard and API call keeps working unchanged, and a
// customer who signed up with a password months ago lands on the same account
// with their order history intact.

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useClerk, useSignUp } from '@clerk/nextjs'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

/** Named stages, so the wait reads as progress rather than a stalled spinner. */
const STAGES = {
  connecting: 'Connecting to Google',
  verifying: 'Verifying your account',
  redirecting: 'Signing you in',
} as const
type Stage = keyof typeof STAGES

const STAGE_ORDER: Stage[] = ['connecting', 'verifying', 'redirecting']

function GoogleMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}

/** Shared page frame — keeps the loading and error states visually identical. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] flex items-center justify-center px-4 py-10 bg-secondary/30">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

function SsoCallbackInner() {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth()
  const { signUp } = useSignUp()
  const clerk = useClerk()
  const params = useSearchParams()
  // handleRedirectCallback must fire once, and only after Clerk has loaded.
  const handshakeStarted = useRef(false)
  const [error, setError] = useState('')
  const [stage, setStage] = useState<Stage>('connecting')
  // The exchange must happen exactly once; React may run effects twice in
  // development and a second POST would be a wasted round trip.
  const exchanged = useRef(false)

  // Is this a genuine return from Google, or did someone just open the URL?
  // It matters because <AuthenticateWithRedirectCallback> with nothing to
  // process renders Clerk's own generic sign-in card — "Sign in to My
  // Application", Clerk branding, "Development mode" — right over this page.
  // Resolved once on mount: the flag is consumed here, and re-reading it after
  // the exchange clears it would flip this to false mid-flow.
  const [isRealCallback] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      if (sessionStorage.getItem('engmart_sso_pending')) return true
    } catch {}
    // Belt and braces: Clerk also stamps its own params onto the return URL.
    return /__clerk|createdSessionId|handshake/i.test(window.location.search)
  })

  const nextUrl = params.get('next') || '/account'

  const exchange = useCallback(async () => {
    setStage('verifying')
    // The attempt is being handled now; don't let a stale flag make a later
    // direct visit look like a real callback.
    try { sessionStorage.removeItem('engmart_sso_pending') } catch {}
    let token: string | null = null
    try {
      token = await getToken()
    } catch (err) {
      // Distinct from a network failure, and it used to be reported as one.
      console.error('[sso] could not read the Clerk session token:', err)
      setError('Google sign-in did not complete. Please try again.')
      await signOut().catch(() => {})
      return
    }
    if (!token) {
      setError('Google sign-in did not complete. Please try again.')
      await signOut().catch(() => {})
      return
    }

    try {
      // One retry on a network-level failure. The backend may simply have been
      // restarting; a customer who has already been through Google should not
      // be sent back to the start because of a single dropped request.
      let res: Response | null = null
      let lastErr: unknown = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          res = await fetch(`${API_BASE}/auth/clerk/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          })
          break
        } catch (err) {
          lastErr = err
          console.error(`[sso] POST ${API_BASE}/auth/clerk/ failed (attempt ${attempt}):`, err)
          if (attempt === 1) await new Promise(r => setTimeout(r, 1500))
        }
      }

      if (!res) {
        // Genuinely unreachable — name the address so the cause is obvious
        // rather than blaming the customer's connection.
        console.error('[sso] backend unreachable at', API_BASE, lastErr)
        setError(`Could not reach the server at ${API_BASE}. It may be starting up — please try again in a moment.`)
        await signOut().catch(() => {})
        return
      }

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        console.error('[sso] backend rejected the sign-in:', res.status, data)
        setError(data?.detail || 'Google sign-in failed. Please try again.')
        // Leave no half-signed-in Clerk session behind on failure.
        await signOut().catch(() => {})
        return
      }

      // Same storage keys the password login uses, so AuthProvider, authFetch
      // and the account pages need no special casing.
      localStorage.setItem('engmart_tokens', JSON.stringify({
        access: data.access, refresh: data.refresh,
      }))
      localStorage.setItem('engmart_user', JSON.stringify(data.user))

      setStage('redirecting')

      // Relative paths only — an attacker-supplied ?next= must not send anyone
      // to another site.
      const safeNext = nextUrl.startsWith('/') && !nextUrl.startsWith('//')
        ? nextUrl
        : '/account'

      // Clerk's job is done; drop its session so only Django's remains.
      await signOut({ redirectUrl: safeNext }).catch(() => {})

      // Then force a FULL page load, and do not skip this because signOut has
      // already navigated. Clerk navigates with the Next.js router, which keeps
      // React mounted — AuthProvider would still be holding the pre-login
      // (empty) session and the navbar would keep showing "Login" until the
      // customer manually refreshed. A hard load re-reads the tokens above.
      window.location.replace(safeNext)
    } catch (err) {
      // Anything left is a genuine bug, not a connection problem — say so and
      // leave the real cause in the console rather than guessing at it.
      console.error('[sso] unexpected failure while completing sign-in:', err)
      setError('Something went wrong finishing your sign-in. Please try again.')
      await signOut().catch(() => {})
    }
  }, [getToken, signOut, nextUrl])

  // Finish the OAuth handshake imperatively.
  //
  // Clerk ships <AuthenticateWithRedirectCallback> for this, but it renders
  // Clerk's own sign-in card whenever it cannot complete — and it does so
  // through a portal on document.body, so it escapes any wrapper and paints
  // over this page wearing Clerk branding ("Sign in to My Application",
  // "Development mode"). handleRedirectCallback does the identical work with
  // no UI of its own, which keeps this page the only thing a customer sees.
  //
  // The navigate override is what stops Clerk redirecting anywhere on its own:
  // this page decides where the customer goes, after the token exchange below.
  useEffect(() => {
    if (!isLoaded || !isRealCallback || isSignedIn || handshakeStarted.current) return
    handshakeStarted.current = true
    clerk
      .handleRedirectCallback(
        {
          // Without these, a handshake Clerk cannot complete sends the browser
          // to Clerk's hosted Account Portal — a different website, showing
          // "Sign in to My Application" and Clerk branding. Every escape hatch
          // has to point back at our own pages.
          signInUrl: '/login',
          signUpUrl: '/register',
          signInFallbackRedirectUrl: '/login',
          signUpFallbackRedirectUrl: '/login',
          firstFactorUrl: '/login',
          secondFactorUrl: '/login',
          resetPasswordUrl: '/forgot-password',
          continueSignUpUrl: '/login',
        },
        async () => { /* stay put — this page decides where to go next */ },
      )
      .catch(() => { /* the timeout below reports it */ })
  }, [isLoaded, isRealCallback, isSignedIn, clerk])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || exchanged.current) return
    exchanged.current = true
    exchange()
  }, [isLoaded, isSignedIn, exchange])

  // Nothing should sit on this page for long — it is a staging post, not a
  // destination. Someone who opens the URL directly, or whose OAuth handshake
  // genuinely stalls, would otherwise watch a spinner forever.
  //
  // Every failure diagnosis belongs HERE, on the timeout, and nowhere else.
  // Clerk passes *through* transient states while it works — a first-time
  // Google user is briefly a sign-up with status "missing_requirements" before
  // the account is created. An earlier version treated that instant as fatal
  // and rendered the error card, which unmounted <AuthenticateWithRedirectCallback>
  // and killed the handshake mid-flight. Clerk still created the account; the
  // page had already given up on it. Judge the flow only once it has had time
  // to finish.
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (exchanged.current) return

      const missing = signUp?.missingFields || []
      if (signUp?.status === 'missing_requirements' && missing.length > 0) {
        console.error(
          '[Clerk] Sign-up blocked — the Clerk instance requires fields Google does not provide:',
          missing.join(', '),
          '\nFix in Clerk dashboard → Configure → Email, phone, username.',
        )
        setError('Google sign-in is not fully configured yet. Please use email and password for now.')
      } else {
        console.error('[Clerk] Sign-in did not complete. status:', signUp?.status ?? '(none)')
        setError('Google sign-in did not complete. Please try again.')
      }

      // Clear the half-finished attempt. Leaving it behind makes the *next*
      // attempt fail with a 400 on /client/sign_ins, which looks like a new
      // and unrelated bug.
      try { sessionStorage.removeItem('engmart_sso_pending') } catch {}
      await signOut().catch(() => {})
    }, 25000)
    return () => clearTimeout(timer)
  }, [signUp?.status, signUp?.missingFields, signOut])

  // ── opened directly, with no sign-in in flight ──────────────────────
  // Nothing to process and nothing to wait for, so say so immediately rather
  // than running a spinner for 25 seconds to reach the same conclusion.
  if (!isRealCallback && isLoaded && !isSignedIn && !error) {
    return (
      <Shell>
        <div className="bg-card border border-border rounded-2xl shadow-xl p-7 sm:p-8 text-center animate-fade-in">
          <h1 className="text-lg font-extrabold text-foreground">Nothing to sign in to</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            This page finishes a Google sign-in. Start from the sign-in page.
          </p>
          <Link href="/login" className="btn-primary mt-6 w-full justify-center text-sm py-2.5">
            Go to sign in
          </Link>
        </div>
      </Shell>
    )
  }

  // ── error ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <Shell>
        <div className="bg-card border border-border rounded-2xl shadow-xl p-7 sm:p-8 text-center animate-fade-in">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full
                       bg-destructive/10 text-destructive"
            aria-hidden="true"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 8v5" />
              <path d="M12 16.5v.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>

          <h1 className="text-lg font-extrabold text-foreground">Sign-in didn&apos;t finish</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{error}</p>

          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login" className="btn-primary w-full justify-center text-sm py-2.5">
              Try again
            </Link>
            <Link
              href="/"
              className="w-full rounded-lg px-4 py-2.5 text-xs font-semibold text-muted-foreground
                         hover:text-foreground hover:bg-secondary transition-colors"
            >
              Back to the store
            </Link>
          </div>

          <p className="mt-5 text-[11px] text-muted-foreground">
            You can also sign in with your email and password.
          </p>
        </div>
      </Shell>
    )
  }

  // ── in progress ─────────────────────────────────────────────────────
  const activeIndex = STAGE_ORDER.indexOf(stage)

  return (
    <Shell>
      <div className="bg-card border border-border rounded-2xl shadow-xl p-7 sm:p-8 animate-fade-in">
        {/* Google mark inside a rotating ring — one clear focal point that
            shows the flow is alive without a bare spinner. */}
        <div className="relative mx-auto mb-6 h-20 w-20" role="status" aria-live="polite" aria-label={STAGES[stage]}>
          <span
            className="absolute inset-0 rounded-full border-2 border-border
                       border-t-primary motion-safe:animate-spin"
            style={{ animationDuration: '1.1s' }}
          />
          <span className="absolute inset-[6px] rounded-full bg-secondary/60" />
          <span className="absolute inset-0 flex items-center justify-center">
            <GoogleMark className="h-7 w-7" />
          </span>
        </div>

        <h1 className="text-center text-lg font-extrabold text-foreground">
          {STAGES[stage]}…
        </h1>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          Hold on a moment — please don&apos;t close this window.
        </p>

        {/* Step rail: turns an opaque wait into visible progress. */}
        <ol className="mt-7 space-y-3">
          {STAGE_ORDER.map((key, i) => {
            const done = i < activeIndex
            const active = i === activeIndex
            return (
              <li key={key} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold
                    ${done ? 'border-primary bg-primary text-primary-foreground'
                      : active ? 'border-primary text-primary'
                      : 'border-border text-muted-foreground'}`}
                  aria-hidden="true"
                >
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-xs font-semibold transition-colors ${
                    active ? 'text-foreground' : done ? 'text-muted-foreground' : 'text-muted-foreground/60'
                  }`}
                >
                  {STAGES[key]}
                </span>
                {active && (
                  <span className="ml-auto flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map(d => (
                      <span
                        key={d}
                        className="h-1 w-1 rounded-full bg-primary motion-safe:animate-pulse"
                        style={{ animationDelay: `${d * 160}ms` }}
                      />
                    ))}
                  </span>
                )}
              </li>
            )
          })}
        </ol>

        <p className="mt-7 text-center text-[11px] text-muted-foreground">
          Secured by Google · Eng-Mart never sees your password
        </p>
      </div>

      {/* Clerk's bot protection mounts its CAPTCHA here during a first-time
          sign-up. Without this element Clerk logs a warning and falls back to
          an invisible widget, which is less reliable. */}
      <div id="clerk-captcha" className="mt-4 flex justify-center empty:hidden" />

      {/* No Clerk component is rendered here on purpose — the handshake runs
          imperatively in the effect above. See the comment there. */}
    </Shell>
  )
}

export default function SsoCallbackPage() {
  // Same rule as the button: no Clerk hooks may run without a ClerkProvider
  // above them, or this route fails to prerender and takes the build with it.
  // Unreachable in normal use — nothing links here when Clerk is off.
  if (!PUBLISHABLE_KEY) {
    return (
      <Shell>
        <div className="bg-card border border-border rounded-2xl shadow-xl p-7 text-center">
          <h1 className="text-lg font-extrabold text-foreground">Google sign-in is unavailable</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Please sign in with your email and password.
          </p>
          <Link href="/login" className="btn-primary mt-6 w-full justify-center text-sm py-2.5">
            Back to sign in
          </Link>
        </div>
      </Shell>
    )
  }

  // useSearchParams needs a Suspense boundary to keep the route static-safe.
  return (
    <Suspense fallback={<Shell><div className="h-64" /></Shell>}>
      <SsoCallbackInner />
    </Suspense>
  )
}
