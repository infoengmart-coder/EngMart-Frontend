'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount, QuoteStatus, Quote } from '@/lib/account-context'
import { useAuth } from '@/lib/auth'
import { createInquiry } from '@/lib/api'
import { useSiteSettings } from '@/lib/site-settings'
import { gstPercentFrom, gstLabel } from '@/lib/charges'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Inbox,
  FileCheck,
  ShoppingBag,
  Send,
  Plus,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  Tag
} from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'

const PRODUCT_CATEGORIES = [
  'MCBs (Miniature Circuit Breakers)',
  'MCCBs (Molded Case Circuit Breakers)',
  'Magnetic Contactors & Overloads',
  'Current Transformers (CTs)',
  'Digital & Analog Panel Meters',
  'Capacitors & Power Factor Controllers',
  'Industrial Sockets & Plugs',
  'Protection Relays (Phase, Overload, Earth)',
  'Air Circuit Breakers (ACBs)',
  'Variable Frequency Drives (VFDs)',
  'HRC Fuses & Base Holders',
  'Wiring Accessories & Distribution Boxes',
  'Timers, Counters & Temperature Controllers',
  'ABB Switchgear Solutions',
  'CHINT Low Voltage Equipment',
  'Himel Electrical Components',
  'Custom B2B Project / Multiple Products',
  'Other Industrial Components'
]

const STATUS_CONFIG: Record<QuoteStatus, { bg: string; text: string; border: string; icon: any }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', icon: Clock },
  Quoted: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/50', icon: FileCheck },
  Accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: CheckCircle },
  Expired: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200/50', icon: XCircle }
}

export default function QuoteRequestsPage() {
  const { settings: SITE } = useSiteSettings()
  // Current rate: a quotation is an offer for future business.
  const quoteGstPercent = gstPercentFrom(SITE)

  const { quotes, acceptQuote } = useAccount()
  const { user } = useAuth()

  const [showForm, setShowForm] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null)

  // Inquiry form state
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    product: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Pre-fill form from authenticated user profile
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        company: prev.company || user.company || '',
      }))
    }
  }, [user])

  const handleAccept = (id: string) => setPendingAcceptId(id)

  const confirmAccept = () => {
    if (!pendingAcceptId) return
    const id = pendingAcceptId
    setPendingAcceptId(null)
    setProcessingId(id)
    acceptQuote(id)
    setProcessingId(null)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErrorMsg('')
    try {
      await createInquiry({
        name: form.name,
        company: form.company,
        phone: form.phone,
        email: form.email,
        product_interest: form.product || 'Quote Request / B2B RFQ',
        message: form.message,
      })
      setSent(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quote inquiry. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleResetForm = () => {
    setSent(false)
    setErrorMsg('')
    setForm({
      name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
      company: user?.company || '',
      phone: user?.phone || '',
      email: user?.email || '',
      product: '',
      message: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Quote Requests</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" /> B2B & Wholesale
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Submit custom RFQs, review approved pricing offers, and order directly from our sales desk.
          </p>
        </div>

        {quotes.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              showForm
                ? 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                : 'btn-primary text-white'
            }`}
          >
            {showForm ? (
              <>
                <X className="w-3.5 h-3.5" /> Close Form
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Request New Quote
              </>
            )}
          </button>
        )}
      </div>

      {/* Embedded Quote & Inquiry Form (Shown on toggle or when no quotes exist) */}
      {(showForm || quotes.length === 0) && (
        <div className="bg-white border-2 border-primary/20 dark:border-primary/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-primary/5 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <h3 className="text-lg font-black text-slate-900">Request a Custom B2B Quotation</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Fill in your specifications below. Our technical sales engineers will calculate wholesale rates and send a verified proposal to your email.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Direct Engineering Review
            </div>
          </div>

          {sent ? (
            <div className="p-8 rounded-2xl text-center border-2 border-emerald-500/30 bg-emerald-500/10">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3 border border-emerald-500/30">
                ✓
              </div>
              <h4 className="text-lg font-black text-slate-900">Quote Request Submitted Successfully!</h4>
              <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-md mx-auto mt-1.5">
                Thank you! Your quotation inquiry has been dispatched to our sales engineers. You will receive an email confirmation and detailed pricing offer shortly.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleResetForm}
                  className="btn-primary text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer"
                >
                  Submit Another Quote Request
                </button>
                <Link
                  href="/account/support"
                  className="btn-secondary text-xs font-bold py-2.5 px-5 rounded-xl inline-flex items-center gap-1"
                >
                  View Support Inquiries <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Engr. Ahmad Ali"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="e.g. Apex Industrial Switchgears"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Phone / WhatsApp <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+92-300-0000000"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Email Address <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                  Product Category / Area of Interest
                </label>
                <select
                  value={form.product}
                  onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">Select component category or brand...</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                  Quote Requirements, Model / Part Numbers & Quantities <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Please specify part numbers, ratings, quantities (e.g. 50x ABB S203-C32 MCB 32A 3-Pole, 20x CHINT NXC-25 220V Contactors, 5x Himel 100A MCCBs)..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              {errorMsg && (
                <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  ⚠️ {errorMsg}
                </p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary py-3 px-8 text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {sending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting Quote Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Quote Inquiry</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  Instant email confirmation sent to your inbox upon submission
                </p>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Existing Quotes List */}
      {quotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              Your Quotation History ({quotes.length})
            </h3>
          </div>

          {quotes.map(quote => {
            const badge = STATUS_CONFIG[quote.status]
            const StatusIcon = badge.icon
            const itemsCount = quote.items.reduce((acc, item) => acc + item.quantity, 0)

            return (
              <div
                key={quote.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                  quote.status === 'Quoted'
                    ? 'border-indigo-200 shadow shadow-indigo-50/20 ring-1 ring-indigo-50'
                    : 'border-slate-200'
                }`}
              >
                {/* Quote Header Info */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
                  <div className="flex gap-4 sm:gap-8">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">RFQ Date</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{quote.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Requested Items</p>
                      <p className="text-foreground font-bold mt-0.5">{itemsCount} Unit{itemsCount > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase">Quote Ref</p>
                    <p className="text-slate-950 font-extrabold mt-0.5">{quote.id}</p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4">
                  {/* Items List inside Quote */}
                  <div className="space-y-3">
                    {quote.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Part #: {item.catNo} • Brand: {item.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-700">Qty: {item.quantity}</p>
                          {quote.status === 'Quoted' && item.quotedPrice && (
                            <p className="text-[10px] text-indigo-600 font-bold mt-0.5">
                              Approved: PKR {item.quotedPrice.toLocaleString('en-PK')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Remarks Notes */}
                  {quote.notes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500 font-medium">
                      <span className="font-bold text-slate-700 block mb-1">Buyer Notes / Sales Remarks:</span>
                      {quote.notes}
                    </div>
                  )}

                  {/* Actions & pricing values */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {quote.status}
                      </span>
                      {quote.status === 'Accepted' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-md flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5" /> Order Placed
                        </span>
                      )}
                    </div>

                    {/* Offer details & conversion trigger buttons */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      {quote.status === 'Quoted' && quote.quotedTotal && (
                        <>
                          <div className="text-right">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Approved Bid Total</p>
                            {/* A quotation is a forward-looking offer, so it is
                                priced at the CURRENT GST rate rather than a
                                snapshot — unlike an order, which keeps the rate
                                it was actually charged at. */}
                            {quoteGstPercent > 0 ? (
                              <>
                                <p className="text-[10px] text-muted-foreground font-semibold leading-none mt-0.5">
                                  PKR {quote.quotedTotal.toLocaleString('en-PK')}
                                  {' + '}
                                  {gstLabel(quoteGstPercent)}{' '}
                                  {Math.round(quote.quotedTotal * quoteGstPercent) / 100 > 0 && (
                                    <>PKR {(Math.round(quote.quotedTotal * quoteGstPercent) / 100).toLocaleString('en-PK')}</>
                                  )}
                                </p>
                                <p className="text-sm font-extrabold text-indigo-600 leading-none mt-1">
                                  PKR {(quote.quotedTotal + Math.round(quote.quotedTotal * quoteGstPercent) / 100).toLocaleString('en-PK')}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-extrabold text-indigo-600 leading-none mt-0.5">
                                PKR {quote.quotedTotal.toLocaleString('en-PK')}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleAccept(quote.id)}
                            disabled={processingId === quote.id}
                            className="btn-primary text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 shadow-none border-0 flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
                          >
                            {processingId === quote.id ? (
                              'Converting to Order...'
                            ) : (
                              <>
                                Accept Offer & Order <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {quote.status === 'Accepted' && (
                        <Link href="/account/orders" className="btn-secondary text-xs px-4 py-2 hover:bg-slate-50 flex items-center gap-1">
                          Track Order in History <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingAcceptId !== null}
        title="Accept this quotation?"
        message="The quoted price will be accepted and converted into a confirmed order."
        confirmLabel="Accept & Order"
        danger={false}
        onConfirm={confirmAccept}
        onClose={() => setPendingAcceptId(null)}
      />
    </div>
  )
}
