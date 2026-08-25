'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getBanners, getProducts, mediaUrl, type BannerData, type Product } from '@/lib/api'

/* ─── Types ─────────────────────────────────────────── */
interface BannerSlide {
  id: string
  title: string
  subtitle: string
  badge?: string
  ctaText: string
  ctaLink: string
  ctaText2?: string
  ctaLink2?: string
  imagePreview?: string
  accentColor?: string
  bgColor?: string
  textColor?: string
}

/* ─── Helpers ────────────────────────────────────────── */
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: size, height: size }} className="shrink-0">
      <path d="M12.003 2A10 10 0 0 0 2.2 11.96c0 1.9.52 3.69 1.43 5.25L2 22l5.02-1.31A10 10 0 1 0 12.003 2z" fill="#25D366"/>
      <path d="M16.94 14.22c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7 1-.86 1.18-.16.18-.32.2-.59.07a7.44 7.44 0 0 1-2.19-1.35 8.16 8.16 0 0 1-1.52-1.9c-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.28.27-.46a.52.52 0 0 0-.02-.48c-.07-.15-.61-1.48-.84-2.02-.22-.54-.45-.47-.61-.48h-.53c-.18 0-.48.07-.73.34A2.78 2.78 0 0 0 6.5 9.77c0 1.63.78 3.2 1.34 3.96a11.9 11.9 0 0 0 5.09 4.5c.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3 1.8-1.42-.07-.13-.27-.2-.54-.35z" fill="white"/>
    </svg>
  )
}

const isWAUrl = (url: string) => !!(url?.toLowerCase().includes('wa.me') || url?.toLowerCase().includes('whatsapp'))

/* ─── Map Admin Banner API object to slide shape ── */
function bannerDataToSlide(b: BannerData): BannerSlide {
  return {
    id: `banner-${b.id}`,
    title: b.title,
    subtitle: b.subtitle,
    badge: b.badge || undefined,
    ctaText: b.cta_text || 'View Details',
    ctaLink: b.cta_link || '/products',
    ctaText2: b.cta_text_2 || undefined,
    ctaLink2: b.cta_link_2 || undefined,
    imagePreview: b.image_src ? mediaUrl(b.image_src) : undefined,
    accentColor: b.accent_color || '#3B82F6',
    bgColor: b.bg_color || '#0F172A',
    textColor: b.text_color || '#FFFFFF',
  }
}

/* ─── Map a real Product onto the slide shape ── */
const ACCENT_PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6']

function productToSlide(p: Product, idx: number): BannerSlide {
  const accent = ACCENT_PALETTE[idx % ACCENT_PALETTE.length]
  const brandName = p.brand_name || (p.brand as any)?.name || ''
  const catName = p.category_name || (p.category as any)?.name || ''
  let priceLabel = ''
  if (p.price_range) {
    const min = Math.round(p.price_range.min).toLocaleString()
    const max = Math.round(p.price_range.max).toLocaleString()
    priceLabel = p.price_range.min === p.price_range.max ? `PKR ${min}` : `PKR ${min} – ${max}`
  } else if (p.has_price_on_request) {
    priceLabel = 'Request a Quote'
  }
  return {
    id: `prod-${p.id}`,
    title: p.name,
    subtitle: priceLabel
      ? `${p.short_description || catName} · ${priceLabel}`
      : (p.short_description || catName || 'View Product Details'),
    badge: brandName ? brandName.toUpperCase() : 'FEATURED PRODUCT',
    ctaText: 'View Product',
    ctaLink: `/products/${p.slug}`,
    ctaText2: 'Get Quote',
    ctaLink2: '/contact',
    imagePreview: p.image ? mediaUrl(p.image) : undefined,
    accentColor: accent,
    bgColor: '#0F172A',
    textColor: '#FFFFFF',
  }
}

function productToSideSlide(p: Product, idx: number): BannerSlide {
  const accent = ACCENT_PALETTE[idx % ACCENT_PALETTE.length]
  const brandName = p.brand_name || (p.brand as any)?.name || ''
  let priceLabel = ''
  if (p.price_range) {
    priceLabel = `PKR ${Math.round(p.price_range.min).toLocaleString()}`
  } else if (p.has_price_on_request) {
    priceLabel = 'Price on Request'
  }
  return {
    id: `prod-side-${p.id}`,
    title: p.name,
    subtitle: priceLabel || p.short_description || 'Click to view details',
    badge: brandName ? brandName.toUpperCase() : 'NEW',
    ctaText: 'View Details',
    ctaLink: `/products/${p.slug}`,
    imagePreview: p.image ? mediaUrl(p.image) : undefined,
    accentColor: accent,
    bgColor: '#0F172A',
  }
}



/* ─── Single Sidebar Card ────────────────────────────── */
function SidebarCard({ banner }: { banner: BannerSlide }) {
  const accent = banner.accentColor || 'var(--primary)'
  const bgCol = banner.bgColor || '#0F172A'
  const textCol = banner.textColor || '#FFFFFF'
  return (
    <Link
      href={banner.ctaLink || '/'}
      className="relative rounded-xl overflow-hidden group block shadow-md hover:shadow-xl transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 h-full"
      style={{ backgroundColor: bgCol }}
    >
      {/* Background image */}
      {banner.imagePreview ? (
        <img
          src={mediaUrl(banner.imagePreview)}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${bgCol}, #1e293b)` }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      {/* Accent border glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${accent} 40%, transparent)` }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-3 lg:p-3.5">
        {/* Badge */}
        {banner.badge && (
          <span
            className="self-start text-[11px] font-black tracking-[0.15em] uppercase px-1.5 py-0.5 rounded"
            style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)` }}
          >
            {banner.badge}
          </span>
        )}

        {/* Bottom text */}
        <div>
          <p className="font-extrabold text-[11px] lg:text-xs leading-snug line-clamp-2" style={{ color: textCol }}>
            {banner.title}
          </p>
          <p className="text-[11px] mt-1 line-clamp-2 leading-relaxed opacity-70" style={{ color: textCol }}>
            {banner.subtitle}
          </p>

          {/* CTA pill */}
          <div
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            {isWAUrl(banner.ctaLink) && <WhatsAppIcon size={12} />}
            {banner.ctaText}
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Main Component ─────────────────────────────────── */
export function PromoBanners() {
  const [carouselSlides, setCarouselSlides] = useState<BannerSlide[]>([])
  const [sidebarBanners, setSidebarBanners] = useState<BannerSlide[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pointerStartX = useRef<number | null>(null)

  /* ── Load custom Admin Banners first, fallback to products ── */
  const loadBanners = useCallback(async () => {
    try {
      // 1. Fetch custom banners created in Admin Panel (/admin/banners)
      const banners = await getBanners().catch(() => [])

      const carouselBanners = banners.filter(b => b.type === 'carousel' && b.is_active)
      const sideBanners = banners.filter(b => b.type === 'sidebar' && b.is_active)

      if (carouselBanners.length > 0 || sideBanners.length > 0) {
        if (carouselBanners.length > 0) {
          setCarouselSlides(carouselBanners.map(bannerDataToSlide))
        }
        if (sideBanners.length > 0) {
          setSidebarBanners(sideBanners.map(bannerDataToSlide))
        }
        setLoaded(true)
        return
      }

      // 2. Fallback to featured/newest products if no admin banners are active
      const [newestRes, featuredRes] = await Promise.all([
        getProducts({ page_size: 10, ordering: '-id' }),
        getProducts({ page_size: 4, is_featured: true, ordering: '-id' }),
      ])

      const newest = newestRes.results || []
      const featured = featuredRes.results || []
      const sidePool = featured.length >= 2 ? featured : newest.slice(0, 4)

      if (newest.length > 0) {
        setCarouselSlides(newest.slice(0, 8).map((p, i) => productToSlide(p, i)))
        setSidebarBanners(sidePool.slice(0, 4).map((p, i) => productToSideSlide(p, i)))
      }
    } catch (err) {
      console.error('Banner load error:', err)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  /* ── Carousel auto-play ── */
  const goTo = useCallback((idx: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveIdx(idx)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % (carouselSlides.length || 1))
    }, 4000)
  }, [carouselSlides.length])

  useEffect(() => {
    if (!isPaused && carouselSlides.length > 1) {
      startInterval()
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPaused, carouselSlides.length, startInterval])

  // Clamp activeIdx when slides are hidden/removed so it never goes out of bounds
  useEffect(() => {
    if (carouselSlides.length > 0 && activeIdx >= carouselSlides.length) {
      setActiveIdx(0)
    }
  }, [carouselSlides.length, activeIdx])

  const prev = () => { goTo((activeIdx - 1 + carouselSlides.length) % carouselSlides.length); startInterval() }
  const next = () => { goTo((activeIdx + 1) % carouselSlides.length); startInterval() }
  const jumpTo = (i: number) => { goTo(i); startInterval() }

  // Determine what's visible
  const visibleSidebar = sidebarBanners.slice(0, 4)
  const hasCarousel = carouselSlides.length > 0
  const hasSidebar = visibleSidebar.length > 0

  // Reserve the hero space while banners load so the page doesn't shift when it pops in
  if (!loaded) {
    return (
      <section className="py-4 sm:py-6 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="skeleton rounded-2xl w-full" style={{ height: 'clamp(300px, 52vw, 600px)' }} />
        </div>
      </section>
    )
  }

  // Both hidden → hide the entire section
  if (!hasCarousel && !hasSidebar) return null

  // Safe slide reference (only used when carousel is visible)
  const safeIdx = hasCarousel ? Math.min(activeIdx, carouselSlides.length - 1) : 0
  const slide = hasCarousel ? carouselSlides[safeIdx] : null

  return (
    <section className="py-3 sm:py-4 lg:py-6 bg-background">
      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* ══ CASE 1: Only sidebar (no carousel) ══ */}
        {!hasCarousel && hasSidebar && (
          <div
            className={`grid gap-2 sm:gap-3 ${
              visibleSidebar.length === 1 ? 'grid-cols-1'
              : visibleSidebar.length === 2 ? 'grid-cols-2'
              : visibleSidebar.length === 3 ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-4'
            }`}
            style={{ height: 'clamp(220px, 36vw, 440px)' }}
          >
            {visibleSidebar.map(b => <SidebarCard key={b.id} banner={b} />)}
          </div>
        )}

        {/* ══ CASE 2: Carousel (+ optional sidebar on md+) ══ */}
        {hasCarousel && slide && (
          <>
            {/* Row: carousel + sidebar side-by-side on md+ */}
            <div
              className="flex gap-2 sm:gap-3"
              style={{ height: 'clamp(220px, 48vw, 580px)' }}
            >
              {/* ── MAIN CAROUSEL ─────────────────────── */}
              <div
                className="relative flex-1 min-w-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg touch-pan-y"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onPointerDown={e => { pointerStartX.current = e.clientX }}
                onPointerUp={e => {
                  if (pointerStartX.current === null) return
                  const dx = e.clientX - pointerStartX.current
                  pointerStartX.current = null
                  if (Math.abs(dx) >= 40 && carouselSlides.length > 1) {
                    dx < 0 ? next() : prev()
                  }
                }}
                onPointerCancel={() => { pointerStartX.current = null }}
              >
                {/* Background layers — only mount active ± 1 */}
                {carouselSlides.map((s, i) => {
                  const n = carouselSlides.length
                  const dist = Math.min(Math.abs(i - safeIdx), n - Math.abs(i - safeIdx))
                  if (dist > 1) return null
                  return (
                    <div
                      key={s.id}
                      className="absolute inset-0 transition-opacity duration-700"
                      style={{ opacity: i === safeIdx ? 1 : 0, zIndex: i === safeIdx ? 1 : 0, backgroundColor: s.bgColor || '#0F172A' }}
                    >
                      {s.imagePreview
                        ? <img src={mediaUrl(s.imagePreview)} alt={s.title} className="w-full h-full object-cover opacity-80" />
                        : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${s.bgColor || '#0F172A'}, #020617)` }} />
                      }
                    </div>
                  )
                })}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent z-10" />

                {/* Slide content */}
                <div
                  key={`slide-${slide.id}`}
                  className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-8 lg:p-12 pb-14 sm:pb-16 lg:pb-20 animate-fade-up"
                >
                  {slide.badge && (
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="w-5 h-[2px] rounded-full" style={{ backgroundColor: slide.accentColor || 'var(--primary)' }} />
                      <span className="text-[10px] sm:text-[11px] font-black tracking-[0.18em] uppercase" style={{ color: slide.accentColor || 'var(--primary)' }}>
                        {slide.badge}
                      </span>
                    </div>
                  )}
                  <h2 className="text-lg sm:text-3xl lg:text-[2.5rem] font-extrabold mb-2 sm:mb-3 leading-tight tracking-tight max-w-xs sm:max-w-xl lg:max-w-2xl line-clamp-3 sm:line-clamp-2" style={{ color: slide.textColor || '#FFFFFF' }}>
                    {slide.title}
                  </h2>
                  <p className="hidden sm:block text-sm lg:text-base mb-5 sm:mb-7 max-w-md lg:max-w-xl leading-relaxed line-clamp-2 opacity-80" style={{ color: slide.textColor || '#FFFFFF' }}>
                    {slide.subtitle}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Link
                      href={slide.ctaLink || '/'}
                      className="inline-flex items-center gap-2 text-white font-bold text-xs sm:text-sm lg:text-base px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg transition-transform duration-200 shadow-lg hover:-translate-y-0.5"
                      style={{ backgroundColor: slide.accentColor || 'var(--primary)' }}
                    >
                      {isWAUrl(slide.ctaLink) && <WhatsAppIcon size={16} />}
                      {slide.ctaText}
                    </Link>
                    {slide.ctaText2 && (
                      <Link
                        href={slide.ctaLink2 || '/'}
                        className="hidden sm:inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm text-white font-bold text-xs sm:text-sm lg:text-base px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg transition-[transform,background-color] duration-200 hover:-translate-y-0.5"
                      >
                        {isWAUrl(slide.ctaLink2 || '') && <WhatsAppIcon size={16} />}
                        {slide.ctaText2}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Prev / Next arrows */}
                {carouselSlides.length > 1 && (
                  <>
                    <button onClick={prev} aria-label="Previous"
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white transition-[transform,background-color] duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button onClick={next} aria-label="Next"
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white transition-[transform,background-color] duration-200 hover:scale-110"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dots */}
                {carouselSlides.length > 1 && (
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center">
                    {carouselSlides.map((_, i) => (
                      <button key={i} onClick={() => jumpTo(i)} aria-label={`Slide ${i + 1}`} className="p-1.5 sm:p-2 group">
                        <span
                          className={`block rounded-full transition-[width,height,background-color] duration-300 ${
                            i === safeIdx ? 'w-5 sm:w-6 h-1.5 sm:h-2' : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/35 group-hover:bg-white/60'
                          }`}
                          style={{ backgroundColor: i === safeIdx ? (slide.accentColor || 'var(--primary)') : undefined }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── RIGHT SIDEBAR — hidden on mobile, shown from md ── */}
              {hasSidebar && (
                <div className="hidden md:block w-[240px] lg:w-[300px] xl:w-[360px] shrink-0">
                  {visibleSidebar.length <= 3 ? (
                    <div className="flex flex-col gap-2 lg:gap-2.5 h-full">
                      {visibleSidebar.map(b => (
                        <div key={b.id} className="flex-1 min-h-0">
                          <SidebarCard banner={b} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 h-full" style={{ gridTemplateRows: '1fr 1fr' }}>
                      {visibleSidebar.map(b => (
                        <div key={b.id} className="min-h-0">
                          <SidebarCard banner={b} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Mobile: sidebar cards as horizontal snap strip below carousel ── */}
            {hasSidebar && (
              <div className="md:hidden mt-2.5 -mx-3 px-3 sm:-mx-6 sm:px-6 flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-none">
                {visibleSidebar.map(b => (
                  <div key={b.id} className="snap-start shrink-0 w-[72vw] max-w-[280px] h-[140px]">
                    <SidebarCard banner={b} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  )
}

