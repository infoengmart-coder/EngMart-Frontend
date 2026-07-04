'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 8, suffix: '', label: 'Global Brands' },
  { value: 2500, suffix: '+', label: 'Products Sourced' },
  { value: 14, suffix: '', label: 'Product Categories' },
  { value: 500, suffix: '+', label: 'Active Clients' },
]

const POINTS = [
  { title: 'Authentic Supply', desc: '100% genuine products sourced directly from manufacturers.' },
  { title: 'Rapid Quotes', desc: 'Formal quotations and detailed pricing sent in 24 hours.' },
  { title: 'Karachi Delivery', desc: 'Same-day dispatch for all items in local stock.' },
  { title: 'Certified Equipment', desc: 'WAPDA approved current transformers & protective gear.' },
]

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const counters = ref.current.querySelectorAll('[data-counter]')
    counters.forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10)
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = Math.floor(obj.val).toLocaleString()
        },
      })
    })
  }, [])

  return (
    <section ref={ref} className="py-24 bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
      {/* Background visual details (21.dev style) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.1),transparent_50%)]" />
        <div className="absolute inset-0 grid-pattern opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left panel: Counters */}
          <div>
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Verified Sourcing</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2 mb-10 leading-tight">
              Powering Pakistan's <br />
              Industrial Infrastructure
            </h2>
            
            <div className="grid grid-cols-2 gap-8">
              {STATS.map((s, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800/60 backdrop-blur-sm">
                  <div className="flex items-baseline text-4xl sm:text-5xl font-black text-white tracking-tight">
                    <span data-counter data-target={s.value}>0</span>
                    <span className="text-blue-400 ml-0.5">{s.suffix}</span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm font-semibold mt-2 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Value props */}
          <div className="space-y-6">
            {POINTS.map((pt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/20 hover:bg-slate-800/40 border border-slate-800/30 hover:border-slate-850 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-all">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{pt.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{pt.desc}</p>
                </div>
              </motion.div>
            ))}
            
            <div className="pt-4 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-premium-primary text-[13px]">
                Get a Quote Now
              </Link>
              <Link href="/about" className="px-6 py-2.5 rounded-full bg-transparent hover:bg-slate-800 text-[13px] font-semibold text-white border border-slate-800 hover:border-slate-700 transition-all">
                About Us
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
