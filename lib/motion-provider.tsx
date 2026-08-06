'use client'

// Honors the OS "reduce motion" setting for every framer-motion animation in
// the app (ScrollReveal, product cards, banners…) in one place. Users who get
// motion sickness — or cheap phones that stutter — get instant transitions.
import { MotionConfig } from 'framer-motion'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
