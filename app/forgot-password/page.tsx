'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { requestPasswordReset } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await requestPasswordReset(email.trim())
      // The API answers the same whether or not the account exists, so we show
      // the same screen either way — telling a stranger which emails are
      // registered would leak the client's customer list.
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Could not send the email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image src="/header_logo.png" alt="Eng-Mart" width={150} height={42} className="h-9 w-auto mx-auto" />
          </Link>
        </div>

        <div className="panel-card p-7 sm:p-9">
          {sent ? (
            <div className="text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-lg font-black text-foreground mb-2">Check your email</h1>
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                If an account exists for <strong className="text-foreground">{email}</strong>,
                we have sent a link to reset your password.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-6">
                The link works once and expires shortly. Remember to check your spam folder.
              </p>
              <Link href="/login" className="btn-primary text-xs w-full justify-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black text-foreground tracking-tight mb-1.5">
                Forgot your password?
              </h1>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Enter the email address on your account and we will send you a link to choose
                a new password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full justify-center text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="text-xs font-semibold text-primary hover:underline">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
