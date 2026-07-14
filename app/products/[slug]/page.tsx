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
        className="relative w-full rounded-lg overflow-hidden cursor-zoom-in border border-border group"
        style={{ background: 'var(--secondary)' }}
        onClick={() => setZoom(!zoom)}
        transition={{ duration: 0.2 }}
      >
        <div className="h-56 sm:h-80 lg:h-96 flex items-center justify-center relative">
          {/* Icon */}
          <motion.span
            className="text-[5rem] sm:text-[9rem] relative z-10 select-none"
            animate={{ scale: zoom ? 1.15 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.span>

          {/* Badge */}
          <div
            className="absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-md z-20"
            style={{ background: badgeColor }}
          >
            {badge}
          </div>

          {/* Brand */}
          <div className="absolute top-3 right-3 bg-card text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md border border-border z-20">
            {brand}
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-3 right-3 bg-card/80 text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {zoom ? 'Click to reset' : 'Click to zoom'}
          </div>
        </div>
      </motion.div>

      {/* Thumb grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`aspect-square min-w-0 rounded-lg flex items-center justify-center text-xl sm:text-2xl cursor-pointer border-2 transition-colors duration-200 bg-secondary ${
              i === 0 ? 'border-primary' : 'border-border hover:border-primary/40'
            }`}
          >
            <span className="text-xl select-none">{icon}</span>
          </div>
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
    <div className="min-h-screen bg-secondary/30 overflow-x-hidden w-full max-w-[100vw]">
      <Navbar />

      {/* ── BREADCRUMB ── */}
      <div className="bg-card border-b border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
          <nav className="breadcrumb flex-wrap">
            <Link href="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/products">Products</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href={`/categories/${p.category.toLowerCase().replace(/\s+/g, '-')}`}>{p.category}</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current truncate">{p.catNo}</span>
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
                className="btn-secondary flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg className="w-4 h-4 shrink-0 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                <span className="truncate text-foreground font-bold text-xs sm:text-sm">WhatsApp Inquiry</span>
              </motion.a>

              <motion.button
                onClick={() => setActiveTab('inquiry')}
                className="btn-primary flex items-center justify-center gap-2 py-3 sm:py-3.5 px-3 w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="truncate font-bold text-xs sm:text-sm">Get Quote</span>
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mt-4 w-full min-w-0">
              {['✅ Genuine Product', '🛡️ Warranty Included', '📦 Karachi Stock'].map((b, i) => (
                <span key={i} className="text-[10px] px-2.5 py-1 rounded bg-secondary text-muted-foreground font-semibold border border-border">
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{p.category}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-foreground border border-border">{p.brand}</span>
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
            <div className="my-5 p-4 sm:p-5 rounded-lg bg-secondary border border-border w-full min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Price (PKR)</p>
              {pkrRange ? (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {formatPKR(pkrRange.min)}
                  </span>
                  <span className="text-muted-foreground">–</span>
                  <span className="text-xl sm:text-2xl font-bold text-foreground">
                    {formatPKR(pkrRange.max)}
                  </span>
                  <span className="text-xs text-muted-foreground w-full sm:w-auto sm:ml-1">(varies by variant)</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl font-bold text-foreground">Price on Request</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Contact for Pricing</span>
                </div>
              )}
              {pkrRange && (
                <p className="text-xs text-muted-foreground mt-1">
                  All prices include GST. Final pricing may vary based on quantity &amp; variant.
                </p>
              )}
            </div>

            {/* Key specs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 w-full min-w-0">
              {p.specs.slice(0, 4).map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 store-card px-3 py-2.5 min-w-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  <span className="text-xs font-medium text-muted-foreground break-words min-w-0">{spec}</span>
                </div>
              ))}
            </div>

            {/* ── ADD TO CART ── */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quantity</p>
              <div className="flex flex-wrap items-center gap-3 mb-4 w-full min-w-0">
                <div className="qty-stepper shrink-0">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                {pkrRange && (
                  <div className="text-xs sm:text-sm font-bold text-foreground break-words min-w-0">
                    Est. Total: <span>{formatPKR(pkrRange.min * qty)}</span>
                    <span className="text-muted-foreground font-normal"> – {formatPKR(pkrRange.max * qty)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  inCart
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'btn-primary'
                }`}
              >
                {inCart ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Added to Cart — View Cart
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Add to Cart
                  </>
                )}
              </button>

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
            <div className="flex gap-1 mb-5 p-1 bg-secondary rounded-lg border border-border w-full min-w-0 overflow-hidden">
              {(['variants', 'specs', 'inquiry'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-md transition-all capitalize cursor-pointer ${
                    activeTab === tab
                      ? 'bg-card text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
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
                    <div className="overflow-x-auto rounded-lg border border-border w-full">
                      <table className="w-full min-w-[520px] text-xs">
                        <thead>
                          <tr className="bg-secondary text-muted-foreground uppercase tracking-wider">
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
                            <tr key={idx} className={`border-t border-border transition-colors hover:bg-secondary/60 ${
                              idx % 2 === 0 ? 'bg-card' : 'bg-secondary/30'
                            }`}>
                              <td className="px-3 py-2.5 font-mono font-bold text-foreground">{v.catNo}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">{v.description}</td>
                              {Object.values(v.specs).map((val, i) => (
                                <td key={i} className="px-3 py-2.5 text-muted-foreground">{val}</td>
                              ))}
                              <td className="px-3 py-2.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Contact</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm bg-secondary rounded-lg border border-border">
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
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 py-3 px-4 rounded-lg border border-border bg-card min-w-0"
                      >
                        <span className="text-xs text-muted-foreground font-medium shrink-0">{label.trim()}</span>
                        <span className="text-xs font-bold text-foreground break-words text-left sm:text-right">{value?.trim() || spec}</span>
                      </div>
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
                      <button
                        type="submit"
                        className="btn-primary w-full py-3 text-sm justify-center"
                      >
                        Send Inquiry →
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── FULL DESCRIPTION SECTION ── */}
        <div className="mb-10 sm:mb-16 p-4 sm:p-8 rounded-lg bg-card border border-border w-full min-w-0">
          <p className="overline mb-3">About This Product</p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 break-words">{p.name}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl break-words">{p.fullDescription}</p>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        <div>
          <div className="mb-6">
            <p className="overline mb-1">You May Also Like</p>
            <h2 className="text-xl font-bold text-foreground">Related Products</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.filter(fp => fp.slug !== slug).slice(0, 4).map((related, idx) => (
              <Link
                key={related.slug}
                href={`/products/${related.slug}`}
                className="store-card overflow-hidden group"
              >
                <div className="h-28 sm:h-32 flex items-center justify-center bg-secondary">
                  <span className="text-4xl sm:text-5xl transition-transform duration-300 group-hover:scale-110 select-none">
                    {getIcon(related.category)}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">{related.category}</p>
                  <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-1">{related.name}</h3>
                  <p className="text-[10px] text-muted-foreground font-mono">{related.catNo}</p>
                  {PKR_PRICES[related.slug] && (
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--color-orange)' }}>
                      {formatPKR(PKR_PRICES[related.slug]!.min)}+
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
