'use client'

import Link from 'next/link'
import { SITE } from '@/lib/data'

export function CtaSection() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-foreground rounded-xl p-8 sm:p-12 lg:p-16 text-primary-foreground relative overflow-hidden">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/3" style={{ background: 'var(--primary)' }} />

          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Start Sourcing</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-2 mb-4 leading-tight">
              Ready to Upgrade Your Electrical Supply?
            </h2>
            <p className="text-primary-foreground/70 text-sm max-w-xl leading-relaxed mb-8">
              Receive competitive wholesale quotes within 24 hours. Connect directly with our Karachi branch for bulk discounts and official product certifications.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/contact" className="btn-primary text-sm py-2.5 px-6">
                Submit an RFQ →
              </Link>
              <a href={`tel:${SITE.phone}`} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-sm font-semibold text-primary-foreground border border-primary-foreground/20 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                Call: {SITE.phone}
              </a>
            </div>

            {/* Info strip */}
            <div className="pt-6 border-t border-primary-foreground/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-primary-foreground/40 block uppercase font-bold tracking-wider">Fast Turnaround</span>
                <span className="text-sm font-medium text-primary-foreground/70 mt-0.5 block">Quotes in 24 Hours</span>
              </div>
              <div>
                <span className="text-[10px] text-primary-foreground/40 block uppercase font-bold tracking-wider">Official Stock</span>
                <span className="text-sm font-medium text-primary-foreground/70 mt-0.5 block">ABB, CHINT, Himel & more</span>
              </div>
              <div>
                <span className="text-[10px] text-primary-foreground/40 block uppercase font-bold tracking-wider">Karachi Branch</span>
                <span className="text-sm font-medium text-primary-foreground/70 mt-0.5 block">Sarafa Bazar, Karachi</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
