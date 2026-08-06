'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useSiteSettings } from '@/lib/site-settings'
import Link from 'next/link'

import { createInquiry } from '@/lib/api'

const PRODUCT_CATEGORIES = ['MCBs', 'MCCBs', 'Magnetic Contactors', 'Current Transformers', 'Panel Meters', 'Capacitors & PF Controllers', 'Industrial Sockets', 'Protection Relays', 'Air Circuit Breakers', 'VFDs', 'HRC Fuses', 'Wiring Devices', 'Timers & Controls', 'Other']

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
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
      title: 'Phone',
      lines: [SITE.phone, SITE.mobile],
      href: `tel:${SITE.phone}`,
      color: 'var(--primary)',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0">
          <path d="M12.003 2A10 10 0 0 0 2.2 11.96c0 1.9.52 3.69 1.43 5.25L2 22l5.02-1.31A10 10 0 1 0 12.003 2z" fill="var(--color-whatsapp)"/>
          <path d="M16.94 14.22c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7 1-.86 1.18-.16.18-.32.2-.59.07a7.44 7.44 0 0 1-2.19-1.35 8.16 8.16 0 0 1-1.52-1.9c-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.28.27-.46a.52.52 0 0 0-.02-.48c-.07-.15-.61-1.48-.84-2.02-.22-.54-.45-.47-.61-.48h-.53c-.18 0-.48.07-.73.34A2.78 2.78 0 0 0 6.5 9.77c0 1.63.78 3.2 1.34 3.96a11.9 11.9 0 0 0 5.09 4.5c.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3 1.8-1.42-.07-.13-.27-.2-.54-.35z" fill="white"/>
        </svg>
      ),
      title: 'WhatsApp Chat',
      lines: [SITE.whatsapp, 'Instant Inquiry Support'],
      href: `https://wa.me/${SITE.whatsapp_digits}?text=Hi Eng-Mart, I have an inquiry about electrical components.`,
      color: 'var(--color-whatsapp)',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      title: 'Email',
      lines: [SITE.email],
      href: `mailto:${SITE.email}`,
      color: 'var(--color-info)',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      title: 'Address',
      lines: SITE.address ? SITE.address.split(', ').reduce((acc: string[], part, i) => {
        // keep the address readable across two lines
        const half = Math.ceil(SITE.address.split(', ').length / 2)
        if (i < half) acc[0] = acc[0] ? `${acc[0]}, ${part}` : part
        else acc[1] = acc[1] ? `${acc[1]}, ${part}` : part
        return acc
      }, ['', '']).filter(Boolean) : [],
      href: SITE.map_link_url || 'https://maps.google.com',
      color: 'var(--color-orange)',
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: 'Hours',
      lines: [SITE.hours, SITE.hours_note].filter(Boolean),
      color: 'var(--color-admin)',
    },
  ]

  return (
    <div className="min-h-screen bg-secondary/30 transition-colors">
      <Navbar />

      {/* Page hero */}
      <section className="relative pt-12 pb-16 bg-card border-b border-border transition-colors">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <nav className="breadcrumb mb-6">
              <Link href="/">Home</Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Contact Us</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
              Get In Touch
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              Whether you need a quick quote, technical support, or want to source a specific part, our team is ready to help. Most inquiries are answered within 2 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 sm:py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {CONTACT_CARDS.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.href.startsWith('http') ? '_blank' : undefined}
                    rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="store-card p-6 flex flex-col items-start group h-full hover:border-primary transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 transition-transform group-hover:scale-105 shadow-sm"
                      style={{ background: card.color }}
                    >
                      {card.icon}
                    </div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                    {card.lines.map((line, i) => (
                      <p key={i} className="text-xs text-muted-foreground leading-relaxed font-semibold">{line}</p>
                    ))}
                  </a>
                ) : (
                  <div className="store-card p-6 flex flex-col items-start h-full">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm"
                      style={{ background: card.color }}
                    >
                      {card.icon}
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{card.title}</h3>
                    {card.lines.map((line, i) => (
                      <p key={i} className="text-xs text-muted-foreground leading-relaxed font-semibold">{line}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-16 sm:py-20 bg-card border-t border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14">
            
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Send an Inquiry</h2>
              <p className="text-muted-foreground mb-8 text-sm">Fill in the form and our team will respond within a few hours.</p>

              {sent ? (
                <motion.div
                  className="p-8 rounded-lg text-center border-2 border-emerald-100 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-2">Inquiry Sent!</h3>
                  <p className="text-emerald-600 dark:text-emerald-500 text-xs font-semibold">Thank you! We will get back to you within a few hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Full Name *</label>
                      <input
                        type="text" required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Engr. Ahmad Ali"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Company</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Your Company Pvt Ltd"
                        className="input-base"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Phone *</label>
                      <input
                        type="tel" required
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+92-300-0000000"
                        className="input-base"
                      />
                    </div>
                    <div>
                      {/* Required: the backend rejects a blank email, and the
                          whole quote flow replies by email. It was unmarked, so
                          leaving it empty failed with a 400 after submitting. */}
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@company.com"
                        className="input-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Product Interest</label>
                    <select
                      value={form.product}
                      onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                      className="input-base cursor-pointer"
                    >
                      <option value="">Select product category...</option>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">Message / Requirements *</label>
                    <textarea
                      required rows={4}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Please describe your requirements, quantities needed, or list specific model numbers..."
                      className="input-base resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <p role="alert" className="text-sm font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                      {errorMsg}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={sending}
                    className="btn-primary w-full py-4 justify-center"
                    whileHover={{ scale: sending ? 1 : 1.01 }}
                    whileTap={{ scale: sending ? 1 : 0.98 }}
                  >
                    {sending ? 'Sending...' : 'Send Inquiry'}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Map + Extra Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Map placeholder */}
              <div
                className="rounded-lg overflow-hidden border border-border shadow-sm"
                style={{ height: '320px' }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.6!2d67.01!3d24.86!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUxJzM2LjAiTiA2N8KwMDAnMzYuMCJF!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Eng-Mart Location — Sarafa Bazar, Karachi"
                />
              </div>

              {/* WhatsApp quick contact */}
              <a
                href={`https://wa.me/${SITE.whatsapp_digits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="store-card flex items-center gap-4 p-5 group hover:border-primary"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl shrink-0 shadow-sm" style={{ background: 'var(--color-whatsapp)' }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">Chat on WhatsApp</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">{SITE.whatsapp}</p>
                </div>
                <svg className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Direct call */}
              <a
                href={`tel:${SITE.phone}`}
                className="store-card flex items-center gap-4 p-5 group hover:border-primary"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ background: 'var(--primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">Call Us Directly</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">{SITE.phone}</p>
                </div>
                <svg className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
