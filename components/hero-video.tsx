'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getBanners, getCatalogStats, mediaUrl, type BannerData, type CatalogStats } from '@/lib/api'

/**
 * Homepage hero, driven by the `hero` Banner record.
 *
 * The headline, subcopy, badge, buttons, background video and stat pills are
 * all editable from the admin panel. The constants below are only a fallback
 * for a fresh install where no hero row exists yet, so the homepage is never
 * blank.
 */
const FALLBACK = {
  badge: "Pakistan's #1 Industrial Electrical Supplier",
  title: 'Premium Switchgear, Certified & In Stock',
  subtitle:
    'Source genuine ABB, CHINT, Himel, FICO & PCE products directly. Built for industry — backed by trust. Karachi-based.',
  cta_text: 'Browse Catalog',
  cta_link: '/products',
  cta_text_2: 'Get Quote',
  cta_link_2: '/contact',
  video_url: '/herovideo.mp4',
  // No hardcoded counts here — real figures come from /products/stats/
  // below. The old '2,500+ Products / 8 Global Brands' undercounted the
  // catalog by half once the price lists were imported.
  highlights: ['📍 Karachi Based', '🚚 Nationwide Delivery'],
}

const HERO_CACHE_KEY = 'engmart-hero-banner'

export function HeroVideo() {
  const [hero, setHero] = useState<BannerData | null>(null)
  const [stats, setStats] = useState<CatalogStats | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // sessionStorage stopgap: show the last-fetched hero immediately so the
    // fallback copy doesn't flash while the API request is in flight.
    try {
      const cached = sessionStorage.getItem(HERO_CACHE_KEY)
      if (cached) setHero(JSON.parse(cached) as BannerData)
    } catch {}
    getBanners('hero')
      .then(rows => {
        const row = rows[0] || null
        setHero(row)
        try { sessionStorage.setItem(HERO_CACHE_KEY, JSON.stringify(row)) } catch {}
      })
      .catch(() => {}) // keep cached copy (or fallback) on fetch failure

    // Live catalog figures for the stat pills (cached an hour server-side).
    getCatalogStats().then(setStats).catch(() => {})
  }, [])

  const badge = hero?.badge || FALLBACK.badge
  const title = hero?.title || FALLBACK.title
  const subtitle = hero?.subtitle || FALLBACK.subtitle
  const ctaText = hero?.cta_text || FALLBACK.cta_text
  const ctaLink = hero?.cta_link || FALLBACK.cta_link
  const ctaText2 = hero?.cta_text_2 || FALLBACK.cta_text_2
  const ctaLink2 = hero?.cta_link_2 || FALLBACK.cta_link_2
  // Admin-authored highlights win; otherwise show live catalog figures so the
  // headline numbers can never go stale again.
  const liveHighlights = stats
    ? [
        `📦 ${stats.products.toLocaleString('en-PK')}+ Products`,
        `🌍 ${stats.brands} Global Brands`,
        '📍 Karachi Based',
        '🚚 Nationwide Delivery',
      ]
    : FALLBACK.highlights
  const highlights = hero?.highlights?.length ? hero.highlights : liveHighlights

  // A relative path is served from /public; anything else goes through mediaUrl
  // so an uploaded file resolves against the API host rather than the frontend.
  const rawVideo = hero?.video_url || FALLBACK.video_url
  const videoSrc = rawVideo.startsWith('/media/') ? mediaUrl(rawVideo) : rawVideo
  const imageSrc = hero?.image_src || ''

  // Respect prefers-reduced-motion: stop the ambient autoplay video.
  // (Re-runs when the src changes since key={videoSrc} remounts the element.)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videoRef.current?.pause()
    }
  }, [videoSrc])

  return (
    <section className="relative w-full h-[80svh] lg:h-[calc(100svh-100px)] min-h-[520px] overflow-hidden bg-black">
      {/* Background: video when set, otherwise the hero image */}
      {videoSrc ? (
        <video
          key={videoSrc}
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : imageSrc ? (
        <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      ) : null}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/90 text-xs font-semibold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {badge}
          </div>
        )}

        <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-5 max-w-5xl drop-shadow-lg tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-white/80 text-sm sm:text-lg font-medium mb-8 max-w-2xl drop-shadow leading-relaxed">
            {subtitle}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          {ctaText && (
            <Link href={ctaLink} className="btn-primary text-sm sm:text-base py-3 px-8 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow">
              {ctaText}
            </Link>
          )}
          {ctaText2 && (
            <Link href={ctaLink2} className="btn-secondary text-sm sm:text-base py-3 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
              {ctaText2}
            </Link>
          )}
        </div>

        {/* Highlight pills */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {highlights.map((label, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/80 text-xs font-medium"
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
