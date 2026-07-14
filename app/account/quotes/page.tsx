'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount, QuoteStatus, Quote } from '@/lib/account-context'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Inbox,
  FileCheck,
  ShoppingBag
} from 'lucide-react'

const STATUS_CONFIG: Record<QuoteStatus, { bg: string; text: string; border: string; icon: any }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', icon: Clock },
  Quoted: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/50', icon: FileCheck },
  Accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: CheckCircle },
  Expired: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200/50', icon: XCircle }
}

export default function QuoteRequestsPage() {
  const { quotes, acceptQuote } = useAccount()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAccept = async (id: string) => {
    if (confirm('Accept this quotation price offer and convert it into a confirmed order?')) {
      setProcessingId(id)
      // Simulate API lag
      await new Promise(r => setTimeout(r, 1000))
      acceptQuote(id)
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Quote Requests</h2>
        <p className="text-xs text-slate-500 font-medium">Review pending RFQs and approved pricing offers from our technical sales representatives.</p>
      </div>

      {quotes.length > 0 ? (
        <div className="space-y-4">
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
                      <p className="text-slate-850 font-bold mt-0.5">{itemsCount} Unit{itemsCount > 1 ? 's' : ''}</p>
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
                            <p className="text-sm font-extrabold text-indigo-600 leading-none mt-0.5">
                              PKR {quote.quotedTotal.toLocaleString('en-PK')}
                            </p>
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
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl text-center py-16 px-4">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-base font-extrabold text-slate-900">No quotes requests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Need special B2B contracts pricing or bulk volumes on ABB/CHINT/Himel? Request custom quotes directly.
          </p>
          <Link href="/contact" className="btn-primary text-xs px-6 py-3 mt-5 inline-flex items-center gap-1">
            Request B2B Quote
          </Link>
        </div>
      )}
    </div>
  )
}
