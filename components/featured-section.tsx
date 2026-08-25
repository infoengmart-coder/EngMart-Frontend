'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ProductCard } from '@/components/product-card'
import { ProductQuickView } from '@/components/product-quick-view'
import { getProducts, Product } from '@/lib/api'

/** Fisher-Yates shuffle — unbiased, returns a shuffled copy of the array */
function shuffleArray<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null)

  // Fetch 40 products on page mount (newest 4 pinned at top)
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true)
      try {
        // 1. Fetch newest products (top 4 latest by -id) to pin at top
        const newestRes = await getProducts({ page_size: 4, ordering: '-id' })
        const newestList = newestRes.results || []
        const newestIds = new Set(newestList.map(p => p.id))

        // 2. Fetch catalog (40 products batch)
        const catalogRes = await getProducts({ page_size: 40 })
        const rawCatalog = catalogRes.results || []

        // Filter out items already in newest to avoid duplicates
        const rotatingPool = shuffleArray(rawCatalog.filter(p => !newestIds.has(p.id)))

        // Combine newest products at top (is_new: true) + rotating catalog slice (total 40)
        const combined = [
          ...newestList.map(p => ({ ...p, is_new: true })),
          ...rotatingPool.map(p => ({ ...p, is_new: false })),
        ].slice(0, 40)

        setProducts(combined)
      } catch (err) {
        console.error('Failed to fetch homepage featured products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCatalog()
  }, [])

  // Brand tabs derived from loaded items
  const FILTERS = ['All', ...Array.from(
    new Set(products.map(p => p.brand_name || p.brand?.name || '').filter(Boolean))
  ).slice(0, 8)]

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'All') return true
    const brandName = p.brand_name || p.brand?.name || ''
    return brandName.toLowerCase().includes(activeFilter.toLowerCase())
  })

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-secondary/40 via-background to-secondary/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="section-label">Top Picks</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Featured Selection (40 Items)
              </span>
            </div>
            <h2 className="section-title">Featured Products</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1 bg-card p-1 rounded-lg border border-border w-fit shadow-xs">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 min-h-10 sm:min-h-0 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeFilter === f
                    ? 'bg-primary text-primary-foreground shadow-xs'
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
            {[...Array(16)].map((_, i) => (
              <div key={i} className="store-card overflow-hidden flex flex-col">
                <div className="skeleton aspect-[4/3] w-full rounded-none" />
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
          /* Product grid — 40 cards directly */
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.slug || product.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(idx % 12, 6) * 0.03 }}
                >
                  <ProductCard
                    product={product}
                    index={idx}
                    isNew={(product as any).is_new}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* View all catalog button */}
        <div className="mt-10 text-center">
          <Link href="/products" className="btn-primary inline-flex text-sm py-3 px-8 shadow-md hover:shadow-lg rounded-xl">
            Browse Full Product Catalog →
          </Link>
        </div>

      </div>

      {/* Quick View Modal Popup */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </section>
  )
}




