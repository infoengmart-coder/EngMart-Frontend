import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useAuthGate } from '@/lib/auth-gate'
import { useAccount } from '@/lib/account-context'
import { mediaUrl } from '@/lib/api'
import { brandLogo } from '@/lib/brand-logos'
import { brandDiscountPercent, discountedUnitPrice } from '@/lib/brand-discount'
import { ProductQuickView } from '@/components/product-quick-view'

interface Product {
  id: number; name: string; slug: string;
  brand?: string | { name?: string; color?: string; slug?: string; logo?: string | null; discount_percent?: number } | null; brand_name?: string;
  category?: string | { name?: string } | null; category_name?: string;
  series?: string; catNo?: string; short_description?: string; specs?: string[];
  image?: string | null;
  price_range?: { min: number; max: number } | null;
  has_price_on_request?: boolean;
  first_variant?: { cat_no?: string; description?: string; price?: string | null } | null;
  is_new?: boolean;
}

const BRAND_COLORS: Record<string, string> = {
  'ABB': '#CC0000', 'CHINT': '#0055AA', 'Himel': '#C41230',
  'FICO Hi-Tech': '#1B4F8A', 'PCE': '#D97706', 'Tense': '#A0281E',
  'Kondas': '#1E6FA8', 'Opas': '#1E8A4A',
}

interface ProductCardProps {
  product: Product
  imageUrl?: string
  index?: number
  isNew?: boolean
  onQuickView?: (product: Product) => void
}

export function ProductCard({ product, imageUrl, index = 0, isNew = false, onQuickView }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const brandName = typeof product.brand === 'string' ? product.brand : (product.brand?.name || product.brand_name || 'Generic')
  const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || product.category_name || 'Electrical Equipment')
  const catNo = product.catNo || product.series || product.first_variant?.cat_no || ''
  const brandColor = (typeof product.brand === 'object' && product.brand?.color) || BRAND_COLORS[brandName] || 'var(--primary)'
  // Brand-wide discount, straight off the embedded brand payload. Already
  // zeroed by the backend when the campaign is paused, so no extra guard here.
  const discountPercent = brandDiscountPercent(product.brand)
  const fallback = '/product-placeholder.svg'

  // Brand wordmark for the corner badge, replacing the coloured dot. An admin-
  // uploaded logo wins; otherwise fall back to the bundled wordmark set. If
  // neither exists the badge quietly keeps the dot, so no card is ever broken.
  const brandSlug = typeof product.brand === 'object' ? product.brand?.slug : undefined
  const uploadedBrandLogo = typeof product.brand === 'object' && product.brand?.logo
    ? mediaUrl(product.brand.logo)
    : null
  const [brandLogoFailed, setBrandLogoFailed] = useState(false)
  const brandMark = brandLogoFailed
    ? null
    : uploadedBrandLogo || brandLogo(brandName, brandSlug)
  
  let finalImg = imageUrl || fallback
  if (!imageUrl && product.image) {
    finalImg = mediaUrl(product.image) || fallback
  }

  const { add, isInCart } = useCart()
  const { requireAuth } = useAuthGate()
  const { toggleWishlist, isInWishlist } = useAccount()
  const inCart = isInCart(product.slug)
  const isNewArrival = isNew || product.is_new
  const isWishlisted = isInWishlist(product.slug) || (product.id ? isInWishlist(product.id) : false)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product as any)
  }

  // Price calculation
  //
  // With a brand discount running, the ORIGINAL price is struck through beside
  // the price actually payable. Showing only the reduced figure would leave the
  // customer unable to see the saving the storefront is advertising.
  const money = (n: number) => n.toLocaleString('en-PK', { maximumFractionDigits: 0 })
  const PriceValue = ({ value, className }: { value: number; className?: string }) =>
    discountPercent > 0 ? (
      <span className="flex items-baseline gap-1.5 flex-wrap">
        <span className={className}>{money(discountedUnitPrice(value, discountPercent))}</span>
        <span className="text-[11px] font-bold text-muted-foreground line-through decoration-1">
          {money(value)}
        </span>
      </span>
    ) : (
      <span className={className}>{money(value)}</span>
    )

  let priceDisplay: React.ReactNode = (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold shadow-2xs">
      <svg className="w-3 h-3 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      <span>Request Quote</span>
    </div>
  )

  if (product.price_range) {
    const { min, max } = product.price_range
    if (min === max && min > 0) {
      priceDisplay = (
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">PKR</span>
          <PriceValue value={min} className="text-base sm:text-lg font-black text-foreground tracking-tight" />
        </div>
      )
    } else if (min > 0 && max > 0) {
      priceDisplay = (
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">PKR</span>
          {discountPercent > 0 ? (
            <span className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-foreground tracking-tight">
                {money(discountedUnitPrice(min, discountPercent))} – {money(discountedUnitPrice(max, discountPercent))}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground line-through decoration-1">
                {money(min)} – {money(max)}
              </span>
            </span>
          ) : (
            <span className="text-sm sm:text-base font-black text-foreground tracking-tight">
              {money(min)} – {money(max)}
            </span>
          )}
        </div>
      )
    }
  } else if (product.first_variant?.price) {
    const pVal = parseFloat(product.first_variant.price)
    if (!isNaN(pVal) && pVal > 0) {
      priceDisplay = (
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">PKR</span>
          <PriceValue value={pVal} className="text-base sm:text-lg font-black text-foreground tracking-tight" />
        </div>
      )
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    requireAuth(() => doAdd())
  }

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product)
    } else {
      setQuickViewOpen(true)
    }
  }

  const doAdd = () => {
    let unitPrice = 0
    let isPriceOnRequest = product.has_price_on_request ?? true
    const rangeMin = product.price_range?.min ?? 0
    if (rangeMin > 0) {
      unitPrice = rangeMin
      isPriceOnRequest = false
    } else if (product.first_variant?.price) {
      const pVal = parseFloat(product.first_variant.price)
      if (!isNaN(pVal) && pVal > 0) {
        unitPrice = pVal
        isPriceOnRequest = false
      }
    }

    add({
      slug: product.slug,
      productId: product.id,
      variantId: null,
      name: product.name,
      brand: brandName,
      brandSlug: brandSlug,
      brandColor: brandColor,
      category: categoryName,
      catNo: catNo,
      variantDescription: product.first_variant?.description || '',
      image: finalImg,
      // The UNDISCOUNTED unit price. The cart re-applies today's brand
      // percentage on top, so storing the reduced figure here would discount
      // the same line twice.
      unitPrice,
      isPriceOnRequest,
      discountPercent,
    })
  }

  const specsList = Array.isArray(product.specs) ? product.specs : (product.short_description ? [product.short_description] : [])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.4, ease: "easeOut" }}
        className="group relative flex flex-col overflow-hidden h-full bg-white rounded-2xl border-2 border-gray-200/80 shadow-md hover:shadow-2xl hover:border-primary/60 transition-all duration-300 ease-in-out"
      >
        {/* Premium Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/30 opacity-80 group-hover:opacity-100 transition-opacity duration-300 z-30" />

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Product Image Stage */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100/50 to-white shrink-0 flex items-center justify-center">
          {/* Decorative Ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[85%] h-[85%] rounded-full border-2 border-primary/5 group-hover:border-primary/20 transition-all duration-500" />
          </div>

          <Link href={`/products/${product.slug}`} className="block w-full h-full p-4 relative z-10">
            <img
              src={finalImg}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md group-hover:drop-shadow-xl"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallback
              }}
            />
          </Link>

          {/* Brand Badge — shows the manufacturer's wordmark rather than a
              coloured dot, so the brand is recognisable at a glance. */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-[11px] font-bold border-2 border-gray-200/80 shadow-lg flex items-center gap-2 text-gray-800 max-w-[70%]">
            {brandMark ? (
              <img
                src={brandMark}
                alt={brandName}
                loading="lazy"
                // Capped by height so tall square marks and wide wordmarks both
                // sit on the same baseline inside the pill.
                className="h-4 w-auto max-w-[76px] object-contain shrink-0"
                onError={() => setBrandLogoFailed(true)}
              />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full shadow-inner shrink-0" style={{ backgroundColor: brandColor }} />
            )}
            <span className="truncate">{brandName}</span>
          </div>

          {/* Wishlist Heart Icon Button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 ${isNewArrival ? 'right-28' : 'right-3'} z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md border ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600 scale-105'
                : 'bg-white/90 hover:bg-white border-gray-200/80 text-gray-400 hover:text-rose-500'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 transition-transform duration-200 ${isWishlisted ? 'fill-rose-600 text-rose-600 scale-110' : ''}`} />
          </button>

          {/* Brand discount ribbon — bottom-left so it never collides with the
              wishlist heart or the New Arrival pill in the top corners. */}
          {discountPercent > 0 && (
            <div className="absolute bottom-3 left-3 z-20 bg-gradient-to-r from-rose-600 to-red-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide text-white shadow-lg border border-white/20">
              {discountPercent}% OFF
            </div>
          )}

          {/* NEW ARRIVAL Badge - Gradient Premium */}
          {isNewArrival && (
            <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5 border border-white/20">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              ✨ New Arrival
            </div>
          )}

          {/* Quick Action Overlay - Premium Glass */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 p-4 pointer-events-none group-hover:pointer-events-auto">
            <button
              onClick={handleQuickViewClick}
              className="bg-white text-gray-900 hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-2xl transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2 cursor-pointer active:scale-95 border-2 border-white/30 hover:border-primary/30"
              title="Quick View Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Quick View
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-primary text-white hover:bg-primary/90 p-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 cursor-pointer active:scale-95 border-2 border-white/20 hover:border-white/40"
              title={inCart ? "Already in Cart" : "Quick Add to Cart"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            </button>
          </div>
        </div>

        {/* Content Area - Clean & Premium */}
        <div className="p-5 flex flex-col flex-1 bg-white justify-between">
          <Link href={`/products/${product.slug}`} className="block flex-1">
            {/* Category & Catalog Number */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-primary/80 tracking-widest uppercase line-clamp-1">
                {categoryName}
              </span>
              {catNo && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg border border-gray-200/80 shadow-sm">
                  #{catNo}
                </span>
              )}
            </div>

            {/* Product Name - Clean Typography */}
            <h3 className="text-sm font-bold text-gray-900 mt-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>

            {/* Specs Tags - Modern Pill Design */}
            {specsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {specsList.slice(0, 2).map((spec: string, si: number) => (
                  <span
                    key={si}
                    className="text-[10px] font-semibold px-3 py-1 bg-gray-50 border border-gray-200/80 rounded-full text-gray-600 line-clamp-1 shadow-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </Link>

          {/* Price + Add to Cart - Clean Bottom Section */}
          <div className="mt-4 pt-4 border-t-2 border-gray-100 flex flex-col gap-3">
            {/* Price Row */}
            <div className="flex items-center justify-between">
              {priceDisplay}
            </div>

            {/* Premium Gradient Action Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full relative overflow-hidden font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-xl ${
                inCart 
                  ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100' 
                  : 'bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary border-2 border-primary/20 hover:border-primary/40'
              }`}
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {inCart ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  Added to Cart ✓
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Internal Quick View Modal */}
      {!onQuickView && (
        <ProductQuickView
          product={{ ...product, is_new: isNewArrival }}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  )
}