'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { BRAND_LOGO_ENTRIES } from '@/lib/brand-logos'

/**
 * Infinite, always-running strip of manufacturer wordmarks.
 *
 * The track holds the logo list TWICE and slides by exactly half its own
 * width. At the moment the offset passes that halfway point it is wrapped back
 * to zero, and because copy #2 sits precisely where copy #1 began, the seam is
 * invisible. The duplicate is required, not decorative.
 *
 * WHY requestAnimationFrame RATHER THAN A CSS ANIMATION
 * -----------------------------------------------------
 * This started life as a CSS `@keyframes` animation and did not move on the
 * client's machine. The compiled stylesheet was correct, so the cause was
 * environmental — the app ships a global
 *
 *     @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms } }
 *
 * rule, and Windows' "Show animations" toggle (off on plenty of machines) sets
 * that media query. Any CSS-driven version is therefore at the mercy of a
 * setting we cannot see from here. Driving the transform from rAF makes the
 * marquee behave identically everywhere, which is what the client asked for.
 *
 * The loop is cheap: one transform write per frame on a single compositor-
 * promoted element, and it parks itself entirely whenever the strip is off
 * screen or the tab is hidden.
 */

interface BrandMarqueeProps {
  /** Which way the logos travel. */
  direction?: 'left' | 'right'
  /** Pixels travelled per second. */
  speed?: number
  /** Heading shown above the strip. Pass `null` to render the strip alone. */
  title?: string | null
  /** Small uppercase kicker above the heading. */
  label?: string | null
  className?: string
}

export function BrandMarquee({
  direction = 'right',
  speed = 45,
  title = 'Authorized Distributor for World-Class Brands',
  label = 'Our Brand Partners',
  className = '',
}: BrandMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  /** Set while the pointer is over the strip, so a logo can be read/clicked. */
  const pausedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return

    let offset = 0
    let lastTime: number | null = null
    let frame = 0
    let running = true

    /**
     * Distance from copy #1's first logo to copy #2's first logo — one exact
     * loop period.
     *
     * NOT `scrollWidth / 2`: the track lays out 2N items with a gap between
     * each, so half its width is short by half a gap and the strip would jump
     * backwards a little on every wrap. Measuring the second copy's actual
     * offset includes the separating gap and makes the seam invisible.
     */
    const measurePeriod = () => {
      const items = track.children
      const half = items.length / 2
      if (half < 1) return 0
      const first = items[0] as HTMLElement
      const secondCopy = items[half] as HTMLElement | undefined
      if (!secondCopy) return 0
      return secondCopy.offsetLeft - first.offsetLeft
    }

    // Re-measured on resize and once images have loaded, because logo widths
    // (and therefore the period) are unknown until then.
    const periodRef = { current: measurePeriod() }
    const remeasure = () => { periodRef.current = measurePeriod() }

    const resizeObserver = new ResizeObserver(remeasure)
    resizeObserver.observe(track)
    Array.from(track.querySelectorAll('img')).forEach(img => {
      if (!img.complete) img.addEventListener('load', remeasure, { once: true })
    })

    const step = (time: number) => {
      if (!running) return

      // First frame after a pause has a huge delta (the whole idle period);
      // seeding from it would teleport the strip. Skip it instead.
      if (lastTime === null) lastTime = time
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (!pausedRef.current && delta > 0 && delta < 0.5) {
        const period = periodRef.current
        if (period > 0) {
          offset += speed * delta
          // Modulo rather than a reset-to-zero: at high deltas a plain reset
          // would drop the remainder and visibly stutter.
          offset %= period
          const x = direction === 'right' ? offset - period : -offset
          track.style.transform = `translate3d(${x}px, 0, 0)`
        }
      }

      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)

    // Stop entirely when scrolled away or the tab is backgrounded — an
    // off-screen rAF loop is pure battery drain on mobile.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!running) {
            running = true
            lastTime = null
            frame = requestAnimationFrame(step)
          }
        } else {
          running = false
          cancelAnimationFrame(frame)
        }
      },
      { threshold: 0 },
    )
    observer.observe(viewport)

    const onVisibility = () => {
      // Reset the clock so returning to the tab does not jump the strip.
      if (!document.hidden) lastTime = null
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [direction, speed])

  const logos = BRAND_LOGO_ENTRIES
  if (logos.length === 0) return null

  // Duplicated once — see the component docblock for why the seam depends on it.
  const track = [...logos, ...logos]

  return (
    <section
      className={`relative py-8 sm:py-10 bg-card border-y border-border overflow-hidden ${className}`}
      aria-label="Brands we distribute"
    >
      {(label || title) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
          {label && (
            <span className="text-[11px] font-bold text-primary tracking-widest uppercase">
              {label}
            </span>
          )}
          {title && (
            <h2 className="text-lg sm:text-2xl font-extrabold text-foreground mt-1 tracking-tight">
              {title}
            </h2>
          )}
        </div>
      )}

      {/* Edge fades so logos dissolve instead of being chopped at the viewport.
          pointer-events-none keeps the links underneath clickable. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-card to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-card to-transparent" />

      <div
        ref={viewportRef}
        className="marquee-viewport"
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
        onFocus={() => { pausedRef.current = true }}
        onBlur={() => { pausedRef.current = false }}
      >
        <div ref={trackRef} className="marquee-track">
          {track.map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              href={`/brands/${brand.slug}`}
              // The second copy is decorative duplication — hide it from screen
              // readers and the tab order so the list is announced once.
              aria-hidden={i >= logos.length}
              tabIndex={i >= logos.length ? -1 : undefined}
              title={brand.name}
              className="marquee-item group/logo"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                loading="lazy"
                draggable={false}
                // Full colour: these are manufacturer wordmarks and their brand
                // colours are the whole point of showing them.
                className="max-h-10 sm:max-h-12 w-auto max-w-[130px] sm:max-w-[150px] object-contain
                           transition-transform duration-300 group-hover/logo:scale-110"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
