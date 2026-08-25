'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { GoogleSignIn } from '@/components/google-sign-in'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)  // stay signed in by default
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(form.email, form.password, rememberMe)
    setLoading(false)
    if (result.ok) {
      setSuccess(true)
      setTimeout(() => {
        if (result.user?.is_admin) {
          router.push('/admin')
        } else {
          router.push('/account')
        }
      }, 800)
    } else {
      setError(result.error || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">

      {/* Premium background radial glowing spots */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-[960px] bg-card rounded-[2.5rem] border-4 border-slate-300 shadow-[0_20px_50px_rgba(8,112,184,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] relative z-10">

        {/* Left Side: Stunning Illustration Panel */}
        <div className="hidden md:flex md:col-span-6 flex-col items-center justify-between p-8 bg-card relative">
          {/* Logo on top left */}
          <div className="self-start">
            <Link href="/">
              <Image src="/header_logo.png" alt="Eng-Mart" width={130} height={36} className="h-8 w-auto" />
            </Link>
          </div>

          {/* Premium Floating Illustration */}
          <div className="w-full flex items-center justify-center flex-1 py-8">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full max-w-[340px] aspect-square"
            >
              <Image
                src="/b2b_electrical_illustration.png"
                alt="B2B Electrical Solutions"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Subtext info */}
          <div className="text-center max-w-[280px]">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-1.5">Authorized B2B Portal</h3>
            <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
              Unlock tier discounts, direct orders, and technical specs for all industrial products.
            </p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="md:col-span-6 bg-background/90 p-8 sm:p-10 lg:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/50">
          
          <div className="my-auto space-y-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-5 border border-emerald-500/20 shadow-sm">✓</div>
                <h2 className="text-xl font-bold text-foreground mb-1">Welcome Back!</h2>
                <p className="text-muted-foreground text-xs">Redirecting to your B2B account dashboard...</p>
              </motion.div>
            ) : (
              <>
                {/* Form Title */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                    Welcome Back. Please Log In To Your Account.
                  </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Error message */}
                  {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
                      {error}
                    </div>
                  )}

                  {/* Stacked Input Block (High Contrast, Enhanced Visibility) */}
                  <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm divide-y-2 divide-border focus-within:border-primary transition-colors">
                    
                    {/* Email Input Field */}
                    <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card">
                      {/* Email Icon */}
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      {/* type="text", NOT "email": the backend accepts a username
                          OR an email, and type="email" made the browser reject
                          usernames before the form could even submit — which
                          locked the admin (Engmart-admin987) out entirely. */}
                      <input
                        type="text"
                        required
                        autoComplete="username"
                        aria-label="Email or username"
                        placeholder="Email or username"
                        className="w-full text-sm text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>

                    {/* Password Input Field */}
                    <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card">
                      {/* Lock Icon */}
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full text-sm text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        className="shrink-0 p-1 -mr-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                  </div>

                  {/* Options Row (Remember Password Switch & Forgot Password Link) */}
                  <div className="flex items-center justify-between text-xs">
                    {/* Remember Password Toggle Switch */}
                    <label className="flex items-center gap-2.5 cursor-pointer group min-h-10">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                        />
                        {/* Track */}
                        <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${rememberMe ? 'bg-primary' : 'bg-slate-300'}`} />
                        {/* Knob */}
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${rememberMe ? 'transform translate-x-4' : ''}`} />
                      </div>
                      <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                        Remember Password
                      </span>
                    </label>

                    {/* Forgot Password Link */}
                    <Link href="/forgot-password" className="text-primary font-bold hover:underline inline-flex items-center min-h-10">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Action Buttons (Side by Side) */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary py-3.5 rounded-xl text-xs font-bold w-full justify-center disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.25)] active:scale-[0.99] transition-[box-shadow,transform]"
                    >
                      {loading ? 'Logging In...' : 'Login'}
                    </button>
                    <Link
                      href="/register"
                      className="btn-secondary py-3.5 rounded-xl text-xs font-bold w-full justify-center text-center bg-card border border-border text-foreground hover:bg-background hover:border-slate-300 transition-[background-color,border-color,transform] shadow-[0_2px_4px_rgba(0,0,0,0.02)] active:scale-[0.99]"
                    >
                      Create Account
                    </Link>
                  </div>
                </form>

                <GoogleSignIn dividerLabel="or" redirectTo="/account" />
              </>
            )}
          </div>

          {/* Bottom Agreement Link */}
          <div className="mt-8 pt-4 border-t border-border/50 flex flex-wrap justify-between gap-2 text-[10px] text-muted-foreground font-semibold">
            <span>© {new Date().getFullYear()} Eng-Mart Co.</span>
            <div className="flex gap-3">
              <a href="/terms" className="hover:text-foreground transition-colors">Terms &amp; Conditions</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
