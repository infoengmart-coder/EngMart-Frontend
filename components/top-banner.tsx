'use client'

import { useState, useEffect } from 'react'
import { ANNOUNCEMENTS, SITE } from '@/lib/data'

export function TopBanner() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % ANNOUNCEMENTS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="bg-primary text-primary-foreground relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-9 gap-4">
          {/* Left contacts */}
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-xs text-primary-foreground/90 font-medium">
            <a href={`tel:${SITE.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {SITE.phone}
            </a>
            <span className="opacity-50">·</span>
            <span>{SITE.hours}</span>
          </div>

          {/* Centre announcement */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <p
              key={idx}
              className="text-xs font-semibold text-center truncate animate-[fadeInUp_0.4s_ease]"
              style={{ animation: 'fadeInUp 0.4s ease' }}
            >
              {ANNOUNCEMENTS[idx]}
            </p>
          </div>

          {/* Right dismiss */}
          <button
            onClick={() => setVisible(false)}
            className="flex-shrink-0 p-1 rounded text-primary-foreground/75 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
