'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useSiteSettings } from '@/lib/site-settings'
import Link from 'next/link'
import { createInquiry } from '@/lib/api'

const PRODUCT_CATEGORIES = [
  'MCBs', 'MCCBs', 'Magnetic Contactors', 'Current Transformers',
  'Panel Meters', 'Capacitors & PF Controllers', 'Industrial Sockets',
  'Protection Relays', 'Air Circuit Breakers', 'VFDs', 'HRC Fuses',
  'Wiring Devices', 'Timers & Controls', 'Other'
]

export default function ContactPage() {
  const { settings: SITE } = useSiteSettings()
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', product: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErrorMsg('')
    try {
      await createInquiry({
        name: form.name,
        company: form.company,
        phone: form.phone,
        email: form.email,
        product_interest: form.product,
        message: form.message,
      })
      setSent(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const CONTACT_CARDS = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Phone Support',
      lines: [SITE.phone, SITE.mobile].filter(Boolean),
      href: `tel:${SITE.phone}`,
      color: '#3B82F6',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0">
          <path d="M12.003 2A10 10 0 0 0 2.2 11.96c0 1.9.52 3.69 1.43 5.25L2 22l5.02-1.31A10 10 0 1 0 12.003 2z" fill="#25D366"/>
          <path d="M16.94 14.22c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7 1-.86 1.18-.16.18-.32.2-.59.07a7.44 7.44 0 0 1-2.19-1.35 8.16 8.16 0 0 1-1.52-1.9c-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.28.27-.46a.52.52 0 0 0-.02-.48c-.07-.15-.61-1.48-.84-2.02-.22-.54-.45-.47-.61-.48h-.53c-.18 0-.48.07-.73.34A2.78 2.78 0 0 0 6.5 9.77c0 1.63.78 3.2 1.34 3.96a11.9 11.9 0 0 0 5.09 4.5c.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3 1.8-1.42-.07-.13-.27-.2-.54-.35z" fill="white"/>
        </svg>
      ),
      title: 'WhatsApp Chat',
      lines: [SITE.whatsapp, 'Instant Technical Support'],
      href: `https://wa.me/${SITE.whatsapp_digits}?text=Hi Eng-Mart, I have an inquiry about electrical components.`,
      color: '#10B981',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Us',
      lines: [SITE.email],
      href: `mailto:${SITE.email}`,
      color: '#8B5CF6',
    },
    // The "Showroom Address" card was removed at the client's request — the
    // site is not to publish a physical address anywhere. The Google Maps
    // embed that used to sit beside the inquiry form went with it.
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Working Hours',
      lines: [SITE.hours, SITE.hours_note].filter(Boolean),
      color: '#EC4899',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background transition-colors">
      <Navbar />

      {/* Page Hero */}
      <section className="relative pt-12 pb-16 bg-gradient-to-b from-card via-background to-secondary/30 border-b border-border/80 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <nav className="breadcrumb mb-6">
              <Link href="/">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Contact Us</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Fast Technical & Quote Support
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ⚡ Response within 2 hours
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
              Get In Touch With <span className="bg-gradient-to-r from-primary via-cyan-400 to-amber-500 bg-clip-text text-transparent">Engineering Mart</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
              Whether you need a bulk quotation for commercial projects, technical assistance selecting the right switchgear, or product availability check, our engineers are ready to assist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5 Contact Cards Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_CARDS.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.3 }}
              >
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith('http') ? '_blank' : undefined}
                    rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="store-card p-5 flex flex-col justify-between group h-full relative overflow-hidden rounded-2xl border-2 border-primary/30 dark:border-primary/40 bg-card hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 shadow-sm"
                  >
                    <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-primary via-cyan-400 to-amber-400 opacity-100" />

                    <div>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 transition-transform duration-300 group-hover:scale-110 shadow-md"
                        style={{ backgroundColor: card.color }}
                      >
                        {card.icon}
                      </div>
                      <h3 className="font-extrabold text-sm text-foreground mb-2 group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      {card.lines.map((line, i) => (
                        <p key={i} className="text-xs text-muted-foreground leading-relaxed font-semibold">
                          {line}
                        </p>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center gap-1 text-[11px] font-bold text-primary opacity-90 group-hover:translate-x-1 transition-transform">
                      <span>Connect Now</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ) : (
                  <div className="store-card p-5 flex flex-col justify-between h-full relative overflow-hidden rounded-2xl border-2 border-primary/30 dark:border-primary/40 bg-card shadow-sm">
                    <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-primary via-cyan-400 to-amber-400 opacity-100" />

                    <div>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 shadow-md"
                        style={{ backgroundColor: card.color }}
                      >
                        {card.icon}
                      </div>
                      <h3 className="font-extrabold text-sm text-foreground mb-2">{card.title}</h3>
                      {card.lines.map((line, i) => (
                        <p key={i} className="text-xs text-muted-foreground leading-relaxed font-semibold">
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Mon – Sat Operations</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Form + Interactive Location Map Section */}
      <section className="py-16 sm:py-20 bg-card border-t border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-start">

            {/* Left: Professional Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-3 bg-background/90 rounded-2xl border-2 border-border/90 p-6 sm:p-8 shadow-xl shadow-primary/5 backdrop-blur-sm relative"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-foreground">Send an Inquiry</h2>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  Priority Queue
                </span>
              </div>
              <p className="text-muted-foreground mb-8 text-xs sm:text-sm font-medium">
                Fill in the form details and our technical sales engineers will respond with detailed specs and competitive pricing.
              </p>

              {sent ? (
                <motion.div
                  className="p-8 rounded-2xl text-center border-2 border-emerald-500/40 bg-emerald-500/10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-500/30">
                    ✓
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground mb-2">Inquiry Submitted Successfully!</h3>
                  <p className="text-muted-foreground text-xs font-semibold leading-relaxed max-w-md mx-auto">
                    Thank you! Your request has been dispatched to our sales desk. Expect a call or email reply within a few hours.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', company: '', phone: '', email: '', product: '', message: '' }) }}
                    className="mt-6 btn-secondary text-xs font-bold py-2.5 px-6 rounded-full"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Step 1 — who is asking. Grouping the fields under explicit
                      headings turns a flat eight-field wall into two short,
                      obviously-finishable sections. */}
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center shrink-0">1</span>
                    <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">Your Details</h3>
                    <span className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
                        Full Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text" required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Engr. Ahmad Ali"
                        className="input-base border-2 border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Your Company Pvt Ltd"
                        className="input-base border-2 border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
                        Phone Number <span className="text-primary">*</span>
                      </label>
                      <input
                        type="tel" required
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+92-300-0000000"
                        className="input-base border-2 border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
                        Email Address <span className="text-primary">*</span>
                      </label>
                      <input
                        type="email" required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@company.com"
                        className="input-base border-2 border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Step 2 — what they need. */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-black flex items-center justify-center shrink-0">2</span>
                    <h3 className="text-xs font-extrabold text-foreground uppercase tracking-widest">Your Requirement</h3>
                    <span className="flex-1 h-px bg-border" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
                      Product Interest Category
                    </label>
                    <select
                      value={form.product}
                      onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                      className="input-base border-2 border-border/80 cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select product category...</option>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
                      Message / Requirements <span className="text-primary">*</span>
                    </label>
                    <textarea
                      required rows={4}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Please describe your requirements, quantities needed, or list specific model numbers (e.g. Siemens 3RT Contactor 32A)..."
                      className="input-base border-2 border-border/80 resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {errorMsg && (
                    <p role="alert" className="text-xs font-bold text-destructive bg-destructive/10 border-2 border-destructive/30 rounded-xl px-4 py-3">
                      ⚠️ {errorMsg}
                    </p>
                  )}

                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={sending}
                      className="btn-primary w-full py-3.5 justify-center text-sm font-bold shadow-lg hover:shadow-xl cursor-pointer"
                      whileHover={{ scale: sending ? 1 : 1.01 }}
                      whileTap={{ scale: sending ? 1 : 0.98 }}
                    >
                      {sending ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Sending Inquiry...</span>
                        </span>
                      ) : (
                        <span>Send Inquiry Request →</span>
                      )}
                    </motion.button>
                  </div>

                  <p className="text-[11px] text-muted-foreground font-semibold text-center mt-3">
                    🔒 Your information is confidential and will only be used for quote processing.
                  </p>
                </form>
              )}
            </motion.div>

            {/* Right rail: direct-contact shortcuts.
                The Google Maps embed that used to head this column was removed
                with the showroom address — the site publishes no location. */}
            <motion.div
              className="lg:col-span-2 space-y-5 lg:sticky lg:top-28"
              initial={{ opacity: 0, x: 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="rounded-2xl border-2 border-border/90 bg-background p-5 shadow-sm">
                <h3 className="text-sm font-extrabold text-foreground">Prefer to talk now?</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                  Our sales engineers answer during working hours. For anything
                  urgent, WhatsApp gets the fastest reply.
                </p>
              </div>

              {/* Quick Action: WhatsApp */}
              <a
                href={`https://wa.me/${SITE.whatsapp_digits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="store-card flex items-center justify-between p-5 rounded-2xl border-2 border-border/90 bg-background group hover:border-emerald-500/80 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-[#25D366]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-foreground text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Instant WhatsApp Chat
                      </p>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">{SITE.whatsapp}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>

              {/* Quick Action: Direct Call */}
              <a
                href={`tel:${SITE.phone}`}
                className="store-card flex items-center justify-between p-5 rounded-2xl border-2 border-border/90 bg-background group hover:border-primary/80 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-extrabold text-foreground text-sm group-hover:text-primary transition-colors">
                      Call Direct Sales Desk
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">{SITE.phone}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

