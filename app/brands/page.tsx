'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { BRANDS } from '@/lib/data'
import * as Lucide from 'lucide-react'

export default function BrandsPage() {
  const renderLucideIcon = (name: string, color: string) => {
    // @ts-ignore
    const IconComp = Lucide[name] || Lucide.Zap
    return <IconComp className="w-7 h-7" style={{ color }} />
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-14 pb-16 overflow-hidden bg-white border-b border-slate-200/60 transition-colors">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-slate-200">/</span>
              <span className="text-slate-700 font-medium">Brands</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2 tracking-tight">
              Our Sourced <span className="text-gradient-cyan">Brands</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-semibold">Authorized distributor for 8 world-class industrial electrical brands</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRANDS.map((brand, idx) => (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="glow-card block overflow-hidden bg-white border border-slate-200/60 group hover:border-primary/20 transition-all duration-300 h-full shadow-sm hover:shadow-md">
                  <Link href={`/brands/${brand.slug}`}>
                    {/* Brand header */}
                    <div
                      className="h-36 flex items-center justify-center relative overflow-hidden bg-slate-50"
                      style={{
                        background: `radial-gradient(circle at center, ${brand.color}12 0%, transparent 70%)`,
                        borderBottom: `1px solid ${brand.color}15`,
                      }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${brand.color}15, ${brand.color}05)`,
                          border: `1.5px solid ${brand.color}25`
                        }}
                        whileHover={{ scale: 1.08, rotate: 3 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {renderLucideIcon(brand.icon || 'Zap', brand.color)}
                      </motion.div>
                    </div>

                    {/* Brand info */}
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                        {brand.name}
                      </h2>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{brand.country}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wide">{brand.products}+ Products</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-5 font-semibold">
                        Supplier: <span className="font-bold text-slate-600">{brand.supplier}</span>
                      </p>

                      <div
                        className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-200"
                        style={{ background: `${brand.color}08`, border: `1px solid ${brand.color}15` }}
                      >
                        <span className="text-[12px] font-bold" style={{ color: brand.color }}>
                          Browse {brand.name}
                        </span>
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: brand.color }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
