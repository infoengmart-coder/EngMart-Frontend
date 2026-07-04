'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Product {
  name: string; slug: string; brand: string; category: string;
  catNo: string; description: string; specs: string[]; image?: string;
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
  const brandColor = BRAND_COLORS[product.brand] ?? '#1C4ED8'
  const fallback = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="glow-card flex flex-col overflow-hidden h-[380px] hover:border-primary/45 group"
      >
        {/* Product image container */}
        <div className="relative h-[200px] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
          <img
            src={imageUrl ?? fallback}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Top visual tags */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/50">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono tracking-wider uppercase">
              {product.brand}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-wider uppercase">
              In Stock
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
              {product.category}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              {product.catNo}
            </p>
          </div>

          {/* Specs tags */}
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-850/50">
            {product.specs.slice(0, 2).map((spec, si) => (
              <span
                key={si}
                className="text-[10px] font-semibold px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-md text-slate-500 dark:text-slate-400"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
