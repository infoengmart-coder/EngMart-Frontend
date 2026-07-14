'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { SITE, CATEGORIES } from '@/lib/data'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { count } = useCart()
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* ══ TOP UTILITY BAR ══ */}
      <div className="bg-foreground text-primary-foreground text-xs hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9">
            <div className="flex items-center gap-4">
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {SITE.phone}
              </a>
              <span className="text-white/30">|</span>
              <a href={`mailto:${SITE.email}`} className="text-white/80 hover:text-white transition-colors">
                {SITE.email}
              </a>
              <span className="text-white/30">|</span>
              <span className="text-white/60">{SITE.hours}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/account/orders" className="text-white/80 hover:text-white transition-colors font-medium">Track Order</Link>
              <span className="text-white/30">|</span>
              <a
                href={`https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, '')}?text=Hi Eng-Mart, I need help with electrical products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN HEADER ══ */}
      <header className={`sticky top-0 z-[100] store-header transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-6 h-16">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/header_logo.png"
                alt="Eng-Mart"
                width={160}
                height={40}
                className="h-9 sm:h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Navigation Links — Replaced Search Bar */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-8 relative">
              {NAV_LINKS.map(link => 
                link.label === 'Categories' ? (
                  <div key={link.label} className="group relative">
                    <Link href={link.href} className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors py-4">
                      {link.label}
                      <svg className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </Link>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="w-[500px] bg-card border border-border rounded-xl shadow-xl p-4 grid grid-cols-2 gap-2">
                        {CATEGORIES.slice(0, 10).map(cat => (
                          <Link key={cat.slug} href={`/categories/${cat.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group/item">
                            <div className="w-10 h-10 rounded-lg bg-secondary border border-border text-primary flex items-center justify-center text-lg shadow-sm group-hover/item:border-primary/30 group-hover/item:bg-primary/5 transition-all">
                              {cat.icon || '⚡'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors leading-tight mb-0.5">{cat.short}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{cat.count}+ Products</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link key={link.label} href={link.href} className="text-sm font-semibold text-foreground hover:text-primary transition-colors py-4">
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-auto lg:ml-0">

              {/* Login or My Account dropdown */}
              {isAuthenticated ? (
                <div className="group relative">
                  <Link href="/account" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white hover:opacity-90 font-semibold text-sm transition-all shadow-sm" aria-label="My Account">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="hidden lg:inline">My Account</span>
                  </Link>
                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 space-y-0.5 text-xs text-slate-700">
                      <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                        <p className="font-extrabold text-slate-900 leading-none">{user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{user?.email}</p>
                      </div>
                      <Link href="/account" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 font-bold transition-all text-slate-800">
                        Overview
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 font-bold transition-all text-slate-800">
                        Order History
                      </Link>
                      <Link href="/account/wishlist" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 font-bold transition-all text-slate-800">
                        Saved Wishlist
                      </Link>
                      <Link href="/account/quotes" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 font-bold transition-all text-slate-800">
                        Quotes Request
                      </Link>
                      <div className="h-px bg-slate-100 my-1.5" />
                      <button onClick={logout} className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-rose-50 text-rose-600 font-bold transition-all text-left cursor-pointer">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground font-semibold text-sm transition-all" aria-label="Login">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                  <span className="hidden lg:inline">Login</span>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative flex items-center gap-1.5 px-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all" aria-label="Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                <span className="text-sm font-medium hidden lg:inline">Cart</span>
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {count}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all" aria-label="Menu">
                <div className="w-5 space-y-1.5">
                  <span className={`block h-0.5 bg-current transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-0.5 bg-current transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 bg-current transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ══ MOBILE NAV DRAWER ══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-foreground/30 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed inset-y-0 right-0 w-4/5 max-w-sm bg-card z-50 shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-5">
                {/* Close button */}
                <div className="flex items-center justify-between mb-6">
                  <Image src="/header_logo.png" alt="Eng-Mart" width={120} height={32} className="h-8 w-auto" />
                  <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                {/* Nav Links */}
                <div className="space-y-1 mb-5">
                  {NAV_LINKS.map(link => (
                    <Link key={link.label} href={link.href}
                      className="block px-3 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                      onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Accounts Section */}
                <div className="border-t border-border pt-5 space-y-3">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">My Account ({user?.name})</p>
                      <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-slate-800 hover:text-primary hover:bg-slate-50 rounded-lg">
                        Overview
                      </Link>
                      <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-slate-800 hover:text-primary hover:bg-slate-50 rounded-lg">
                        Order History
                      </Link>
                      <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-slate-800 hover:text-primary hover:bg-slate-50 rounded-lg">
                        Saved Wishlist
                      </Link>
                      <Link href="/account/quotes" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-slate-800 hover:text-primary hover:bg-slate-50 rounded-lg">
                        Quote Requests
                      </Link>
                      <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg text-left cursor-pointer">
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                      Login
                    </Link>
                  )}

                  <div className="h-px bg-slate-100 my-2" />

                  <a href={`tel:${SITE.phone}`} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {SITE.phone}
                  </a>
                  <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {SITE.email}
                  </a>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

