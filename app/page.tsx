import { Navbar } from '@/components/navbar'
import { PromoBanners } from '@/components/promo-banners'
import { HeroVideo } from '@/components/hero-video'
import { FeaturedSection } from '@/components/featured-section'
import { Footer } from '@/components/footer'
import { BrandMarquee } from '@/components/brand-marquee'
import Link from 'next/link'
import { CATEGORIES, STATS, TESTIMONIALS } from '@/lib/data'
import { BRAND_LOGO_ENTRIES } from '@/lib/brand-logos'
import { WhatsAppCta } from '@/components/whatsapp-cta'

/* ── Stats Strip ── */
function StatsStrip() {
  return (
    <section className="bg-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((stat, i) => (
            <div key={i} className="text-white">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm font-bold text-white/90 mt-1">{stat.label}</div>
              <div className="text-xs text-white/60 mt-0.5">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Category Grid ── */
function CategorySection() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="section-label">Browse By Type</span>
          <h2 className="section-title mt-1">Product Categories</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto">
            From MCBs to ACBs — every industrial electrical product category in one place
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.slice(0, 10).map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="store-card group flex flex-col items-center text-center p-4 sm:p-5"
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-200 shadow-sm"
                style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
              >
                {cat.icon}
              </div>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {cat.short}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">{cat.count}+ Products</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/categories" className="btn-secondary text-sm inline-flex">
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Brand Showcase ── */
function BrandsSection() {
  // Real manufacturer wordmarks instead of the coloured-emoji placeholders,
  // and sourced from BRAND_LOGO_ENTRIES rather than the stale hardcoded
  // eight-brand list — three of which (Tense, Kondas, Opas) have no products
  // in the catalogue at all, so their cards led to empty pages.
  return (
    <section className="py-12 bg-secondary/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="section-label">Authorized Distributor</span>
          <h2 className="section-title mt-1">World-Class Brands</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {BRAND_LOGO_ENTRIES.slice(0, 12).map(brand => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="store-card group flex flex-col items-center justify-center text-center p-4 gap-3"
            >
              <div className="h-10 flex items-center justify-center">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  loading="lazy"
                  className="max-h-10 max-w-[110px] w-auto object-contain grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                />
              </div>
              <p className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                {brand.name}
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/brands" className="btn-secondary text-sm inline-flex">
            View All Brands →
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── Why Choose Us ── */
function WhyUsSection() {
  const features = [
    { icon: '✅', title: 'Genuine Products', desc: '100% authentic from authorized distributors. Zero counterfeits.' },
    { icon: '🌍', title: '60+ Global Brands', desc: 'ABB, Siemens, Schneider, CHINT, Himel, Hyundai, LS, Fuji and many more — all in one place.' },
    { icon: '⚡', title: 'Fast Availability', desc: 'Large stock for fast-moving items. Ready for immediate dispatch.' },
    { icon: '💰', title: 'Best Pricing', desc: 'Competitive market prices. Volume discounts for contractors.' },
    { icon: '📞', title: 'Expert Support', desc: 'Technical team helps you select the right product for your application.' },
    { icon: '📍', title: 'Karachi Based', desc: 'Located in Sarafa Bazar, Karachi. Walk-in welcome Mon–Sat.' },
  ]
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">Why Choose Eng-Mart</span>
          <h2 className="section-title mt-1">The Eng-Mart Advantage</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <div key={i} className="store-card p-5 sm:p-6 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-xl shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ── */
function TestimonialsSection() {
  // Hidden until real client quotes are added to TESTIMONIALS in lib/data.ts —
  // the previous entries were invented names presented as real reviews.
  if (TESTIMONIALS.length === 0) return null
  return (
    <section className="py-12 sm:py-16 bg-foreground text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">Client Reviews</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Trusted by Industry Professionals
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, si) => (
                  <span key={si} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-white/80 text-xs leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="border-t border-white/10 pt-3">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-[10px] text-white/50 mt-0.5">{t.role} · {t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA Banner ── */
function CTASection() {
  return (
    <section className="py-14 bg-gradient-to-br from-primary via-[color-mix(in_srgb,var(--primary)_85%,black)] to-[color-mix(in_srgb,var(--primary)_55%,black)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 800 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1"/>
          <circle cx="700" cy="300" r="120" stroke="white" strokeWidth="1"/>
          <circle cx="400" cy="200" r="200" stroke="white" strokeWidth="1"/>
        </svg>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Ready to Order? Get a Quote Today
        </h2>
        <p className="text-white/85 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
          Contact our sales team for bulk pricing, technical specifications, and fast delivery across Karachi and Pakistan.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-7 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg text-sm">
            Request a Quote →
          </Link>
          <WhatsAppCta message="Hi Eng-Mart, I need a quote for electrical products." />
        </div>
      </div>
    </section>
  )
}

/* ── Main Page ── */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroVideo />
      <StatsStrip />
      {/* Directly under the blue stats strip and above the promo banners, as
          requested — the logo wall is the first proof of authenticity a new
          visitor sees. */}
      <BrandMarquee />
      <PromoBanners />
      <CategorySection />
      <FeaturedSection />
      <BrandsSection />
      <WhyUsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
