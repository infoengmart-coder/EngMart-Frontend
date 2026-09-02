'use client'

/**
 * Google Analytics 4 + Vercel Analytics.
 *
 * `@vercel/analytics` was already a dependency but had never been imported
 * anywhere, so the site collected nothing at all — there was no way to answer
 * "how many people visited today".
 *
 * The two tools answer different questions and are both worth having:
 *   • GA4 — how many visitors, from where, what they viewed. Free.
 *   • Vercel Analytics — real Core Web Vitals from real visitors, which is a
 *     ranking signal Search Console only reports on a 28-day lag.
 *
 * Google Search Console needs no script — verification is a meta tag, set in
 * app/layout.tsx.
 *
 * ── On the measurement ID living in the source ──
 * A GA4 measurement ID is not a secret. It is emitted into the HTML of every
 * page by design, and anyone can read it with View Source; it grants no access
 * to the analytics account. Hardcoding the default means the site reports from
 * the first deploy with no dashboard step to forget — NEXT_PUBLIC_* values are
 * baked in at build time, so a variable added in Vercel later does nothing
 * until someone redeploys. The environment variable still wins when set, so a
 * fork or a second property can override it.
 */

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'

const GA_ID = (process.env.NEXT_PUBLIC_GA_ID || 'G-QYRWW3QT5T').trim()

/**
 * Hosts allowed to report to the live GA property.
 *
 * Vercel gives every branch and pull request its own *.vercel.app deployment,
 * and localhost runs constantly during development. Without this gate all of
 * that traffic lands in the same property as real customers, and the numbers
 * the client is shown are quietly wrong — inflated by the developers looking
 * at it. Checking the hostname at runtime is what makes that impossible,
 * rather than relying on per-environment variables being set correctly.
 */
const PRODUCTION_HOSTS = ['eng-mart.com', 'www.eng-mart.com']

export function Analytics() {
  // Resolved after mount: `window` does not exist during the server render.
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    setIsProduction(PRODUCTION_HOSTS.includes(window.location.hostname))
  }, [])

  return (
    <>
      {isProduction && GA_ID && (
        <>
          {/*
            afterInteractive, not beforeInteractive: analytics must never sit
            on the critical path. Loading gtag ahead of hydration delays the
            largest contentful paint — which would damage the very Core Web
            Vitals score this is here to measure.
          */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      )}

      {/* Free on any Vercel plan, and a no-op anywhere else. */}
      <VercelAnalytics />
    </>
  )
}
