'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ProductCard } from '@/components/product-card'
import { ProductQuickView } from '@/components/product-quick-view'
import { getShowcaseProducts, Product } from '@/lib/api'

export function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null)

  /**
   * One request for the whole selection — recent arrivals first, then a random
   * sample across every brand.
   *
   * This used to fetch `?page_size=40` and shuffle it locally, which could
   * never produce a mix: the API orders by brand name, so page 1 of a 4,788
   * product catalogue is entirely ABB. Shuffling forty ABB products still
   * gives forty ABB products, which is exactly what the homepage showed.
   * The sampling now happens server-side across the full catalogue, and it is
   * redrawn on every request — so a refresh really does show different stock.
   */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getShowcaseProducts()
      .then(rows => { if (!cancelled) setProducts(rows) })
      .catch(err => console.error('Failed to fetch homepage products:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

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
                Fresh mix on every visit
              </span>
            </div>
            <h2 className="section-title">Featured Products</h2>
          </div>

          {/* The brand filter tabs that used to sit here are gone.
              They were derived from whatever forty products happened to load,
              so with the catalogue ordered by brand they read "All | ABB" and
              nothing else — a filter offering one choice. Browsing by brand
              belongs on /brands, which lists all 69. */}
          <Link
            href="/products"
            className="text-xs font-bold text-primary hover:underline shrink-0 inline-flex items-center gap-1.5"
          >
            View all products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
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
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground text-sm font-medium">Products are loading — please refresh in a moment.</p>
            <Link href="/products" className="mt-3 btn-secondary text-xs min-h-10 inline-flex">
              Browse the full catalog
            </Link>
          </div>
        ) : (
          /* Product grid — 40 cards directly */
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {products.map((product, idx) => (
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




