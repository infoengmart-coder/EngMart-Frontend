'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { BRANDS, STATS } from '@/lib/data'
import Link from 'next/link'

const TIMELINE = [
  { year: 'Founded', title: 'Established in Karachi', desc: 'Eng-Mart began operations in the industrial heart of Karachi, Sarafa Bazar, as a specialized supplier of industrial electrical products.' },
  { year: 'Growth', title: 'Expanded Brand Portfolio', desc: 'Partnered with international brands including ABB, CHINT, Himel, and FICO Hi-Tech to offer a comprehensive product range.' },
  { year: 'Today', title: 'Pakistan\'s Sourcing Hub', desc: '500+ satisfied clients across Karachi. Sourcing for 8 global brands with 2,500+ products in stock.' },
]

const TEAM = [
  { name: 'Sales Team', role: 'Product Specialists', desc: 'Experienced team helping you select the right product for your application.' },
  { name: 'Technical Support', role: 'Engineering Consultants', desc: 'Expert guidance on specifications, sizing, and technical selection.' },
  { name: 'Procurement', role: 'Sourcing Experts', desc: 'Fast, reliable sourcing with competitive pricing and delivery.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      <Navbar />

      {/* Page hero */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-white border-b border-slate-200/60 transition-colors">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-slate-200">/</span>
              <span className="text-slate-700 font-medium">About Us</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
              About <span className="text-gradient-cyan">Eng-Mart</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              Pakistan's premier supplier of premium industrial electrical products — serving engineers, contractors, and facilities across Karachi with genuine products from 8 global brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">Our Story</span>
              <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
                Powering Karachi's <span className="text-gradient-cyan">Industrial Growth</span>
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Eng-Mart was established in Karachi's thriving industrial hub of Sarafa Bazar with a clear mission: to provide Pakistan's engineers and contractors with access to genuine, premium industrial electrical products at competitive prices.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                We recognized that the Pakistani market was flooded with counterfeit and low-quality electrical components — a serious safety risk for industrial installations. Our solution was to become authorized distributors for world-class brands, ensuring every product that leaves our store is 100% genuine.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Today, we stock over 2,500 products from 8 global brands including ABB, CHINT, Himel, FICO Hi-Tech, PCE, Tense, Kondas, and Opas — making us the go-to one-stop shop for industrial electrical sourcing in Karachi.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {[
                  { icon: '🎯', title: 'Our Mission', text: 'Supply genuine, premium industrial electrical products to Pakistan\'s engineers and contractors with expert technical support and competitive pricing.' },
                  { icon: '🔭', title: 'Our Vision', text: 'To be Pakistan\'s most trusted industrial electrical supplier, known for product quality, technical expertise, and exceptional service.' },
                  { icon: '⚡', title: 'Our Values', text: 'Integrity in every transaction. Genuine products only. Technical honesty. Customer success above short-term profit.' },
                  { icon: '🤝', title: 'Our Promise', text: 'Every product is 100% genuine. Every quote is competitive. Every delivery is reliable. We stand behind everything we sell.' },
                ].map((card, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-200/60 group hover:border-primary/25 transition-all duration-300 shadow-sm"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="text-2xl mb-3">{card.icon}</div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-15" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6 rounded-2xl border border-slate-800 bg-slate-800/40 backdrop-blur-sm shadow-sm"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}{stat.suffix}</div>
                <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">{stat.label}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-slate-50 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">Our Journey</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Built on <span className="text-gradient-cyan">Trust & Quality</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-slate-200" />
            <div className="space-y-10">
              {TIMELINE.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-6 sm:gap-8 relative pl-14 sm:pl-16"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div
                    className="absolute left-3 sm:left-4 top-6 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xs font-black -translate-x-1/2 border-4 border-white bg-primary shadow-sm"
                  >
                    {idx + 1}
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">{item.year}</span>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-white border-y border-slate-200/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">Authorized Partner</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              8 Sourced <span className="text-gradient-cyan">Global Brands</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {BRANDS.map((brand, idx) => (
              <motion.div
                key={brand.slug}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50 group transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/brands/${brand.slug}`}>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-black mb-4 transition-transform group-hover:scale-110"
                    style={{ background: brand.color }}
                  >
                    {brand.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
                  <p className="text-[11px] text-slate-400 mb-0.5">{brand.country}</p>
                  <p className="text-[11px] text-slate-400">via {brand.supplier}</p>
                  <p className="text-[10px] font-bold mt-3 uppercase tracking-wider text-primary">{brand.products}+ Products</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-2">Our Estimators</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Meet Our <span className="text-gradient-cyan">Support Team</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((member, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 text-center border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 bg-primary/10 text-primary">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-xs font-bold uppercase tracking-wider mb-4 text-primary">{member.role}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
