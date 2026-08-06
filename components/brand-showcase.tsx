'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BRANDS } from '@/lib/data'

export function BrandShowcase() {
  return (
    <section className="py-10 bg-secondary/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

          <div className="flex-shrink-0 text-center lg:text-left">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Authorized Distributor</span>
            <h2 className="text-lg font-bold text-foreground mt-0.5">Official Brand Partners</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href={`/brands/${brand.slug}`}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 bg-card hover:bg-card border border-border hover:border-primary/30 rounded-lg transition-all group"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: brand.color }} />
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {brand.country}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
