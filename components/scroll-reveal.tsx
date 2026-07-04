'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

type Variant = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in' | 'fade-down'

interface ScrollRevealProps {
  children: ReactNode
  variant?: Variant
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  amount?: number
}

const VARIANTS: Record<Variant, { hidden: object; visible: object }> = {
  'fade-up': {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-down': {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
  },
}

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.55,
  className,
  once = true,
  amount = 0.15,
}: ScrollRevealProps) {
  const v = VARIANTS[variant]
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: v.hidden,
        visible: {
          ...v.visible,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Staggered children wrapper
interface StaggerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
  amount?: number
}

export function StaggerReveal({
  children,
  className,
  staggerDelay = 0.09,
  once = true,
  amount = 0.1,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerChild({
  children,
  className,
  variant = 'fade-up',
}: {
  children: ReactNode
  className?: string
  variant?: Variant
}) {
  const v = VARIANTS[variant]
  return (
    <motion.div
      className={className}
      variants={{
        hidden: v.hidden,
        visible: {
          ...v.visible,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
