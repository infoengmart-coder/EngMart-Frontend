'use client'

import Link from 'next/link'
import { useAccount } from '@/lib/account-context'
import { useCart } from '@/lib/cart'
import { ALL_PRODUCTS } from '@/lib/data'
import { Heart, ShoppingCart, Trash2, ArrowRight, Inbox } from 'lucide-react'
import { motion } from 'framer-motion'

const BRAND_COLORS: Record<string, string> = {
  'ABB': '#CC0000', 'CHINT': '#0055AA', 'Himel': '#C41230',
  'FICO Hi-Tech': '#1B4F8A', 'PCE': '#D97706', 'Tense': '#A0281E',
  'Kondas': '#1E6FA8', 'Opas': '#1E8A4A',
}

const PKR_PRICES: Record<string, number> = {
  'chint-nxb63-mcb': 420,
  'abb-sh201-mcb': 850,
  'himel-hdm3-mccb': 8500,
  'fico-elc-ct': 650,
  'tense-dja96-ammeter': 2800,
  'abb-ax-contactor': 3200,
  'pce-industrial-socket': 1800,
  'kondas-znpp-capacitor': 4500,
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useAccount()
  const { add, isInCart } = useCart()

  // Match saved slugs to full catalog products
  const savedProducts = wishlist
    .map(slug => ALL_PRODUCTS.find(p => p.slug === slug))
    .filter(p => p !== undefined) as typeof ALL_PRODUCTS

  const handleMoveToCart = (product: typeof ALL_PRODUCTS[number]) => {
    // Add to cart
    add({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      catNo: product.catNo,
      badge: product.badge || '',
      badgeColor: product.badgeColor || BRAND_COLORS[product.brand] || '#CC0000',
    })
    // Remove from wishlist
    toggleWishlist(product.slug)
  }

  const fallback = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Wishlist</h2>
        <p className="text-xs text-slate-500 font-medium">Your saved items. Move them to cart or purchase when project requirements align.</p>
      </div>

      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedProducts.map((product, idx) => {
            const brandColor = BRAND_COLORS[product.brand] ?? '#1C4ED8'
            const inCart = isInCart(product.slug)
            const price = PKR_PRICES[product.slug]

            return (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className="store-card flex flex-col overflow-hidden h-full bg-white border border-slate-200 shadow-sm relative group"
              >
                {/* Remove Quick Toggle */}
                <button
                  onClick={() => toggleWishlist(product.slug)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 hover:bg-rose-50 border border-slate-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all z-20 cursor-pointer shadow-sm"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Product Image link */}
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative h-[160px] w-full overflow-hidden bg-secondary flex-shrink-0">
                    <img
                      src={fallback}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />

                    {/* Brand badge */}
                    <div className="absolute top-2.5 left-2.5 brand-badge">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: brandColor }} />
                      {product.brand}
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <Link href={`/products/${product.slug}`} className="block flex-1 mb-4">
                    <span className="text-[9px] font-extrabold text-primary tracking-widest uppercase">
                      {product.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1 hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 font-bold">
                      {product.catNo}
                    </p>
                  </Link>

                  {/* Actions footer */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="mb-3">
                      {price ? (
                        <span className="price-tag-sm text-sm">
                          PKR {price.toLocaleString('en-PK')}
                        </span>
                      ) : (
                        <span className="price-request">Request Quote</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="flex-1 btn-primary text-[10px] font-extrabold py-2 px-3 flex items-center justify-center gap-1 border-0 shadow-none"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
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
          <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4 animate-pulse" />
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
