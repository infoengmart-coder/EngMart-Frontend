'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FEATURED_PRODUCTS } from '@/lib/data'
import { ProductCard } from '@/components/product-card'

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1531986371515-b3f9479b1856?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600',
]

const FILTERS = ['All', 'ABB', 'CHINT', 'Himel', 'FICO']

export function FeaturedSection() {
  const [activeFilter, setActiveFilter] = useState('All')
  
  const filteredProducts = activeFilter === 'All'
    ? FEATURED_PRODUCTS.slice(0, 8)
    : FEATURED_PRODUCTS.filter(p => p.brand.toLowerCase() === activeFilter.toLowerCase()).slice(0, 8)

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 relative">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Special Sourcing</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Featured Products
            </h2>
          </div>

          {/* Interactive filter badges (21.dev style) */}
          <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-950 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-800/60 w-fit">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  activeFilter === f
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic product card grid with exit/entry animations */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard
                  product={product}
                  imageUrl={PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length]}
                  index={idx}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Panel */}
        <div className="mt-12 text-center">
          <Link href="/products" className="btn-premium-primary inline-flex">
            Explore Full Catalog
          </Link>
        </div>

      </div>
    </section>
  )
}
