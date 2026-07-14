'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import {
  Percent,
  Building,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  Copy,
  Info
} from 'lucide-react'
import { useState } from 'react'

// Contract pricing details for wholesale customers
const CONTRACT_PRICELIST = [
  { slug: 'chint-nxb63-mcb', name: 'CHINT NXB-63 MCB', category: 'MCBs', standardPrice: 420, wholesalePrice: 350, discount: 16.6 },
  { slug: 'abb-sh201-mcb', name: 'ABB SH201 MCB', category: 'MCBs', standardPrice: 850, wholesalePrice: 720, discount: 15.3 },
  { slug: 'himel-hdm3-mccb', name: 'Himel HDM3 MCCB', category: 'MCCBs', standardPrice: 8500, wholesalePrice: 7300, discount: 14.1 },
  { slug: 'abb-ax-contactor', name: 'ABB AX-Series Contactor', category: 'Contactors', standardPrice: 3200, wholesalePrice: 2750, discount: 14.0 },
  { slug: 'tense-dja96-ammeter', name: 'Tense DJA-96 Ammeter', category: 'Panel Meters', standardPrice: 2800, wholesalePrice: 2400, discount: 14.2 },
  { slug: 'pce-industrial-socket', name: 'PCE Industrial Socket', category: 'Industrial Sockets', standardPrice: 1800, wholesalePrice: 1550, discount: 13.8 }
]

const VOLUME_TIERS = [
  { minQuantity: 50, discount: '额外 2% (2% Extra)', description: 'Applied on checkout for single item orders exceeding 50 units.' },
  { minQuantity: 150, discount: '额外 5% (5% Extra)', description: 'Contract bracket for bulk panel builder wiring device allocations.' },
  { minQuantity: 300, discount: '额外 8% (8% Extra)', description: 'Volume threshold for institutional construction tenders.' }
]

const ACTIVE_PROMO_CODES = [
  { code: 'ENGMARTB2B', discount: 'Flat PKR 5,000 Off', criteria: 'Valid on orders above PKR 100,000', expires: '2026-12-31' },
  { code: 'KARACHIBULK', discount: 'Free Freight & Logistics', criteria: 'No min limit for Korangi/SITE industrial zones', expires: '2026-09-30' }
]

export default function WholesalePricingPage() {
  const { user } = useAuth()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const isWholesale = user?.role === 'wholesale'

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // ⚠️ RETAIL RESTRICTION CARD
  if (!isWholesale) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-xl">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Wholesale Section Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            This section is reserved exclusively for registered corporate procurement officers, electrical panel builders, and wholesale B2B contractors with approved credit brackets at Eng-Mart.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          <h4 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-primary" /> Apply for B2B Wholesale Partnership:
          </h4>
          <p className="text-[11px] text-slate-455 leading-relaxed mb-3">
            Registered partners unlock discounted price list catalog lines, corporate credit thresholds, tax exemption certificates processing, and logistics coordination.
          </p>
          <Link href="/contact" className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5 border-0 shadow-none">
            Contact B2B Accounts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-indigo-600 border border-indigo-700 rounded-3xl p-6 text-white shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 bg-indigo-500/40 px-2 py-0.5 rounded border border-indigo-400/35 inline-block">
            B2B Contract Portal
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold leading-tight">Corporate Contract Pricing Active</h2>
          <p className="text-xs text-indigo-100 leading-relaxed max-w-xl font-semibold">
            Special pricing rules apply for your account <strong>{user?.company}</strong>. Discount margins are processed automatically on the storefront catalog and checkout panels.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contract Pricelist Matrix */}
        <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Exclusive Contract Pricelist
            </h3>
            <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded font-bold border border-primary/10">
              Avg. 15% Off
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="py-2.5">Part / Item Name</th>
                  <th className="py-2.5 text-right">Standard</th>
                  <th className="py-2.5 text-right text-indigo-600">Your Price</th>
                  <th className="py-2.5 text-right text-emerald-600">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {CONTRACT_PRICELIST.map(item => (
                  <tr key={item.slug} className="hover:bg-slate-50/30">
                    <td className="py-3">
                      <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.category}</p>
                    </td>
                    <td className="py-3 text-right text-slate-400 line-through">
                      PKR {item.standardPrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-indigo-600 font-extrabold">
                      PKR {item.wholesalePrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-emerald-600 font-extrabold">
                      -{item.discount}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Volume tiers and Promo Codes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Active Promo Codes */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-indigo-500" /> Exclusive Promo Codes
            </h3>

            <div className="space-y-3">
              {ACTIVE_PROMO_CODES.map(promo => (
                <div key={promo.code} className="border border-slate-150 rounded-2xl p-3.5 space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-slate-900 text-xs px-2 py-1 bg-white border border-slate-250 rounded-lg select-all">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopy(promo.code)}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      {copiedCode === promo.code ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedCode === promo.code ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{promo.discount}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{promo.criteria}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-bold">Expires: {promo.expires}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Tiers */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-500" /> Volume Discount Tiers
            </h3>

            <div className="space-y-3.5">
              {VOLUME_TIERS.map((tier, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      Min Qty: {tier.minQuantity} Units • <span className="text-emerald-600">{tier.discount}</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">{tier.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
