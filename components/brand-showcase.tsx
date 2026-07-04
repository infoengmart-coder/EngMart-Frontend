'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BRANDS } from '@/lib/data'

export function BrandShowcase() {
  return (
    <section className="bg-slate-50 dark:bg-slate-950 border-y border-slate-200/50 dark:border-slate-900/50 py-10 relative overflow-hidden">
      {/* Light dot grid */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="flex-shrink-0 text-center lg:text-left">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Authorized Distributor</span>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Global Manufacturing Partners</h2>
          </div>

          {/* Premium responsive grid of brand cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/brands/${brand.slug}`}
                  className="flex items-center justify-center gap-3 px-5 py-3.5 bg-white dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:border-primary/30 dark:hover:border-primary/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: brand.color }} />
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {brand.country}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
