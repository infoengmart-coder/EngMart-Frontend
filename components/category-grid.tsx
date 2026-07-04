'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/data'

// Beautiful, industrial SVG Icons for each category type to replace emojis
function getCategoryIcon(short: string) {
  switch (short) {
    case 'MCBs':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'MCCBs':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
      )
    case 'Contactors':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    case 'CTs':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
        </svg>
      )
    case 'Panel Meters':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    case 'Capacitors':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'Industrial Plugs':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v2a2 2 0 11-4 0V4zM4 14a2 2 0 114 0v2a2 2 0 11-4 0v-2zM18 14a2 2 0 114 0v2a2 2 0 11-4 0v-2z" />
        </svg>
      )
    case 'Protection Relays':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'Cam Switches':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
  }
}

export function CategoryGrid() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative">
      {/* Visual background details */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Browse Our Catalog</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Browse by Product Category
            </h2>
          </div>
          <Link href="/categories" className="btn-premium-secondary text-sm">
            All Categories
          </Link>
        </div>

        {/* Categories Grid (Dribbble/21.dev style card layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.slice(0, 9).map((cat, idx) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Link
                href={`/categories/${cat.slug}`}
                className="glow-card flex flex-col justify-between p-6 h-64 hover:border-primary/40 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    {/* Icon container */}
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      {getCategoryIcon(cat.short)}
                    </div>
                    {/* Count badge */}
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400">
                      {cat.count}+ Products
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mt-6 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-850/50">
                  <div className="flex items-center gap-1.5">
                    {cat.brands.map(b => (
                      <span key={b} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {b}
                      </span>
                    ))}
                  </div>
                  
                  {/* Small clean arrow */}
                  <span className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </span>
                </div>

              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
