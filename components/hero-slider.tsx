'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

const SLIDES = [
  {
    title: 'Power Your Ideas with Precision',
    desc: 'Build Smarter Circuits. Start with Engineering Mart',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=1200',
  },
  {
    title: 'High-Performance Protection',
    desc: 'WAPDA Approved Switchgear for Every Application',
    image: 'https://images.unsplash.com/photo-1531986371515-b3f9479b1856?auto=format&fit=crop&q=80&w=1200',
  },
  {
    title: 'Industrial Scale Solutions',
    desc: 'Authorized Distributor for 8+ Global Brands',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
  }
]

const SIDE_BANNERS = [
  {
    title: 'COMPLETE SOLUTIONS',
    subtitle: 'FOR YOUR ELECTRICAL NEEDS',
    desc: 'Fixing Your Circuit Problems — Fast, Accurate, Reliable. With top-quality parts, expert guidance, and fast service.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'BULK DISCOUNTS',
    subtitle: 'ON PROJECT ORDERS',
    desc: 'Save more on large-scale procurement and industrial supplies. Volume pricing available.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400'
  },
]

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0)
  const isAnimating = useRef(false)

  const goTo = (idx: number) => {
    if (isAnimating.current || idx === activeSlide) return
    isAnimating.current = true
    setActiveSlide(idx)
    setTimeout(() => { isAnimating.current = false }, 700)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(s => (s + 1) % SLIDES.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-background py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 min-h-[300px] sm:min-h-[400px] lg:h-[480px]">

          {/* Main Carousel */}
          <div className="lg:col-span-3 relative rounded-lg overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${SLIDES[activeSlide].image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-[2px] bg-primary" />
                      <span className="text-primary text-xs font-bold uppercase tracking-widest">Premium Selection</span>
                    </div>
                    <h1 className="text-white text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 max-w-xl">
                      {SLIDES[activeSlide].title}
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base font-medium mb-6 max-w-md">
                      {SLIDES[activeSlide].desc}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/products" className="btn-primary text-sm py-2.5 px-6">
                        Browse Catalog
                      </Link>
                      <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-colors border border-white/20">
                        Get Quote
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-400 ${idx === activeSlide ? 'w-7 bg-white' : 'w-2 bg-white/40'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <button
              onClick={() => goTo((activeSlide - 1 + SLIDES.length) % SLIDES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-20"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => goTo((activeSlide + 1) % SLIDES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-20"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Side Banners */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
            {SIDE_BANNERS.map((banner, i) => (
              <Link
                key={i}
                href="/products"
                className="relative rounded-lg overflow-hidden group block min-h-[160px] lg:min-h-0"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-5">
                  <h3 className="text-primary text-[10px] font-bold tracking-widest mb-1 uppercase">
                    {banner.title}
                  </h3>
                  <p className="text-white text-sm font-bold leading-tight uppercase mb-1.5">
                    {banner.subtitle}
                  </p>
                  <p className="text-white/60 text-[10px] leading-relaxed line-clamp-2">
                    {banner.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
