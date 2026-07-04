'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SITE } from '@/lib/data'

export function CtaSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Curved gradient container card (21.dev & Dribbble style) */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
          {/* Internal gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />
          
          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Start Sourcing</span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mt-2 mb-6 leading-tight">
              Ready to Upgrade Your <br />
              Electrical Supply?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Receive competitive wholesale quotes within 24 hours. Connect directly with our Karachi branch for bulk discounts and official product certifications.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/contact" className="btn-premium-primary text-[14px] px-8 py-3.5">
                Submit an RFQ
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
              <a href={`tel:${SITE.phone}`} className="px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[14px] font-bold border border-slate-700 hover:border-slate-600 transition-all">
                Call: {SITE.phone}
              </a>
            </div>

            {/* Subtext info strip */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Fast Turnaround</span>
                <span className="text-[13px] font-semibold text-slate-355 mt-1 block">Quotes in 24 Hours</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Official Stock</span>
                <span className="text-[13px] font-semibold text-slate-355 mt-1 block">ABB, CHINT, Himel & more</span>
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Karachi Branch</span>
                <span className="text-[13px] font-semibold text-slate-355 mt-1 block">Sarafa Bazar, Karachi</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
