'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { GoogleSignIn } from '@/components/google-sign-in'

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
  const [error, setError] = useState('')
  const [step, setStep] = useState<'personal' | 'business'>('personal')
  const [noBusiness, setNoBusiness] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Steps render one at a time, so validate every field here (native `required`
    // only covers the currently visible step).
    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setStep('personal')
      return setError('Please complete all personal details first.')
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setStep('personal')
      return setError('Please enter a valid email address.')
    }
    if (form.password.length < 8) {
      setStep('personal')
      return setError('Password must be at least 8 characters.')
    }
    if (form.password !== form.confirm) {
      setStep('personal')
      return setError('Passwords do not match.')
    }
    if (!form.terms) {
      setStep('personal')
      return setError('Please accept the Terms and Privacy Policy to continue.')
    }
    // They said they have a business, so make them actually describe it.
    if (!noBusiness) {
      if (!form.company.trim()) {
        setStep('business')
        return setError('Please enter your company name, or tick “I don’t have a business”.')
      }
      if (!form.businessType) {
        setStep('business')
        return setError('Please select your business type.')
      }
    }
    setLoading(true)
    setError('')
    const nameParts = form.fullName.trim().split(' ')
    const email = form.email.trim().toLowerCase()

    // This no longer creates the account. It validates everything and emails a
    // 6-digit code; /verify-email is where the account is actually created.
    // Phone and company travel with the request so they survive the round trip
    // — the customer must not have to retype them after verifying.
    const result = await register({
      username: email.split('@')[0] + Math.floor(Math.random() * 100),
      email,
      password: form.password,
      password_confirm: form.confirm,
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      phone: form.phone,
      company: form.company,
      business_type: form.businessType,
    })
    setLoading(false)

    if (result.ok) {
      setSuccess(true)
      // The email is passed in the URL, not in state, so a refresh on the
      // verification screen does not lose it.
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } else {
      // Errors are almost always about the personal fields (email taken,
      // password too weak), so put the customer back where they can fix it.
      setStep('personal')
      setError(result.error || 'Could not start sign-up')
    }
  }

  const f = (key: keyof typeof form, val: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: val }))

  /**
   * Is the Personal tab complete enough to move on?
   *
   * The continue/submit button is hidden until this is true, so the customer
   * never clicks a button that silently does nothing.
   */
  const personalReady =
    form.fullName.trim().length > 1 &&
    form.phone.trim().length >= 7 &&
    /^\S+@\S+\.\S+$/.test(form.email) &&
    form.password.length >= 8 &&
    form.password === form.confirm &&
    form.terms

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
              <Image src="/header_logo.png" alt="Eng-Mart" width={260} height={87} priority className="h-12 sm:h-14 w-auto" />
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
              Join Pakistan's leading industrial electrical community. Direct wholesale pricing & invoice management.
            </p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="md:col-span-6 bg-background/90 p-8 sm:p-10 lg:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/50">
          
          <div className="my-auto space-y-5">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto mb-5 border border-primary/20 shadow-sm">✉️</div>
                <h2 className="text-xl font-bold text-foreground mb-1">Check Your Email</h2>
                <p className="text-muted-foreground text-xs mb-1">
                  We've sent a 6-digit code to <strong>{form.email}</strong>.
                </p>
                <p className="text-[10px] text-muted-foreground mb-6">Taking you to the verification page…</p>
                <Link
                  href={`/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`}
                  className="btn-primary py-3 px-6 rounded-xl text-xs font-bold justify-center inline-flex"
                >
                  Enter Code →
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Form Title */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-snug">
                    Get Started. Please Sign Up For An Account.
                  </h2>
                </div>

                {/* Step Tab bar.

                    With "I don't have a business" switched on there IS no
                    second step, so the tab disappears rather than sitting there
                    inviting a click that leads to a form the customer has just
                    said does not apply to them. */}
                <div className="flex gap-1 mb-4 p-1 bg-secondary rounded-xl border border-border/20">
                  {(noBusiness ? (['personal'] as const) : (['personal', 'business'] as const)).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStep(tab)}
                      className={`flex-1 min-h-10 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize cursor-pointer ${
                        step === tab ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'personal' ? '👤 Personal Details' : '🏢 Business Details'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error message (rendered on both steps) */}
                  {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3">
                      {error}
                    </div>
                  )}
                  {step === 'personal' ? (
                    <motion.div
                      key="personal"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {/* Stacked Personal Card (High Contrast & Visible Input fields) */}
                      <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm divide-y-2 divide-border focus-within:border-primary transition-colors">
                        
                        {/* Name */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card">
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <input
                            required
                            type="text"
                            placeholder="Full Name"
                            className="w-full text-xs text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                            value={form.fullName}
                            onChange={e => f('fullName', e.target.value)}
                          />
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card">
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305 1.305a11.947 11.947 0 005.368 5.368l1.305-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <input
                            required
                            type="tel"
                            placeholder="Phone (e.g. +92-300-0000000)"
                            className="w-full text-xs text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                            value={form.phone}
                            onChange={e => f('phone', e.target.value)}
                          />
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card">
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <input
                            required
                            type="email"
                            placeholder="Email Address"
                            className="w-full text-xs text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                            value={form.email}
                            onChange={e => f('email', e.target.value)}
                          />
                        </div>

                        {/* Password */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card">
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <input
                            required
                            type="password"
                            placeholder="Password (min. 8 characters)"
                            className="w-full text-xs text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                            value={form.password}
                            onChange={e => f('password', e.target.value)}
                          />
                        </div>

                        {/* Confirm Password */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card">
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <input
                            required
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full text-xs text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                            value={form.confirm}
                            onChange={e => f('confirm', e.target.value)}
                          />
                        </div>

                      </div>

                      {form.confirm && form.password !== form.confirm && (
                        <p className="text-[11px] text-destructive font-semibold pl-1">Passwords don't match</p>
                      )}

                      {/* Do you have a business? Asked here so the customer knows
                          up front whether a second step is coming. */}
                      <label className="flex items-center gap-2.5 cursor-pointer group min-h-10 pt-1">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={noBusiness}
                            onChange={e => {
                              setNoBusiness(e.target.checked)
                              // The business step no longer exists once this is
                              // on, so leaving it as the current step would
                              // strand the customer on a hidden tab.
                              if (e.target.checked) setStep('personal')
                              setError('')
                            }}
                          />
                          <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${noBusiness ? 'bg-primary' : 'bg-slate-300'}`} />
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${noBusiness ? 'transform translate-x-4' : ''}`} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                          I don't have a business
                        </span>
                      </label>

                      {/* Terms live on this tab: with the toggle on, this is the
                          last screen before the account is created. */}
                      <label className="flex items-start gap-2.5 cursor-pointer group min-h-10">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={form.terms}
                            onChange={e => f('terms', e.target.checked)}
                          />
                          <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${form.terms ? 'bg-primary' : 'bg-slate-300'}`} />
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${form.terms ? 'transform translate-x-4' : ''}`} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground leading-snug transition-colors">
                          I agree to Eng-Mart's{' '}
                          <a href="/terms" className="text-primary hover:underline font-bold">Terms</a> and{' '}
                          <a href="/terms" className="text-primary hover:underline font-bold">Privacy Policy</a>
                        </span>
                      </label>

                      {/* Action button.

                          ONE button, full width. There used to be a "Sign In"
                          button sitting next to it at equal weight, and
                          customers filling in the sign-up form pressed it —
                          landing on the login page with no account and
                          reporting that "sign up doesn't work". Signing in is
                          now a quiet text link below, where it belongs on a
                          registration page.

                          The button is also hidden until the form is actually
                          completable, so it is never a dead click. */}
                      <div className="pt-2">
                        {personalReady ? (
                          noBusiness ? (
                            <button
                              type="submit"
                              disabled={loading}
                              className="btn-primary py-3.5 rounded-xl text-xs font-bold w-full justify-center disabled:opacity-50 shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.25)] active:scale-[0.99] transition-[box-shadow,transform]"
                            >
                              {loading ? 'Sending code…' : 'Create Account'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => { setError(''); setStep('business') }}
                              className="btn-primary py-3.5 rounded-xl text-xs font-bold w-full justify-center shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.25)] active:scale-[0.99] transition-[box-shadow,transform]"
                            >
                              Continue to Business Details →
                            </button>
                          )
                        ) : (
                          <div className="rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3">
                            <p className="text-[11px] font-semibold text-muted-foreground leading-snug">
                              Fill in every field above and accept the Terms — the
                              {noBusiness ? ' “Create Account” ' : ' “Continue” '}
                              button appears as soon as you do.
                            </p>
                          </div>
                        )}

                        {/* Tells the customer what pressing it will do, before
                            they press it — the second step used to arrive with
                            no warning. */}
                        {personalReady && !noBusiness && (
                          <p className="text-[11px] text-muted-foreground font-semibold text-center mt-2.5 leading-snug">
                            One more step: your company details. No business?
                            Switch on “I don't have a business” above.
                          </p>
                        )}
                        {personalReady && noBusiness && (
                          <p className="text-[11px] text-muted-foreground font-semibold text-center mt-2.5 leading-snug">
                            We'll email a 6-digit code to <strong className="text-foreground">{form.email}</strong> to
                            confirm it's yours.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="business"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {/* Back arrow, at the TOP where a back control is looked
                          for. It returns to the personal step with everything
                          still filled in, so a customer who reached this step by
                          mistake can flip the "I don't have a business" toggle
                          and finish — rather than feeling trapped in a form
                          about a company they do not have. */}
                      <button
                        type="button"
                        onClick={() => { setError(''); setStep('personal') }}
                        className="inline-flex items-center gap-1.5 min-h-10 -ml-1 px-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
                      >
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2.5}
                          className="transition-transform group-hover:-translate-x-0.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to personal details
                      </button>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Tell us about your business so we can apply the right trade
                        pricing. Both fields are required.
                      </p>

                      <div className="rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5">
                        <p className="text-[11px] font-semibold text-muted-foreground leading-snug">
                          Don't have a business? Go{' '}
                          <button
                            type="button"
                            onClick={() => { setNoBusiness(true); setError(''); setStep('personal') }}
                            className="text-primary font-bold hover:underline cursor-pointer"
                          >
                            back and switch on “I don't have a business”
                          </button>{' '}
                          — you can create your account without this step.
                        </p>
                      </div>

                      {/* Business details are mandatory on this step: reaching it
                          at all means the customer said they DO have a business.

                          Company name and business type are two SEPARATE cards,
                          not one card with `overflow-hidden`. That wrapper is
                          what hid the business-type dropdown: the listbox opens
                          as an absolutely-positioned child, and an
                          overflow-hidden ancestor clips it away to nothing. The
                          options were rendering the whole time -- they were just
                          being cut off by the card they were inside. */}
                      {true && (
                        <div className="space-y-3">
                          
                          {/* Company Name */}
                          <div className="flex items-center gap-3.5 px-4 py-3.5 bg-card border-2 border-border rounded-2xl shadow-sm focus-within:border-primary transition-colors">
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <input
                              type="text"
                              placeholder="Company / Firm Name"
                              className="w-full text-xs text-foreground placeholder:text-muted-foreground font-medium outline-none bg-transparent"
                              value={form.company}
                              onChange={e => f('company', e.target.value)}
                            />
                          </div>

                          {/* Business Type Select.

                              `relative` positions the listbox; nothing above it
                              may clip, so this card deliberately has no
                              `overflow-hidden`. */}
                          <div className={`flex items-center gap-3.5 px-4 py-3.5 bg-card border-2 rounded-2xl shadow-sm transition-colors relative ${
                            typeOpen ? 'border-primary z-30' : 'border-border focus-within:border-primary'
                          }`}>
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {/* Custom listbox: a native <select> renders with the
                                OS's own chrome, which looked out of place next to
                                the styled inputs and could not be themed. */}
                            <button
                              type="button"
                              onClick={() => setTypeOpen(o => !o)}
                              aria-haspopup="listbox"
                              aria-expanded={typeOpen}
                              className={`w-full flex items-center justify-between text-xs font-medium bg-transparent outline-none cursor-pointer pr-1 ${
                                form.businessType ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              <span className="truncate">
                                {form.businessType || 'Select Business Type…'}
                              </span>
                              <svg
                                width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth={2.2}
                                className={`shrink-0 text-muted-foreground transition-transform duration-200 ${typeOpen ? 'rotate-180' : ''}`}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {typeOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setTypeOpen(false)} />
                                <ul
                                  role="listbox"
                                  className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border-2 border-border rounded-xl shadow-2xl animate-scale-in max-h-60 overflow-y-auto overscroll-contain"
                                >
                                  {BUSINESS_TYPES.map(bt => {
                                    const active = form.businessType === bt
                                    return (
                                      <li key={bt}>
                                        <button
                                          type="button"
                                          role="option"
                                          aria-selected={active}
                                          onClick={() => { f('businessType', bt); setTypeOpen(false) }}
                                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 transition-colors ${
                                            active
                                              ? 'bg-primary/10 text-primary'
                                              : 'text-foreground hover:bg-secondary'
                                          }`}
                                        >
                                          <span>{bt}</span>
                                          {active && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          )}
                                        </button>
                                      </li>
                                    )
                                  })}
                                </ul>
                              </>
                            )}
                          </div>

                        </div>
                      )}

                      {/* Action button. Full width and alone: "Create Account"
                          is the only thing to do here, and the way back is the
                          arrow at the top of this step. */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading || !form.company.trim() || !form.businessType}
                          className="btn-primary py-3.5 rounded-xl text-xs font-bold w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.25)] active:scale-[0.99] transition-[box-shadow,transform]"
                        >
                          {loading ? 'Sending code…' : 'Create Account'}
                        </button>
                        {!form.company.trim() || !form.businessType ? (
                          <p className="text-[11px] font-semibold text-muted-foreground text-center mt-2.5">
                            {!form.company.trim()
                              ? 'Enter your company name to continue.'
                              : 'Choose your business type to continue.'}
                          </p>
                        ) : (
                          <p className="text-[11px] font-semibold text-muted-foreground text-center mt-2.5 leading-snug">
                            We'll email a 6-digit code to <strong className="text-foreground">{form.email}</strong> to
                            confirm it's yours.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </form>

                <GoogleSignIn dividerLabel="or sign up with" redirectTo="/account" />

                {/* Signing in lives here, as a link — not as a button beside
                    "Create Account", where it was being pressed by mistake. */}
                <p className="text-center text-[11px] font-semibold text-muted-foreground pt-1">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Sign in instead
                  </Link>
                </p>
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
