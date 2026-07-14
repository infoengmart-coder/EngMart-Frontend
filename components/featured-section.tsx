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
    ? FEATURED_PRODUCTS.slice(0, 16)
    : FEATURED_PRODUCTS.filter(p => p.brand.toLowerCase() === activeFilter.toLowerCase()).slice(0, 16)

  return (
    <section className="py-12 sm:py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <span className="section-label">Top Picks</span>
            <h2 className="section-title mt-1">Featured Products</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1 bg-card p-1 rounded-lg border border-border w-fit">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
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

        {/* View all */}
        <div className="mt-8 text-center">
          <Link href="/products" className="btn-primary inline-flex text-sm py-2.5 px-6">
            View All Products →
          </Link>
        </div>

      </div>
    </section>
  )
}
