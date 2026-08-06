'use client'

import Link from 'next/link'
import { useAccount } from '@/lib/account-context'
import { useCart } from '@/lib/cart'
import { mediaUrl, formatPriceRange, type Product } from '@/lib/api'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const FALLBACK_IMG =
  '/product-placeholder.svg'

export default function WishlistPage() {
  // Real wishlist rows from the API, each carrying the full product payload.
  // This page used to look saved slugs up in a hardcoded demo array, so most
  // saved items rendered with a placeholder image and no real price.
  const { wishlistEntries, toggleWishlist, ordersLoaded } = useAccount()
  const { add, isInCart, getItemKey } = useCart()

  const handleMoveToCart = (product: Product) => {
    const variant = product.first_variant
    const isPOR = !variant || variant.price_on_request || !variant.price
    add({
      slug: product.slug,
      // A real product id matters: checkout prices every line from the catalog
      // and rejects unknown products, so a placeholder 0 would fail the order.
      productId: product.id,
      variantId: (variant as any)?.id ?? null,
      name: product.name,
      brand: product.brand_name || product.brand?.name || '',
      brandColor: product.brand?.color || 'var(--primary)',
      category: product.category_name || product.category?.name || '',
      catNo: variant?.cat_no || product.series || '',
      variantDescription: variant?.description || '',
      image: mediaUrl(product.image) || FALLBACK_IMG,
      unitPrice: isPOR ? 0 : parseFloat(variant!.price as string),
      isPriceOnRequest: isPOR,
    })
    toggleWishlist(product.slug)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Wishlist</h2>
        <p className="text-xs text-slate-500 font-medium">
          Your saved items. Move them to cart or purchase when project requirements align.
        </p>
      </div>

      {!ordersLoaded ? (
        /* Wishlist arrives with the account API load — skeleton, not an empty flash */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="store-card overflow-hidden">
              <div className="skeleton h-[160px] rounded-none" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-4 w-4/5" />
                <div className="skeleton h-10 w-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlistEntries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistEntries.map((entry, idx) => {
            const product = entry.product
            const brandName = product.brand_name || product.brand?.name || ''
            const brandColor = product.brand?.color || 'var(--primary)'
            const variant = product.first_variant
            const inCart = isInCart(getItemKey(product.slug, (variant as any)?.id ?? null))
            const img = mediaUrl(product.image) || FALLBACK_IMG

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="store-card flex flex-col overflow-hidden h-full bg-white border border-slate-200 shadow-sm relative group"
              >
                {/* Remove */}
                <button
                  onClick={() => toggleWishlist(product.slug)}
                  className="absolute top-2 right-2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-rose-50 border border-border text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors z-20 cursor-pointer shadow-sm"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative h-[160px] w-full overflow-hidden bg-secondary flex-shrink-0">
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-contain p-3 hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
                    />
                    <div className="absolute top-2.5 left-2.5 brand-badge">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: brandColor }} />
                      {brandName}
                    </div>
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <Link href={`/products/${product.slug}`} className="block flex-1 mb-4">
                    <span className="text-[9px] font-extrabold text-primary tracking-widest uppercase">
                      {product.category_name || product.category?.name}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1 hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    {(variant?.cat_no || product.series) && (
                      <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold">
                        {variant?.cat_no || product.series}
                      </p>
                    )}
                  </Link>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="mb-3">
                      {/* Real catalogue price, not a hardcoded lookup table */}
                      <span className={product.price_range ? 'price-tag-sm text-sm' : 'price-request'}>
                        {formatPriceRange(product.price_range)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={inCart}
                        className="flex-1 btn-primary text-[10px] font-extrabold py-2 px-3 flex items-center justify-center gap-1 border-0 shadow-none disabled:opacity-50"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> {inCart ? 'In Cart' : 'Move to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl text-center py-16 px-4">
          <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-base font-extrabold text-slate-900">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Save items here to watch pricing, compare specs, or bulk purchase later.
          </p>
          <Link href="/products" className="btn-primary text-xs px-6 py-3 mt-5 inline-flex items-center gap-1.5">
            Explore Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
