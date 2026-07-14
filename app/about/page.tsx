'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { BRANDS, STATS } from '@/lib/data'
import Link from 'next/link'
import * as Lucide from 'lucide-react'

const TIMELINE = [
  { year: 'Founded', title: 'Established in Karachi', desc: 'Eng-Mart began operations in the industrial heart of Karachi, Sarafa Bazar, as a specialized supplier of industrial electrical products.', icon: 'Building' },
  { year: 'Growth', title: 'Expanded Brand Portfolio', desc: 'Partnered with international brands including ABB, CHINT, Himel, and FICO Hi-Tech to offer a comprehensive product range.', icon: 'TrendingUp' },
  { year: 'Today', title: 'Pakistan\'s Sourcing Hub', desc: '500+ satisfied clients across Karachi. Sourcing for 8 global brands with 2,500+ products in stock.', icon: 'Globe' },
]

const TEAM = [
  { name: 'Sales Team', role: 'Product Specialists', desc: 'Experienced team helping you select the right product for your application.', icon: 'Headphones', color: '#3B82F6' },
  { name: 'Technical Support', role: 'Engineering Consultants', desc: 'Expert guidance on specifications, sizing, and technical selection.', icon: 'Wrench', color: '#10B981' },
  { name: 'Procurement', role: 'Sourcing Experts', desc: 'Fast, reliable sourcing with competitive pricing and delivery.', icon: 'Briefcase', color: '#8B5CF6' },
]

const MISSION_CARDS = [
  { icon: 'Target', title: 'Our Mission', text: 'Supply genuine, premium industrial electrical products to Pakistan\'s engineers and contractors with expert technical support and competitive pricing.', color: '#3B82F6' },
  { icon: 'Compass', title: 'Our Vision', text: 'To be Pakistan\'s most trusted industrial electrical supplier, known for product quality, technical expertise, and exceptional service.', color: '#10B981' },
  { icon: 'Zap', title: 'Our Values', text: 'Integrity in every transaction. Genuine products only. Technical honesty. Customer success above short-term profit.', color: '#F59E0B' },
  { icon: 'Handshake', title: 'Our Promise', text: 'Every product is 100% genuine. Every quote is competitive. Every delivery is reliable. We stand behind everything we sell.', color: '#EC4899' },
]

export default function AboutPage() {
  const renderLucideIcon = (name: string, className: string = "w-5 h-5") => {
    // @ts-ignore
    const IconComponent = Lucide[name] || Lucide.HelpCircle
    return <IconComponent className={className} />
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      <Navbar />

      {/* Page hero */}
      <section className="relative pt-14 pb-20 bg-white border-b border-slate-200/60 transition-colors overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-slate-200">/</span>
              <span className="text-slate-700 font-medium">About Us</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">
              About <span className="text-gradient-cyan">Eng-Mart</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              Pakistan's premier supplier of premium industrial electrical products — serving engineers, contractors, and facilities across Karachi with genuine products from 8 global brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
              <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-3">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Powering Karachi's <br />Industrial Growth
              </h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  Eng-Mart was established in Karachi's thriving industrial hub of Sarafa Bazar with a clear mission: to provide Pakistan's engineers and contractors with access to genuine, premium industrial electrical products at competitive prices.
                </p>
                <p>
                  We recognized that the Pakistani market was flooded with counterfeit and low-quality electrical components — a serious safety risk for industrial installations. Our solution was to become authorized distributors for world-class brands, ensuring every product that leaves our store is 100% genuine.
                </p>
                <p>
                  Today, we stock over 2,500 products from 8 global brands including ABB, CHINT, Himel, FICO Hi-Tech, PCE, Tense, Kondas, and Opas — making us the go-to one-stop shop for industrial electrical sourcing in Karachi.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {MISSION_CARDS.map((card, idx) => (
                  <motion.div
                    key={idx}
                    className="glow-card block overflow-hidden bg-white border border-slate-200/60 p-6 group hover:border-primary/20 transition-all duration-300 animate-fade-in"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                      style={{
                        backgroundColor: `${card.color}12`,
                        color: card.color,
                        border: `1px solid ${card.color}25`
                      }}
                    >
                      {renderLucideIcon(card.icon)}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.1),transparent_50%)]" />
          <div className="absolute inset-0 grid-pattern opacity-15" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6 rounded-2xl bg-slate-800/40 border border-slate-800/60 backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="text-3xl sm:text-4xl font-black text-white mb-2">{stat.value}{stat.suffix}</div>
                <p className="text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-wider">{stat.label}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 sm:py-24 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Built on Trust & Quality
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-7 top-0 bottom-0 w-px bg-slate-200/80" />
            <div className="space-y-8">
              {TIMELINE.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-6 sm:gap-8 relative pl-14 sm:pl-16"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div
                    className="absolute left-3 sm:left-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-primary bg-blue-50 -translate-x-1/2 border-2 border-white shadow shadow-primary/10"
                  >
                    {renderLucideIcon(item.icon, "w-4 h-4")}
                  </div>
                  <div className="glow-card block overflow-hidden bg-white border border-slate-200/60 p-6 flex-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">{item.year}</span>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 sm:py-24 bg-white border-y border-slate-200/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">Authorized Partner</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              8 Sourced Global Brands
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {BRANDS.map((brand, idx) => (
              <motion.div
                key={brand.slug}
                className="glow-card block overflow-hidden bg-white border border-slate-200/60 p-6 flex flex-col items-center text-center group hover:border-primary/20 transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/brands/${brand.slug}`} className="flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${brand.color}15, ${brand.color}05)`,
                      border: `1.5px solid ${brand.color}30`,
                      color: brand.color
                    }}
                  >
                    {renderLucideIcon(brand.icon || 'Zap', "w-6 h-6")}
                  </div>
                  <h3 className="font-bold text-slate-950 mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
                  <div className="flex items-center gap-1.5 mb-1 justify-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{brand.country}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">via {brand.supplier}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 sm:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">Our Estimators</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Meet Our Support Team
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((member, idx) => (
              <div
                key={idx}
                className="glow-card block overflow-hidden bg-white border border-slate-200/60 p-6 text-center group hover:border-primary/20 transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${member.color}15, ${member.color}05)`,
                    border: `1.5px solid ${member.color}30`,
                    color: member.color
                  }}
                >
                  {renderLucideIcon(member.icon, "w-6 h-6")}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3 text-primary">{member.role}</p>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
