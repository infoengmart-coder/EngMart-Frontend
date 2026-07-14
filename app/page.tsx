import { Navbar } from '@/components/navbar'
import { PromoBanners } from '@/components/promo-banners'
import { FeaturedSection } from '@/components/featured-section'
import { Footer } from '@/components/footer'

function HeroVideo() {
  return (
    <section className="relative w-full h-[80vh] lg:h-[calc(100vh-100px)] min-h-[500px] overflow-hidden bg-black">
      {/* Video Background */}
      <video 
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/herovideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1 className="text-white text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 max-w-4xl drop-shadow-lg">
          Pakistan's Most Trusted Industrial Supplier
        </h1>
        <p className="text-white/90 text-sm sm:text-lg font-medium mb-8 max-w-2xl drop-shadow-md leading-relaxed">
          Source genuine, certified switchgear, automation components, and industrial electronics directly from world-leading brands. Built for durability, backed by trust.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/products" className="btn-primary text-sm sm:text-base py-3 px-8">
            Browse Catalog
          </a>
          <a href="/contact" className="btn-secondary text-sm sm:text-base py-3 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
            Get Quote
          </a>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroVideo />
      <PromoBanners />
      <FeaturedSection />
      <Footer />
    </div>
  )
}
