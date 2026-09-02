'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart'
import { createOrder, validatePromoCode, formatPrice, uploadPaymentSlip, type OrderResponse, type PromoValidationResult } from '@/lib/api'
import { useWelcomeDiscount } from '@/lib/welcome-discount'
import { previewCharges, gstLabel } from '@/lib/charges'
import { useBrandDiscounts, lineDiscount, totalBasket } from '@/lib/brand-discount'
import { useSiteSettings } from '@/lib/site-settings'
import { useAuth } from '@/lib/auth'
import { useAccount } from '@/lib/account-context'
import { emitEngmartEvent } from '@/lib/events'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import * as Lucide from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Shipping' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Review' },
]

const PAYMENT_METHODS = [
  { id: 'cod' as const, label: 'Cash on Delivery', sub: 'Pay when you receive your order', icon: 'DollarSign', color: 'text-emerald-600' },
  { id: 'bank' as const, label: 'Bank Transfer', sub: 'Transfer to our bank account', icon: 'Building2', color: 'text-primary' },
  { id: 'whatsapp' as const, label: 'WhatsApp Order', sub: 'Confirm via WhatsApp and pay manually', icon: 'MessageSquare', color: 'text-[var(--color-whatsapp)]' },
]

export default function CheckoutPage() {
  const { settings: SITE } = useSiteSettings()
  const { items, count, subtotal, clear, getItemKey, hydrated } = useCart()
  const { user } = useAuth()
  const { addresses, addAddress, registerOrder, refreshOrders } = useAccount()

  // Payment slip upload (bank transfer orders)
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipRef, setSlipRef] = useState('')
  const [slipUploading, setSlipUploading] = useState(false)
  const [slipDone, setSlipDone] = useState(false)
  const [slipError, setSlipError] = useState('')
  const slipInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'bank' | 'whatsapp'>('cod')
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '',
    address: '', city: 'Karachi', notes: '',
  })

  // Auto-fill checkout fields from logged in user or saved address
  useEffect(() => {
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
    let regPhone = typeof window !== 'undefined' ? localStorage.getItem('engmart_reg_phone') || '' : ''
    let regCompany = typeof window !== 'undefined' ? localStorage.getItem('engmart_reg_company') || '' : ''

    if (typeof window !== 'undefined' && user?.email) {
      try {
        const raw = localStorage.getItem(`engmart_extra_${user.email.toLowerCase().trim()}`)
        if (raw) {
          const extra = JSON.parse(raw)
          if (extra.phone) regPhone = extra.phone
          if (extra.company) regCompany = extra.company
        }
      } catch {}
    }

    const userName = user ? (user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username) : ''
    const userEmail = user?.email || ''
    const userCompany = user?.company || defaultAddr?.company || regCompany || ''
    const userPhone = defaultAddr?.phone || user?.phone || regPhone || ''
    const userAddress = defaultAddr?.addressLine1 || ''
    const userCity = defaultAddr?.city || 'Karachi'

    setForm(f => ({
      name: f.name || userName,
      email: f.email || userEmail,
      company: f.company || userCompany,
      phone: f.phone || userPhone,
      address: f.address || userAddress,
      city: f.city || userCity || 'Karachi',
      notes: f.notes,
    }))
  }, [user, addresses])

  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState<PromoValidationResult | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  // Brand-wide discounts, re-read live rather than trusted from the saved
  // basket — a cart can outlive the campaign it was filled under.
  const { percentFor } = useBrandDiscounts()
  const pricedItems = items.map(item => ({ ...item, percent: percentFor(item) }))
  // Per line, never on the total: a basket mixing brands on different
  // percentages has no single meaningful rate.
  const { brandDiscount, net: payableSubtotal } = totalBasket(
    pricedItems.map(l => ({
      unitPrice: l.unitPrice,
      quantity: l.quantity,
      discountPercent: l.percent,
      isPriceOnRequest: l.isPriceOnRequest,
    })),
  )

  // Discount precedence mirrors apps/orders/welcome.py exactly: an entered
  // promo code wins, and the first-order welcome discount only applies when no
  // code did. Displaying them stacked here would promise a saving the server
  // will not honour when it re-prices the order.
  const {
    discountFor,
    percent: welcomePercent,
    refresh: refreshWelcomeDiscount,
  } = useWelcomeDiscount()
  const promoDiscount = promoResult?.valid ? parseFloat(promoResult.discount_amount || '0') : 0
  // Promo and welcome offers apply to what is left AFTER brand discounts,
  // matching apps/orders/serializers.py — running them on the gross subtotal
  // would hand back part of the same money twice.
  const welcomeDiscount = promoDiscount > 0 ? 0 : discountFor(payableSubtotal)
  const promoOrWelcome = promoDiscount > 0 ? promoDiscount : welcomeDiscount
  // What comes off the subtotal in total. GST is charged on the remainder.
  const discountAmount = brandDiscount + promoOrWelcome

  // GST and the COD charge now come from site settings and are computed by the
  // same rules the server uses, so the total shown here is the total stored on
  // the order. The COD fee used to be a hardcoded 100 that the backend never
  // actually added.
  const charges = previewCharges(SITE, subtotal, discountAmount, selectedPayment)
  const codFee = charges.codFee
  const taxAmount = charges.tax
  const totalAfterDiscount = charges.total

  const porItemCount = items.filter(i => i.isPriceOnRequest).length

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const next = () => { setStep(s => Math.min(s + 1, 3)); scrollTop() }
  const back = () => { setStep(s => Math.max(s - 1, 1)); scrollTop() }
  const goToStep = (id: number) => { setStep(id); scrollTop() }

  // Validate promo via API
  const handleApplyPromo = async () => {
    const code = promoCode.trim()
    if (!code) {
      setPromoError('Please enter a promo code.')
      return
    }
    setPromoLoading(true)
    setPromoError('')
    try {
      const result = await validatePromoCode(code, payableSubtotal)
      if (result.valid) {
        setPromoResult(result)
        setPromoError('')
      } else {
        setPromoResult(null)
        setPromoError(result.error || 'Invalid promo code.')
      }
    } catch {
      setPromoError('Failed to validate promo code. Please try again.')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoResult(null)
    setPromoCode('')
    setPromoError('')
  }

  // Submit order to backend
  const placeOrder = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const orderData = {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        company_name: form.company,
        shipping_address: form.address,
        city: form.city,
        notes: form.notes,
        payment_method: selectedPayment,
        promo_code: promoResult?.valid ? (promoResult.code || '') : '',
        items: items.map(item => ({
          product_id: item.productId,
          variant_id: item.variantId || null,
          product_name: item.name,
          variant_description: item.variantDescription || '',
          cat_no: item.catNo,
          brand_name: item.brand,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          is_price_on_request: item.isPriceOnRequest,
        })),
      }
      const result = await createOrder(orderData)
      setOrderResult(result)
      registerOrder(result)
      refreshOrders()
      // The welcome discount is a first-order offer, so placing this order
      // spends it. Re-ask the server rather than assuming, so the cart stops
      // advertising a discount the next checkout will not receive.
      refreshWelcomeDiscount()
      emitEngmartEvent('ORDER_CREATED', result)
      clear()

      // Automatically save shipping address to user's saved addresses
      if (form.address.trim()) {
        const existingAddress = addresses.find(
          a => a.addressLine1.trim().toLowerCase() === form.address.trim().toLowerCase() &&
               a.city.trim().toLowerCase() === form.city.trim().toLowerCase()
        )
        if (!existingAddress) {
          addAddress({
            name: form.name,
            company: form.company || '',
            phone: form.phone,
            addressLine1: form.address,
            city: form.city,
            province: 'Sindh',
            country: 'Pakistan',
            isDefault: addresses.length === 0,
          })
        }
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIcon = (stepId: number, className: string = "w-4 h-4") => {
    if (stepId === 1) return <Lucide.MapPin className={className} />
    if (stepId === 2) return <Lucide.CreditCard className={className} />
    return <Lucide.CheckCircle2 className={className} />
  }

  // Form validation
  const isStep1Valid = form.name.trim() && form.phone.trim() && form.email.trim() && form.address.trim()

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />

      {/* Page header */}
      <div className="pt-12 bg-card border-b border-border/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="breadcrumb mb-3" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/cart">Cart</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Checkout</span>
          </nav>
          <h1 className="text-3xl font-black text-foreground leading-tight">
            {orderResult ? '🎉 Order Confirmed' : <>Checkout</>}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {orderResult ? (
          /* ─── Order Success ─── */
          <motion.div
            className="max-w-2xl mx-auto text-center py-20 bg-card border border-border/60 rounded-[2rem] px-8 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-3xl mx-auto mb-6 border border-emerald-100">
              <Lucide.CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Order Received!</h2>

            {/* Order number badge */}
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-4 py-2 mb-4">
              <Lucide.Hash className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary font-mono">{orderResult.order_number}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-2 text-sm font-semibold">
              Thank you, <strong>{orderResult.customer_name}</strong>. Your order inquiry has been received.
            </p>

            {parseFloat(orderResult.discount_amount) > 0 && (
              <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-left mb-6 flex items-start gap-3 mt-4">
                <Lucide.Tag className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Wholesale Discount Applied</p>
                  <p className="text-[11px] text-emerald-600 leading-relaxed font-semibold mt-0.5">
                    Promo code <strong className="font-mono">{orderResult.promo_code_text}</strong> saved you{' '}
                    <strong>{formatPrice(parseFloat(orderResult.discount_amount))}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="max-w-sm mx-auto bg-background rounded-xl border border-border/60 p-4 text-left mb-6 mt-4">
              {/* What was actually ordered. This previously showed only totals,
                  so the customer's confirmation named none of the products. */}
              {orderResult.items.length > 0 && (
                <ul className="mb-3 space-y-2 border-b border-border pb-3">
                  {orderResult.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3 text-xs">
                      <span className="min-w-0">
                        <span className="block font-semibold text-foreground truncate">{it.product_name}</span>
                        {(it.variant_description || it.cat_no) && (
                          <span className="block text-[10px] text-muted-foreground truncate">
                            {it.variant_description || it.cat_no}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          Qty {it.quantity}
                          {parseFloat(it.discount_percent || '0') > 0 && (
                            <span className="ml-1.5 font-black text-rose-500">
                              -{parseFloat(it.discount_percent || '0')}% brand offer
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="shrink-0 font-bold text-foreground text-right">
                        {it.is_price_on_request
                          ? 'On request'
                          : formatPrice(parseFloat(it.line_total))}
                        {parseFloat(it.discount_amount || '0') > 0 && (
                          <span className="block text-[10px] font-semibold text-muted-foreground line-through">
                            {formatPrice(parseFloat(it.unit_price) * it.quantity)}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Items</span>
                  {/* Total UNITS, not line count — a 3-unit order used to say "1". */}
                  <span className="font-bold text-foreground">
                    {orderResult.items.reduce((n, it) => n + (it.quantity || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-semibold">Subtotal</span>
                  <span className="font-bold text-foreground">{formatPrice(parseFloat(orderResult.subtotal))}</span>
                </div>
                {/* `discount_amount` is the GRAND total taken off; the brand
                    share is broken out of it so the receipt explains itself
                    instead of showing one unlabelled deduction. */}
                {parseFloat(orderResult.brand_discount_amount || '0') > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span className="font-semibold">Brand discount</span>
                    <span className="font-bold">
                      -{formatPrice(parseFloat(orderResult.brand_discount_amount || '0'))}
                    </span>
                  </div>
                )}
                {parseFloat(orderResult.discount_amount) - parseFloat(orderResult.brand_discount_amount || '0') > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-semibold">
                      {orderResult.promo_code_text ? `Discount (${orderResult.promo_code_text})` : 'Discount'}
                    </span>
                    <span className="font-bold">
                      -{formatPrice(
                        parseFloat(orderResult.discount_amount)
                          - parseFloat(orderResult.brand_discount_amount || '0'),
                      )}
                    </span>
                  </div>
                )}
                {/* Straight off the created order, so the confirmation shows
                    exactly what was charged rather than re-deriving it. */}
                {parseFloat(orderResult.tax_amount || '0') > 0 && (
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{gstLabel(parseFloat(orderResult.gst_percent || '0'))}</span>
                    <span className="font-bold">+{formatPrice(parseFloat(orderResult.tax_amount))}</span>
                  </div>
                )}
                {parseFloat(orderResult.cod_fee || '0') > 0 && (
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">COD Charges</span>
                    <span className="font-bold">+{formatPrice(parseFloat(orderResult.cod_fee))}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-black text-primary text-sm">
                    {formatPrice(parseFloat(orderResult.total))}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank transfer: show account details + payment slip upload */}
            {orderResult.payment_method === 'bank' && (
              <div className="text-left bg-background border border-border rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <Lucide.Landmark className="w-4 h-4 text-primary" />
                  Bank Transfer Details
                </h3>

                <dl className="text-xs space-y-1.5 mb-4">
                  {[
                    ['Bank', SITE.bank_name],
                    ['Account Title', SITE.bank_account_title],
                    ['Account Number', SITE.bank_account_number],
                    ['IBAN', SITE.bank_iban],
                    ['Branch', SITE.bank_branch],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label as string} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground font-semibold">{label}</dt>
                      <dd className="font-mono font-bold text-foreground text-right break-all">{value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 pt-1.5 border-t border-border">
                    <dt className="text-muted-foreground font-semibold">Amount</dt>
                    <dd className="font-black text-primary">{formatPrice(parseFloat(orderResult.total))}</dd>
                  </div>
                </dl>

                {SITE.bank_transfer_note && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">{SITE.bank_transfer_note}</p>
                )}

                {/* Upload */}
                {slipDone ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3 py-2.5 text-xs font-bold">
                    <Lucide.CheckCircle2 className="w-4 h-4 shrink-0" />
                    Payment slip received — we&apos;ll verify and confirm your order shortly.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block">
                      Upload payment slip
                    </label>
                    <input
                      ref={slipInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => { setSlipFile(e.target.files?.[0] || null); setSlipError('') }}
                      className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={slipRef}
                      onChange={(e) => setSlipRef(e.target.value)}
                      placeholder="Transaction / reference number (optional)"
                      className="input-base text-xs"
                    />
                    {slipError && <p className="text-[11px] text-rose-600 font-semibold">{slipError}</p>}
                    <button
                      type="button"
                      disabled={!slipFile || slipUploading}
                      onClick={async () => {
                        if (!slipFile) return
                        setSlipUploading(true); setSlipError('')
                        try {
                          await uploadPaymentSlip(orderResult.order_number, slipFile, slipRef)
                          setSlipDone(true)
                        } catch (err: any) {
                          setSlipError(err?.message || 'Upload failed. Please try again.')
                        } finally {
                          setSlipUploading(false)
                        }
                      }}
                      className="btn-primary text-xs min-h-10 px-4 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {slipUploading ? 'Uploading…' : 'Upload Payment Slip'}
                    </button>
                    <p className="text-[10px] text-muted-foreground">JPG, PNG, WEBP or PDF · max 5 MB</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-muted-foreground text-xs leading-relaxed mb-8 font-semibold">
              Our team will contact you on <strong>{orderResult.customer_phone}</strong> within 2–3 hours to confirm final pricing, discount adjustments, and delivery details.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={`/account/orders/${orderResult.order_number}`}
                className="btn-primary text-xs px-6 py-3 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Lucide.Package className="w-4 h-4" /> Track My Order
              </Link>
              <Link href="/products" className="btn-secondary text-xs px-6 py-3">Continue Shopping</Link>
              <Link href="/" className="btn-secondary text-xs px-6 py-3">Back to Home</Link>
            </div>
          </motion.div>
        ) : !hydrated ? (
          /* ─── Cart hydrating: skeleton shaped like the checkout layout ─── */
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="skeleton h-[52px] rounded-2xl mb-8" />
              <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="skeleton h-6 w-48 mb-6" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="skeleton h-10 rounded-xl" />
                  <div className="skeleton h-10 rounded-xl" />
                  <div className="skeleton h-10 rounded-xl" />
                  <div className="skeleton h-10 rounded-xl" />
                  <div className="skeleton h-20 rounded-xl sm:col-span-2" />
                  <div className="skeleton h-10 rounded-xl" />
                  <div className="skeleton h-10 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="skeleton h-6 w-32 mb-5" />
                <div className="space-y-2 mb-5">
                  <div className="skeleton h-4" />
                  <div className="skeleton h-4" />
                  <div className="skeleton h-4" />
                </div>
                <div className="skeleton h-8" />
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* ─── Empty Cart Redirect ─── */
          <motion.div
            className="max-w-2xl mx-auto text-center py-20 bg-card border border-border/60 rounded-[2rem] px-8 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Lucide.ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 text-sm">Add some products before checking out.</p>
            <Link href="/products" className="btn-primary text-xs px-6 min-h-10">Browse Products</Link>
          </motion.div>
        ) : (
          /* ─── Checkout Flow ─── */
          <>
          <div className="grid lg:grid-cols-3 gap-8 pb-20 sm:pb-0">
            {/* Left: Steps */}
            <div className="lg:col-span-2">

              {/* Step indicator */}
              <div className="flex items-center gap-0 mb-8 bg-card rounded-2xl border border-border/60 p-2 shadow-sm">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex-1 flex items-center">
                    <button
                      onClick={() => { if (step > s.id && !isSubmitting) goToStep(s.id) }}
                      disabled={step > s.id && isSubmitting}
                      className={`flex-1 flex items-center justify-center gap-2 min-h-10 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                        step === s.id
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                          : step > s.id
                          ? 'text-primary cursor-pointer hover:bg-primary/5'
                          : 'text-muted-foreground cursor-default'
                      }`}
                    >
                      <span>{renderStepIcon(s.id)}</span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-4 h-0.5 shrink-0 ${step > s.id ? 'bg-primary/30' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glow-card bg-card border border-border/60 p-6 sm:p-8 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Lucide.MapPin className="w-5 h-5 text-primary" /> Shipping Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Full Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Company Name</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Optional"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Phone Number *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="03XX-XXXXXXX"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="input-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Shipping Address *</label>
                      <textarea
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        placeholder="Full street address"
                        rows={3}
                        className="input-base resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">City</label>
                      <select
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        className="input-base"
                      >
                        {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot', 'Other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Order Notes</label>
                      <input
                        type="text"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Special instructions"
                        className="input-base"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={next}
                      disabled={!isStep1Valid}
                      className="btn-primary text-xs px-6 py-2.5 min-h-10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Continue to Payment <Lucide.ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glow-card bg-card border border-border/60 p-6 sm:p-8 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Lucide.CreditCard className="w-5 h-5 text-primary" /> Payment Method
                  </h2>

                  <div className="space-y-3 mb-6">
                    {PAYMENT_METHODS.map(m => {
                      // @ts-ignore
                      const Icon = Lucide[m.icon]
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedPayment(m.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left cursor-pointer ${
                            selectedPayment === m.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            selectedPayment === m.id ? 'bg-primary/10' : 'bg-secondary'
                          }`}>
                            <Icon className={`w-5 h-5 ${m.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{m.label}</p>
                            <p className="text-xs text-muted-foreground">{m.sub}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPayment === m.id ? 'border-primary' : 'border-border'
                          }`}>
                            {selectedPayment === m.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Bank transfer note */}
                  {selectedPayment === 'bank' && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                      <p className="text-xs font-bold text-primary mb-1">Bank Transfer Instructions</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        After placing your order, our team will share the bank account details via WhatsApp or email. Please complete the transfer and share the payment slip.
                      </p>
                    </div>
                  )}

                  {/* Promo code */}
                  <div className="border-t border-border/60 pt-6">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <Lucide.Tag className="w-4 h-4 text-primary" /> Promo Code
                    </h3>
                    {promoResult?.valid ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Lucide.CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-800 font-mono">{promoResult.code}</span>
                          <span className="text-xs text-emerald-600 font-semibold">
                            — saves {formatPrice(parseFloat(promoResult.discount_amount || '0'))}
                          </span>
                        </div>
                        <button
                          onClick={handleRemovePromo}
                          className="text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
                          placeholder="Enter promo code"
                          className="input-base flex-1 font-mono uppercase"
                          onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading}
                          className="btn-secondary text-xs px-4 py-2.5 min-h-10 cursor-pointer disabled:opacity-50"
                        >
                          {promoLoading ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                        <Lucide.AlertCircle className="w-3.5 h-3.5" /> {promoError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button onClick={back} className="btn-secondary text-xs px-5 py-2.5 min-h-10 cursor-pointer">
                      <Lucide.ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button onClick={next} className="btn-primary text-xs px-6 py-2.5 min-h-10 cursor-pointer">
                      Review Order <Lucide.ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glow-card bg-card border border-border/60 p-6 sm:p-8 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Lucide.CheckCircle2 className="w-5 h-5 text-primary" /> Review Your Order
                  </h2>

                  {/* Customer info summary */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-background rounded-xl border border-border/60">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-sm font-bold text-foreground">{form.name}</p>
                      {form.company && <p className="text-xs text-muted-foreground">{form.company}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                      <p className="text-sm font-semibold text-foreground">{form.phone}</p>
                      <p className="text-xs text-muted-foreground">{form.email}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Shipping To</p>
                      <p className="text-sm text-foreground">{form.address}, {form.city}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Payment</p>
                      <p className="text-sm font-semibold text-foreground">
                        {PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}
                      </p>
                    </div>
                  </div>

                  {/* Item list */}
                  <div className="space-y-3 mb-6">
                    {items.map(item => {
                      const key = getItemKey(item.slug, item.variantId)
                      return (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card">
                          <div className="w-10 h-10 rounded-lg bg-background overflow-hidden flex items-center justify-center border border-border/60 shrink-0">
                            <img
                              src={item.image || '/product-placeholder.svg'}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/product-placeholder.svg' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.brand} • {item.catNo} • Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-foreground text-right">
                            {item.isPriceOnRequest
                              ? 'POR'
                              : formatPrice(
                                  item.unitPrice * item.quantity
                                    - lineDiscount(item.unitPrice, item.quantity, percentFor(item)),
                                )}
                            {!item.isPriceOnRequest && percentFor(item) > 0 && (
                              <span className="block text-[10px] font-black text-rose-500">
                                -{percentFor(item)}%
                              </span>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 mb-4 flex items-center gap-2">
                      <Lucide.AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-xs font-semibold text-red-700">{submitError}</p>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <button onClick={back} disabled={isSubmitting} className="btn-secondary text-xs px-5 py-2.5 min-h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      <Lucide.ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={isSubmitting}
                      className="btn-primary text-xs px-8 py-3 min-h-10 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" /> Placing Order...
                        </>
                      ) : (
                        <>
                          Place Order <Lucide.CheckCircle className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="glow-card bg-card border border-border/60 p-6 sticky top-24 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-5">Order Summary</h2>

                {/* Items */}
                <div className="space-y-2 mb-5 max-h-48 overflow-y-auto pr-1">
                  {pricedItems.map(item => {
                    const key = getItemKey(item.slug, item.variantId)
                    const net = item.unitPrice * item.quantity
                      - lineDiscount(item.unitPrice, item.quantity, item.percent)
                    return (
                      <div key={key} className="flex justify-between text-xs items-center">
                        <span className="text-foreground font-semibold truncate max-w-[65%]">
                          {item.name} <span className="text-muted-foreground font-medium">×{item.quantity}</span>
                          {item.percent > 0 && (
                            <span className="ml-1 text-[10px] font-black text-rose-500">-{item.percent}%</span>
                          )}
                        </span>
                        <span className="text-foreground font-bold">
                          {item.isPriceOnRequest ? 'POR' : formatPrice(net)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Pricing */}
                <div className="border-t border-border/60 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{subtotal > 0 ? formatPrice(subtotal) : 'TBD'}</span>
                  </div>

                  {/* Brand campaigns, itemised separately from a promo code so
                      the customer can see which saving came from where. */}
                  {brandDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-rose-600 dark:text-rose-400">
                      <span className="flex items-center gap-1.5">
                        <Lucide.Tag className="w-3.5 h-3.5" />
                        Brand discount
                      </span>
                      <span>-{formatPrice(brandDiscount)}</span>
                    </div>
                  )}

                  {promoDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                      <span>Discount ({promoResult?.code})</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}

                  {welcomeDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Lucide.BadgePercent className="w-3.5 h-3.5" />
                        Welcome discount ({welcomePercent}%)
                      </span>
                      <span>-{formatPrice(welcomeDiscount)}</span>
                    </div>
                  )}

                  {taxAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{gstLabel(charges.gstPercent)}</span>
                      <span>+{formatPrice(taxAmount)}</span>
                    </div>
                  )}

                  {/* Only shown for Cash on Delivery — an online/bank order
                      never carries this charge. */}
                  {codFee > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>COD Charges</span>
                      <span>+{formatPrice(codFee)}</span>
                    </div>
                  )}

                  {porItemCount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-amber-600">
                      <span>Price on Request</span>
                      <span>{porItemCount} item{porItemCount > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-border">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    {totalAfterDiscount > 0 ? (
                      <span className="flex items-baseline gap-2">
                        {/* Struck-through original, so the saving is visible
                            rather than merely stated on its own line. */}
                        {discountAmount > 0 && (
                          <span className="text-sm font-bold text-muted-foreground line-through">
                            {formatPrice(charges.subtotal + taxAmount + codFee)}
                          </span>
                        )}
                        <span className="text-xl font-black text-primary">
                          {formatPrice(totalAfterDiscount)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xl font-black text-primary">TBD</span>
                    )}
                  </div>

                  {brandDiscount > 0 && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold leading-relaxed pt-1">
                      🏷 Brand offers saved you {formatPrice(brandDiscount)} on this order.
                    </p>
                  )}

                  {welcomeDiscount > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed pt-1">
                      🎉 You saved {formatPrice(welcomeDiscount)} with your {welcomePercent}% first-order discount.
                    </p>
                  )}
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-5 border-t border-border/60 space-y-2">
                  {[
                    { icon: 'ShieldCheck', text: '100% genuine manufactured products' },
                    { icon: 'Truck', text: 'Free dispatch inside Karachi above PKR 50k' },
                    { icon: 'Award', text: 'Original manufacturer warranty' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold">
                      {(() => {
                        // @ts-ignore
                        const Icon = Lucide[t.icon]
                        return <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      })()}
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile sticky total bar */}
          <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-card border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-lg font-black text-primary leading-tight truncate">
                {totalAfterDiscount > 0 ? formatPrice(totalAfterDiscount) : 'TBD'}
              </p>
            </div>
            {step === 1 && (
              <button
                onClick={next}
                disabled={!isStep1Valid}
                className="btn-primary text-xs min-h-10 px-5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <Lucide.ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {step === 2 && (
              <button onClick={next} className="btn-primary text-xs min-h-10 px-5 shrink-0">
                Review Order <Lucide.ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={placeOrder}
                disabled={isSubmitting}
                className="btn-primary text-xs min-h-10 px-5 shrink-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Lucide.Loader2 className="w-3.5 h-3.5 animate-spin" /> Placing…
                  </>
                ) : (
                  <>
                    Place Order <Lucide.CheckCircle className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
