'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(form.email, form.password)
    setLoading(false)
    if (ok) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/account')
      }, 1000)
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 flex transition-colors">
      {/* Left: Form panel */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-10 lg:px-12 py-10 max-w-xl mx-auto lg:mx-0 w-full">
        {/* Top nav */}
        <div>
          <Link href="/" className="inline-block mb-10">
            <Image src="/header_logo.png" alt="Eng-Mart" width={140} height={36} className="h-9 w-auto" />
          </Link>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-4xl mx-auto mb-6 border border-emerald-100">✅</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back!</h2>
              <p className="text-slate-500 mb-8 text-sm">You've been signed in successfully.</p>
              <Link href="/" className="btn-primary text-xs px-6 py-3 justify-center mx-auto inline-flex">Go to Home</Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Welcome Back</span>
                <h1 className="text-2xl sm:text-3xl text-slate-900 mb-2 font-extrabold leading-tight tracking-tight">Sign in to your account</h1>
                <p className="text-slate-400 text-xs font-semibold">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-primary font-bold hover:underline transition-all">Create one →</Link>
                </p>
              </div>

              {/* Google sign-in */}
              <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-655 hover:border-slate-355 transition-all mb-6 cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or sign in with email</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email" required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <Link href="#" className="text-xs text-primary font-bold hover:underline transition-all">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all pr-12"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
                    >
                      {showPass ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer group pt-1">
                  <input type="checkbox" className="w-4 h-4 rounded accent-primary cursor-pointer" />
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me for 30 days</span>
                </label>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-xs font-bold justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>
            </>
          )}
        </div>

        {/* Bottom */}
        <p className="text-[11px] text-slate-400 text-center mt-10">
          By signing in you agree to our{' '}
          <a href="#" className="text-primary hover:underline font-bold">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline font-bold">Privacy Policy</a>.
        </p>
      </div>

      {/* Right: Visual panel */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center p-16 max-w-xl text-white">
          <div className="mb-6">
            <Image src="/header_logo.png" alt="Eng-Mart" width={140} height={36} className="h-9 w-auto brightness-0 invert" />
          </div>
          <h2 className="text-2xl font-extrabold mb-3 leading-tight">
            Your B2B Electrical Supply Portal
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Sign in to access your order history, formal quotations, and wholesale pricing tiers. Trusted by panel builders and electrical contractors across Karachi.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: '📋', title: 'Quote History', desc: 'Access all past quotations and reorder instantly' },
              { icon: '🚚', title: 'Order Tracking', desc: 'Real-time updates on your delivery status' },
              { icon: '💰', title: 'Volume Pricing', desc: 'Unlock bulk discount tiers on your account' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">{f.title}</p>
                  <p className="text-[11px] text-slate-455">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
