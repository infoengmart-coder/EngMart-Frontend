'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getBrands, mediaUrl, type Brand } from '@/lib/api'

const FALLBACK_COLOR = 'var(--primary)'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  // Real brands from the API — the page previously listed 8 hardcoded ones.
  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-14 pb-16 overflow-hidden bg-card border-b border-border transition-colors">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <nav className="breadcrumb mb-4">
              <Link href="/">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Brands</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-2 tracking-tight">
              Our Sourced <span className="text-gradient-cyan">Brands</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base font-semibold">
              Authorized distributor for {!loading && brands.length > 0 ? `${brands.length} ` : ''}world-class industrial electrical brands
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="store-card overflow-hidden h-full">
                  <div className="skeleton h-36 rounded-none" />
                  <div className="p-6">
                    <div className="skeleton h-5 w-2/3 mb-3" />
                    <div className="skeleton h-3 w-3/4 mb-4" />
                    <div className="skeleton h-3 w-1/2 mb-5" />
                    <div className="skeleton h-11 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && brands.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground text-sm font-medium">No brands available right now.</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand, idx) => (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="store-card block overflow-hidden group h-full">
                  <Link href={`/brands/${brand.slug}`}>
                    {/* Brand header */}
                    <div
                      className="h-40 flex items-center justify-center relative overflow-hidden bg-card"
                      style={{
                        background: `radial-gradient(circle at center, color-mix(in srgb, ${brand.color || FALLBACK_COLOR} 7%, transparent) 0%, transparent 70%)`,
                        borderBottom: `1px solid color-mix(in srgb, ${brand.color || FALLBACK_COLOR} 8%, transparent)`,
                      }}
                    >
                      {brand.logo ? (
                        // A real logo gets the space to be legible — the old
                        // 64px tinted tile squashed wide wordmarks like
                        // "Schneider Electric" into an unreadable smudge.
                        <img
                          src={mediaUrl(brand.logo)}
                          alt={brand.name}
                          loading="lazy"
                          className="max-h-20 max-w-[70%] object-contain transition-transform duration-300 group-hover:scale-[1.06]"
                        />
                      ) : (
                        // No logo on file: a coloured monogram reads better than
                        // a generic bolt icon repeated across every card.
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black tracking-tight transition-transform duration-300 group-hover:scale-[1.06]"
                          style={{
                            background: `color-mix(in srgb, ${brand.color || FALLBACK_COLOR} 10%, transparent)`,
                            border: `1.5px solid color-mix(in srgb, ${brand.color || FALLBACK_COLOR} 20%, transparent)`,
                            color: brand.color || FALLBACK_COLOR,
                          }}
                        >
                          {brand.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Product count as a corner pill — scannable at a glance */}
                      <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-full bg-card border border-border text-muted-foreground">
                        {brand.product_count ?? 0}
                      </span>
                    </div>

                    {/* Brand info */}
                    <div className="p-5">
                      <h2 className="text-base font-black text-foreground mb-1 group-hover:text-primary transition-colors">
                        {brand.name}
                      </h2>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{brand.origin_country || '—'}</span>
                        <span className="text-border">·</span>
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wide">{brand.product_count ?? 0} Products</span>
                      </div>
                      {brand.supplier_name && (
                        <p className="text-[11px] text-muted-foreground mb-4 font-semibold truncate">
                          Supplier: <span className="font-bold text-foreground">{brand.supplier_name}</span>
                        </p>
                      )}

                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-200"
                        style={{ background: `color-mix(in srgb, ${brand.color || FALLBACK_COLOR} 3%, transparent)`, border: `1px solid color-mix(in srgb, ${brand.color || FALLBACK_COLOR} 8%, transparent)` }}
                      >
                        <span className="text-[12px] font-bold" style={{ color: brand.color || FALLBACK_COLOR }}>
                          Browse {brand.name}
                        </span>
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: brand.color || FALLBACK_COLOR }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
