'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAccount, OrderStatus } from '@/lib/account-context'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { mediaUrl } from '@/lib/api'
import { subscribeEngmartEvents } from '@/lib/events'
import { useSiteSettings } from '@/lib/site-settings'
import { OrderInvoice } from '@/components/order-invoice'
import { chargesFromOrder, gstLabel } from '@/lib/charges'
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
  RotateCcw,
  ExternalLink,
  MapPin,
  CreditCard,
  Printer,
  ShieldCheck,
  Sparkles
} from 'lucide-react'

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; border: string; icon: any; desc: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', icon: Clock, desc: 'We are verifying payment status and stock availability.' },
  Confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/50', icon: CheckCircle2, desc: 'Your order has been confirmed and is scheduled for packing.' },
  Packaging: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/50', icon: Package, desc: 'Your items are being packed in our Karachi warehouse.' },
  Shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/50', icon: Truck, desc: 'Your package has been handed over to the courier.' },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: CheckCircle2, desc: 'Your order was successfully delivered. Thank you!' },
  Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/50', icon: AlertCircle, desc: 'This order was cancelled.' },
  'Return Requested': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/50', icon: AlertCircle, desc: 'A return request has been submitted for verification.' }
}

const STEPPER_STAGES: OrderStatus[] = ['Pending', 'Confirmed', 'Packaging', 'Shipped', 'Delivered']

const STEPPER_STAGE_META: Record<string, {
  label: string
  icon: any
  gradient: string
  activeBg: string
  activeText: string
  ringColor: string
}> = {
  Pending: {
    label: 'Pending',
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
    activeBg: 'bg-amber-500',
    activeText: 'text-amber-600',
    ringColor: 'ring-amber-500/30',
  },
  Confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    gradient: 'from-blue-600 to-indigo-600',
    activeBg: 'bg-blue-600',
    activeText: 'text-blue-600',
    ringColor: 'ring-blue-500/30',
  },
  Packaging: {
    label: 'Packaging',
    icon: Package,
    gradient: 'from-purple-600 to-indigo-500',
    activeBg: 'bg-purple-600',
    activeText: 'text-purple-600',
    ringColor: 'ring-purple-500/30',
  },
  Shipped: {
    label: 'Shipped',
    icon: Truck,
    gradient: 'from-sky-500 to-blue-600',
    activeBg: 'bg-sky-500',
    activeText: 'text-sky-500',
    ringColor: 'ring-sky-500/30',
  },
  Delivered: {
    label: 'Delivered',
    icon: ShieldCheck,
    gradient: 'from-emerald-500 to-teal-600',
    activeBg: 'bg-emerald-600',
    activeText: 'text-emerald-600',
    ringColor: 'ring-emerald-500/30',
  },
}

function formatStepDate(raw?: string): string {
  if (!raw) return ''
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw.split('T')[0] || raw
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${dateStr} · ${timeStr}`
  } catch {
    return raw
  }
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { orders, ordersLoaded, cancelOrder, requestReturn, reorderItems, refreshOrders } = useAccount()
  const { settings: SITE } = useSiteSettings()
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'return' | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    refreshOrders()
    return subscribeEngmartEvents(() => {
      refreshOrders()
    })
  }, [refreshOrders])

  const order = orders.find(o => o.id === id)

  // Skeleton order layout while the API load settles — never flash "Not Found" first
  if (!ordersLoaded) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="skeleton h-4 w-40" />

        {/* Header card skeleton */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="skeleton h-6 w-32" />
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
            <div className="skeleton h-3 w-56 max-w-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="skeleton h-10 w-32 rounded-lg" />
            <div className="skeleton h-10 w-36 rounded-lg" />
          </div>
        </div>

        {/* Stepper skeleton */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="skeleton h-4 w-44 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3">
                <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex flex-col md:items-center">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-2.5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items + address skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
            <div className="skeleton h-4 w-48" />
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-3/4" />
                  <div className="skeleton h-2.5 w-32" />
                </div>
                <div className="skeleton h-3 w-20" />
              </div>
            ))}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-4 w-full" />
            </div>
          </div>
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
              <div className="skeleton h-4 w-36 mb-4" />
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-2">
              <div className="skeleton h-4 w-36 mb-4" />
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-card border border-border rounded-3xl p-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-extrabold text-foreground">Order Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          The order number you requested could not be located in your purchase history.
        </p>
        <Link href="/account/orders" className="btn-primary text-xs px-6 py-3 mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    )
  }

  const badge = STATUS_CONFIG[order.status]
  const StatusIcon = badge.icon
  const fallbackImg = '/product-placeholder.svg'

  // Global @media print CSS hides nav/header/footer/aside/.no-print,
  // so printing this page yields a clean invoice.
  const handlePrintInvoice = () => {
    window.print()
  }

  const handleReorder = () => {
    reorderItems(order.items)
    // Redirect to cart
    router.push('/cart')
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return
    setConfirmBusy(true)
    setActionError('')
    try {
      // These now hit the API, so they can genuinely fail (e.g. the order was
      // shipped in the meantime). Surface that instead of silently pretending.
      if (confirmAction === 'cancel') await cancelOrder(order.id)
      else await requestReturn(order.id)
      setConfirmAction(null)
    } catch (err: any) {
      setActionError(err?.message || 'That did not work. Please try again or contact us.')
      setConfirmAction(null)
    } finally {
      setConfirmBusy(false)
    }
  }

  const showCancelButton = order.status === 'Pending' || order.status === 'Confirmed'
  const showReturnButton = order.status === 'Delivered' // Simplification: any delivered order can request a return

  return (
    <>
    {/* The print-only invoice. Kept OUTSIDE the on-screen tree so the print
        stylesheet can hide everything else without hiding this too. */}
    <OrderInvoice order={order} site={SITE} />

    <div className="space-y-6 print-hide-when-invoice">
      {actionError && (
        <div className="no-print rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
          {actionError}
        </div>
      )}

      {/* Back button */}
      <div className="no-print">
        <Link href="/account/orders" className="text-xs text-muted-foreground hover:text-primary font-bold flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Order History
        </Link>
      </div>

      {/* Header card with Actions */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-foreground">{order.id}</h2>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {order.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Placed on <span className="font-bold text-slate-700">{order.date}</span> • Paid with {order.paymentMethod}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          {showCancelButton && (
            <button
              onClick={() => setConfirmAction('cancel')}
              disabled={confirmBusy}
              className="btn-secondary text-xs px-4 py-2.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}

          {showReturnButton && (
            <button
              onClick={() => setConfirmAction('return')}
              disabled={confirmBusy}
              className="btn-secondary text-xs px-4 py-2.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Request Return
            </button>
          )}

          <button
            onClick={handleReorder}
            className="btn-secondary text-xs px-4 py-2.5 flex items-center gap-1.5 text-primary border-primary/20 hover:bg-primary/5"
          >
            <RefreshCw className="w-4 h-4" /> Reorder Items
          </button>

          <button
            onClick={handlePrintInvoice}
            className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-none border-0"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      </div>

      {/* Stepper Timeline Visualizer */}
      {order.status !== 'Cancelled' && order.status !== 'Return Requested' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm no-print relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Fulfillment Progress
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shrink-0 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Current Status: {order.status}</span>
            </div>
          </div>

          <div className="relative pt-4 pb-2">
            {/* Desktop progress track bar */}
            {(() => {
              const currentIdx = STEPPER_STAGES.indexOf(order.status)
              const pct = (currentIdx / (STEPPER_STAGES.length - 1)) * 100
              return (
                <div className="absolute hidden md:block left-8 right-8 top-[38px] h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full z-0 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )
            })()}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
              {STEPPER_STAGES.map((stage, idx) => {
                const currentIdx = STEPPER_STAGES.indexOf(order.status)
                const isCompleted = idx <= currentIdx
                const isCurrent = idx === currentIdx
                const meta = STEPPER_STAGE_META[stage] || {
                  label: stage,
                  icon: CheckCircle2,
                  gradient: 'from-blue-500 to-indigo-600',
                  activeBg: 'bg-primary',
                  activeText: 'text-primary',
                  ringColor: 'ring-primary/20',
                }
                const StageIcon = meta.icon
                const stepTime = order.timeline.find(t => t.status === stage)?.timestamp || (isCompleted ? (order.timeline[0]?.timestamp || order.date) : undefined)
                const formattedTime = formatStepDate(stepTime)

                return (
                  <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-3">
                    {/* Circle icon container */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                          isCompleted
                            ? `bg-gradient-to-br ${meta.gradient} text-white shadow-md ${
                                isCurrent ? `ring-4 ${meta.ringColor} scale-110 shadow-lg` : ''
                              }`
                            : 'bg-secondary text-muted-foreground border-2 border-border'
                        }`}
                      >
                        <StageIcon className="w-5 h-5" />
                      </div>
                      {isCurrent && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black animate-bounce">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 justify-start md:justify-center">
                        <span className={`text-xs leading-tight ${isCompleted ? 'text-foreground font-extrabold' : 'text-muted-foreground font-semibold'}`}>
                          {meta.label}
                        </span>
                      </div>
                      {formattedTime ? (
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1 bg-secondary/60 px-2 py-0.5 rounded-full inline-block">
                          {formattedTime}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/60 italic mt-1 font-medium">Upcoming step</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Courier Tracker Details */}
      {order.courier && order.trackingNumber && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-primary/15 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Courier Shipment Info</h4>
              <p className="text-sm font-extrabold text-slate-950 mt-1">
                {order.courier} • <span className="font-mono">{order.trackingNumber}</span>
              </p>
            </div>
          </div>
          <a
            href={order.trackingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-1 align-middle justify-center self-start sm:self-auto shadow-sm"
          >
            Track on Courier Site <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Grid: Items + Address */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Order Items */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-slate-100 pb-3">
            Ordered Line Items ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => {
              const itemImg = item.image ? (mediaUrl(item.image) || fallbackImg) : fallbackImg
              return (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-border shrink-0 p-1 flex items-center justify-center shadow-2xs">
                      <img
                        src={itemImg}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-950 leading-tight mb-1">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">Part #: {item.catNo}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        PKR {item.price.toLocaleString('en-PK')} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-950">
                      PKR {(item.price * item.quantity).toLocaleString('en-PK')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pricing Breakdown Summary.
              Every figure is read back off the stored order, so a customer
              tracking an old order still sees the GST rate and COD charge that
              were in force the day they bought — not today's settings. */}
          {(() => {
            const c = chargesFromOrder(order)
            return (
              <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800">PKR {c.subtotal.toLocaleString('en-PK')}</span>
                </div>

                {c.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount{order.discountCode ? ` (${order.discountCode})` : ''}</span>
                    <span>-PKR {c.discount.toLocaleString('en-PK')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery / Shipping</span>
                  <span className="text-emerald-600 font-extrabold">FREE</span>
                </div>

                {c.tax > 0 && (
                  <div className="flex justify-between">
                    <span>{gstLabel(c.gstPercent)}</span>
                    <span className="text-slate-800">+PKR {c.tax.toLocaleString('en-PK')}</span>
                  </div>
                )}

                {c.codFee > 0 && (
                  <div className="flex justify-between text-slate-800">
                    <span>COD Charges</span>
                    <span>+PKR {c.codFee.toLocaleString('en-PK')}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-2.5 flex justify-between text-sm text-foreground font-extrabold">
                  <span>Grand Total</span>
                  <span className="text-primary">PKR {c.total.toLocaleString('en-PK')}</span>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Right Col: Logistics Address & Payment Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Address Details */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-muted-foreground" /> Delivery Address
            </h3>
            <div className="text-xs space-y-1 text-muted-foreground font-semibold">
              <p className="text-foreground font-bold">{order.shippingAddress.name}</p>
              {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
              {order.shippingAddress.postalCode && <p>Postal Code: {order.shippingAddress.postalCode}</p>}
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2 text-foreground">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Method details */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-muted-foreground" /> Payment & Billing
            </h3>
            <div className="text-xs space-y-1 text-muted-foreground font-semibold">
              <p className="text-foreground font-bold">{order.paymentMethod}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Payment Status:</span>
                <span className={`text-[10px] font-bold uppercase ${
                  order.paymentStatus === 'Paid' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded' :
                  order.paymentStatus === 'Unpaid' ? 'text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded' :
                  'text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel / Return confirmation (replaces native confirm()) */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction === 'return' ? 'Request a return?' : 'Cancel this order?'}
        message={confirmAction === 'return'
          ? `Submit a return request for order ${order.id}? Our team will contact you to verify the details.`
          : `Order ${order.id} will be cancelled and cannot be reinstated. Do you want to continue?`}
        confirmLabel={confirmAction === 'return' ? 'Request Return' : 'Cancel Order'}
        cancelLabel="Keep Order"
        danger={confirmAction !== 'return'}
        busy={confirmBusy}
        onConfirm={handleConfirmAction}
        onClose={() => { if (!confirmBusy) setConfirmAction(null) }}
      />
    </div>
    </>
  )
}
