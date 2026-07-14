'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CATEGORIES } from '@/lib/data'

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

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-14 pb-16 overflow-hidden bg-white border-b border-slate-200/60 transition-colors">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-slate-200">/</span>
              <span className="text-slate-700 font-medium">Categories</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2 tracking-tight">
              Product <span className="text-gradient-cyan">Categories</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">Browse our comprehensive catalog of 2,500+ industrial electrical products</p>
          </motion.div>
        </div>
      </section>

      {/* Category grid */}
      <section className="py-16 bg-slate-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.slug} variants={item}>
                <div className="glow-card block overflow-hidden bg-white border border-slate-200/60 group hover:border-primary/45 transition-colors">
                  <Link href={`/categories/${cat.slug}`}>
                    {/* Card header */}
                    <div
                      className="p-6 flex items-center gap-4 border-b border-slate-100"
                      style={{ background: `linear-gradient(135deg, ${cat.color}08, ${cat.color}03)` }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-350 group-hover:scale-110"
                        style={{ background: cat.color, boxShadow: `0 4px 14px ${cat.color}35` }}
                      >
                        {getCategoryIcon(cat.short)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary transition-colors">
                          {cat.name}
                        </h2>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">{cat.count}+ Products Available</p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-6">
                      <p className="text-[13px] text-slate-500 leading-relaxed mb-4 min-h-[40px] line-clamp-2">{cat.description}</p>

                      {/* Brand tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {cat.brands.map(brand => (
                          <span
                            key={brand}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-200/50 uppercase tracking-wider"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300"
                        style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}15` }}
                      >
                        <span className="text-[12px] font-bold" style={{ color: cat.color }}>
                          Browse {cat.short}
                        </span>
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: cat.color }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-white border-t border-slate-200/60 transition-colors">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Can't find what you need?
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
              Our catalog covers 8 global brands and 2,500+ products. If you don't see what you need, contact us — we can source it for you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="btn-premium-primary text-xs px-6 py-3.5 shadow-lg shadow-primary/20"
              >
                Contact Our Estimators
              </Link>
              <Link
                href="/products"
                className="btn-premium-secondary text-xs px-6 py-3.5"
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
