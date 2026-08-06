'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getBanners, type BannerData } from '@/lib/api'

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

/* ─── Default Data ───────────────────────────────────── */
const DEFAULT_CAROUSEL: BannerSlide[] = [
  {
    id: 'C-001',
    title: 'High-Performance Protection',
    subtitle: 'WAPDA Approved Switchgear for Every Application',
    badge: 'PREMIUM SELECTION',
    ctaText: 'Browse Catalog',
    ctaLink: '/products',
    ctaText2: 'Get Quote',
    ctaLink2: '/contact',
    imagePreview: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=1400&h=600',
  },
  {
    id: 'C-002',
    title: 'Power Your Ideas with Precision',
    subtitle: 'Build Smarter Circuits. Start with Engineering Mart',
    badge: 'PREMIUM SELECTION',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    ctaText2: 'View Catalog',
    ctaLink2: '/categories',
    imagePreview: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1400&h=600',
  },
  {
    id: 'C-003',
    title: 'Industrial Scale Solutions',
    subtitle: 'Authorized Distributor for 8+ Global Brands',
    badge: 'PREMIUM SELECTION',
    ctaText: 'Browse Brands',
    ctaLink: '/brands',
    ctaText2: 'Get Quote',
    ctaLink2: '/contact',
    imagePreview: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=1400&h=600',
  },
  {
    id: 'C-004',
    title: 'Smart Automation Systems',
    subtitle: 'Transform Your Industrial Operations with IoT',
    badge: 'TECHNOLOGY LEADER',
    ctaText: 'Explore Now',
    ctaLink: '/categories',
    ctaText2: 'Learn More',
    ctaLink2: '/about',
    imagePreview: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=1400&h=600',
  },
  {
    id: 'C-005',
    title: 'Energy Efficient Solutions',
    subtitle: 'Save More, Perform Better with Latest Tech',
    badge: 'ECO FRIENDLY',
    ctaText: 'View Products',
    ctaLink: '/products',
    ctaText2: 'Get Quote',
    ctaLink2: '/contact',
    imagePreview: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=1400&h=600',
  },
  {
    id: 'C-006',
    title: '24/7 Technical Support',
    subtitle: 'Expert Engineers Ready to Help Your Projects',
    badge: 'ALWAYS AVAILABLE',
    ctaText: 'Contact Us',
    ctaLink: '/contact',
    ctaText2: 'WhatsApp',
    ctaLink2: 'https://wa.me/923112763951',
    imagePreview: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1400&h=600',
  },
]

const DEFAULT_SIDEBAR: BannerSlide[] = [
  {
    id: 'S-001',
    title: 'For Your Electrical Needs',
    subtitle: 'Fixing Your Circuit Problems — Fast, Accurate, Reliable.',
    badge: 'COMPLETE SOLUTIONS',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    imagePreview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600&h=300',
    accentColor: '#3B82F6',
    bgColor: '#0F172A',
  },
  {
    id: 'S-002',
    title: 'On Project Orders',
    subtitle: 'Save more on large-scale procurement and industrial supply.',
    badge: 'BULK DISCOUNTS',
    ctaText: 'Get Quote',
    ctaLink: '/contact',
    imagePreview: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=600&h=300',
    accentColor: '#F59E0B',
    bgColor: '#1C1400',
  },
  {
    id: 'S-003',
    title: 'Expert Consultation',
    subtitle: 'Our engineers help you select the right product.',
    badge: 'TECHNICAL SUPPORT',
    ctaText: 'Contact',
    ctaLink: '/contact',
    imagePreview: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600&h=300',
    accentColor: '#10B981',
    bgColor: '#022C22',
  },
]

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

/* ─── Map an API banner onto the slide shape this component renders ── */
function toSlide(b: BannerData): BannerSlide {
  return {
    id: String(b.id),
    title: b.title,
    subtitle: b.subtitle,
    badge: b.badge || undefined,
    ctaText: b.cta_text,
    ctaLink: b.cta_link,
    ctaText2: b.cta_text_2 || undefined,
    ctaLink2: b.cta_link_2 || undefined,
    imagePreview: b.image_src || undefined,
    accentColor: b.accent_color || undefined,
    bgColor: b.bg_color || undefined,
    textColor: b.text_color || undefined,
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
          src={banner.imagePreview}
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

  /* ── Load banners from the API (admin-managed) ── */
  const loadBanners = useCallback(async () => {
    try {
      const all = await getBanners()
      const carousel = all.filter(b => b.type === 'carousel').map(toSlide)
      const sidebar = all.filter(b => b.type === 'sidebar').map(toSlide)
      // Only replace the built-in defaults when the API actually has banners,
      // so the homepage never renders empty if the table hasn't been seeded.
      setCarouselSlides(carousel.length ? carousel : DEFAULT_CAROUSEL)
      setSidebarBanners(sidebar.length ? sidebar : DEFAULT_SIDEBAR)
    } catch {
      setCarouselSlides(DEFAULT_CAROUSEL)
      setSidebarBanners(DEFAULT_SIDEBAR)
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
    <section className="py-4 sm:py-6 bg-background">
      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ CASE 1: Only sidebar visible (carousel all hidden) ══
            Show sidebar banners full-width in a responsive grid       */}
        {!hasCarousel && hasSidebar && (
          <div
            className={`grid gap-3 ${
              visibleSidebar.length === 1
                ? 'grid-cols-1'
                : visibleSidebar.length === 2
                ? 'grid-cols-2'
                : visibleSidebar.length === 3
                ? 'grid-cols-2 md:grid-cols-3'
                : 'grid-cols-2 md:grid-cols-4'
            }`}
            style={{ height: 'clamp(280px, 40vw, 480px)' }}
          >
            {visibleSidebar.map((banner) => (
              <SidebarCard key={banner.id} banner={banner} />
            ))}
          </div>
        )}

        {/* ══ CASE 2: Carousel visible (with or without sidebar) ══ */}
        {hasCarousel && slide && (
          <>
          <div
            className="flex gap-3 sm:gap-4"
            style={{ height: 'clamp(300px, 52vw, 600px)' }}
          >

            {/* ── MAIN CAROUSEL ──────────────────────────────── */}
            <div
              className="relative flex-1 rounded-2xl overflow-hidden shadow-xl min-w-0 touch-pan-y"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onPointerDown={(e) => { pointerStartX.current = e.clientX }}
              onPointerUp={(e) => {
                if (pointerStartX.current === null) return
                const dx = e.clientX - pointerStartX.current
                pointerStartX.current = null
                if (Math.abs(dx) >= 40 && carouselSlides.length > 1) {
                  if (dx < 0) next()
                  else prev()
                }
              }}
              onPointerCancel={() => { pointerStartX.current = null }}
            >
              {/* Background layers — only mount active slide ± 1 neighbour */}
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
                  {s.imagePreview ? (
                    <img src={s.imagePreview} alt={s.title} className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${s.bgColor || '#0F172A'}, #020617)` }} />
                  )}
                </div>
                )
              })}

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

              {/* Slide Content */}
              <div
                key={`slide-${slide.id}`}
                className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-14 pb-20 lg:pb-24 animate-fade-up"
              >
                {slide.badge && (
                  <div className="flex items-center gap-2 mb-3.5">
                    <div className="w-6 h-[2px] rounded-full" style={{ backgroundColor: slide.accentColor || 'var(--primary)' }} />
                    <span className="text-[11px] lg:text-xs font-black tracking-[0.2em] uppercase" style={{ color: slide.accentColor || 'var(--primary)' }}>{slide.badge}</span>
                  </div>
                )}
                <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold mb-3 leading-tight tracking-tight max-w-2xl" style={{ color: slide.textColor || '#FFFFFF' }}>
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg mb-8 max-w-xl leading-relaxed line-clamp-2 opacity-80" style={{ color: slide.textColor || '#FFFFFF' }}>
                  {slide.subtitle}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    href={slide.ctaLink || '/'}
                    className="inline-flex items-center gap-2.5 text-white font-bold text-sm lg:text-base px-6 lg:px-8 py-3 rounded-lg transition-transform duration-200 shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: slide.accentColor || 'var(--primary)' }}
                  >
                    {isWAUrl(slide.ctaLink) && <WhatsAppIcon size={18} />}
                    {slide.ctaText}
                  </Link>
                  {slide.ctaText2 && (
                    <Link
                      href={slide.ctaLink2 || '/'}
                      className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-sm text-white font-bold text-sm lg:text-base px-6 lg:px-8 py-3 rounded-lg transition-[transform,background-color] duration-200 hover:-translate-y-0.5"
                    >
                      {isWAUrl(slide.ctaLink2 || '') && <WhatsAppIcon size={18} />}
                      {slide.ctaText2}
                    </Link>
                  )}
                </div>
              </div>

              {/* Prev / Next */}
              {carouselSlides.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white transition-[transform,background-color] duration-200 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 backdrop-blur-sm flex items-center justify-center text-white transition-[transform,background-color] duration-200 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots */}
              {carouselSlides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center">
                  {carouselSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => jumpTo(i)}
                      aria-label={`Slide ${i + 1}`}
                      className="p-2 group"
                    >
                      <span
                        className={`block rounded-full transition-[width,height,background-color] duration-300 ${
                          i === safeIdx ? 'w-6 h-2' : 'w-2.5 h-2.5 bg-white/35 group-hover:bg-white/60'
                        }`}
                        style={{ backgroundColor: i === safeIdx ? (slide.accentColor || 'var(--primary)') : undefined }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR (only when carousel is also visible) ── */}
            {hasSidebar && (
              <div className="hidden md:block w-[260px] lg:w-[310px] shrink-0">
                {visibleSidebar.length <= 3 ? (
                  <div className="flex flex-col gap-2.5 h-full">
                    {visibleSidebar.map((banner) => (
                      <div key={banner.id} className="flex-1 min-h-0">
                        <SidebarCard banner={banner} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 h-full" style={{ gridTemplateRows: '1fr 1fr' }}>
                    {visibleSidebar.map((banner) => (
                      <div key={banner.id} className="min-h-0">
                        <SidebarCard banner={banner} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar promos on mobile: horizontal snap strip below the carousel */}
          {hasSidebar && (
            <div className="md:hidden mt-3 -mx-4 px-4 sm:-mx-6 sm:px-6 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
              {visibleSidebar.map((banner) => (
                <div key={banner.id} className="snap-start shrink-0 w-[260px] max-w-[78vw] h-[150px]">
                  <SidebarCard banner={banner} />
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
