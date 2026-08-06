'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart'
import { mediaUrl } from '@/lib/api'

// Structurally compatible with the lib/api Product shape; legacy static
// cards may still pass string brand/category and a specs array.
interface Product {
  id: number; name: string; slug: string;
  brand?: string | { name?: string; color?: string } | null; brand_name?: string;
  category?: string | { name?: string } | null; category_name?: string;
  series?: string; catNo?: string; short_description?: string; specs?: string[];
  image?: string | null;
  price_range?: { min: number; max: number } | null;
  has_price_on_request?: boolean;
  first_variant?: { cat_no?: string; description?: string; price?: string | null } | null;
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
}

export function ProductCard({ product, imageUrl, index = 0 }: ProductCardProps) {
  const brandName = typeof product.brand === 'string' ? product.brand : (product.brand?.name || product.brand_name || 'Generic')
  const categoryName = typeof product.category === 'string' ? product.category : (product.category?.name || product.category_name || 'Electrical Equipment')
  const catNo = product.catNo || product.series || product.first_variant?.cat_no || ''
  const brandColor = (typeof product.brand === 'object' && product.brand?.color) || BRAND_COLORS[brandName] || 'var(--primary)'
  const fallback = '/product-placeholder.svg'
  
  // Format image URL
  // mediaUrl() derives the backend origin from NEXT_PUBLIC_API_URL. Hardcoding
  // localhost here meant every product image 404'd once deployed.
  let finalImg = imageUrl || fallback
  if (!imageUrl && product.image) {
    finalImg = mediaUrl(product.image) || fallback
  }

  const { add, isInCart } = useCart()
  const inCart = isInCart(product.slug)

  // Price calculation
  let priceDisplay: React.ReactNode = <span className="price-request">Request Quote</span>
  if (product.price_range) {
    const { min, max } = product.price_range
    if (min === max && min > 0) {
      priceDisplay = (
        <span className="price-tag-sm">
          PKR {min.toLocaleString('en-PK')}
        </span>
      )
    } else if (min > 0 && max > 0) {
      priceDisplay = (
        <span className="price-tag-sm">
          PKR {min.toLocaleString('en-PK')} – {max.toLocaleString('en-PK')}
        </span>
      )
    }
  } else if (product.first_variant?.price) {
    const pVal = parseFloat(product.first_variant.price)
    if (!isNaN(pVal) && pVal > 0) {
      priceDisplay = (
        <span className="price-tag-sm">
          PKR {pVal.toLocaleString('en-PK')}
        </span>
      )
    }
  }
  // No real price in the payload → the card stays on "Request Quote".
  // Never invent a number here: quoted prices are a business commitment.

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Determine the best price to use
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
      brandColor: brandColor,
      category: categoryName,
      catNo: catNo,
      variantDescription: product.first_variant?.description || '',
      image: finalImg,
      unitPrice,
      isPriceOnRequest,
    })
  }

  const specsList = Array.isArray(product.specs) ? product.specs : (product.short_description ? [product.short_description] : [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.3 }}
      className="store-card flex flex-col overflow-hidden h-full"
    >
      {/* Product image — clickable to detail */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary shrink-0">
          <img
            src={finalImg}
            alt={product.name}
            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallback
            }}
          />

          {/* Brand badge — top left */}
          <div className="absolute top-2.5 left-2.5 brand-badge">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: brandColor }} />
            {brandName}
          </div>
          {/* No stock badge: the API has no stock data, and a hardcoded
              "In Stock" on every card is a promise the store can't keep. */}
        </div>
      </Link>

      {/* Content area */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="block flex-1">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase line-clamp-1">
            {categoryName}
          </span>
          <h3 className="text-sm font-semibold text-foreground mt-1 hover:text-primary transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          {catNo && (
            <p className="text-xs text-muted-foreground font-mono mt-1 line-clamp-1">
              {catNo}
            </p>
          )}

          {/* Specs tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {specsList.slice(0, 2).map((spec: string, si: number) => (
              <span
                key={si}
                className="text-[10px] font-medium px-1.5 py-0.5 bg-secondary border border-border rounded text-muted-foreground line-clamp-1"
              >
                {spec}
              </span>
            ))}
          </div>
        </Link>

        {/* Price + Add to Cart */}
        <div className="mt-3 pt-3 border-t border-border">
          {/* Price */}
          <div className="mb-2.5">
            {priceDisplay}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className={`btn-cart ${inCart ? 'btn-cart-added' : ''}`}
          >
            {inCart ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                Added
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
