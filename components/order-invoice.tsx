'use client'

/**
 * Printable invoice, laid out to match the Engineering Mart quotation
 * letterhead the client supplied.
 *
 * Rendered on every order detail page but hidden on screen — only the print
 * stylesheet reveals it (`hidden print:block`). "Print Invoice" therefore
 * produces this document rather than a screenshot of the web page, which is
 * why the on-screen layout can stay a rich order tracker while the printout
 * stays a clean A4 business document.
 *
 * IMPORTANT — every figure is the order's real, STORED figure. GST and the COD
 * charge are snapshotted onto the order when it is placed, so reprinting an old
 * invoice after the admin changes the GST rate still shows the rate that
 * customer actually paid. Rows appear only when non-zero, and the lines always
 * reconcile to `order.total`.
 */

import Image from 'next/image'
import { formatPrice } from '@/lib/api'
import type { Order } from '@/lib/account-context'
import type { SiteSettingsData } from '@/lib/api'
import { chargesFromOrder, gstLabel } from '@/lib/charges'

interface OrderInvoiceProps {
  order: Order
  site: SiteSettingsData
}

/** "2026-08-25" → "25 August 2026"; falls back to the raw string. */
function formatInvoiceDate(raw: string): string {
  if (!raw) return ''
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function OrderInvoice({ order, site }: OrderInvoiceProps) {
  // Read back the charges the order was actually placed with. GST and the COD
  // fee are snapshotted on the order row, so an invoice reprinted after the
  // admin changes the rate still shows what the customer paid.
  const c = chargesFromOrder(order)
  // The brand share is broken OUT of the total discount rather than added to
  // it: `discount` already contains it, so the two rows must sum back to `c.discount`.
  const brandDiscount = Math.min(Math.max(order.brandDiscount || 0, 0), c.discount)
  const otherDiscount = c.discount - brandDiscount
  const hasDiscount = c.discount > 0
  const hasTax = c.tax > 0
  const hasCod = c.codFee > 0
  // Anything the stored total contains that these lines do not account for.
  // Normally zero; a non-zero value means a legacy order predating these
  // fields, and printing it keeps the invoice adding up.
  const adjustment = c.total - (c.taxable + c.tax + c.codFee)

  return (
    <div className="hidden print:block invoice-sheet text-[#1a1a1a]">
      {/* ── Letterhead ── */}
      <div className="flex items-start justify-between gap-6 pb-4">
        <Image
          src="/header_logo.png"
          alt="Engineering Mart"
          width={260}
          height={87}
          className="h-16 w-auto object-contain"
        />
      </div>

      <div className="border-t-[3px] border-[#1e3a5f]" />

      {/* ── Parties and references ── */}
      <div className="grid grid-cols-3 gap-6 items-start pt-5">
        <div className="col-span-1 text-[11px] leading-6">
          <p><span className="font-semibold">Company Name:</span> {order.companyName || '-'}</p>
          <p><span className="font-semibold">Contact Person:</span> {order.customerName || '-'}</p>
          <p><span className="font-semibold">Project:</span> -</p>
        </div>

        <div className="col-span-1 text-center">
          <h1 className="text-2xl font-extrabold tracking-wide text-[#1e3a5f]">INVOICE</h1>
        </div>

        <div className="col-span-1 text-[11px] leading-6">
          <p><span className="font-semibold">Date:</span> {formatInvoiceDate(order.date)}</p>
          <p><span className="font-semibold">Our Reference:</span> {order.id}</p>
          <p><span className="font-semibold">Your Reference:</span> -</p>
        </div>
      </div>

      <div className="border-t border-[#d4d4d4] mt-5" />

      {/* ── Subject ── */}
      <p className="text-[12px] font-bold py-3">
        Subject: INVOICE FOR COMPONENTS
      </p>

      <div className="border-t border-[#d4d4d4]" />

      {/* ── Line items ── */}
      <table className="w-full text-[11px] mt-4 border-collapse">
        <thead>
          <tr className="border-b-2 border-[#1e3a5f] text-left">
            <th className="py-2 pr-2 font-bold w-[7%]">Item.</th>
            <th className="py-2 pr-2 font-bold">Description</th>
            <th className="py-2 px-2 font-bold text-right w-[8%]">Qty</th>
            <th className="py-2 px-2 font-bold text-right w-[16%]">Unit Price</th>
            <th className="py-2 pl-2 font-bold text-right w-[18%]">Total (PKR)</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={`${item.slug}-${index}`} className="border-b border-[#ececec] align-top">
              <td className="py-2.5 pr-2">{index + 1}</td>
              <td className="py-2.5 pr-2">
                {item.name}
                {item.brand ? ` - ${item.brand}` : ''}
                {item.catNo ? ` MODEL: ${item.catNo}` : ''}
                {/* Named on the line it applies to, so a mixed-brand invoice
                    explains where the "Brand Discount" total came from. */}
                {(item.discountPercent || 0) > 0 && (
                  <span className="block text-[10px] text-[#b91c1c]">
                    Brand discount applied: {item.discountPercent}%
                  </span>
                )}
              </td>
              <td className="py-2.5 px-2 text-right">{item.quantity}</td>
              <td className="py-2.5 px-2 text-right">
                {item.price > 0 ? `Rs. ${item.price.toLocaleString('en-PK')}` : 'On Request'}
              </td>
              <td className="py-2.5 pl-2 text-right">
                {item.price > 0
                  ? `Rs. ${(item.price * item.quantity).toLocaleString('en-PK')}`
                  : 'On Request'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <table className="w-full text-[11px] border-collapse">
        <tbody>
          <tr>
            <td className="py-2 text-right pr-4">Subtotal</td>
            <td className="py-2 text-right w-[18%]">
              Rs. {c.subtotal.toLocaleString('en-PK')}
            </td>
          </tr>

          {brandDiscount > 0 && (
            <tr>
              <td className="py-2 text-right pr-4">Brand Discount</td>
              <td className="py-2 text-right text-[#15803d]">
                -Rs. {brandDiscount.toLocaleString('en-PK')}
              </td>
            </tr>
          )}

          {otherDiscount > 0 && (
            <tr>
              <td className="py-2 text-right pr-4">
                Discount{order.discountCode ? ` (${order.discountCode})` : ''}
              </td>
              <td className="py-2 text-right text-[#15803d]">
                -Rs. {otherDiscount.toLocaleString('en-PK')}
              </td>
            </tr>
          )}

          {hasTax && (
            <tr>
              <td className="py-2 text-right pr-4">{gstLabel(c.gstPercent)}</td>
              <td className="py-2 text-right">
                +Rs. {c.tax.toLocaleString('en-PK')}
              </td>
            </tr>
          )}

          {hasCod && (
            <tr>
              <td className="py-2 text-right pr-4">COD Charges</td>
              <td className="py-2 text-right">
                +Rs. {c.codFee.toLocaleString('en-PK')}
              </td>
            </tr>
          )}

          {Math.abs(adjustment) >= 1 && (
            <tr>
              <td className="py-2 text-right pr-4">
                {adjustment > 0 ? 'Delivery / Handling' : 'Adjustment'}
              </td>
              <td className="py-2 text-right">
                {adjustment > 0 ? '+' : '-'}Rs. {Math.abs(adjustment).toLocaleString('en-PK')}
              </td>
            </tr>
          )}

          <tr className="bg-[#f1f1f1]">
            <td className="py-3 text-right pr-4 font-bold">
              Total Amount{hasTax ? ' with GST' : ''} --- PKR
            </td>
            <td className="py-3 text-right font-extrabold">
              Rs. {c.total.toLocaleString('en-PK')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Terms ── */}
      <div className="mt-6 text-[10px] leading-[1.7]">
        <p className="text-[12px] font-bold mb-2">Terms &amp; Conditions:</p>

        <p className="font-bold">Delivery:</p>
        <p>12 to 16 weeks</p>
        <p>
          The delivery schedule will be applicable from the date of receipt of your
          technically / commercially confirmed order alongwith advance payment.
        </p>

        <p className="font-bold mt-2">Payment:</p>
        <p>We request for 100% advance payment before delivery.</p>
        <p>Our quoted price includes GST, it will be calculated additionally.</p>

        <p className="font-bold mt-2">Warranty:</p>
        <p>1 year warranty at the time of delivery.</p>

        <p className="font-bold mt-2">Validity:</p>
        <p>
          If any variation found in equipment/material prices within 15 days, the
          quoted amount will be revised.
        </p>

        <p className="mt-4">Best Regards:</p>
        <p className="font-bold text-[11px]">Emart Enterprises</p>
      </div>

      {/* ── Footer. Contact details come from site settings, so changing the
             number in the admin Contact tab updates the invoice too. ── */}
      <div className="invoice-footer mt-8 pt-2 border-t border-[#d4d4d4] text-[9px] leading-5">
        <p>
          Tel: {site.phone}
          {site.url ? <span className="ml-4">{site.url.replace(/^https?:\/\//, '')}</span> : null}
        </p>
        {site.address && <p>Addr: {site.address}</p>}
      </div>
    </div>
  )
}
