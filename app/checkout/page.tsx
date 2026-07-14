'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import * as Lucide from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Shipping' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Review' },
]

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive your order' },
  { id: 'bank', label: 'Bank Transfer', sub: 'Transfer to our UBL / HBL account' },
  { id: 'whatsapp', label: 'WhatsApp Order', sub: 'Confirm via WhatsApp and pay manually' },
]

const CATEGORY_LUCIDE_ICONS: Record<string, string> = {
  MCBs: 'Zap',
  MCCBs: 'Power',
  Contactors: 'Boxes',
  'Current Transformers': 'RefreshCw',
  'Panel Meters': 'Gauge',
  Capacitors: 'Cpu',
  'Industrial Sockets': 'Plug',
  'Variable Frequency Drives': 'Sliders',
  'Protection Relays': 'ShieldCheck',
  'Cam Switches': 'RotateCw'
}

export default function CheckoutPage() {
  const { items, count, clear } = useCart()
  const [step, setStep] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('cod')
  const [ordered, setOrdered] = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '',
    address: '', city: 'Karachi', notes: '',
  })

  // Promo code states
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: string } | null>(null)
  const [promoError, setPromoError] = useState('')

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const placeOrder = () => {
    setOrdered(true)
    clear()
  }

  const handleApplyPromo = () => {
    const codeUpper = promoCode.trim().toUpperCase()
    if (codeUpper === 'BULK20-JUL26') {
      setAppliedPromo({ code: 'BULK20-JUL26', discount: '20%' })
      setPromoError('')
    } else if (codeUpper === 'WHOLESALE-VIP15') {
      setAppliedPromo({ code: 'WHOLESALE-VIP15', discount: '15%' })
      setPromoError('')
    } else if (codeUpper === '') {
      setPromoError('Please enter a promo code.')
    } else {
      setPromoError('Invalid promo code.')
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError('')
  }

  const renderStepIcon = (stepId: number, className: string = "w-4 h-4") => {
    if (stepId === 1) return <Lucide.MapPin className={className} />
    if (stepId === 2) return <Lucide.CreditCard className={className} />
    return <Lucide.CheckCircle2 className={className} />
  }

  const renderPaymentIcon = (methodId: string, className: string = "w-5 h-5") => {
    if (methodId === 'cod') return <Lucide.DollarSign className={`${className} text-emerald-600`} />
    if (methodId === 'bank') return <Lucide.Building2 className={`${className} text-blue-650`} />
    return <Lucide.MessageSquare className={`${className} text-emerald-700`} />
  }

  const renderCategoryIcon = (categoryName: string, className: string = "w-5 h-5") => {
    const iconName = CATEGORY_LUCIDE_ICONS[categoryName] || 'Zap'
    // @ts-ignore
    const IconComp = Lucide[iconName] || Lucide.Zap
    return <IconComp className={className} />
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      <Navbar />

      {/* Page header */}
      <div className="pt-12 bg-white border-b border-slate-200/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-slate-200">/</span>
            <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
            <span className="text-slate-200">/</span>
            <span className="text-slate-700 font-medium">Checkout</span>
          </nav>
          <h1 className="text-[32px] sm:text-4xl font-black text-slate-900 leading-tight">
            {ordered ? '🎉 Order Confirmed' : <>Checkout</>}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {ordered ? (
          // Order success
          <motion.div
            className="max-w-2xl mx-auto text-center py-20 bg-white border border-slate-200/60 rounded-[2rem] px-8 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-3xl mx-auto mb-6 border border-emerald-100">
              <Lucide.CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Order Received!</h2>
            <p className="text-slate-500 leading-relaxed mb-2 text-sm font-semibold">
              Thank you, <strong>{form.name || 'Customer'}</strong>. Your order inquiry has been received.
            </p>
            
            {appliedPromo && (
              <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-50/50 border border-emerald-150 text-left mb-6 flex items-start gap-3 mt-4">
                <Lucide.Tag className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Wholesale Discount Code Applied</p>
                  <p className="text-[11px] text-emerald-600 leading-relaxed font-semibold mt-0.5">
                    We've registered the promo code <strong className="font-mono">{appliedPromo.code}</strong>. A {appliedPromo.discount} discount has been factored into your request and will be reflected on the formal quotation we send you.
                  </p>
                </div>
              </div>
            )}

            <p className="text-slate-450 text-xs leading-relaxed mb-8 font-semibold">
              Our team will contact you on <strong>{form.phone || 'your number'}</strong> within 2–3 hours to confirm final pricing, discount adjustments, and delivery details.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/products" className="btn-premium-primary text-xs px-6 py-3">Continue Shopping</Link>
              <Link href="/" className="btn-premium-secondary text-xs px-6 py-3">Back to Home</Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Steps */}
            <div className="lg:col-span-2">

              {/* Step indicator */}
              <div className="flex items-center gap-0 mb-8 bg-white rounded-2xl border border-slate-200/60 p-2 shadow-sm">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex-1 flex items-center">
                    <button
                      onClick={() => step > s.id ? setStep(s.id) : undefined}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                        step === s.id
                          ? 'bg-primary text-white shadow-md shadow-primary/25'
                          : step > s.id
                          ? 'text-primary cursor-pointer hover:bg-primary/5'
                          : 'text-slate-400 cursor-default'
                      }`}
                    >
                      <span>{renderStepIcon(s.id)}</span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-4 h-0.5 flex-shrink-0 ${step > s.id ? 'bg-primary/30' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Step 1: Shipping */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm"
                  >
                    <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Lucide.MapPin className="w-5 h-5 text-primary" /> Shipping Details
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name *</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-450 outline-none focus:border-primary transition-all font-semibold"
                          placeholder="Engr. Ahmad Ali"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Company</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-450 outline-none focus:border-primary transition-all font-semibold"
                          placeholder="Your Company Pvt Ltd"
                          value={form.company}
                          onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone *</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-450 outline-none focus:border-primary transition-all font-semibold"
                          type="tel"
                          placeholder="+92-300-0000000"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Email</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-450 outline-none focus:border-primary transition-all font-semibold"
                          type="email"
                          placeholder="you@company.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Delivery Address *</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-450 outline-none focus:border-primary transition-all font-semibold"
                          placeholder="Street, Area, Karachi"
                          value={form.address}
                          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">City</label>
                        <select
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary transition-all cursor-pointer font-bold"
                          value={form.city}
                          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        >
                          {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Other'].map(c => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Order Notes</label>
                        <textarea
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-450 outline-none focus:border-primary transition-all resize-none font-semibold"
                          rows={3}
                          placeholder="Delivery date, specific requirements, etc."
                          value={form.notes}
                          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={next}
                        disabled={!form.name || !form.phone || !form.address}
                        className="btn-premium-primary text-xs w-full sm:w-auto py-3 px-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Payment →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm"
                  >
                    <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Lucide.CreditCard className="w-5 h-5 text-primary" /> Payment Method
                    </h2>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                            selectedPayment === pm.id
                              ? 'border-primary bg-blue-50/30'
                              : 'border-slate-200 bg-white hover:border-primary/40'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                            {renderPaymentIcon(pm.id)}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800">{pm.label}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">{pm.sub}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedPayment === pm.id ? 'border-primary' : 'border-slate-300'
                          }`}>
                            {selectedPayment === pm.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedPayment === 'bank' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-inner"
                      >
                        <p className="text-xs font-bold text-slate-705 mb-2">Bank Account Details</p>
                        <div className="space-y-1 text-xs text-slate-500 font-mono">
                          <p>Bank: United Bank Limited (UBL)</p>
                          <p>Account: 1234-567890-001</p>
                          <p>Title: Eng-Mart Trading Co.</p>
                          <p>IBAN: PK00UNIL0000001234567890</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                      <button onClick={back} className="btn-premium-secondary text-xs w-full sm:w-auto py-3 px-6 cursor-pointer">← Back</button>
                      <button onClick={next} className="btn-premium-primary text-xs w-full sm:w-auto py-3 px-6 cursor-pointer">Review Order →</button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm"
                  >
                    <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Lucide.CheckCircle2 className="w-5 h-5 text-primary" /> Review Your Order
                    </h2>

                    {/* Shipping summary */}
                    <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping To</p>
                        <button onClick={() => setStep(1)} className="text-xs text-primary font-bold hover:underline cursor-pointer">Edit</button>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{form.name} {form.company && `(${form.company})`}</p>
                      <p className="text-[11px] text-slate-450 mt-1 font-semibold">{form.phone} {form.email && `· ${form.email}`}</p>
                      <p className="text-[11px] text-slate-450 font-semibold">{form.address}, {form.city}</p>
                    </div>

                    {/* Payment summary */}
                    <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</p>
                        <button onClick={() => setStep(2)} className="text-xs text-primary font-bold hover:underline cursor-pointer">Edit</button>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {PAYMENT_METHODS.find(pm => pm.id === selectedPayment)?.label}
                      </p>
                    </div>

                    {/* Applied Promo Code */}
                    {appliedPromo && (
                      <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-150 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Lucide.Tag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800">Promo Code Applied</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Promo code <strong className="font-mono text-primary">{appliedPromo.code}</strong> will apply a <strong className="text-emerald-600">{appliedPromo.discount} discount</strong> to the final quotation value.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    <div className="mb-5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Products ({count} items)</p>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.slug} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                              {renderCategoryIcon(item.category, "w-5 h-5")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Cat: {item.catNo}</p>
                            </div>
                            <span className="text-xs font-bold text-slate-500">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {form.notes && (
                      <div className="mb-5 p-3 rounded-xl bg-blue-50/30 border border-primary/10">
                        <p className="text-xs font-bold text-primary mb-1">Order Note</p>
                        <p className="text-xs text-slate-650 font-semibold">{form.notes}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <button onClick={back} className="btn-premium-secondary text-xs w-full sm:w-auto py-3 px-6 cursor-pointer">← Back</button>
                      <button onClick={placeOrder} className="btn-premium-primary text-xs w-full sm:w-auto py-3 px-6 cursor-pointer">
                        Place Order ✓
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-200/60 p-5 sticky top-28 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Cart Summary</h3>
                <div className="space-y-2.5 mb-4 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.slug} className="flex items-center gap-2.5 py-2 border-b border-slate-100 last:border-0">
                      <span className="text-slate-400">{renderCategoryIcon(item.category, "w-4 h-4")}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {!appliedPromo ? (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Have a promo code?</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={e => {
                            setPromoCode(e.target.value)
                            setPromoError('')
                          }}
                          placeholder="e.g. BULK20-JUL26"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:border-primary outline-none transition-all placeholder:normal-case placeholder:font-sans font-semibold text-slate-700"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-primary text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[10px] text-red-500 mt-1 font-semibold">{promoError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <Lucide.Tag className="w-3.5 h-3.5" />
                          <span className="font-mono">{appliedPromo.code}</span>
                        </div>
                        <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">{appliedPromo.discount} discount applied</p>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-xs font-bold text-emerald-700 hover:text-red-500 p-1 transition-colors cursor-pointer shrink-0"
                      >
                        <Lucide.X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Total Items</span>
                  <span className="text-base font-black text-primary">{count}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center mt-2.5 py-1.5 px-2 bg-emerald-50/20 border border-emerald-100/50 rounded-lg text-emerald-600">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Applied Promo</span>
                    <span className="text-xs font-bold font-mono">-{appliedPromo.discount} Discount</span>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 mt-3 font-semibold leading-relaxed">
                  {appliedPromo 
                    ? `Promo code adjusted. Final custom quote pricing sent after verification.` 
                    : `Final pricing confirmed after order review by our team.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
