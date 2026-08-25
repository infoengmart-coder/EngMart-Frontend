'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import {
  Percent,
  Building,
  ShieldAlert,
  ArrowRight,
  FileText,
  MessageSquare
} from 'lucide-react'

// Wholesale pricing is negotiated per account by the sales team — there is no
// published price list, discount tiers, or promo-code backend. This page
// explains the real process instead of rendering fabricated contract numbers.

const PRICING_STEPS = [
  {
    title: 'Request a quote',
    description: 'Share the parts and quantities you need through the contact page — bulk volumes, panel schedules, and tender BOQs are all welcome.'
  },
  {
    title: 'Sales team prepares your pricing',
    description: 'Our B2B team confirms stock and prepares contract pricing for your account and order volume.'
  },
  {
    title: 'Accept the offer and order',
    description: 'Approved offers appear under Quote Requests, where you can accept the price and convert it into a confirmed order.'
  }
]

export default function WholesalePricingPage() {
  const { user } = useAuth()
  const isWholesale = user?.role === 'wholesale'

  // Retail restriction card
  if (!isWholesale) {
    return (
      <div className="panel-card p-6 sm:p-8 space-y-6">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-foreground leading-tight">Wholesale Section Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            This section is reserved exclusively for registered corporate procurement officers, electrical panel builders, and wholesale B2B contractors with approved credit brackets at Eng-Mart.
          </p>
        </div>
        <div className="bg-background border border-border p-4 rounded-2xl">
          <h4 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-primary" /> Apply for B2B Wholesale Partnership:
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
            Registered partners unlock negotiated contract pricing, corporate credit thresholds, tax exemption certificates processing, and logistics coordination.
          </p>
          <Link href="/contact" className="btn-primary text-xs px-5 py-2.5 min-h-10 inline-flex items-center gap-1.5 border-0 shadow-none">
            Contact B2B Accounts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground leading-tight">Wholesale Pricing</h2>
        <p className="text-xs text-muted-foreground font-medium">
          How contract pricing works for your B2B account{user?.company ? ` — ${user.company}` : ''}.
        </p>
      </div>

      {/* How pricing is arranged — honest informational state, no invented numbers */}
      <div className="panel-card p-6 sm:p-8 space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Percent className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-foreground leading-tight">
            Contract pricing is arranged with our sales team
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium max-w-xl">
            Wholesale and project prices are negotiated per account and per order volume, so we do not publish a fixed discount table here. Send us the items and quantities you need and our B2B sales team will reply with pricing for your account.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Link
            href="/contact"
            className="btn-primary text-xs px-5 py-3 min-h-10 inline-flex items-center justify-center gap-1.5 border-0 shadow-none"
          >
            <MessageSquare className="w-4 h-4" /> Contact B2B Sales
          </Link>
          <Link
            href="/account/quotes"
            className="btn-secondary text-xs px-5 py-3 min-h-10 inline-flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> View My Quote Requests
          </Link>
        </div>
      </div>

      {/* Process steps */}
      <div className="panel-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">
          How It Works
        </h3>
        <div className="space-y-3.5">
          {PRICING_STEPS.map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-foreground">{step.title}</h4>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-snug">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
