'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getCategories, type Category } from '@/lib/api'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function getCategoryIcon(short: string) {
  switch (short) {
    case 'MCBs':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'MCCBs':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
      )
    case 'Contactors':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    case 'CTs':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
        </svg>
      )
    case 'Panel Meters':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    case 'Capacitors':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    case 'Protection Relays':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'Cam Switches':
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    default:
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
  }
}

const FALLBACK_COLOR = '#3B82F6'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((rows) => {
        // Only show categories that actually have products — empty parent
        // groupings would otherwise render as dead "0 Products" cards.
        setCategories(rows.filter((c) => (c.product_count ?? 0) > 0))
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0)

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-14 pb-16 overflow-hidden bg-card border-b border-border transition-colors">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-border">/</span>
              <span className="text-foreground font-medium">Categories</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 tracking-tight">
              Product <span className="text-primary">Categories</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {loading
                ? <span className="skeleton inline-block h-4 w-72 max-w-full align-middle" />
                : `Browse ${categories.length} categories covering ${totalProducts.toLocaleString()} industrial electrical products`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category grid */}
      <section className="py-16 bg-background transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            /* Structured skeletons mirroring the real card layout (header strip,
               description lines, CTA bar) so the swap-in doesn't jump. */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-6 flex items-center gap-4 border-b border-border">
                    <div className="skeleton w-14 h-14 rounded-2xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="skeleton h-4 w-2/3 mb-2" />
                      <div className="skeleton h-3 w-1/3" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="skeleton h-3 w-full mb-2" />
                    <div className="skeleton h-3 w-4/5 mb-6" />
                    <div className="skeleton h-11 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground text-sm font-medium">No categories available right now.</p>
              <Link href="/products" className="btn-secondary text-xs px-5 py-2.5 mt-4 inline-flex">
                Browse all products
              </Link>
            </div>
          ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {categories.map((cat) => {
              const color = cat.color || FALLBACK_COLOR
              const short = cat.short_name || cat.name
              return (
              <motion.div key={cat.slug} variants={item}>
                <div className="store-card block overflow-hidden group">
                  <Link href={`/categories/${cat.slug}`}>
                    {/* Card header */}
                    <div
                      className="p-6 flex items-center gap-4 border-b border-border"
                      style={{ background: `linear-gradient(135deg, ${color}08, ${color}03)` }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{ background: color, boxShadow: `0 4px 14px ${color}35` }}
                      >
                        {cat.icon ? <span>{cat.icon}</span> : getCategoryIcon(short)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                          {cat.name}
                        </h2>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">
                          {cat.product_count} {cat.product_count === 1 ? 'Product' : 'Products'} Available
                        </p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-6">
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 min-h-[40px] line-clamp-2">
                        {cat.description || `Browse our range of ${cat.name.toLowerCase()} from leading global brands.`}
                      </p>

                      {/* Subcategory tags */}
                      {!!cat.children?.length && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {cat.children.slice(0, 4).map(child => (
                            <span
                              key={child.slug}
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50 uppercase tracking-wider"
                            >
                              {child.short_name || child.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl transition-transform duration-200 group-hover:-translate-y-0.5"
                        style={{ background: `${color}08`, border: `1px solid ${color}15` }}
                      >
                        <span className="text-[12px] font-bold" style={{ color }}>
                          Browse {short}
                        </span>
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )})}
          </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-card border-t border-border transition-colors">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-black text-foreground mb-4">
              Can't find what you need?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
              Our catalog covers {totalProducts.toLocaleString()} products across leading global brands. If you don&apos;t see what you need, contact us — we can source it for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="btn-primary text-xs px-6 py-3.5 shadow-lg shadow-primary/20"
              >
                Contact Our Estimators
              </Link>
              <Link
                href="/products"
                className="btn-secondary text-xs px-6 py-3.5"
              >
                View All Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
