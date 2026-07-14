'use client'

import { motion } from 'framer-motion'
import { TESTIMONIALS } from '@/lib/data'

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="py-12 sm:py-16 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-label">Client Reviews</span>
          <h2 className="section-title mt-1">Trusted by Pakistan's Engineers</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Read what panel builders, facility managers, and electrical contractors say about us.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="store-card p-5 flex flex-col justify-between"
            >
              <div>
                <Stars count={t.rating} />
                <blockquote className="text-sm text-muted-foreground leading-relaxed mt-3">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
              </div>

              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground leading-none">
                    {t.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
