'use client'

import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { BRANDS, FEATURED_PRODUCTS, CATEGORIES } from '@/lib/data'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart'

const CATEGORY_ICONS: Record<string, string> = {
  MCBs: '⚡', MCCBs: '🔌', Contactors: '🔧',
  'Current Transformers': '🔄', 'Panel Meters': '📊',
  Capacitors: '⚙️', 'Industrial Sockets': '🔌',
}

const BRAND_DETAILS: Record<string, {
  tagline: string;
  about: string;
  strengths: string[];
  certifications: string[];
}> = {
  abb: {
    tagline: 'Swiss engineering. Global reliability.',
    about: 'ABB is a leading global technology company that energizes the transformation of society and industry to achieve a more productive, sustainable future. In Pakistan, ABB is distributed by Ameejee Valleejee & Sons — one of the most trusted names in electrical distribution.',
    strengths: ['MCBs & MCCBs (SH, S200, T-Series)', 'Contactors (AX, A-Series)', 'Air Circuit Breakers (E-Series)', 'Soft Starters & Drives'],
    certifications: ['IEC 60898-1', 'IEC 60947', 'UL Listed', 'CE Marked'],
  },
  chint: {
    tagline: "China's #1 electrical brand. Global quality.",
    about: "CHINT Group is China's leading manufacturer of low-voltage electrical products with a presence in 140+ countries. In Pakistan, CHINT is supplied through HL PK Pvt Ltd with one of the largest ranges of MCBs, MCCBs, and contactors available locally.",
    strengths: ['NXB-63 / NXB-125 MCBs', 'NXM / NM8 MCCBs', 'NC1 / NC2 Contactors', 'VFDs & Soft Starters'],
    certifications: ['IEC 60898-1', 'IEC 60947', 'CE Marked', 'CCC Certified'],
  },
  himel: {
    tagline: 'International quality. Full product range.',
    about: 'Himel is an international electrical brand offering one of the most complete ranges in the industry — from MCBs to wiring devices, from VFDs to panel meters. Distributed by Powerhouse in Pakistan.',
    strengths: ['HDM3 MCCBs', 'HMC1 Contactors', 'Wiring Devices (Prime Series)', 'VFDs & Panel Meters'],
    certifications: ['IEC Standards', 'CE Marked', 'ISO 9001'],
  },
  fico: {
    tagline: 'Pakistan-made precision. WAPDA approved.',
    about: 'FICO Hi-Tech is Pakistan\'s leading manufacturer of current transformers. Their window CTs, bar-type CTs, and metering CTs are WAPDA and KE approved and used throughout the country in metering, protection, and panel applications.',
    strengths: ['Window CTs (ELC Series)', 'Bar-Type CTs', 'HRC Fuse Bases', 'LV Distribution Panels'],
    certifications: ['WAPDA Approved', 'KE Approved', 'ISO 9001', 'PSQCA Certified'],
  },
  pce: {
    tagline: 'German engineering. Industrial-grade connectivity.',
    about: 'PCE is a German manufacturer of industrial plugs, sockets, and connectors. Their products are built for the harshest industrial environments and comply with IEC 60309 standards. Distributed by Powerhouse in Pakistan.',
    strengths: ['IP44 & IP67 Industrial Sockets', 'CEE Industrial Plugs', '16A to 125A Range', '3-Pole & 5-Pole'],
    certifications: ['IEC 60309', 'IP67', 'CE Marked', 'VDE Certified'],
  },
  tense: {
    tagline: 'Turkish precision. Digital measurement.',
    about: 'Tense is a Turkish manufacturer of digital panel meters, protection relays, and timers. Their products are known for reliability and are distributed by AT Electricals in Pakistan.',
    strengths: ['DJA-96 Digital Ammeter', 'Panel Voltmeters & Wattmeters', 'Protection Relays', 'Star-Delta Timers'],
    certifications: ['CE Marked', 'IEC Standards', 'Turkish TSE'],
  },
  kondas: {
    tagline: 'Turkish capacitors. Power factor excellence.',
    about: 'Kondas is a Turkish specialist manufacturer of LV power capacitors and power factor correction systems. Their dry-type capacitors are ideal for industrial and commercial PFC applications.',
    strengths: ['ZNPP Box Capacitors', '5–50 KVAR Range', '440VAC Rating', 'Dry-Type Technology'],
    certifications: ['CE Marked', 'IEC 60831', 'Turkish TSE'],
  },
  opas: {
    tagline: 'Turkish switching. Cam & selector switches.',
    about: 'Opas is a Turkish manufacturer of cam switches, changeover switches, and selector switches for industrial panel applications. Distributed by AT Electricals in Pakistan.',
    strengths: ['Cam Changeover Switches', 'Phase Selector Switches', '32A to 315A Range', '2/3/4-Pole Options'],
    certifications: ['CE Marked', 'IEC 60947', 'Turkish TSE'],
  },
}

export default function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const brand = BRANDS.find(b => b.slug === slug)
  if (!brand) notFound()

  const details = BRAND_DETAILS[slug] || {
    tagline: 'Premium industrial electrical products',
    about: `${brand.name} is one of the trusted brands in our portfolio, offering a wide range of industrial electrical products. Contact us for full catalog and pricing.`,
    strengths: ['Wide product range', 'Genuine & certified', 'Competitive pricing', 'Full warranty'],
    certifications: ['IEC Standards', 'CE Marked'],
  }

  const brandProducts = FEATURED_PRODUCTS.filter(p => p.brand === brand.name)
  const brandCategories = CATEGORIES.filter(c => c.brands.includes(brand.name))

  const { add, isInCart } = useCart()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 border-b border-slate-200/60 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div
          className="absolute right-0 top-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${brand.color}, transparent)` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-slate-600">/</span>
            <Link href="/brands" className="hover:text-primary transition-colors">Brands</Link>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{brand.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Brand logo box */}
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black flex-shrink-0 border border-white/10"
              style={{ background: `${brand.color}22`, borderColor: `${brand.color}40` }}
            >
              <span style={{ color: brand.color }}>{brand.name.charAt(0)}</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15">
                  {brand.country}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-blue-400 border border-primary/30">
                  {brand.products}+ Products
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15">
                  via {brand.supplier}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white">{brand.name}</h1>
              <p className="text-slate-400 text-sm sm:text-base mt-2">{details.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-sm">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">About the Brand</span>
              <p className="text-slate-600 text-sm leading-relaxed">{details.about}</p>
            </div>

            {/* Strengths */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Key Product Lines</span>
              <div className="grid sm:grid-cols-2 gap-4">
                {details.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-white border border-slate-200/60 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md group">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: brand.color }} />
                    <span className="text-sm font-bold text-slate-800">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured products */}
            {brandProducts.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Featured Products</span>
                <div className="grid sm:grid-cols-2 gap-6">
                  {brandProducts.map((product, idx) => {
                    const inCart = isInCart(product.slug)
                    return (
                      <motion.div
                        key={product.slug}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-white rounded-3xl border border-slate-200/60 overflow-hidden hover:border-primary/35 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[320px]"
                      >
                        <div className="h-36 bg-slate-50 flex items-center justify-center text-4xl flex-shrink-0 relative border-b border-slate-100">
                          {CATEGORY_ICONS[product.category] || '⚡'}
                        </div>
                        <div className="p-5 flex flex-col justify-between flex-1">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{product.category}</p>
                            <h3 className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                            <p className="text-[10px] font-mono text-slate-400">Cat: {product.catNo}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => add({ slug: product.slug, name: product.name, brand: product.brand, category: product.category, catNo: product.catNo, badge: product.badge, badgeColor: product.badgeColor })}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                inCart 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-250' 
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                              }`}
                            >
                              {inCart ? '✓ Added' : '+ Add to Cart'}
                            </button>
                            <Link href={`/products/${product.slug}`} className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white text-center hover:bg-primary transition-colors">
                              B2B Quote
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Categories this brand covers */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Available Categories</span>
              <div className="flex flex-wrap gap-2">
                {brandCategories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/60 hover:border-primary/30 transition-all shadow-sm hover:shadow-md group"
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{cat.short}</span>
                    <span className="text-[10px] font-mono text-slate-400">{cat.count}+</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand info card */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Brand Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Country of Origin', value: brand.country },
                  { label: 'Local Distributor', value: brand.supplier },
                  { label: 'Total Products', value: `${brand.products}+` },
                  { label: 'Categories', value: `${brandCategories.length} categories` },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-400">{row.label}</span>
                    <span className="text-xs font-bold text-slate-800 text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Certifications</h3>
              <div className="flex flex-wrap gap-1.5">
                {details.certifications.map(cert => (
                  <span key={cert} className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-md text-slate-500 uppercase tracking-wide">{cert}</span>
                ))}
              </div>
            </div>

            {/* Enquiry CTA */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 relative overflow-hidden border border-slate-800 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
              <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-sm font-bold text-white mb-1">Need {brand.name} products?</p>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">Get pricing, datasheets, and bulk quotes for {brand.name} in Pakistan.</p>
                
                <Link href="/contact" className="btn-premium-primary text-xs w-full py-3.5 shadow-lg shadow-primary/20">
                  Request B2B Quote
                </Link>
                
                <a
                  href={`https://wa.me/923112763951?text=I need ${brand.name} products. Please send catalog and pricing.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl text-xs font-bold text-white border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
