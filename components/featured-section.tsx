'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ProductCard } from '@/components/product-card'
import { getProducts, Product } from '@/lib/api'

const FILTERS = ['All', 'ABB', 'CHINT', 'Himel', 'FICO']

export function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    async function loadFeatured() {
      setLoading(true)
      try {
        // Try fetching featured products first
        let res = await getProducts({ is_featured: true })
        let list = res.results || []
        
        // If no products marked as featured, fallback to all products
        if (list.length === 0) {
          res = await getProducts()
          list = res.results || []
        }
        setProducts(list)
      } catch (err) {
        console.error('Failed to fetch homepage featured products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFeatured()
  }, [])

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'All') return true
    const brandName = p.brand_name || p.brand?.name || ''
    return brandName.toLowerCase().includes(activeFilter.toLowerCase())
  }).slice(0, 16)

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
                className={`px-3 py-1.5 min-h-10 sm:min-h-0 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeFilter === f
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="store-card overflow-hidden flex flex-col">
                {/* Image area — mirrors the aspect-[4/3] product image */}
                <div className="skeleton aspect-[4/3] w-full rounded-none" />
                {/* Content — category, title, cat no, then price + button */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="skeleton h-2.5 w-1/3" />
                  <div className="skeleton h-4 w-full mt-2" />
                  <div className="skeleton h-4 w-2/3 mt-1.5" />
                  <div className="skeleton h-3 w-1/2 mt-2" />
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="skeleton h-4 w-24 mb-2.5" />
                    <div className="skeleton h-10 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground text-sm font-medium">No products found for this filter.</p>
            <button onClick={() => setActiveFilter('All')} className="mt-3 btn-secondary text-xs min-h-10">
              Show All Products
            </button>
          </div>
        ) : (
          /* Product grid */
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.slug || product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProductCard
                    product={product}
                    index={idx}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

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
