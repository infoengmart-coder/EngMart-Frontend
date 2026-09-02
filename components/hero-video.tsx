'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { getBanners, getCatalogStats, mediaUrl, type BannerData, type CatalogStats } from '@/lib/api'

/**
 * Homepage hero, driven by active `hero` Banner records.
 *
 * When multiple hero videos are uploaded in Admin, they play sequentially in a
 * playlist loop: Video 1 -> Video 2 -> Video 3 -> ... -> back to Video 1.
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
  poster_url: '/hero-poster.jpg',
  highlights: ['📍 Karachi Based', '🚚 Nationwide Delivery'],
}

const HEROES_CACHE_KEY = 'engmart-hero-banners-list'

export function HeroVideo() {
  const [heroes, setHeroes] = useState<BannerData[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [stats, setStats] = useState<CatalogStats | null>(null)
  const [fade, setFade] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  /** Sources that 404'd, so we stop retrying them and fall back. */
  const [failedSrcs, setFailedSrcs] = useState<string[]>([])

  useEffect(() => {
    // sessionStorage stopgap to prevent flash
    try {
      const cached = sessionStorage.getItem(HEROES_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) setHeroes(parsed)
      }
    } catch {}

    getBanners('hero')
      .then(rows => {
        if (Array.isArray(rows) && rows.length > 0) {
          // Keep active banners only (or all returned by endpoint)
          const activeHeroes = rows.filter(r => r.is_active !== false)
          setHeroes(activeHeroes.length > 0 ? activeHeroes : rows)
          try { sessionStorage.setItem(HEROES_CACHE_KEY, JSON.stringify(rows)) } catch {}
        }
      })
      .catch(() => {})

    getCatalogStats().then(setStats).catch(() => {})
  }, [])

  // Currently active hero slide
  const hero = heroes[currentIdx] || heroes[0] || null

  const badge = hero?.badge || FALLBACK.badge
  const title = hero?.title || FALLBACK.title
  const subtitle = hero?.subtitle || FALLBACK.subtitle
  const ctaText = hero?.cta_text || FALLBACK.cta_text
  const ctaLink = hero?.cta_link || FALLBACK.cta_link
  const ctaText2 = hero?.cta_text_2 || FALLBACK.cta_text_2
  const ctaLink2 = hero?.cta_link_2 || FALLBACK.cta_link_2

  const liveHighlights = stats
    ? [
        `📦 ${stats.products.toLocaleString('en-PK')}+ Products`,
        `🌍 ${stats.brands} Global Brands`,
        '📍 Karachi Based',
        '🚚 Nationwide Delivery',
      ]
    : FALLBACK.highlights
  const highlights = hero?.highlights?.length ? hero.highlights : liveHighlights

  // Resolve video URL: uploaded file takes precedence over text video_url
  const rawVideo = hero?.video_src || hero?.video_url || (!heroes.length ? FALLBACK.video_url : '')
  const resolvedVideo = rawVideo ? (rawVideo.startsWith('/media/') ? mediaUrl(rawVideo) : rawVideo) : ''

  // A banner row can outlive its file — the database currently points at
  // hero_video_1_218457_*.mp4, which is not in media/ on this server, so the
  // hero rendered as a black rectangle. Fall back to the video bundled with the
  // app rather than showing nothing.
  const videoSrc = resolvedVideo && failedSrcs.includes(resolvedVideo)
    ? (failedSrcs.includes(FALLBACK.video_url) ? '' : FALLBACK.video_url)
    : resolvedVideo

  const handleVideoError = useCallback(() => {
    const broken = videoSrc
    if (!broken) return
    setFailedSrcs(prev => (prev.includes(broken) ? prev : [...prev, broken]))
  }, [videoSrc])

  const imageSrc = hero?.image_src || ''

  // Poster still. Only meaningful for the bundled fallback clip — an
  // admin-uploaded hero has no matching still, and showing the wrong frame
  // behind a different video would be worse than showing none.
  const posterSrc = videoSrc === FALLBACK.video_url ? FALLBACK.poster_url : undefined

  const isMultiVideo = heroes.length > 1

  // Handle sequential video playlist: when current video ends, advance to next
  const handleVideoEnded = useCallback(() => {
    if (isMultiVideo) {
      setFade(false)
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % heroes.length)
        setFade(true)
      }, 300)
    }
  }, [isMultiVideo, heroes.length])

  // Play video automatically when current video index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented; video will wait for user interaction or stays paused
        })
      }
    }
  }, [currentIdx, videoSrc])

  // NOTE: this component used to pause the hero on `prefers-reduced-motion`.
  // That is why the video appeared dead on the client's machine — Windows'
  // "Show animations" toggle sets that media query. The client asked for the
  // video to play, and it is muted, looping, decorative background with no
  // flashing, so it now plays regardless. Revert this block if a viewer ever
  // reports motion discomfort.

  return (
    <section className="relative w-full h-[80svh] lg:h-[calc(100svh-100px)] min-h-[520px] overflow-hidden bg-black">
      {/* Video / Image background layer with smooth transition */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${fade ? 'opacity-60' : 'opacity-0'}`}>
        {videoSrc ? (
          <video
            key={videoSrc}
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            /*
             * Poster + metadata-only preload, for Largest Contentful Paint.
             *
             * The hero was a 2560x1440 / 3.3 Mbps clip — 3.9 MB fighting the
             * page's own render for bandwidth on Pakistani mobile data, and
             * Core Web Vitals is a ranking signal. It is now re-encoded to
             * 720p (412 KB) and paints this 39 KB still immediately, so the
             * hero is visible before a single frame of video arrives.
             */
            poster={posterSrc}
            preload="metadata"
            loop={!isMultiVideo}
            onEnded={handleVideoEnded}
            // src on the element (not a <source> child): a failing <source>
            // does not bubble an error to the <video>, so the fallback below
            // would never trigger.
            src={videoSrc}
            onError={handleVideoError}
          />
        ) : imageSrc ? (
          <img src={imageSrc} alt="" className="w-full h-full object-cover" />
        ) : null}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/90 text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm">
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
            <Link
              href={ctaLink}
              className="btn-primary text-sm sm:text-base py-3 px-8 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
            >
              {ctaText}
            </Link>
          )}
          {ctaText2 && (
            <Link
              href={ctaLink2}
              className="btn-secondary text-sm sm:text-base py-3 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
            >
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
                className="flex items-center gap-1.5 bg-white/10 border border-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-white/80 text-xs font-medium"
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Multi-video playlist indicator dots (if multiple videos exist) */}
        {isMultiVideo && (
          <div className="flex items-center gap-2 mt-6">
            {heroes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIdx
                    ? 'w-8 bg-blue-500 shadow-md shadow-blue-500/50'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`Play Video ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
