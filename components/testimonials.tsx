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
    <section className="py-24 bg-white dark:bg-slate-950 relative">
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">Success Stories</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Trusted by Pakistan's Engineers
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-base sm:text-lg">
            Read stories from panel builders, facility managers, and electrical project contractors.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glow-card p-6 flex flex-col justify-between hover:border-primary/20"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Stars count={t.rating} />
                  {/* Decorative quote mark */}
                  <svg className="w-8 h-8 text-slate-200 dark:text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                <blockquote className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.text}"
                </blockquote>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-850/50">
                {/* Profile initials graphic */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-none">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    {t.role} — <span className="font-semibold text-slate-500">{t.company}</span>
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
