'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '@/lib/data'
import { getProducts } from '@/lib/api'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { useSiteSettings } from '@/lib/site-settings'
import { useScrollLock } from '@/components/confirm-dialog'
import { NotificationBell } from '@/components/notification-bell'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]


export function Navbar() {
  const { settings: SITE } = useSiteSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const [coarsePointer, setCoarsePointer] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const acctRef = useRef<HTMLDivElement>(null)
  const { count } = useCart()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()

  // What to call the signed-in customer in the header. `name` falls back to the
  // username server-side, which can be an email-derived string like
  // "syedzakihaider200680" — long and unfriendly — so prefer the real first
  // name when we have one and keep the rest as a last resort.
  const accountLabel =
    user?.first_name?.trim()
    || user?.name?.trim().split(/\s+/)[0]
    || 'My Account'
  const accountInitial = (accountLabel[0] || 'A').toUpperCase()

  // Lock body scroll while the mobile drawer is open
  useScrollLock(mobileOpen)

  // Live search against the REAL catalog.
  //
  // This used to filter a hardcoded 17-product demo array, so the most visible
  // search box on the site missed 4,700+ products and its results linked to
  // slugs that 404. Debounced so we issue one request per pause, not per key.
  const [searchResults, setSearchResults] = useState<
    { name: string; slug: string; brand: string; category: string; catNo: string }[]
  >([])
  const [searching, setSearching] = useState(false)
  const searchSeq = useRef(0)

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const seq = ++searchSeq.current
    const timer = setTimeout(async () => {
      try {
        const res = await getProducts({ search: q, page_size: 6 })
        // Ignore a response that arrived after a newer keystroke.
        if (seq !== searchSeq.current) return
        setSearchResults(
          (res.results || []).map(p => ({
            name: p.name,
            slug: p.slug,
            brand: p.brand_name || p.brand?.name || '',
            category: p.category_name || p.category?.name || '',
            catNo: p.first_variant?.cat_no || p.series || '',
          })),
        )
      } catch {
        if (seq === searchSeq.current) setSearchResults([])
      } finally {
        if (seq === searchSeq.current) setSearching(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setSearchQuery('')
        setCatOpen(false)
        setAcctOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Detect coarse (touch) pointers so hover menus become click-to-toggle
  useEffect(() => {
    if (typeof window.matchMedia === 'function') {
      setCoarsePointer(window.matchMedia('(pointer: coarse)').matches)
    }
  }, [])

  // Close search dropdown / hover menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) {
        setAcctOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Magnifier tap on mobile: open the drawer (search is pinned at its top) and focus it
  const handleMobileSearch = () => {
    setMobileOpen(true)
    setTimeout(() => inputRef.current?.focus(), 300)
  }

  const showDropdown = searchFocused && searchQuery.trim().length > 0

  // Pressing Enter in either search box runs the full catalogue search.
  // Previously Enter did nothing at all: the only route to a results page was
  // noticing the small "View all results" link at the foot of the dropdown, so
  // a customer who typed a model number and hit Enter simply sat there.
  const router = useRouter()
  const submitSearch = () => {
    const term = searchQuery.trim()
    if (!term) return
    setSearchFocused(false)
    setMobileOpen(false)
    router.push(`/products?q=${encodeURIComponent(term)}`)
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitSearch()
    }
  }

  return (
    <>
      {/* ══ TOP UTILITY BAR ══ */}
      <div className="bg-foreground text-primary-foreground text-xs hidden sm:block print-hide-when-invoice">
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
              {isAdmin && (
                <>
                  <Link href="/admin" className="flex items-center gap-1 text-[var(--color-admin)] font-extrabold hover:opacity-80 transition-opacity">
                    ⚡ Admin Dashboard
                  </Link>
                  <span className="text-white/30">|</span>
                </>
              )}
              <Link href="/account/orders" className="text-white/80 hover:text-white transition-colors font-medium">Track Order</Link>
              <span className="text-white/30">|</span>
              <a
                href={`https://wa.me/${SITE.whatsapp_digits}?text=Hi Eng-Mart, I need help with electrical products.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[var(--color-whatsapp)] hover:opacity-80 transition-opacity font-medium"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN HEADER ══ */}
      <header className={`sticky top-0 z-[100] store-header transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-6 h-20">

            {/* Logo. Height drives the header: the row is h-20 so the wordmark
                can render at h-14 and still keep breathing room. Anything that
                sticks below this header (the products breadcrumb bar, its
                filter sidebar) offsets by 5rem to match. */}
            <Link href="/" className="shrink-0">
              <Image
                src="/header_logo.png"
                alt="Eng-Mart"
                width={210}
                height={70}
                className="h-12 sm:h-14 w-auto object-contain"
                priority
              />
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-8 relative">
              {NAV_LINKS.map(link =>
                link.label === 'Categories' ? (
                  <div key={link.label} ref={catRef} className="group relative">
                    <Link
                      href={link.href}
                      aria-expanded={catOpen}
                      onClick={e => {
                        // Coarse pointers: first tap opens the menu, second tap navigates
                        if (coarsePointer && !catOpen) {
                          e.preventDefault()
                          setCatOpen(true)
                        } else {
                          setCatOpen(false)
                        }
                      }}
                      className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors py-4"
                    >
                      {link.label}
                      <svg className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </Link>
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 ${catOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-[opacity,visibility] duration-200 z-50`}>
                      <div className="w-[500px] bg-card border border-border rounded-xl shadow-xl p-4 grid grid-cols-2 gap-2">
                        {CATEGORIES.slice(0, 10).map(cat => (
                          <Link key={cat.slug} href={`/categories/${cat.slug}`} onClick={() => setCatOpen(false)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors group/item">
                            <div className="w-10 h-10 rounded-lg bg-secondary border border-border text-primary flex items-center justify-center text-lg shadow-sm group-hover/item:border-primary/30 group-hover/item:bg-primary/5 transition-colors">
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

            {/* ══ SEARCH BAR (PERSISTENT & BEAUTIFUL) ══ */}
            <div ref={searchRef} className="hidden md:block relative flex-1 min-w-0 max-w-xl lg:max-w-2xl mx-3 lg:mx-6">
              <div className="flex items-center border border-border rounded-xl bg-secondary/50 focus-within:bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-[background-color,border-color,box-shadow]">
                <svg className="w-5 h-5 text-muted-foreground ml-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search 4,700+ products by name, brand or catalogue number…"
                  className="w-full px-3 py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 mr-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* ── Search Dropdown ── */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {searchResults.length > 0 ? (
                      <>
                        <div className="px-3 py-2 border-b border-border bg-secondary/30">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} Found
                          </p>
                        </div>
                        <div className="divide-y divide-border max-h-[420px] overflow-y-auto overscroll-contain custom-scrollbar">
                          {searchResults.map(product => (
                            <Link
                              key={product.slug}
                              href={`/products/${product.slug}`}
                              onClick={() => setSearchFocused(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    {product.brand}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground truncate">
                                    {product.category}
                                  </span>
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                        <div className="px-4 py-2.5 border-t border-border bg-secondary/20">
                          <Link
                            href={`/products?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setSearchFocused(false)}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            View all results for "{searchQuery}" →
                          </Link>
                        </div>
                      </>
                    ) : (
                      /* ── No Results State ── */
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-foreground">No products found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          No results for "<span className="font-medium text-foreground">{searchQuery}</span>"
                        </p>
                        <Link
                          href="/contact"
                          onClick={() => setSearchFocused(false)}
                          className="mt-3 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                        >
                          Request a Quote →
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto lg:ml-0">

              {/* Mobile search: opens the drawer with search pinned at its top */}
              <button
                onClick={handleMobileSearch}
                className="md:hidden flex items-center justify-center min-w-10 min-h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Search products"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* The orange "Admin Panel" pill that sat here is gone. It was a
                  third route to /admin — the utility bar above and the account
                  dropdown below both already link there — and its colour
                  fought the blue account button beside it. */}

              {/* Login or My Account dropdown */}
              {isAuthenticated ? (
                <div ref={acctRef} className="group relative">
                  <Link
                    href="/account"
                    aria-expanded={acctOpen}
                    onClick={e => {
                      // Coarse pointers: first tap opens the menu, second tap navigates
                      if (coarsePointer && !acctOpen) {
                        e.preventDefault()
                        setAcctOpen(true)
                      } else {
                        setAcctOpen(false)
                      }
                    }}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 min-h-10 rounded-md bg-primary text-white hover:opacity-90 font-semibold text-sm transition-opacity shadow-sm"
                    aria-label={`My account — signed in as ${accountLabel}`}
                  >
                    {/* Initial avatar, then the first name — a signed-in
                        storefront should say WHO is signed in, not just that
                        someone is. Falls back to "My Account" for an account
                        with no name yet. */}
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                                 bg-white/20 text-[11px] font-extrabold uppercase leading-none"
                      aria-hidden="true"
                    >
                      {accountInitial}
                    </span>
                    <span className="hidden lg:inline max-w-[9rem] truncate">{accountLabel}</span>
                  </Link>
                  <div className={`absolute right-0 top-full pt-2 ${acctOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-[opacity,visibility] duration-200 z-50`}>
                    <div className="w-56 bg-card border border-border rounded-xl shadow-xl p-2.5 space-y-0.5 text-xs text-foreground">
                      <div className="px-2.5 py-1.5 border-b border-border mb-1">
                        <p className="font-extrabold text-foreground leading-none">{user?.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-1 truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--color-admin)]/10 text-amber-700 font-extrabold transition-colors hover:bg-[var(--color-admin)]/20 border border-[var(--color-admin)]/30">
                          ⚡ Admin Dashboard
                        </Link>
                      )}
                      <Link href="/account" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary font-bold transition-colors text-foreground">Overview</Link>
                      <Link href="/account/orders" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary font-bold transition-colors text-foreground">Order History</Link>
                      <Link href="/account/wishlist" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary font-bold transition-colors text-foreground">Saved Wishlist</Link>
                      <Link href="/account/quotes" onClick={() => setAcctOpen(false)} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary font-bold transition-colors text-foreground">Quotes Request</Link>
                      <div className="h-px bg-border my-1.5" />
                      <button onClick={() => { setAcctOpen(false); logout(); }} className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-rose-50 text-rose-600 font-bold transition-colors text-left cursor-pointer">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 min-h-10 rounded-md bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground font-semibold text-sm transition-colors" aria-label="Login">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  <span className="hidden lg:inline">Login</span>
                </Link>
              )}

              {/* Cart */}
              <NotificationBell />

              <Link href="/cart" className="relative flex items-center justify-center gap-1.5 px-2 py-2 min-w-10 min-h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                <span className="text-sm font-medium hidden lg:inline">Cart</span>
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {count}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden flex items-center justify-center min-w-10 min-h-10 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Menu" aria-expanded={mobileOpen}>
                <div className="w-5 space-y-1.5">
                  <span className={`block h-0.5 bg-current transition-[transform,opacity] duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-0.5 bg-current transition-[transform,opacity] duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 bg-current transition-[transform,opacity] duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
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
              className="lg:hidden fixed inset-0 bg-foreground/30 z-[110]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="lg:hidden fixed inset-y-0 right-0 w-4/5 max-w-sm bg-card z-[120] shadow-2xl overflow-y-auto overscroll-contain"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-5">
                {/* Close button */}
                <div className="flex items-center justify-between mb-5">
                  <Image src="/header_logo.png" alt="Eng-Mart" width={165} height={55} className="h-11 w-auto object-contain" />
                  <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary text-muted-foreground" aria-label="Close menu">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="relative mb-5">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-[border-color,box-shadow]"
                  />
                  {/* Mobile search results */}
                  {searchQuery.trim().length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                      {searchResults.length > 0 ? (
                        <div className="divide-y divide-border max-h-[360px] overflow-y-auto overscroll-contain custom-scrollbar">
                          {searchResults.map(product => (
                            <Link
                              key={product.slug}
                              href={`/products/${product.slug}`}
                              onClick={() => { setMobileOpen(false); setSearchQuery(''); }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                                <p className="text-[10px] text-muted-foreground">{product.brand} · {product.category}</p>
                              </div>
                            </Link>
                          ))}
                          {/* Parity with the desktop dropdown — the drawer
                              previously capped the customer at 6 results with
                              no way through to the full result set. */}
                          <button
                            type="button"
                            onClick={submitSearch}
                            className="w-full px-4 py-3 text-xs font-bold text-primary hover:bg-secondary/50 transition-colors text-left cursor-pointer"
                          >
                            View all results for &quot;{searchQuery}&quot; →
                          </button>
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-sm font-semibold text-foreground">No products found</p>
                          <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Nav Links */}
                <div className="space-y-1 mb-5">
                  {NAV_LINKS.map(link => (
                    <Link key={link.label} href={link.href}
                      className="flex items-center min-h-11 px-3 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                      onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Accounts Section */}
                <div className="border-t border-border pt-5 space-y-3">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-1">My Account ({user?.name})</p>
                      <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center min-h-11 gap-2.5 px-3 py-2 text-sm font-bold text-foreground hover:text-primary hover:bg-secondary rounded-lg">Overview</Link>
                      <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="flex items-center min-h-11 gap-2.5 px-3 py-2 text-sm font-bold text-foreground hover:text-primary hover:bg-secondary rounded-lg">Order History</Link>
                      <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center min-h-11 gap-2.5 px-3 py-2 text-sm font-bold text-foreground hover:text-primary hover:bg-secondary rounded-lg">Saved Wishlist</Link>
                      <Link href="/account/quotes" onClick={() => setMobileOpen(false)} className="flex items-center min-h-11 gap-2.5 px-3 py-2 text-sm font-bold text-foreground hover:text-primary hover:bg-secondary rounded-lg">Quote Requests</Link>
                      <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center min-h-11 gap-2.5 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg text-left cursor-pointer">Logout</button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center min-h-11 gap-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                      Login
                    </Link>
                  )}

                  <div className="h-px bg-border my-2" />

                  <a href={`tel:${SITE.phone}`} className="flex items-center min-h-11 gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {SITE.phone}
                  </a>
                  <a
                    href={`https://wa.me/${SITE.whatsapp_digits}?text=Hi Eng-Mart, I need help with electrical products.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center min-h-11 gap-2 px-3 py-2 text-sm font-medium text-[var(--color-whatsapp)] hover:opacity-80 transition-opacity"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0">
                      <path d="M12.003 2A10 10 0 0 0 2.2 11.96c0 1.9.52 3.69 1.43 5.25L2 22l5.02-1.31A10 10 0 1 0 12.003 2z" fill="var(--color-whatsapp)" />
                      <path d="M16.94 14.22c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7 1-.86 1.18-.16.18-.32.2-.59.07a7.44 7.44 0 0 1-2.19-1.35 8.16 8.16 0 0 1-1.52-1.9c-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.28.27-.46a.52.52 0 0 0-.02-.48c-.07-.15-.61-1.48-.84-2.02-.22-.54-.45-.47-.61-.48h-.53c-.18 0-.48.07-.73.34A2.78 2.78 0 0 0 6.5 9.77c0 1.63.78 3.2 1.34 3.96a11.9 11.9 0 0 0 5.09 4.5c.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3 1.8-1.42-.07-.13-.27-.2-.54-.35z" fill="white" />
                    </svg>
                    WhatsApp Chat
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
