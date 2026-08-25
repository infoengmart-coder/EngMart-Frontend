'use client'

/**
 * New-visitor offer popup and the post-sign-in celebration.
 *
 * Both live here because they are two halves of one flow: the popup makes the
 * promise, the celebration confirms it was kept. Each is shown at most once per
 * browser — see lib/welcome-discount for the persistence rules.
 *
 * The popup waits a few seconds before appearing. Firing it on load interrupts
 * someone who has not yet seen a single product, which reads as spam and gets
 * dismissed reflexively; letting them look around first makes the offer land.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles, BadgePercent, ShieldCheck, Truck } from 'lucide-react'
import { useWelcomeDiscount } from '@/lib/welcome-discount'
import { useScrollLock } from '@/components/confirm-dialog'

/** How long a visitor gets to look around before the offer appears. */
const POPUP_DELAY_MS = 6000

export function WelcomeDiscountModal() {
  const {
    percent, shouldShowPopup, shouldCelebrate,
    dismissPopup, dismissCelebration,
  } = useWelcomeDiscount()

  const [popupOpen, setPopupOpen] = useState(false)
  const [celebrationOpen, setCelebrationOpen] = useState(false)

  useScrollLock(popupOpen || celebrationOpen)

  // Delay the offer; cancel cleanly if the visitor signs in meanwhile.
  useEffect(() => {
    if (!shouldShowPopup) {
      setPopupOpen(false)
      return
    }
    const timer = setTimeout(() => setPopupOpen(true), POPUP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [shouldShowPopup])

  // The celebration is immediate — it is a reaction to something they just did.
  useEffect(() => {
    if (shouldCelebrate) setCelebrationOpen(true)
  }, [shouldCelebrate])

  const closePopup = () => {
    setPopupOpen(false)
    dismissPopup()
  }

  const closeCelebration = () => {
    setCelebrationOpen(false)
    dismissCelebration()
  }

  // Escape closes whichever is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (celebrationOpen) closeCelebration()
      else if (popupOpen) closePopup()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <AnimatePresence>
        {popupOpen && (
          <OfferDialog percent={percent} onClose={closePopup} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrationOpen && (
          <CelebrationDialog percent={percent} onClose={closeCelebration} />
        )}
      </AnimatePresence>
    </>
  )
}

/* ── The offer ────────────────────────────────────────────────────────── */

function OfferDialog({ percent, onClose }: { percent: number; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-offer-title"
    >
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-card shadow-2xl border border-border"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      >
        <button
          onClick={onClose}
          aria-label="Close offer"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Left: the offer itself */}
          <div className="relative bg-gradient-to-br from-primary via-primary to-[color-mix(in_srgb,var(--primary)_60%,black)] p-8 sm:p-10 text-white flex flex-col justify-center overflow-hidden">
            {/* Decorative rings — purely ornamental, hidden from assistive tech */}
            <svg
              className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
              viewBox="0 0 400 400" fill="none" aria-hidden="true"
            >
              <circle cx="60" cy="60" r="90" stroke="white" strokeWidth="1.5" />
              <circle cx="330" cy="300" r="120" stroke="white" strokeWidth="1.5" />
              <circle cx="200" cy="180" r="160" stroke="white" strokeWidth="1" />
            </svg>

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Welcome Offer
              </span>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-7xl sm:text-8xl font-black leading-none tracking-tighter">
                  {percent}%
                </span>
                <span className="text-2xl font-black tracking-tight">OFF</span>
              </div>

              <p className="mt-3 text-sm font-bold text-white/90 leading-relaxed max-w-xs">
                on your first order — applied automatically at checkout when you
                create your free Engineering Mart account.
              </p>

              <div className="mt-7 space-y-2.5">
                {[
                  { icon: ShieldCheck, text: '100% genuine, authorized stock' },
                  { icon: BadgePercent, text: 'Discount applied automatically' },
                  { icon: Truck, text: 'Fast dispatch across Pakistan' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs font-semibold text-white/85">
                    <Icon className="w-4 h-4 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: the ask */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <Image
              src="/header_logo.png"
              alt="Engineering Mart"
              width={180}
              height={60}
              className="h-11 w-auto object-contain mb-6"
            />

            <h2
              id="welcome-offer-title"
              className="text-2xl font-black text-foreground tracking-tight leading-snug"
            >
              Create an account,<br />save {percent}% today.
            </h2>

            <p className="text-sm text-muted-foreground font-medium mt-3 leading-relaxed">
              Join thousands of contractors and panel builders sourcing ABB,
              Siemens, Schneider and CHINT switchgear at trade prices.
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href="/register"
                onClick={onClose}
                className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-lg"
              >
                Create Free Account &amp; Save {percent}%
              </Link>
              <Link
                href="/login"
                onClick={onClose}
                className="btn-secondary w-full justify-center py-3 text-sm font-bold"
              >
                I already have an account
              </Link>
            </div>

            <button
              onClick={onClose}
              className="mt-5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── The celebration ──────────────────────────────────────────────────── */

/**
 * Confetti built from deterministic pseudo-random values.
 *
 * Math.random() here would produce different positions on the server and the
 * client and trip a hydration mismatch, so the scatter is derived from the
 * index instead — visually irregular, but identical in both renders.
 */
const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const spread = (i * 37) % 100
  const drift = ((i * 53) % 40) - 20
  const delay = ((i * 17) % 100) / 100
  const duration = 2.2 + (((i * 29) % 100) / 100) * 1.4
  const size = 6 + ((i * 13) % 7)
  const palette = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4']
  return { left: spread, drift, delay, duration, size, color: palette[i % palette.length] }
})

function CelebrationDialog({ percent, onClose }: { percent: number; onClose: () => void }) {
  // Auto-dismiss: this is an acknowledgement, not a decision to make.
  useEffect(() => {
    const timer = setTimeout(onClose, 7000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[310] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-celebration-title"
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className="absolute top-0 rounded-[2px]"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 1.6,
              backgroundColor: c.color,
            }}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{
              y: ['-5vh', '105vh'],
              x: [0, c.drift, -c.drift, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360, 720],
            }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: 0.6,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative w-full max-w-md rounded-3xl bg-card shadow-2xl border border-border p-8 sm:p-10 text-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-secondary hover:bg-secondary/70 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge with a pulsing halo */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-500/20"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
            initial={{ rotate: -18, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
          >
            <span className="text-white text-2xl font-black tracking-tight">
              {percent}%
            </span>
          </motion.div>
        </div>

        <motion.h2
          id="welcome-celebration-title"
          className="text-2xl font-black text-foreground tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Congratulations! 🎉
        </motion.h2>

        <motion.p
          className="text-sm text-muted-foreground font-semibold mt-3 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          Your <span className="text-emerald-600 dark:text-emerald-400 font-black">{percent}% welcome discount</span> is
          unlocked. It is applied automatically to your first order — you will
          see it in your cart and at checkout.
        </motion.p>

        <motion.div
          className="mt-7 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Link
            href="/products"
            onClick={onClose}
            className="btn-primary flex-1 justify-center py-3 text-sm font-bold"
          >
            Start Shopping
          </Link>
          <Link
            href="/cart"
            onClick={onClose}
            className="btn-secondary flex-1 justify-center py-3 text-sm font-bold"
          >
            View Cart
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
