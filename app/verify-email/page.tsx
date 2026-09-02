'use client'

/**
 * Email verification — step 2 of sign-up.
 *
 * The sign-up form no longer creates an account. It emails a 6-digit code and
 * sends the customer here; entering the code is what actually creates the
 * account, and they arrive signed in.
 *
 * The email address is carried in the query string (`?email=`) rather than in
 * component state, so a refresh — or opening the link on the phone where the
 * mail arrived — lands on the same screen instead of dumping the customer back
 * to an empty form.
 */

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const CODE_LENGTH = 6

function VerifyEmailInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { verifySignupCode, resendSignupCode } = useAuth()

  const email = (params.get('email') || '').trim()

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  // Guards the auto-submit so a re-render cannot fire the same code twice.
  const submittedRef = useRef('')

  const code = digits.join('')

  // Someone landing here directly, with no sign-up in progress, has nothing to
  // verify — send them back to the form rather than showing a dead screen.
  useEffect(() => {
    if (!email) router.replace('/register')
  }, [email, router])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  // Resend cooldown ticker. The server enforces its own 60s limit; this just
  // stops the button inviting a click that would only be refused.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const submit = useCallback(async (value: string) => {
    if (value.length !== CODE_LENGTH || loading) return
    // Re-submitting the same wrong code burns a server-side attempt for nothing.
    if (submittedRef.current === value) return
    submittedRef.current = value

    setLoading(true)
    setError('')
    setNotice('')

    const result = await verifySignupCode(email, value)
    setLoading(false)

    if (result.ok) {
      setSuccess(true)
      // Straight into the account — they are already signed in.
      setTimeout(() => router.push('/account'), 1400)
      return
    }

    setError(result.error || 'That code could not be verified.')
    // A locked or expired sign-up cannot be recovered by typing again, so send
    // them back to the form instead of leaving them guessing at a dead screen.
    if (result.locked || result.expired) {
      setTimeout(() => router.push('/register'), 2500)
      return
    }
    setDigits(Array(CODE_LENGTH).fill(''))
    inputsRef.current[0]?.focus()
  }, [email, loading, router, verifySignupCode])

  const setDigit = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (!value) {
      setDigits(prev => prev.map((d, i) => (i === index ? '' : d)))
      return
    }

    setDigits(prev => {
      const next = [...prev]
      // Typing or pasting several digits at once fills forward from here,
      // which is what happens when the code is pasted from the email.
      for (let i = 0; i < value.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = value[i]
      }
      const filled = Math.min(index + value.length, CODE_LENGTH - 1)
      inputsRef.current[filled]?.focus()

      const joined = next.join('')
      if (joined.length === CODE_LENGTH && !joined.includes('')) void submit(joined)
      return next
    })
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Backspace on an empty box steps back — the behaviour every OTP field
      // has, and its absence makes correcting a typo feel broken.
      e.preventDefault()
      inputsRef.current[index - 1]?.focus()
      setDigits(prev => prev.map((d, i) => (i === index - 1 ? '' : d)))
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus()
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
    if (pasted.length === CODE_LENGTH) void submit(pasted)
  }

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    setError('')
    setNotice('')

    const result = await resendSignupCode(email)
    setResending(false)

    if (result.ok) {
      setNotice(`A new code is on its way to ${email}.`)
      setDigits(Array(CODE_LENGTH).fill(''))
      submittedRef.current = ''
      inputsRef.current[0]?.focus()
      setCooldown(60)
    } else {
      setError(result.error || 'Could not send a new code.')
      if (result.retryAfter) setCooldown(result.retryAfter)
    }
  }

  if (!email) return null

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
      {/* Same glow treatment as the sign-up page, so this reads as the next
          step of one flow rather than a different site. */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[480px] bg-card rounded-[2rem] border-4 border-slate-300 shadow-[0_20px_50px_rgba(8,112,184,0.06)] p-8 sm:p-10 relative z-10">
        <div className="flex justify-center mb-7">
          <Link href="/">
            <Image src="/header_logo.png" alt="Eng-Mart" width={260} height={87} priority className="h-12 sm:h-14 w-auto" />
          </Link>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-5 border border-emerald-500/20">
              ✓
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1.5">Email Verified!</h1>
            <p className="text-xs text-muted-foreground mb-1">
              Your account is ready and you're signed in.
            </p>
            <p className="text-[10px] text-muted-foreground">Taking you to your account…</p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl mx-auto mb-4 border border-primary/20">
                ✉️
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Check your email
              </h1>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5 break-all">{email}</p>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs font-semibold p-3 mb-4 text-center">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 text-xs font-semibold p-3 mb-4 text-center">
                {notice}
              </div>
            )}

            {/* Code boxes */}
            <div className="flex justify-center gap-2 sm:gap-2.5 mb-6" onPaste={onPaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputsRef.current[i] = el }}
                  // `inputMode="numeric"` brings up the number pad on phones —
                  // type="number" would add spinners and allow "e" and "-".
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={CODE_LENGTH}
                  value={digit}
                  disabled={loading}
                  onChange={e => setDigit(i, e.target.value)}
                  onKeyDown={e => onKeyDown(i, e)}
                  onFocus={e => e.target.select()}
                  aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                  className={`w-11 h-14 sm:w-12 sm:h-15 text-center text-xl font-black rounded-xl border-2 bg-card text-foreground outline-none transition-colors disabled:opacity-60 ${
                    digit ? 'border-primary' : 'border-border'
                  } focus:border-primary`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => submit(code)}
              disabled={loading || code.length !== CODE_LENGTH}
              className="btn-primary py-3.5 rounded-xl text-xs font-bold w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.25)] active:scale-[0.99] transition-[box-shadow,transform]"
            >
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </button>

            <div className="mt-5 text-center space-y-2">
              <p className="text-[11px] text-muted-foreground font-semibold">
                Didn't get it? Check your spam folder.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="text-xs font-bold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
              >
                {resending
                  ? 'Sending…'
                  : cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : 'Resend code'}
              </button>
            </div>

            <div className="mt-7 pt-5 border-t border-border/50 text-center">
              <Link
                href="/register"
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Wrong email? Go back and sign up again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  // useSearchParams needs a Suspense boundary for the static build.
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyEmailInner />
    </Suspense>
  )
}
