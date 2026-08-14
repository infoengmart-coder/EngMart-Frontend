'use client'

// Floating site furniture — the WhatsApp bubble and the cookie notice.
//
// Both are right for a storefront and wrong for a transitional auth screen.
// /sso-callback exists for a second or two while a sign-in completes; asking
// someone to make a cookie decision, or nudging them into WhatsApp, in the
// middle of that is noise at best. Worse, the cookie banner can move the
// session between localStorage and sessionStorage, which is exactly what the
// callback is writing to at that moment.

import { usePathname } from 'next/navigation'

import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { CookieConsent } from '@/components/cookie-consent'

/** Routes that render on their own, with no floating site furniture. */
const BARE_ROUTES = ['/sso-callback']

export function SiteChrome() {
  const pathname = usePathname()
  if (BARE_ROUTES.some(route => pathname?.startsWith(route))) return null

  return (
    <>
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}
