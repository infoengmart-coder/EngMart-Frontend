'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const BUSINESS_TYPES = [
  'Electrical Contractor',
  'Panel Builder / MCC Manufacturer',
  'Engineering Consultant',
  'Procurement / Trader',
  'End User (Factory / Plant)',
  'Other',
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', company: '', businessType: '', phone: '', email: '', password: '', confirm: '', terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState<'personal' | 'business'>('personal')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) return alert('Passwords do not match.')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    setSuccess(true)
  }

  const f = (key: keyof typeof form, val: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="min-h-screen bg-slate-50 flex transition-colors">
      {/* Left: Form panel */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-10 lg:px-12 py-10 max-w-xl mx-auto lg:mx-0 w-full overflow-y-auto">
        
        {/* Top nav */}
        <div>
          <Link href="/" className="inline-block mb-10">
            <Image src="/header_logo.png" alt="Eng-Mart" width={140} height={36} className="h-9 w-auto" />
          </Link>

          {success ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-4xl mx-auto mb-6 border border-emerald-100">🎉</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
              <p className="text-slate-500 mb-2 text-sm">Welcome to Eng-Mart, <strong>{form.fullName}</strong>.</p>
              <p className="text-xs text-slate-400 mb-8">We'll verify your account and activate B2B pricing within 24 hours.</p>
              <Link href="/login" className="btn-primary text-xs px-6 py-3 justify-center inline-flex">Sign In →</Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-7">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Create Account</span>
                <h1 className="text-2xl sm:text-3xl text-slate-900 mb-2 font-extrabold leading-tight tracking-tight">Get started with Eng-Mart</h1>
                <p className="text-slate-400 text-xs font-semibold">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-bold hover:underline transition-colors">Sign in →</Link>
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 mb-6 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(['personal', 'business'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStep(tab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                      step === tab ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'personal' ? '👤 Personal' : '🏢 Business'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Full Name *</label>
                        <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all" placeholder="Ahmad Ali" value={form.fullName} onChange={e => f('fullName', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Phone *</label>
                        <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all" type="tel" placeholder="+92-300-0000000" value={form.phone} onChange={e => f('phone', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Email Address *</label>
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all" type="email" placeholder="you@company.com" value={form.email} onChange={e => f('email', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Password *</label>
                      <div className="relative">
                        <input
                          required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all pr-12" type={showPass ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={form.password} onChange={e => f('password', e.target.value)}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d={showPass ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                              : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Confirm Password *</label>
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => f('confirm', e.target.value)} />
                      {form.confirm && form.password !== form.confirm && (
                        <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                      )}
                    </div>
                    <button type="button" onClick={() => setStep('business')} className="btn-primary w-full py-3.5 justify-center cursor-pointer">
                      Next: Business Info →
                    </button>
                  </motion.div>
                )}

                {step === 'business' && (
                  <motion.div
                    key="business"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Company Name</label>
                      <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary transition-all" placeholder="Your Company / Firm Name" value={form.company} onChange={e => f('company', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Business Type *</label>
                      <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-primary cursor-pointer" value={form.businessType} onChange={e => f('businessType', e.target.value)}>
                        <option value="">Select type...</option>
                        {BUSINESS_TYPES.map(bt => <option key={bt}>{bt}</option>)}
                      </select>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                      <input
                        type="checkbox" required
                        className="w-4 h-4 rounded accent-primary mt-0.5 flex-shrink-0 cursor-pointer"
                        checked={form.terms}
                        onChange={e => f('terms', e.target.checked)}
                      />
                      <span className="text-xs font-semibold text-slate-500 leading-relaxed">
                        I agree to Eng-Mart's{' '}
                        <a href="#" className="text-primary hover:underline font-bold">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="text-primary hover:underline font-bold">Privacy Policy</a>
                      </span>
                    </label>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep('personal')}
                        className="btn-secondary flex-shrink-0 py-3 text-xs"
                      >
                        ← Back
                      </button>
                      <motion.button
                        type="submit"
                        disabled={loading || !form.terms}
                        className="btn-primary flex-1 justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: loading ? 1 : 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {loading ? 'Creating Account...' : 'Create Account ✓'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </form>
            </>
          )}
        </div>

        {/* Bottom */}
        <p className="text-[11px] text-slate-400 text-center mt-10">
          © {new Date().getFullYear()} Eng-Mart. All rights reserved.
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
            Join 500+ Industrial Clients
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Create an account to unlock wholesale pricing, generate instant quotations, and manage your orders. We are the trusted supply partner for Pakistan's top panel builders.
          </p>

          {/* Testimonial from old register page */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mt-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-black text-primary flex-shrink-0">
                KA
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Engr. Kamran Ahmed</p>
                <p className="text-[10px] text-slate-400 mt-1">KA Electrical Works</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "Eng-Mart has been our go-to for ABB and CHINT. Genuine products, fast delivery, and their team actually knows what they're selling."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
