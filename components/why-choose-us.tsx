'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { WHY_CHOOSE } from '@/lib/data'

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 relative">
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left panel: Large manifesto */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">The Eng-Mart Difference</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2 leading-[1.1] mb-6">
              Sourcing Made <br />
              Simple, Reliable, <br />
              & Professional.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
              We stand by engineering integrity. Contractors and panel builders in Karachi rely on our direct wholesale prices, transparent stock tracking, and original product certificates.
            </p>
            
            {/* Direct buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-premium-primary text-xs px-6 py-3">
                Browse Catalog
              </Link>
              <Link href="/contact" className="btn-premium-secondary text-xs px-6 py-3">
                Talk to Sales
              </Link>
            </div>
          </div>

          {/* Right panel: Premium feature list */}
          <div className="lg:col-span-7 grid gap-4">
            {WHY_CHOOSE.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/50 hover:border-primary/20 dark:hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-start gap-4 group"
              >
                {/* Number bullet */}
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 flex items-center justify-center font-mono font-bold text-xs group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all flex-shrink-0">
                  {idx + 1}
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
