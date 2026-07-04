'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'

const SLIDES = [
  {
    title: 'Power Your Ideas with Precision',
    desc: 'Build Smarter Circuits. Start with Engineering Mart',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=1200',
    color: '#F97316'
  },
  {
    title: 'High-Performance Protection',
    desc: 'WAPDA Approved Switchgear for Every Application',
    image: 'https://images.unsplash.com/photo-1531986371515-b3f9479b1856?auto=format&fit=crop&q=80&w=1200',
    color: '#2563EB'
  },
  {
    title: 'Industrial Scale Solutions',
    desc: 'Authorized Distributor for 8+ Global Brands',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    color: '#059669'
  }
]

const SIDE_BANNERS = [
  {
    title: 'COMPLETE SOLUTIONS',
    subtitle: 'FOR YOUR ELECTRICAL NEEDS',
    desc: 'Fixing Your Circuit Problems — Fast, Accurate, Reliable.',
    color: '#00D4FF',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'BULK DISCOUNTS',
    subtitle: 'ON PROJECT ORDERS',
    desc: 'Save more on large-scale procurement and industrial supplies.',
    color: '#F97316',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'TECHNICAL SUPPORT',
    subtitle: 'EXPERT CONSULTATION',
    desc: 'Our engineers help you select the right product for your application.',
    color: '#059669',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400'
  }
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
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
    <section className="bg-white dark:bg-[#0F172A] py-6 sm:py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[450px] lg:h-[550px]">
          
          {/* Main Carousel (3 columns) */}
          <div ref={containerRef} className="lg:col-span-3 relative rounded-3xl overflow-hidden shadow-xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background Image with Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear group-hover:scale-110"
                  style={{ backgroundImage: `url(${SLIDES[activeSlide].image})` }}
                />
                <div className="absolute inset-0 bg-black/40 bg-gradient-to-r from-black/70 to-transparent" />
                
                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-10 h-[2px] bg-orange-500" />
                      <span className="text-orange-500 text-xs font-black uppercase tracking-widest">Premium Selection</span>
                    </div>
                    <h1 className="text-white text-[clamp(1.5rem,6vw,3.5rem)] font-black leading-[1.1] mb-5 max-w-2xl drop-shadow-lg">
                      {SLIDES[activeSlide].title}
                    </h1>
                    <p className="text-white/80 text-base sm:text-lg font-medium mb-10 max-w-lg leading-relaxed">
                      {SLIDES[activeSlide].desc}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link href="/products" className="px-10 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-black rounded-xl transition-all shadow-xl hover:shadow-orange-500/20 uppercase tracking-wide text-sm">
                        Browse Catalog
                      </Link>
                      <Link href="/contact" className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black rounded-xl transition-all border border-white/20 uppercase tracking-wide text-sm">
                        Get Quote
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeSlide ? 'w-8 bg-white shadow-glow' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <button 
              onClick={() => goTo((activeSlide - 1 + SLIDES.length) % SLIDES.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-white/20 z-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => goTo((activeSlide + 1) % SLIDES.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center border border-white/20 z-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Right Side Banners (1 column, 2 items) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {SIDE_BANNERS.map((banner, i) => (
              <Link 
                key={i}
                href="/products"
                className="flex-1 relative rounded-3xl overflow-hidden group shadow-lg"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                  <h3 className="text-[#00D4FF] text-[10px] font-black tracking-[0.2em] mb-2 uppercase">
                    {banner.title}
                  </h3>
                  <p className="text-white text-base font-black mb-3 leading-tight uppercase">
                    {banner.subtitle}
                  </p>
                  <p className="text-white/50 text-[10px] leading-relaxed max-w-[170px] font-medium">
                    {banner.desc}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-white text-[10px] font-black underline underline-offset-4 tracking-widest">DISCOVER NOW</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
