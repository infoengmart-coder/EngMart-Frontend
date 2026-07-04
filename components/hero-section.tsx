'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const STATS = [
  { value: '8', suffix: '', label: 'Global Brands' },
  { value: '2500', suffix: '+', label: 'Products Sourced' },
  { value: '500', suffix: '+', label: 'Active Clients' },
  { value: '10', suffix: '+', label: 'Years in Karachi' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden pt-24 pb-16">
      
      {/* Visual mesh gradient & grid patterns (21.dev style) */}
      <div className="absolute inset-0 z-0">
        {/* Deep mesh gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        {/* Horizontal linear glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800/80 text-xs font-semibold text-blue-400 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Karachi's Premier Electrical Supplier
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[40px] sm:text-[60px] lg:text-[76px] font-black tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400"
          >
            Engineering-Grade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300">
              Electrical Solutions
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-[19px] max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            Karachi's trusted hub for high-quality MCBs, MCCBs, Contactors, CTs, and Panel Meters. Direct supply from ABB, CHINT, Himel, FICO, and Kondas.
          </motion.p>

          {/* Interactive CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
          >
            <Link href="/products" className="btn-premium-primary px-8 py-3.5 text-[14px]">
              Browse Products
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            
            <Link href="/contact" className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-[14px] font-bold border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2">
              Request Quote
            </Link>
          </motion.div>

        </div>

        {/* Dynamic statistics section */}
        <div className="mt-20 border-t border-slate-900 pt-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-baseline justify-center text-3xl sm:text-5xl font-black tracking-tight text-white">
                  <span>{s.value}</span>
                  <span className="text-blue-500">{s.suffix}</span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm font-semibold mt-2 uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
