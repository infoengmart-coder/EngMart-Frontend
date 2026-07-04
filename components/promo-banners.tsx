'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { StaggerChild, StaggerReveal } from '@/components/scroll-reveal'

const PROMOS = [
  {
    title: 'Switchgear Sales',
    subtitle: 'Up to 20% Off',
    cta: 'Shop Now',
    href: '/categories/mcbs',
    bg: '#1E293B',
    accent: '#2563EB',
    imageText: 'MCB',
  },
  {
    title: 'WAPDA Approved',
    subtitle: 'FICO Transformers',
    cta: 'View Series',
    href: '/categories/current-transformers',
    bg: '#0F172A',
    accent: '#00D4FF',
    imageText: 'CT',
  },
  {
    title: 'Heavy Industry',
    subtitle: 'IP67 Connectors',
    cta: 'Browse PCE',
    href: '/brands/pce',
    bg: '#111827',
    accent: '#F97316',
    imageText: 'PCE',
  },
]

export function PromoBanners() {
  return (
    <section className="py-12 bg-white dark:bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.15}>
          {PROMOS.map((promo, idx) => (
            <StaggerChild key={idx} variant="fade-up">
              <Link href={promo.href} className="block group">
                <div
                  className="relative h-64 rounded-3xl overflow-hidden p-8 border border-[#E7E4DF] dark:border-[#334155] transition-all duration-500"
                  style={{ background: promo.bg }}
                >
                  <div
                    className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle, ${promo.accent}, transparent)` }}
                  />
                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <span className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: promo.accent }}>
                      {promo.subtitle}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-tight">
                      {promo.title}
                    </h3>
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:gap-4 transition-all">
                        {promo.cta}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  
                  {/* Abstract placeholder for the product image */}
                  <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 flex items-center justify-center font-black text-6xl text-white select-none">
                    {promo.imageText}
                  </div>
                </div>
              </Link>
            </StaggerChild>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
