'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBrand, getProducts, mediaUrl, type Brand as ApiBrand, type Product as ApiProduct } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { useSiteSettings } from '@/lib/site-settings'
import { Boxes, Cpu, Gauge, Plug, Power, RefreshCw, RotateCw, ShieldCheck, Sliders, Zap, type LucideIcon } from 'lucide-react'

const CATEGORY_LUCIDE_ICONS: Record<string, LucideIcon> = {
  MCBs: Zap,
  MCCBs: Power,
  Contactors: Boxes,
  'Current Transformers': RefreshCw,
  'Panel Meters': Gauge,
  Capacitors: Cpu,
  'Industrial Sockets': Plug,
  'Variable Frequency Drives': Sliders,
  'Protection Relays': ShieldCheck,
  'Cam Switches': RotateCw
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
  const { settings: SITE } = useSiteSettings()
  const { slug } = use(params)
  const [brand, setBrand] = useState<ApiBrand | null>(null)
  const [brandProducts, setBrandProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  // Real brand + its real products. This page used to filter a hardcoded demo
  // list, so it showed the wrong products and linked to slugs that 404.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getBrand(slug).catch(() => null),
      getProducts({ brand: slug, page_size: 24 }).catch(() => null),
    ]).then(([b, prods]) => {
      if (cancelled) return
      if (!b) { setMissing(true); return }
      setBrand(b)
      setBrandProducts(prods?.results || [])
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  if (missing) notFound()

  const details = BRAND_DETAILS[slug] || {
    tagline: 'Premium industrial electrical products',
    about: `${brand?.name || 'This brand'} is one of the trusted brands in our portfolio, offering a wide range of industrial electrical products. Contact us for full catalog and pricing.`,
    strengths: ['Wide product range', 'Genuine & certified', 'Competitive pricing', 'Full warranty'],
    certifications: ['IEC Standards', 'CE Marked'],
  }

  // Categories this brand actually supplies come from the brand detail payload.
  const brandCategories = brand?.categories || []

  const renderCategoryIcon = (categoryName: string, className: string = "w-5 h-5") => {
    const IconComp = CATEGORY_LUCIDE_ICONS[categoryName] || Zap
    return <IconComp className={className} />
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-16 border-b border-border bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--primary)_15%,transparent),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div
          className="absolute right-0 top-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${brand?.color || 'var(--primary)'}, transparent)` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-slate-600">/</span>
            <Link href="/brands" className="hover:text-primary transition-colors">Brands</Link>
            <span className="text-slate-600">/</span>
            {loading ? (
              <span className="skeleton inline-block h-4 w-16 bg-white/10" />
            ) : (
              <span className="text-white font-medium">{brand?.name}</span>
            )}
          </nav>

          {loading ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="skeleton w-24 h-24 rounded-2xl shrink-0 bg-white/10" />
              <div className="flex-1 w-full max-w-md">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="skeleton h-6 w-20 rounded-full bg-white/10" />
                  <div className="skeleton h-6 w-24 rounded-full bg-white/10" />
                  <div className="skeleton h-6 w-28 rounded-full bg-white/10" />
                </div>
                <div className="skeleton h-10 w-2/3 mb-3 bg-white/10" />
                <div className="skeleton h-4 w-1/2 bg-white/10" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              {/* Brand logo box */}
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black shrink-0 border border-white/10"
                style={{ background: `color-mix(in srgb, ${brand?.color || 'var(--primary)'} 13%, transparent)`, borderColor: `color-mix(in srgb, ${brand?.color || 'var(--primary)'} 25%, transparent)`, color: brand?.color }}
              >
                {brand?.logo ? (
                  <img src={mediaUrl(brand.logo)} alt={brand.name} className="w-full h-full object-contain p-3" />
                ) : (
                  <Zap className="w-10 h-10" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15">
                    {brand?.origin_country || '—'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-blue-400 border border-primary/30">
                    {brand?.product_count ?? 0} Products
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15">
                    via {brand?.supplier_name || '—'}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white">{brand?.name}</h1>
                <p className="text-slate-400 text-sm sm:text-base mt-2">{details.tagline}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">About the Brand</span>
              <p className="text-muted-foreground text-sm leading-relaxed font-semibold">{details.about}</p>
            </div>

            {/* Strengths */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">Key Product Lines</span>
              <div className="grid sm:grid-cols-2 gap-4">
                {details.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-[border-color,box-shadow] duration-300 shadow-sm hover:shadow-md group">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 group-hover:scale-110 transition-transform" style={{ background: brand?.color || 'var(--primary)' }} />
                    <span className="text-sm font-bold text-foreground">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products from this brand — rendered with the shared ProductCard so
                prices, images and add-to-cart behave the same as everywhere else.
                The previous bespoke card printed [object Object] for category and
                built an incomplete cart item. */}
            {loading ? (
              <div>
                <div className="skeleton h-3 w-40 mb-4" />
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton h-64 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : brandProducts.length > 0 ? (
              <div>
                <div className="flex items-end justify-between mb-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    Products from {brand?.name}
                  </span>
                  <Link
                    href={`/products?brand=${slug}`}
                    className="inline-flex items-center min-h-10 text-[11px] font-bold text-primary hover:underline"
                  >
                    View all {brand?.product_count ?? 0} →
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {brandProducts.slice(0, 9).map((product, idx) => (
                    <ProductCard key={product.slug} product={product} index={idx} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-card border border-border rounded-2xl">
                <p className="text-sm font-bold text-foreground mb-1">No products listed for {brand?.name} yet.</p>
                <p className="text-xs text-muted-foreground mb-4">We can still source this brand — ask us for the full catalog and pricing.</p>
                <Link href="/contact" className="inline-flex items-center justify-center min-h-10 px-4 text-xs font-bold text-primary hover:underline">
                  Request a quote →
                </Link>
              </div>
            )}

            {/* Categories this brand covers */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">Available Categories</span>
              <div className="flex flex-wrap gap-2">
                {brandCategories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 min-h-10 rounded-2xl bg-card border border-border hover:border-primary/30 transition-[border-color,box-shadow] shadow-sm hover:shadow-md group"
                  >
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">
                      {cat.icon || renderCategoryIcon(cat.short_name || cat.name, "w-4 h-4")}
                    </span>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{cat.short_name || cat.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{cat.product_count}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {loading ? (
              <>
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="skeleton h-4 w-32 mb-5" />
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="skeleton h-3 w-24" />
                        <div className="skeleton h-3 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="skeleton h-4 w-28 mb-5" />
                  <div className="flex flex-wrap gap-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="skeleton h-6 w-20 rounded-md" />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
            {/* Brand info card */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-slate-100">Brand Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Country of Origin', value: brand?.origin_country },
                  { label: 'Local Distributor', value: brand?.supplier_name },
                  { label: 'Total Products', value: String(brand?.product_count ?? 0) },
                  { label: 'Categories', value: `${brandCategories.length} categories` },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-bold text-foreground text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-slate-100">Certifications</h3>
              <div className="flex flex-wrap gap-1.5">
                {details.certifications.map(cert => (
                  <span key={cert} className="text-[10px] font-bold px-2.5 py-1 bg-background border border-border rounded-md text-muted-foreground uppercase tracking-wide">{cert}</span>
                ))}
              </div>
            </div>

            {/* Enquiry CTA */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden border border-slate-800 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_50%)] pointer-events-none" />
              <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-sm font-bold text-white mb-1">Need {brand?.name} products?</p>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed font-semibold">Get pricing, datasheets, and bulk quotes for {brand?.name} in Pakistan.</p>
                
                <Link href="/contact" className="btn-premium-primary text-xs w-full py-3.5 shadow-lg shadow-primary/20">
                  Request B2B Quote
                </Link>
                
                <a
                  href={`https://wa.me/${SITE.whatsapp_digits}?text=${encodeURIComponent(`I need ${brand?.name} products. Please send catalog and pricing.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-3 py-2.5 min-h-10 rounded-xl text-xs font-bold text-white border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
