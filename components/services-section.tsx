'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SERVICES } from '@/lib/data'

function getServiceIcon(idx: number) {
  switch (idx) {
    case 0:
      return (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    case 1:
      return (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 2:
      return (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 3:
      return (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    default:
      return (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
  }
}

export function ServicesSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 relative">
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">End-to-End Supply Services</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Why Contractors Choose Eng-Mart
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Direct imports, localized Karachi warehousing, quick response times, and full warranty support.
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glow-card p-6 flex flex-col justify-between hover:border-primary/30 group"
            >
              <div>
                {/* Icon Circle */}
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  {getServiceIcon(idx)}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-850/50 flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                Learn more
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Need a formal bid or bill of materials priced?</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">Send us your Excel files or PDF drawings. Our team of engineering estimators will price it within 24 hours.</p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <Link href="/contact" className="btn-premium-primary text-sm px-7 py-3">
              Request Estimations
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
