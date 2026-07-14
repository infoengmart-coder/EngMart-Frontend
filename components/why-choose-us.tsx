'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { WHY_CHOOSE } from '@/lib/data'

const TRUST_ICONS = ['✅', '🌍', '⚡', '💰', '📞', '📍']

export function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left panel */}
          <div className="lg:col-span-4">
            <span className="section-label">The Eng-Mart Difference</span>
            <h2 className="section-title mt-1 mb-4">
              Why Contractors <br className="hidden sm:block" />Choose Us
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              We stand by engineering integrity. Contractors and panel builders in Karachi rely on our direct wholesale prices, transparent stock tracking, and original product certificates.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link href="/products" className="btn-primary text-sm py-2 px-5">
                Browse Catalog
              </Link>
              <Link href="/contact" className="btn-secondary text-sm py-2 px-5">
                Talk to Sales
              </Link>
            </div>
          </div>

          {/* Right panel — feature list */}
          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-3">
            {WHY_CHOOSE.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="store-card p-4 flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary border border-border text-foreground flex items-center justify-center text-base flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  {TRUST_ICONS[idx] || '✓'}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
