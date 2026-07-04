'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const STEPS = [
  { id: 1, label: 'Shipping', icon: '📍' },
  { id: 2, label: 'Payment', icon: '💳' },
  { id: 3, label: 'Review', icon: '✓' },
]

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive your order', icon: '💵' },
  { id: 'bank', label: 'Bank Transfer', sub: 'Transfer to our UBL / HBL account', icon: '🏦' },
  { id: 'whatsapp', label: 'WhatsApp Order', sub: 'Confirm via WhatsApp and pay manually', icon: '📱' },
]

export default function CheckoutPage() {
  const { items, count, clear } = useCart()
  const [step, setStep] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('cod')
  const [ordered, setOrdered] = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '',
    address: '', city: 'Karachi', notes: '',
  })

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const placeOrder = () => {
    setOrdered(true)
    clear()
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      <Navbar />

      {/* Page header */}
      <div className="pt-28 bg-white border-b border-slate-200/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
            <span>/</span>
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
            className="max-w-2xl mx-auto text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-5xl mx-auto mb-6 border border-emerald-100">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Order Received!</h2>
            <p className="text-slate-500 leading-relaxed mb-2 text-sm">
              Thank you, <strong>{form.name || 'Customer'}</strong>. Your order inquiry has been received.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed mb-8">
              Our team will contact you on <strong>{form.phone || 'your number'}</strong> within 2–3 hours to confirm pricing, availability, and delivery details.
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
              <div className="flex items-center gap-0 mb-8 bg-white rounded-2xl border border-slate-200/60 p-2">
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
                      <span>{s.icon}</span>
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
                    className="bg-white rounded-3xl border border-slate-200/60 p-6"
                  >
                    <h2 className="text-base font-bold text-slate-900 mb-6">Shipping Details</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name *</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all"
                          placeholder="Engr. Ahmad Ali"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Company</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all"
                          placeholder="Your Company Pvt Ltd"
                          value={form.company}
                          onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone *</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all"
                          type="tel"
                          placeholder="+92-300-0000000"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Email</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all"
                          type="email"
                          placeholder="you@company.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Delivery Address *</label>
                        <input
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all"
                          placeholder="Street, Area, Karachi"
                          value={form.address}
                          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">City</label>
                        <select
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary transition-all cursor-pointer"
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
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all resize-none"
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
                    className="bg-white rounded-3xl border border-slate-200/60 p-6"
                  >
                    <h2 className="text-base font-bold text-slate-900 mb-6">Payment Method</h2>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                            selectedPayment === pm.id
                              ? 'border-primary bg-blue-50/50'
                              : 'border-slate-200 bg-white hover:border-primary/40'
                          }`}
                        >
                          <span className="text-2xl">{pm.icon}</span>
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
                        className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <p className="text-xs font-bold text-slate-700 mb-2">Bank Account Details</p>
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
                    className="bg-white rounded-3xl border border-slate-200/60 p-6"
                  >
                    <h2 className="text-base font-bold text-slate-900 mb-6">Review Your Order</h2>

                    {/* Shipping summary */}
                    <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping To</p>
                        <button onClick={() => setStep(1)} className="text-xs text-primary font-bold hover:underline cursor-pointer">Edit</button>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{form.name} {form.company && `(${form.company})`}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-semibold">{form.phone} {form.email && `· ${form.email}`}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{form.address}, {form.city}</p>
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

                    {/* Products */}
                    <div className="mb-5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Products ({count} items)</p>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div key={item.slug} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-base border border-slate-100">
                              🔌
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
                      <div className="mb-5 p-3 rounded-xl bg-blue-50/50 border border-primary/10">
                        <p className="text-xs font-bold text-primary mb-1">Order Note</p>
                        <p className="text-xs text-slate-600 font-semibold">{form.notes}</p>
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
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.slug} className="flex items-center gap-2.5 py-2 border-b border-slate-100 last:border-0">
                      <span className="text-base">🔌</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">×{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-150">
                  <span className="text-xs font-bold text-slate-500">Total Items</span>
                  <span className="text-base font-black text-primary">{count}</span>
                </div>
                <p className="text-[10px] text-slate-405 mt-3 font-semibold leading-relaxed">Final pricing confirmed after order review by our team.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
