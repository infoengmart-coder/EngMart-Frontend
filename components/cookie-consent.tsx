'use client'

// Cookie / storage consent banner.
//
// Honest scope: this site sets no advertising or third-party tracking cookies.
// What it stores is the sign-in session, the cart, and display preferences —
// all of which are "strictly necessary" and legally do not require consent.
// The banner exists so visitors are told plainly what is stored and can choose
// to keep the session only for this visit, which is the one real choice here.
//
// Deliberately NOT done: a fake "Analytics / Marketing" toggle for trackers
// that do not exist. If analytics are added later, add a real toggle and make
// the script honour it.

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'engmart_cookie_choice'   // 'all' | 'essential'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        // Let the page paint first — a banner that appears with the content
        // competes with it and feels heavier than it is.
        const t = setTimeout(() => setShow(true), 1200)
        return () => clearTimeout(t)
      }
    } catch { /* storage blocked — no banner, nothing is being stored anyway */ }
  }, [])

  const choose = (choice: 'all' | 'essential') => {
    try {
      localStorage.setItem(CONSENT_KEY, choice)
      // "This visit only" must not silently keep an existing long-lived
      // session — move it to sessionStorage semantics by clearing the
      // persistent copy. The user stays signed in for this tab.
      if (choice === 'essential') {
        const tokens = localStorage.getItem('engmart_tokens')
        const user = localStorage.getItem('engmart_user')
        if (tokens) { sessionStorage.setItem('engmart_tokens', tokens); localStorage.removeItem('engmart_tokens') }
        if (user) { sessionStorage.setItem('engmart_user', user); localStorage.removeItem('engmart_user') }
      }
    } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[130] p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
    >
      <div className="mx-auto max-w-3xl bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
              🍪 We use cookies to keep you signed in
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We store your sign-in session and cart so you don't have to start over
              on every visit. We don't use advertising or tracking cookies. See our{' '}
              <Link href="/terms" className="text-primary font-semibold hover:underline">
                Terms &amp; Privacy
              </Link>.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => choose('essential')}
              className="btn-secondary text-xs px-4 whitespace-nowrap"
            >
              This visit only
            </button>
            <button
              onClick={() => choose('all')}
              className="btn-primary text-xs px-5 whitespace-nowrap"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
