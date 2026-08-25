'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useAuthGate } from '@/lib/auth-gate'
import { mediaUrl } from '@/lib/api'

interface ProductQuickViewProps {
  product: any
  isOpen: boolean
  onClose: () => void
}

const BRAND_COLORS: Record<string, string> = {
  'ABB': '#CC0000', 'CHINT': '#0055AA', 'Himel': '#C41230',
  'FICO Hi-Tech': '#1B4F8A', 'PCE': '#D97706', 'Tense': '#A0281E',
  'Kondas': '#1E6FA8', 'Opas': '#1E8A4A',
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !product) return null

  const brandName = typeof product.brand === 'string' ? product.brand : (product.brand?.name || product.brand_name || 'Generic')
  const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || product.category_name || 'Electrical Equipment')
  const catNo = product.catNo || product.series || product.first_variant?.cat_no || ''
  const brandColor = (typeof product.brand === 'object' && product.brand?.color) || BRAND_COLORS[brandName] || 'var(--primary)'
  const fallback = '/product-placeholder.svg'
  
  let finalImg = fallback
  if (product.image) {
    finalImg = mediaUrl(product.image) || fallback
  }

  const { add, isInCart } = useCart()
  const { requireAuth } = useAuthGate()
  const inCart = isInCart(product.slug)

  // Price formatting
  let priceDisplay: React.ReactNode = (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-lg">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
      Price on Request / Official Quote
    </div>
  )

  let unitPrice = 0
  let isPriceOnRequest = product.has_price_on_request ?? true

  if (product.price_range && product.price_range.min > 0) {
    const { min, max } = product.price_range
    unitPrice = min
    isPriceOnRequest = false
    priceDisplay = (
      <div className="text-xl sm:text-2xl font-extrabold text-foreground">
        PKR {min === max ? min.toLocaleString('en-PK') : `${min.toLocaleString('en-PK')} – ${max.toLocaleString('en-PK')}`}
        <span className="text-xs text-muted-foreground font-normal ml-2">Excl. Tax</span>
      </div>
    )
  } else if (product.first_variant?.price) {
    const pVal = parseFloat(product.first_variant.price)
    if (!isNaN(pVal) && pVal > 0) {
      unitPrice = pVal
      isPriceOnRequest = false
      priceDisplay = (
        <div className="text-xl sm:text-2xl font-extrabold text-foreground">
          PKR {pVal.toLocaleString('en-PK')}
          <span className="text-xs text-muted-foreground font-normal ml-2">Per Unit</span>
        </div>
      )
    }
  }

  const handleAddToCart = () => {
    requireAuth(() => {
      add({
        slug: product.slug,
        productId: product.id,
        variantId: null,
        name: product.name,
        brand: brandName,
        brandColor: brandColor,
        category: categoryName,
        catNo: catNo,
        variantDescription: product.first_variant?.description || '',
        image: finalImg,
        unitPrice,
        isPriceOnRequest,
      }, quantity)
    })
  }

  const specsList = Array.isArray(product.specs) ? product.specs : (product.short_description ? [product.short_description] : [])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full z-10 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{brandName}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-medium text-muted-foreground">{categoryName}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
            {/* Image Column */}
            <div className="flex flex-col items-center justify-center bg-secondary/40 rounded-xl p-4 border border-border relative group">
              {product.is_new && (
                <span className="absolute top-3 left-3 badge-new-arrival text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ✨ New Arrival
                </span>
              )}
              <img
                src={finalImg}
                alt={product.name}
                className="w-full h-48 sm:h-56 object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = fallback }}
              />
            </div>

            {/* Product Details Column */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {product.name}
                </h2>
                {catNo && (
                  <p className="text-xs font-mono text-primary font-semibold mt-1">
                    Cat No: {catNo}
                  </p>
                )}

                <div className="mt-4">
                  {priceDisplay}
                </div>

                {/* Description / Specs */}
                {specsList.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-foreground mb-1.5">Key Highlights & Specs:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {specsList.map((spec: string, i: number) => (
                        <span key={i} className="text-xs bg-secondary border border-border px-2 py-1 rounded text-muted-foreground">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Quantity</span>
                  <div className="flex items-center border border-border rounded-lg bg-card">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-l-lg cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-r-lg cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className={`btn-cart flex-1 py-2.5 ${inCart ? 'btn-cart-added' : ''}`}
                  >
                    {inCart ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                  <Link
                    href={`/products/${product.slug}`}
                    className="btn-secondary px-3 py-2.5 text-xs whitespace-nowrap"
                    onClick={onClose}
                  >
                    Full Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
