/**
 * GST and cash-on-delivery charge maths, shared by every surface that shows a
 * total: cart, checkout, order tracking, invoice, quotation and the admin order
 * view.
 *
 * This mirrors `apps/orders/charges.py` line for line. The server is the
 * authority — it recalculates and stores these figures when the order is
 * created — but the two must agree exactly, or the customer sees one number at
 * checkout and a different one on the invoice.
 *
 * Order of operations (identical to the backend):
 *
 *     taxable = subtotal - discount
 *     tax     = taxable * gst%
 *     total   = taxable + tax + codFee
 *
 * GST is charged on the DISCOUNTED amount; the COD fee sits outside the tax
 * base so a delivery charge is never itself taxed.
 */

import type { SiteSettingsData } from '@/lib/api'

/** Round to whole paisa, matching the backend's ROUND_HALF_UP quantise. */
function money(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100
}

export type ChargeBreakdown = {
  subtotal: number
  discount: number
  /** Amount GST is charged on (subtotal less discount). */
  taxable: number
  /** Effective GST rate — 0 when GST is switched off. */
  gstPercent: number
  tax: number
  codFee: number
  total: number
}

/**
 * The configured GST rate. Zero means no GST.
 *
 * Mirrors `charges.gst_percent()` on the backend: the rate is the only
 * control, so an admin who types 18 gets 18% everywhere. A separate
 * `gst_enabled` flag used to gate this and defaulted to off, which made a
 * configured rate silently do nothing.
 */
export function gstPercentFrom(site: Pick<SiteSettingsData, 'gst_percent'>): number {
  const percent = Number(site?.gst_percent ?? 0)
  return Number.isFinite(percent) && percent > 0 ? percent : 0
}

/** The configured cash-on-delivery charge. */
export function codFeeFrom(site: Pick<SiteSettingsData, 'cod_fee'>): number {
  const fee = Number(site?.cod_fee ?? 0)
  return Number.isFinite(fee) && fee > 0 ? money(fee) : 0
}

/**
 * Preview the charges for a basket that has not been ordered yet.
 *
 * Used by checkout. `paymentMethod` decides whether the COD fee applies.
 */
export function previewCharges(
  site: SiteSettingsData,
  subtotal: number,
  discount: number,
  paymentMethod: string,
): ChargeBreakdown {
  const safeSubtotal = money(subtotal)
  const safeDiscount = money(discount)
  const taxable = Math.max(0, safeSubtotal - safeDiscount)

  const gstPercent = gstPercentFrom(site)
  const tax = gstPercent > 0 ? money(taxable * (gstPercent / 100)) : 0
  const codFee = paymentMethod === 'cod' ? codFeeFrom(site) : 0

  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    taxable,
    gstPercent,
    tax,
    codFee,
    total: money(taxable + tax + codFee),
  }
}

/**
 * Read the charges back off an order that has already been placed.
 *
 * These come from the stored snapshot, NOT from current site settings — an
 * order placed at 17% GST must keep showing 17% after the rate changes.
 */
export function chargesFromOrder(order: {
  subtotal?: number
  discount?: number
  gstPercent?: number
  tax?: number
  codFee?: number
  total?: number
}): ChargeBreakdown {
  const subtotal = money(order.subtotal ?? 0)
  const discount = money(order.discount ?? 0)
  const tax = money(order.tax ?? 0)
  const codFee = money(order.codFee ?? 0)
  const taxable = Math.max(0, subtotal - discount)

  return {
    subtotal,
    discount,
    taxable,
    gstPercent: Number(order.gstPercent ?? 0) || 0,
    tax,
    codFee,
    // Prefer the stored total: it is what the customer was actually charged,
    // even if a historic row predates these fields and does not add up.
    total: money(order.total ?? taxable + tax + codFee),
  }
}

/** Label for a tax line, e.g. "GST (18%)". Falls back when the rate is unknown. */
export function gstLabel(percent: number): string {
  if (!percent) return 'GST'
  // Trim "18.00" to "18" but keep a real fraction like "17.5".
  const rendered = Number.isInteger(percent) ? String(percent) : String(percent)
  return `GST (${rendered}%)`
}
