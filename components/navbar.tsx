'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { CATEGORIES, BRANDS, ALL_PRODUCTS, SITE } from '@/lib/data'
import { useCart } from '@/lib/cart'
import { useTheme } from '@/lib/theme'

const NAV_LINKS = [
  { label: 'Products', href: '/products', hasMega: true },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const { count } = useCart()
  const { isDark, toggleTheme } = useTheme()

  const searchResults = searchQuery.trim().length > 1
    ? ALL_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.catNo.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMegaOpen(false); setMobileOpen(false); setSearchOpen(false) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openMega = () => { if (megaTimer.current) clearTimeout(megaTimer.current); setMegaOpen(true) }
  const closeMega = () => { megaTimer.current = setTimeout(() => setMegaOpen(false), 150) }

  return (
    <>
      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 z-[200] backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[201] w-full max-w-2xl px-4"
              initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search catalog (e.g. ABB contactor, MCB 10A...)"
                    className="flex-1 bg-transparent outline-none text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    onKeyDown={e => e.key === 'Enter' && searchQuery && (window.location.href = `/products?q=${searchQuery}`)}
                    autoFocus
                  />
                  <kbd className="hidden sm:inline-flex items-center h-5 select-none pointer-events-none gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">ESC</kbd>
                </div>
                {searchResults.length > 0 ? (
                  <div className="py-2 max-h-80 overflow-y-auto">
                    {searchResults.map(p => (
                      <Link key={p.slug} href={`/products/${p.slug}`} onClick={() => setSearchOpen(false)}
                        className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <div>
                          <p className="text-[14px] font-semibold text-slate-950 dark:text-slate-50 group-hover:text-primary transition-colors">{p.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">{p.catNo} · {p.brand}</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-[14px] text-slate-400">No products match "<span className="text-slate-950 dark:text-slate-50 font-medium">{searchQuery}</span>"</p>
                  </div>
                ) : (
                  <div className="px-5 py-5">
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">Suggested Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {['ABB MCB', 'Magnetic Contactor', 'Current Transformer', 'CHINT MCCB', 'PCE Socket'].map(t => (
                        <button key={t} onClick={() => setSearchQuery(t)} className="px-3 py-1.5 text-[12px] bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        initial={{ y: -80 }} animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl border-slate-200/60 dark:border-slate-800/60 shadow-lg'
              : 'bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border-slate-200/30 dark:border-slate-800/30'
          }`}>
            <div className="flex items-center justify-between h-16 px-6">
              
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-primary/20 group-hover:scale-105 transition-all">
                  E
                </div>
                <div>
                  <div className="flex items-baseline font-extrabold text-[16px] tracking-tight">
                    <span className="text-slate-900 dark:text-white">Eng</span>
                    <span className="text-primary">-Mart</span>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-widest -mt-1 uppercase">Industrial</p>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map(link =>
                  link.hasMega ? (
                    <div key={link.label} onMouseEnter={openMega} onMouseLeave={closeMega} className="relative">
                      <button className="flex items-center gap-1 px-4 py-2 text-[14px] font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 rounded-full transition-all">
                        {link.label}
                        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${megaOpen ? 'rotate-180 text-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
                      </button>
                    </div>
                  ) : (
                    <Link key={link.label} href={link.href} className="px-4 py-2 text-[14px] font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 rounded-full transition-all">
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              {/* Utility controls */}
              <div className="flex items-center gap-2">
                {/* Search trigger */}
                <button
                  onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-full transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <span className="hidden sm:inline font-semibold">Search</span>
                  <span className="hidden sm:inline-flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1 rounded text-[9px] font-mono">⌘K</span>
                </button>

                {/* Account / Login link */}
                <Link href="/login" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-all cursor-pointer" aria-label="Account">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </Link>

                {/* Cart link */}
                <Link href="/cart" className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {count}
                    </span>
                  )}
                </Link>

                {/* Premium CTA */}
                <Link href="/contact" className="hidden sm:inline-flex btn-premium-primary text-[13px] py-2 px-5">
                  Get Quote
                </Link>

                {/* Mobile Drawer Trigger */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <div className="w-5 space-y-1.5">
                    <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              className="absolute left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={openMega} onMouseLeave={closeMega}
            >
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-2xl grid grid-cols-12 gap-8">
                <div className="col-span-8">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-4">Product Categories</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.slice(0, 9).map(cat => (
                      <Link key={cat.slug} href={`/categories/${cat.slug}`} onClick={() => setMegaOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-all">
                          {cat.icon || '⚡'}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors leading-tight">{cat.short}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{cat.count}+ Products</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="col-span-4 border-l border-slate-100 dark:border-slate-800 pl-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-4">Official Brands</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {BRANDS.slice(0, 6).map(brand => (
                        <Link key={brand.slug} href={`/brands/${brand.slug}`} onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-all">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.color }} />
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                    <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100">Need Bulk Pricing?</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Send us your bill of quantities for wholesale rates.</p>
                    <Link href="/contact" onClick={() => setMegaOpen(false)} className="btn-premium-primary text-[12px] py-2 w-full">
                      Submit RFQ
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="lg:hidden fixed inset-x-4 top-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-2xl z-40 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map(link => (
                  <Link key={link.label} href={link.href} className="px-4 py-3 text-base font-bold text-slate-800 dark:text-slate-200 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-all" onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.slice(0, 6).map(cat => (
                    <Link key={cat.slug} href={`/categories/${cat.slug}`} className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 text-[12px] font-semibold text-slate-600 dark:text-slate-300" onClick={() => setMobileOpen(false)}>
                      <span>{cat.icon || '⚡'}</span>
                      {cat.short}
                    </Link>
                  ))}
                </div>
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                
                <Link href="/contact" className="btn-premium-primary py-3 text-center" onClick={() => setMobileOpen(false)}>Get Quote</Link>
                <a href={`tel:${SITE.phone}`} className="btn-premium-secondary py-3 text-center" onClick={() => setMobileOpen(false)}>Call Direct</a>
                <Link href="/login" className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs" onClick={() => setMobileOpen(false)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  My Account / Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
