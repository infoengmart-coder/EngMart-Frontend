'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { use, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FEATURED_PRODUCTS } from '@/lib/data'
import { useCart } from '@/lib/cart'

/* ─── PKR Price Map ─────────────────────────────────────────────────── */
const PKR_PRICES: Record<string, { min: number; max: number } | null> = {
  'chint-nxb63-mcb': { min: 420, max: 1800 },
  'abb-sh201-mcb': { min: 850, max: 3200 },
  'himel-hdm3-mccb': { min: 8500, max: 45000 },
  'fico-elc-ct': { min: 650, max: 4200 },
  'tense-dja96-ammeter': { min: 2800, max: 6500 },
  'abb-ax-contactor': { min: 3200, max: 28000 },
  'pce-industrial-socket': { min: 1800, max: 8500 },
  'kondas-znpp-capacitor': { min: 4500, max: 18000 },
}

function formatPKR(n: number) {
  return `PKR ${n.toLocaleString('en-PK')}`
}

/* ─── Extended Product Data ─────────────────────────────────────────── */
const ALL_PRODUCTS_DETAIL: Record<string, {
  name: string; brand: string; category: string; catNo: string;
  description: string; specs: string[]; badge: string; badgeColor: string;
  fullDescription: string;
  variants: { catNo: string; description: string; specs: Record<string, string>; price: string }[];
}> = {
  'chint-nxb63-mcb': {
    name: 'CHINT NXB-63 Miniature Circuit Breaker',
    brand: 'CHINT', category: 'MCBs', catNo: 'NXB-63', badge: 'Best Seller', badgeColor: '#F97316',
    description: '1-Pole to 4-Pole MCBs, C-Curve, 6kA Breaking Capacity, 6A to 63A Rating',
    fullDescription: 'The CHINT NXB-63 series miniature circuit breakers provide reliable overcurrent and short-circuit protection for domestic and commercial installations. Available in 1-pole, 2-pole, 3-pole, and 4-pole configurations with B, C, and D curve tripping characteristics. 6kA breaking capacity meets IEC 60898-1 requirements.',
    specs: ['Breaking Capacity: 6kA', 'Curves: B, C, D', 'Poles: 1P, 2P, 3P, 4P', 'Standard: IEC 60898-1', 'Mounting: DIN Rail 35mm', 'Voltage: 230/400VAC'],
    variants: [
      { catNo: 'NXB-63-1P-C6', description: '1-Pole, C-Curve, 6A', specs: { Poles: '1', Curve: 'C', Rating: '6A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'NXB-63-1P-C16', description: '1-Pole, C-Curve, 16A', specs: { Poles: '1', Curve: 'C', Rating: '16A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'NXB-63-1P-C32', description: '1-Pole, C-Curve, 32A', specs: { Poles: '1', Curve: 'C', Rating: '32A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'NXB-63-1P-C63', description: '1-Pole, C-Curve, 63A', specs: { Poles: '1', Curve: 'C', Rating: '63A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'NXB-63-2P-C16', description: '2-Pole, C-Curve, 16A', specs: { Poles: '2', Curve: 'C', Rating: '16A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'NXB-63-2P-C32', description: '2-Pole, C-Curve, 32A', specs: { Poles: '2', Curve: 'C', Rating: '32A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'NXB-63-3P-C32', description: '3-Pole, C-Curve, 32A', specs: { Poles: '3', Curve: 'C', Rating: '32A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'NXB-63-3P-C63', description: '3-Pole, C-Curve, 63A', specs: { Poles: '3', Curve: 'C', Rating: '63A', kA: '6kA' }, price: 'Contact' },
    ],
  },
  'abb-sh201-mcb': {
    name: 'ABB SH201 Series MCB — 6kA',
    brand: 'ABB', category: 'MCBs', catNo: 'SH201', badge: 'Premium', badgeColor: '#1E3A5F',
    description: '1-Pole to 4-Pole MCBs, C-Curve, 6kA, 1A to 40A — Swiss Quality (Made in Germany)',
    fullDescription: 'ABB SH201 series miniature circuit breakers offer Swiss-engineered quality for domestic and light commercial applications. The SH series provides reliable protection with compact design and proven reliability. Available from 1A to 40A in C-curve with 6kA breaking capacity. Made in Germany.',
    specs: ['Breaking Capacity: 6kA', 'Curve: C', 'Rating: 1A–40A', 'Poles: 1P, 2P, 3P, 4P', 'Standard: IEC 60898-1', 'Made in Germany'],
    variants: [
      { catNo: 'SH201-C6', description: '1-Pole, C-Curve, 6A', specs: { Poles: '1', Curve: 'C', Rating: '6A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'SH201-C10', description: '1-Pole, C-Curve, 10A', specs: { Poles: '1', Curve: 'C', Rating: '10A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'SH201-C16', description: '1-Pole, C-Curve, 16A', specs: { Poles: '1', Curve: 'C', Rating: '16A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'SH201-C25', description: '1-Pole, C-Curve, 25A', specs: { Poles: '1', Curve: 'C', Rating: '25A', kA: '6kA' }, price: 'Contact' },
      { catNo: 'SH201-C40', description: '1-Pole, C-Curve, 40A', specs: { Poles: '1', Curve: 'C', Rating: '40A', kA: '6kA' }, price: 'Contact' },
    ],
  },
}

function getIcon(category: string) {
  const icons: Record<string, string> = {
    'MCBs': '⚡', 'MCCBs': '🔌', 'Contactors': '🔧',
    'Current Transformers': '🔄', 'Panel Meters': '📊', 'Capacitors': '⚙️',
    'Industrial Sockets': '🔌',
  }
  return icons[category] || '⚡'
}

/* ─── Image Gallery Component ───────────────────────────────────────── */
function ProductImageGallery({ category, badge, badgeColor, brand }: {
  category: string; badge: string; badgeColor: string; brand: string
}) {
  const [zoom, setZoom] = useState(false)
  const icon = getIcon(category)

  return (
    <div className="space-y-3 w-full min-w-0 max-w-full">
      {/* Main image */}
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden cursor-zoom-in border border-[#E7E4DF] dark:border-[#334155] group"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)' }}
        onClick={() => setZoom(!zoom)}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="h-56 sm:h-80 lg:h-96 flex items-center justify-center relative">
          {/* Grid pattern */}
          <div className="absolute inset-0 pattern-grid-dark opacity-40" />
          {/* Glow */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,212,255,0.15) 0%, transparent 70%)' }} />

          {/* Icon */}
          <motion.span
            className="text-[5rem] sm:text-[9rem] relative z-10 select-none filter drop-shadow-lg"
            animate={{ scale: zoom ? 1.15 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.span>

          {/* Badge */}
          <motion.div
            className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-xl z-20"
            style={{ background: badgeColor }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {badge}
          </motion.div>

          {/* Brand */}
          <motion.div
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 z-20"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {brand}
          </motion.div>

          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {zoom ? 'Click to reset' : 'Click to zoom'}
          </div>
        </div>
      </motion.div>

      {/* Thumb grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="aspect-square min-w-0 rounded-xl flex items-center justify-center text-xl sm:text-2xl cursor-pointer border-2 transition-colors duration-200"
            style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)' }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.15 }}
            initial={{ borderColor: i === 0 ? '#2563EB' : '#334155' }}
            animate={{ borderColor: i === 0 ? '#2563EB' : '#334155' }}
          >
            <span className="text-xl select-none">{icon}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { add, isInCart } = useCart()

  const product = ALL_PRODUCTS_DETAIL[slug]
  const featuredProduct = FEATURED_PRODUCTS.find(p => p.slug === slug)
  const inCart = isInCart(slug)

  const [activeTab, setActiveTab] = useState<'specs' | 'variants' | 'inquiry'>('variants')
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
  const [qty, setQty] = useState(1)
  const [addedAnim, setAddedAnim] = useState(false)

  if (!product && !featuredProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-black text-foreground mb-4">Product Not Found</h1>
          <Link href="/products" className="text-orange-500 font-bold hover:underline">← Back to Products</Link>
        </div>
      </div>
    )
  }

  const p = product || {
    name: featuredProduct!.name,
    brand: featuredProduct!.brand,
    category: featuredProduct!.category,
    catNo: featuredProduct!.catNo,
    description: featuredProduct!.description,
    badge: featuredProduct!.badge,
    badgeColor: featuredProduct!.badgeColor,
    fullDescription: featuredProduct!.description,
    specs: featuredProduct!.specs,
    variants: [],
  }

  const pkrRange = PKR_PRICES[slug]

  function handleAddToCart() {
    add({
      slug, name: p.name, brand: p.brand, category: p.category,
      catNo: p.catNo, badge: p.badge, badgeColor: p.badgeColor,
    })
    setAddedAnim(true)
    setTimeout(() => setAddedAnim(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden w-full max-w-[100vw] pt-24">
      <Navbar />

      {/* ── PROMO BANNER ── */}
      <motion.div
        className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border-b border-[#334155] overflow-hidden relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs">
            {[
              { icon: '🚚', text: 'Free delivery on orders above PKR 50,000 in Karachi' },
              { icon: '✅', text: '100% Genuine Products — Manufacturer Warranty' },
              { icon: '📋', text: 'Formal Quotations Available for Procurement' },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 text-gray-300 font-medium">
                <span>{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── BREADCRUMB ── */}
      <div className="bg-[#F5F4F0] dark:bg-[#1E293B] border-b border-[#E7E4DF] dark:border-[#334155] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-400">
            <Link href="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <Link href="/products" className="hover:text-[#2563EB] transition-colors">Products</Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <Link href={`/categories/${p.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#2563EB] transition-colors">{p.category}</Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{p.catNo}</span>
          </nav>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-24 sm:pb-28 min-w-0 w-full">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-14 mb-10 sm:mb-16 min-w-0">

          {/* ── LEFT: IMAGE + ACTION BUTTONS ── */}
          <motion.div
            className="lg:sticky lg:top-32 h-fit w-full min-w-0 max-w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductImageGallery
              category={p.category}
              badge={p.badge}
              badgeColor={p.badgeColor}
              brand={p.brand}
            />

            {/* Quick contact buttons below image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-4 w-full min-w-0">
              <motion.a
                href={`https://wa.me/+923112763951?text=I'm interested in ${encodeURIComponent(p.name)} (${p.catNo}). Please provide pricing.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 text-xs sm:text-sm font-bold text-white rounded-2xl relative overflow-hidden group min-w-0 w-full"
                style={{ background: '#25D366' }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(37,211,102,0.35)' }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <svg className="w-4 h-4 relative z-10 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                <span className="relative z-10 truncate">WhatsApp Inquiry</span>
              </motion.a>

              <motion.button
                onClick={() => setActiveTab('inquiry')}
                className="flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 text-xs sm:text-sm font-bold text-white rounded-2xl relative overflow-hidden group min-w-0 w-full"
                style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(37,99,235,0.4)' }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <svg className="w-4 h-4 relative z-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="relative z-10">Get Quote</span>
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mt-4 w-full min-w-0">
              {['✅ Genuine Product', '🛡️ Warranty Included', '📦 Karachi Stock'].map((b, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-[#F5F4F0] dark:bg-[#1E293B] text-gray-600 dark:text-gray-400 font-medium border border-[#E7E4DF] dark:border-[#334155]">
                  {b}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: PRODUCT INFO + CART ── */}
          <motion.div
            className="w-full min-w-0 max-w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-4 w-full min-w-0">
              <span className="badge-orange">{p.category}</span>
              <span className="badge-navy">{p.brand}</span>
              {p.badge && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold text-white uppercase tracking-wider"
                  style={{ background: p.badgeColor }}
                >
                  {p.badge}
                </span>
              )}
            </div>

            {/* Product name */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight break-words">
              {p.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 break-words">
              Catalog No: <span className="font-bold font-mono text-gray-800 dark:text-gray-200">{p.catNo}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 break-words">{p.description}</p>

            {/* ── PRICE IN PKR ── */}
            <div className="my-5 p-4 sm:p-5 rounded-2xl bg-[#F5F4F0] dark:bg-[#1E293B] border border-[#E7E4DF] dark:border-[#334155] relative overflow-hidden w-full min-w-0">
              <div className="absolute inset-0 animate-shimmer" />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Price (PKR)</p>
                {pkrRange ? (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-2xl sm:text-3xl font-black text-orange-500">
                      {formatPKR(pkrRange.min)}
                    </span>
                    <span className="text-gray-400">–</span>
                    <span className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {formatPKR(pkrRange.max)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-full sm:w-auto sm:ml-1">(varies by variant)</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Price on Request</span>
                    <span className="badge-orange text-xs">Contact for Pricing</span>
                  </div>
                )}
                {pkrRange && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    All prices include GST. Final pricing may vary based on quantity & variant.
                  </p>
                )}
              </div>
            </div>

            {/* Key specs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 w-full min-w-0">
              {p.specs.slice(0, 4).map((spec, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1E293B] rounded-xl px-3 py-2.5 border border-[#E7E4DF] dark:border-[#334155] min-w-0"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.06 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0 mt-1.5" />
                  <span className="text-xs font-medium break-words min-w-0">{spec}</span>
                </motion.div>
              ))}
            </div>

            {/* ── ADD TO CART ── */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Quantity</p>
              <div className="flex flex-wrap items-center gap-3 mb-4 w-full min-w-0">
                <div className="flex items-center rounded-xl border border-[#E7E4DF] dark:border-[#334155] overflow-hidden bg-white dark:bg-[#1E293B] shrink-0">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-[#2563EB]/10 transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-[#2563EB]/10 transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                {pkrRange && (
                  <div className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 break-words min-w-0">
                    Est. Total: <span className="text-orange-500">{formatPKR(pkrRange.min * qty)}</span>
                    <span className="text-gray-400 font-normal"> – {formatPKR(pkrRange.max * qty)}</span>
                  </div>
                )}
              </div>

              <motion.button
                onClick={handleAddToCart}
                className="w-full py-4 text-sm font-black text-white rounded-2xl relative overflow-hidden"
                style={inCart
                  ? { background: 'linear-gradient(135deg, #059669, #047857)' }
                  : { background: 'linear-gradient(135deg, #F97316, #EA580C)' }
                }
                whileHover={{ scale: 1.01, boxShadow: '0 8px 32px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {inCart ? (
                    <motion.span
                      key="added"
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to Cart — View Cart
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* View cart link */}
              <AnimatePresence>
                {inCart && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-center"
                  >
                    <Link href="/cart" className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors">
                      View Cart & Checkout →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-1 mb-5 p-1 bg-[#F5F4F0] dark:bg-[#1E293B] rounded-xl border border-[#E7E4DF] dark:border-[#334155] w-full min-w-0 overflow-hidden">
              {(['variants', 'specs', 'inquiry'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all capitalize ${activeTab === tab
                      ? 'bg-white dark:bg-[#0F172A] text-[#2563EB] shadow-sm border border-[#E7E4DF] dark:border-[#334155]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                  {tab === 'variants' ? 'Variants' : tab === 'specs' ? 'Specs' : 'Inquiry'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'variants' && (
                <motion.div
                  key="variants"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {p.variants.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 rounded-xl border border-[#E7E4DF] dark:border-[#334155] w-full max-w-[100vw] sm:max-w-full">
                      <table className="w-full min-w-[520px] text-xs">
                        <thead>
                          <tr className="bg-[#F5F4F0] dark:bg-[#1E293B] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <th className="text-left px-3 py-2.5 font-bold">Cat No.</th>
                            <th className="text-left px-3 py-2.5 font-bold">Description</th>
                            {p.variants[0] && Object.keys(p.variants[0].specs).map(k => (
                              <th key={k} className="text-left px-3 py-2.5 font-bold">{k}</th>
                            ))}
                            <th className="text-left px-3 py-2.5 font-bold">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.variants.map((v, idx) => (
                            <tr key={idx} className={`border-t border-[#E7E4DF] dark:border-[#334155] ${idx % 2 === 0
                                ? 'bg-white dark:bg-[#0F172A]'
                                : 'bg-[#F5F4F0]/50 dark:bg-[#1E293B]/50'
                              } hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-colors`}>
                              <td className="px-3 py-2.5 font-mono font-bold text-gray-800 dark:text-gray-200">{v.catNo}</td>
                              <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{v.description}</td>
                              {Object.values(v.specs).map((val, i) => (
                                <td key={i} className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{val}</td>
                              ))}
                              <td className="px-3 py-2.5">
                                <span className="badge-orange text-[10px]">Contact</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm bg-[#F5F4F0] dark:bg-[#1E293B] rounded-xl border border-[#E7E4DF] dark:border-[#334155]">
                      Contact us for full model variant list and pricing.
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'specs' && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  {p.specs.map((spec, idx) => {
                    const [label, value] = spec.includes(':') ? spec.split(':') : ['Specification', spec]
                    return (
                      <motion.div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-3 px-4 rounded-xl border border-[#E7E4DF] dark:border-[#334155] bg-white dark:bg-[#1E293B] min-w-0"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium shrink-0">{label.trim()}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white break-words text-left sm:text-right">{value?.trim() || spec}</span>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {activeTab === 'inquiry' && (
                <motion.div
                  key="inquiry"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {sent ? (
                    <div className="text-center py-10 bg-green-500/10 rounded-2xl border-2 border-green-500/30">
                      <div className="text-3xl mb-2">✅</div>
                      <p className="font-bold text-green-400">Inquiry sent!</p>
                      <p className="text-sm text-green-500/70">We'll respond within a few hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      await new Promise(r => setTimeout(r, 1000))
                      setSent(true)
                    }}>
                      <input
                        type="text" required placeholder="Your Name"
                        value={inquiryForm.name}
                        onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                        className="input-base mb-3"
                      />
                      <input
                        type="tel" required placeholder="Phone Number"
                        value={inquiryForm.phone}
                        onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                        className="input-base mb-3"
                      />
                      <textarea
                        required rows={3} placeholder={`Inquiry about ${p.catNo}...`}
                        value={inquiryForm.message}
                        onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                        className="input-base mb-4 resize-none"
                      />
                      <motion.button
                        type="submit"
                        className="w-full py-3.5 text-sm font-black text-white rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
                        whileHover={{ scale: 1.01, boxShadow: '0 6px 24px rgba(37,99,235,0.4)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Send Inquiry →
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── FULL DESCRIPTION SECTION ── */}
        <motion.div
          className="mb-10 sm:mb-16 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E7E4DF] dark:border-[#334155] w-full min-w-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
        >
          <p className="overline mb-3">About This Product</p>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-4 break-words">{p.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl break-words">{p.fullDescription}</p>
        </motion.div>

        {/* ── RELATED PRODUCTS ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="overline mb-2">You May Also Like</p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Related Products</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.filter(fp => fp.slug !== slug).slice(0, 4).map((related, idx) => (
              <motion.div
                key={related.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  href={`/products/${related.slug}`}
                  className="block bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E7E4DF] dark:border-[#334155] overflow-hidden group hover:border-[#2563EB] dark:hover:border-[#2563EB] transition-all duration-300 hover:shadow-blue-glow"
                >
                  <div className="h-28 sm:h-32 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)' }}>
                    <span className="text-4xl sm:text-5xl transition-transform duration-300 group-hover:scale-110 select-none">
                      {getIcon(related.category)}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-bold text-orange-500 mb-1 uppercase tracking-wider">{related.category}</p>
                    <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#2563EB] transition-colors leading-tight mb-1">{related.name}</h3>
                    <p className="text-[10px] text-gray-400 font-mono">{related.catNo}</p>
                    {PKR_PRICES[related.slug] && (
                      <p className="text-xs font-bold text-orange-500 mt-1">
                        {formatPKR(PKR_PRICES[related.slug]!.min)}+
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
