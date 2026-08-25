'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { confirmPasswordReset } from '@/lib/api'

function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const uid = params.get('uid') || ''
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const linkBroken = !uid || !token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('The two passwords do not match.')

    setLoading(true)
    setError('')
    try {
      await confirmPasswordReset({ uid, token, password })
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) {
      setError(err?.message || 'Could not reset your password. The link may have expired.')
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
          {linkBroken ? (
            <div className="text-center">
              <h1 className="text-lg font-black text-foreground mb-2">This link isn't valid</h1>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                It looks incomplete. Password reset links can only be used once, so please
                request a fresh one.
              </p>
              <Link href="/forgot-password" className="btn-primary text-xs w-full justify-center">
                Request a New Link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                ✓
              </div>
              <h1 className="text-lg font-black text-foreground mb-2">Password changed</h1>
              <p className="text-xs text-muted-foreground mb-6">
                Taking you to the sign-in page…
              </p>
              <Link href="/login" className="btn-primary text-xs w-full justify-center">
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-black text-foreground tracking-tight mb-1.5">
                Choose a new password
              </h1>
              <p className="text-xs text-muted-foreground mb-6">
                Make it at least 8 characters and not something easy to guess.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      required
                      autoFocus
                      autoComplete="new-password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="••••••••"
                      className="input-base pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(v => !v)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      {show ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError('') }}
                    placeholder="••••••••"
                    className="input-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="btn-primary w-full justify-center text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving…' : 'Change Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
