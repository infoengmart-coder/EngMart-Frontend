'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart'

interface Product {
  name: string; slug: string; brand: string; category: string;
  catNo: string; description: string; specs: string[]; image?: string;
  badge?: string; badgeColor?: string;
}

const BRAND_COLORS: Record<string, string> = {
  'ABB': '#CC0000', 'CHINT': '#0055AA', 'Himel': '#C41230',
  'FICO Hi-Tech': '#1B4F8A', 'PCE': '#D97706', 'Tense': '#A0281E',
  'Kondas': '#1E6FA8', 'Opas': '#1E8A4A',
}

// Price map for products that have visible pricing
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

interface ProductCardProps {
  product: Product
  imageUrl?: string
  index?: number
}

export function ProductCard({ product, imageUrl, index = 0 }: ProductCardProps) {
  const brandColor = BRAND_COLORS[product.brand] ?? '#1C4ED8'
  const fallback = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
  const { add, isInCart } = useCart()
  const inCart = isInCart(product.slug)
  const price = PKR_PRICES[product.slug]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    add({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      catNo: product.catNo,
      badge: product.badge || '',
      badgeColor: product.badgeColor || brandColor,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="store-card flex flex-col overflow-hidden h-full"
    >
      {/* Product image — clickable to detail */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-[180px] w-full overflow-hidden bg-secondary flex-shrink-0">
          <img
            src={imageUrl ?? fallback}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Brand badge — top left */}
          <div className="absolute top-2.5 left-2.5 brand-badge">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: brandColor }} />
            {product.brand}
          </div>

          {/* Stock status — top right */}
          <div className="absolute top-2.5 right-2.5 stock-badge stock-in">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            In Stock
          </div>
        </div>
      </Link>

      {/* Content area */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="block flex-1">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            {product.category}
          </span>
          <h3 className="text-sm font-semibold text-foreground mt-1 hover:text-primary transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {product.catNo}
          </p>

          {/* Specs tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {product.specs.slice(0, 2).map((spec, si) => (
              <span
                key={si}
                className="text-[10px] font-medium px-1.5 py-0.5 bg-secondary border border-border rounded text-muted-foreground"
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
            {price ? (
              <span className="price-tag-sm">
                PKR {price.toLocaleString('en-PK')}
                <span className="text-xs text-muted-foreground font-normal ml-1">onwards</span>
              </span>
            ) : (
              <span className="price-request">Request Quote</span>
            )}
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
