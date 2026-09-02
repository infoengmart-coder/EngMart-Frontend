/**
 * Brand-wide discounts — the storefront half.
 *
 * The admin sets one percentage per brand (Admin → Discounts). Every product of
 * that brand is then sold at that percentage off, and the saving has to appear
 * identically on the product card, the product page, quick view, the cart, the
 * checkout summary and the final receipt.
 *
 * This file mirrors `apps/orders/serializers.py::_resolve_lines` exactly. The
 * server is the authority — it re-prices every line from the catalog and
 * ignores whatever the browser sends — but the two must agree to the paisa, or
 * the customer is shown one number and charged another.
 *
 * The rule that matters, and the one worth getting right:
 *
 *     the discount is applied PER LINE, never to the cart total
 *
 * A basket holding an ABB item at 20% off and a CHINT item at 10% off has no
 * single meaningful percentage. Blending them overcharges one brand and
 * undercharges the other; discounting each line by its own brand's rate and
 * then summing is both correct and what the receipt has to itemise.
 */
'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getBrandDiscounts, type Brand, type BrandDiscount } from '@/lib/api'

/** Round to whole paisa — matches the backend's ROUND_HALF_UP quantise. */
function money(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100
}

/** Clamp anything that arrives from an API or localStorage into 0–100. */
export function safePercent(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(n, 100)
}

/**
 * The discount in force for a brand object embedded in a product response.
 *
 * The backend already zeroes `discount_percent` while a campaign is paused, so
 * there is no "active" flag to re-check here.
 */
export function brandDiscountPercent(
  brand: Brand | { discount_percent?: number | string } | string | null | undefined,
): number {
  if (!brand || typeof brand === 'string') return 0
  return safePercent((brand as { discount_percent?: number }).discount_percent)
}

/** Money taken off one line: unit price × quantity × percent. */
export function lineDiscount(unitPrice: number, quantity: number, percent: number): number {
  const pct = safePercent(percent)
  if (pct <= 0) return 0
  const gross = money(unitPrice) * Math.max(0, quantity)
  return Math.min(money(gross * (pct / 100)), money(gross))
}

/** A single unit's price after the brand discount. */
export function discountedUnitPrice(unitPrice: number, percent: number): number {
  const pct = safePercent(percent)
  if (pct <= 0) return money(unitPrice)
  return money(money(unitPrice) * (1 - pct / 100))
}

export type BasketLine = {
  unitPrice: number
  quantity: number
  discountPercent?: number
  isPriceOnRequest?: boolean
}

export type BasketTotals = {
  /** Sum of unit price × quantity, before any discount. */
  gross: number
  /** Total money taken off by brand discounts. */
  brandDiscount: number
  /** gross − brandDiscount. What promo codes and GST are then applied to. */
  net: number
  /** True when at least one line carries a brand discount. */
  hasDiscount: boolean
}

/**
 * Total a basket that may mix brands on different discounts.
 *
 * Price-on-request lines contribute nothing to either figure: there is no
 * agreed price yet, so there is nothing to take a percentage of.
 */
export function totalBasket(lines: BasketLine[]): BasketTotals {
  let gross = 0
  let brandDiscount = 0
  for (const line of lines) {
    if (line.isPriceOnRequest) continue
    gross += money(line.unitPrice) * Math.max(0, line.quantity)
    brandDiscount += lineDiscount(line.unitPrice, line.quantity, line.discountPercent ?? 0)
  }
  gross = money(gross)
  brandDiscount = money(Math.min(brandDiscount, gross))
  return {
    gross,
    brandDiscount,
    net: money(gross - brandDiscount),
    hasDiscount: brandDiscount > 0,
  }
}

// ─── Live lookup, for surfaces that have no product payload ──────────────
//
// The cart stores a snapshot of each item, including the percentage that was
// running when it was added. A basket can then sit in localStorage for weeks
// while the campaign changes or ends. So the cart and checkout re-read the
// current percentages here and use those instead — the snapshot is only ever a
// fallback for when the lookup has not loaded yet.

type DiscountMap = Record<string, BrandDiscount>

type BrandDiscountCtx = {
  /** Keyed by brand slug AND by lowercased brand name. */
  discounts: DiscountMap
  loaded: boolean
  /** Today's percentage for a cart line, falling back to its snapshot. */
  percentFor: (item: { brandSlug?: string; brand?: string; discountPercent?: number }) => number
  labelFor: (item: { brandSlug?: string; brand?: string }) => string
}

const Ctx = createContext<BrandDiscountCtx | null>(null)

function keyOf(value: string | undefined | null): string {
  return (value || '').trim().toLowerCase()
}

export function BrandDiscountProvider({ children }: { children: React.ReactNode }) {
  const [discounts, setDiscounts] = useState<DiscountMap>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getBrandDiscounts()
      .then(rows => {
        if (cancelled) return
        const map: DiscountMap = {}
        for (const row of rows || []) {
          // Indexed by slug and by name: cart lines saved before this feature
          // existed only carry the brand's display name.
          map[keyOf(row.slug)] = row
          map[keyOf(row.name)] = row
        }
        setDiscounts(map)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const value = useMemo<BrandDiscountCtx>(() => {
    const lookup = (item: { brandSlug?: string; brand?: string }) =>
      discounts[keyOf(item.brandSlug)] || discounts[keyOf(item.brand)] || null

    return {
      discounts,
      loaded,
      percentFor: (item) => {
        const hit = lookup(item)
        if (hit) return safePercent(hit.discount_percent)
        // Before the lookup resolves, show the snapshot rather than flashing
        // the undiscounted price and then correcting it. Once loaded, a brand
        // missing from the response genuinely has no discount, so the snapshot
        // is discarded — an expired campaign never keeps discounting.
        return loaded ? 0 : safePercent(item.discountPercent)
      },
      labelFor: (item) => lookup(item)?.discount_label || '',
    }
  }, [discounts, loaded])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/**
 * Live brand discounts.
 *
 * Safe to call outside the provider — it degrades to "use whatever percentage
 * the line was saved with", so no surface can crash for want of this context.
 */
export function useBrandDiscounts(): BrandDiscountCtx {
  const ctx = useContext(Ctx)
  if (ctx) return ctx
  return {
    discounts: {},
    loaded: false,
    percentFor: (item) => safePercent(item.discountPercent),
    labelFor: () => '',
  }
}
