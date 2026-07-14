'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const PROMOS = [
  {
    title: 'Switchgear Sale',
    subtitle: 'Up to 20% Off MCBs',
    cta: 'Shop Now',
    href: '/categories/mcb',
  },
  {
    title: 'WAPDA Approved',
    subtitle: 'FICO Transformers',
    cta: 'View Series',
    href: '/categories/current-transformers',
  },
  {
    title: 'IP67 Connectors',
    subtitle: 'PCE Industrial Range',
    cta: 'Browse PCE',
    href: '/brands/pce',
  },
]

export function PromoBanners() {
  return (
    <section className="py-4 sm:py-6 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {PROMOS.map((promo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
            >
              <Link href={promo.href} className="block group">
                <div
                  className="relative h-40 sm:h-48 rounded-lg overflow-hidden bg-secondary border border-border transition-all shadow-sm group-hover:shadow-md"
                >
                  {/* Background Image Placeholder */}
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span className="text-muted-foreground font-bold text-xs tracking-widest uppercase opacity-50">Upload Banner Image</span>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                  <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6">
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-1 text-primary">
                      {promo.subtitle}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                      {promo.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-3 transition-all">
                      {promo.cta}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
