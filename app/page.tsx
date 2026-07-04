import { HeroSection } from '@/components/hero-section'
import { BrandShowcase } from '@/components/brand-showcase'
import { CategoryGrid } from '@/components/category-grid'
import { StatsSection } from '@/components/stats-section'
import { FeaturedSection } from '@/components/featured-section'
import { ServicesSection } from '@/components/services-section'
import { WhyChooseUs } from '@/components/why-choose-us'
import { Testimonials } from '@/components/testimonials'
import { CtaSection } from '@/components/cta-section'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BrandShowcase />
      <CategoryGrid />
      <StatsSection />
      <FeaturedSection />
      <ServicesSection />
      <WhyChooseUs />
      <Testimonials />
      <CtaSection />
      <Footer />
    </div>
  )
}
