'use client'

/**
 * First-order welcome discount — client state.
 *
 * Three jobs:
 *   1. Decide whether a visitor should be shown the "sign up for 5% off" popup.
 *   2. Decide whether a customer who just signed in should see the celebration.
 *   3. Expose the discount so the cart and checkout can show the real total.
 *
 * The numbers here are for DISPLAY. `apps/orders/welcome.py` recomputes the
 * same discount when the order is written, so nothing a visitor does in their
 * browser can change what they are actually charged.
 *
 * Persistence rules (this is the fiddly part):
 *   - The popup is suppressed forever once dismissed or once the visitor signs
 *     in, using localStorage rather than sessionStorage. The client was
 *     explicit: closing the browser by accident and coming back must NOT show
 *     it again.
 *   - The celebration is a separate key, so a customer who dismissed the popup
 *     and signed in later still gets congratulated exactly once.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react'
import { getWelcomeDiscount } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useSiteSettings } from '@/lib/site-settings'

const LS_POPUP_DISMISSED = 'engmart_welcome_popup_dismissed_v1'
const LS_CELEBRATED = 'engmart_welcome_celebrated_v1'

/** localStorage throws in private-mode Safari; never let that break a page. */
function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    /* Storage unavailable — the popup may reappear next visit. Acceptable. */
  }
}

type Ctx = {
  /** Server-confirmed: this customer's next order carries the discount. */
  eligible: boolean
  /** Percentage off, from site settings (default 5). */
  percent: number
  /** True until the eligibility check has settled. */
  loading: boolean
  /** Show the "get 5% off" popup to this visitor right now? */
  shouldShowPopup: boolean
  /** Show the congratulations animation right now? */
  shouldCelebrate: boolean
  dismissPopup: () => void
  dismissCelebration: () => void
  /** Discount payable on a given subtotal — 0 when not eligible. */
  discountFor: (subtotal: number) => number
  /** Re-check after an order is placed (the discount is then spent). */
  refresh: () => Promise<void>
}

const WelcomeDiscountContext = createContext<Ctx>({
  eligible: false,
  percent: 5,
  loading: true,
  shouldShowPopup: false,
  shouldCelebrate: false,
  dismissPopup: () => {},
  dismissCelebration: () => {},
  discountFor: () => 0,
  refresh: async () => {},
})

export function WelcomeDiscountProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()
  const { settings } = useSiteSettings()

  const [eligible, setEligible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [popupDismissed, setPopupDismissed] = useState(true)
  const [celebrated, setCelebrated] = useState(true)

  const offerEnabled = settings.welcome_discount_enabled !== false
  const percent = Number(settings.welcome_discount_percent ?? 5) || 5

  // Read persisted flags after mount. They start as "already dismissed" so the
  // popup can never flash during hydration before we know the real answer.
  useEffect(() => {
    setPopupDismissed(readFlag(LS_POPUP_DISMISSED))
    setCelebrated(readFlag(LS_CELEBRATED))
  }, [])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setEligible(false)
      setLoading(false)
      return
    }
    try {
      const info = await getWelcomeDiscount(0)
      setEligible(Boolean(info.eligible))
    } catch {
      // Never block the storefront on this. Assuming "not eligible" is the
      // safe direction: worst case we omit a discount the server would still
      // have applied at checkout, rather than promising one that vanishes.
      setEligible(false)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (authLoading) return
    refresh()
  }, [authLoading, refresh])

  // Signing in is itself the answer to the popup — never show it again.
  useEffect(() => {
    if (isAuthenticated && !popupDismissed) {
      writeFlag(LS_POPUP_DISMISSED)
      setPopupDismissed(true)
    }
  }, [isAuthenticated, popupDismissed])

  const dismissPopup = useCallback(() => {
    writeFlag(LS_POPUP_DISMISSED)
    setPopupDismissed(true)
  }, [])

  const dismissCelebration = useCallback(() => {
    writeFlag(LS_CELEBRATED)
    setCelebrated(true)
  }, [])

  const discountFor = useCallback(
    (subtotal: number) => {
      if (!eligible || !offerEnabled || !(subtotal > 0)) return 0
      // Round to whole paisa the same way the server does, so the figure the
      // customer sees in the cart matches the order to the last rupee.
      return Math.round(subtotal * (percent / 100) * 100) / 100
    },
    [eligible, offerEnabled, percent],
  )

  const value = useMemo<Ctx>(() => ({
    eligible: eligible && offerEnabled,
    percent,
    loading: loading || authLoading,
    // Admins are running the shop, not shopping — never interrupt them.
    shouldShowPopup:
      offerEnabled && !authLoading && !isAuthenticated && !popupDismissed && !isAdmin,
    shouldCelebrate:
      offerEnabled && !authLoading && isAuthenticated && eligible && !celebrated && !isAdmin,
    dismissPopup,
    dismissCelebration,
    discountFor,
    refresh,
  }), [
    eligible, offerEnabled, percent, loading, authLoading, isAuthenticated,
    isAdmin, popupDismissed, celebrated, dismissPopup, dismissCelebration,
    discountFor, refresh,
  ])

  return (
    <WelcomeDiscountContext.Provider value={value}>
      {children}
    </WelcomeDiscountContext.Provider>
  )
}

export function useWelcomeDiscount() {
  return useContext(WelcomeDiscountContext)
}
