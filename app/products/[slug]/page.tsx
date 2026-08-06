'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { use, useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getProduct, submitInquiry, submitQuotation, mediaUrl, ProductDetail as ApiProductDetail, formatPrice, formatPriceRange } from '@/lib/api'
import { useCart } from '@/lib/cart'
import { useSiteSettings } from '@/lib/site-settings'
import { ProductCard } from '@/components/product-card'

/* ─── Image Gallery Component ───────────────────────────────────────── */
function ProductImageGallery({ product }: { product: ApiProductDetail }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(false)

  const fallback = '/product-placeholder.svg'

  const allImages: string[] = []
  if (product.image) {
    if (product.image.startsWith('http')) {
      allImages.push(product.image)
    } else {
      const cleanPath = product.image.replace(/^\/?media\//, '')
      allImages.push(mediaUrl('/media/' + cleanPath))
    }
  }
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (img.image) {
        let fullUrl: string
        if (img.image.startsWith('http')) {
          fullUrl = img.image
        } else {
          const cleanPath = img.image.replace(/^\/?media\//, '')
          fullUrl = mediaUrl('/media/' + cleanPath)
        }
        if (!allImages.includes(fullUrl)) allImages.push(fullUrl)
      }
    })
  }

  const activeImg = selectedImage || allImages[0] || fallback

  return (
    <div className="space-y-3 w-full min-w-0 max-w-full">
      {/* Main image */}
      <motion.div
        className="relative w-full rounded-lg overflow-hidden cursor-zoom-in border border-border group"
        style={{ background: 'var(--secondary)' }}
        onClick={() => setZoom(!zoom)}
      >
        <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center relative bg-card">
          <motion.img
            src={activeImg}
            alt={product.name}
            className="w-full h-full object-contain p-4"
            animate={{ scale: zoom ? 1.25 : 1 }}
            transition={{ duration: 0.3 }}
            onError={(e) => { (e.target as HTMLImageElement).src = fallback }}
          />

          {/* Brand badge */}
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-md z-20 shadow-sm">
            {product.brand?.name || product.brand_name}
          </div>

          {/* Category */}
          <div className="absolute top-3 right-3 bg-card text-foreground text-[10px] font-bold px-2.5 py-1 rounded-md border border-border z-20">
            {product.category?.name || product.category_name}
          </div>
        </div>
      </motion.div>

      {/* Thumbnails — horizontal scroll row, 64px touch targets */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 w-full min-w-0">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(img)}
              className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer bg-card ${
                activeImg === img ? 'border-primary' : 'border-border hover:border-primary/40'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).src = fallback }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Detail Page ──────────────────────────────────────────────── */
export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { settings: SITE } = useSiteSettings()
  const { slug } = use(params)
  const { add, isInCart, getItemKey } = useCart()

  const [product, setProduct] = useState<ApiProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'variants' | 'specs' | 'inquiry'>('variants')
  const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [inquirySubmitting, setInquirySubmitting] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await getProduct(slug)
        if (isMounted) {
          // Sort the ampere ladder numerically (6A → 63A → 100A) so the
          // dropdown reads like the price list, not DB insertion order.
          if (data.variants && data.variants.length > 1) {
            const amps = (v: { specs?: Record<string, string>; description?: string; cat_no?: string }) => {
              const src = v.specs?.rating || v.description || v.cat_no || ''
              const m = String(src).match(/(\d+(?:\.\d+)?)\s*A/i) || String(src).match(/^(\d+(?:\.\d+)?)/)
              return m ? parseFloat(m[1]) : Number.POSITIVE_INFINITY
            }
            data.variants = [...data.variants].sort((a, b) => amps(a) - amps(b))
          }
          setProduct(data)
          if (data.variants && data.variants.length > 0) {
            setSelectedVariantId(data.variants[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        if (isMounted) setError('Product not found or failed to load.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex flex-col">
        <Navbar />
        {/* Breadcrumb skeleton */}
        <div className="bg-card border-b border-border py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="skeleton h-4 w-48 max-w-full" />
          </div>
        </div>
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
            {/* Gallery skeleton */}
            <div className="space-y-3">
              <div className="skeleton h-64 sm:h-80 lg:h-96 w-full rounded-lg" />
              <div className="flex gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="skeleton w-16 h-16 shrink-0 rounded-lg" />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="skeleton h-10 rounded-lg" />
                <div className="skeleton h-10 rounded-lg" />
              </div>
            </div>
            {/* Info column skeleton */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="skeleton h-6 w-24" />
                <div className="skeleton h-6 w-20" />
              </div>
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-24 w-full rounded-xl" />
              <div className="skeleton h-12 w-full rounded-lg" />
              <div className="flex gap-4">
                <div className="skeleton h-10 w-32 rounded-lg" />
                <div className="skeleton h-10 flex-1 rounded-lg" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="skeleton h-14 w-full rounded-lg" />
                <div className="skeleton h-14 w-full rounded-lg" />
                <div className="skeleton h-14 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-black text-foreground mb-4">Product Not Found</h1>
          <Link href="/products" className="text-primary font-bold hover:underline">← Back to All Products</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const brandName = product.brand?.name || product.brand_name
  const categoryName = product.category?.name || product.category_name
  const activeVariant = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0]
  const currentPrice = activeVariant ? (activeVariant.price ? parseFloat(activeVariant.price) : null) : null
  const itemKey = getItemKey(product.slug, activeVariant?.id)
  const inCart = isInCart(itemKey)

  const handleAddToCart = () => {
    const isPOR = activeVariant ? activeVariant.price_on_request || !activeVariant.price : product.has_price_on_request
    const unitPrice = currentPrice || 0
    const mainImg = product.images?.find(i => i.is_primary)?.image || product.image || ''
    const fullImg = mediaUrl(mainImg)

    add({
      slug: product.slug,
      productId: product.id,
      variantId: activeVariant?.id || null,
      name: product.name,
      brand: brandName,
      brandColor: product.brand?.color || 'var(--primary)',
      category: categoryName,
      catNo: activeVariant?.cat_no || product.series || '',
      variantDescription: activeVariant?.description || '',
      image: fullImg,
      unitPrice: isPOR ? 0 : unitPrice,
      isPriceOnRequest: isPOR,
    }, qty)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInquirySubmitting(true)
    try {
      // Raise a proper RFQ with the selected variant as a line item, so the
      // sales team can quote per-line prices from the admin quotations page.
      await submitQuotation({
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        company: inquiryForm.company,
        notes: inquiryForm.message,
        source: 'product',
        items: [{
          product: product.id,
          product_name: product.name,
          variant_description: activeVariant?.description || '',
          cat_no: activeVariant?.cat_no || '',
          brand_name: product.brand?.name || product.brand_name || '',
          quantity: 1,
        }],
      })
      setInquirySent(true)
    } catch (err) {
      alert('Failed to send quote request. Please try again.')
    } finally {
      setInquirySubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category?.slug || ''}`} className="hover:text-primary transition-colors">{categoryName}</Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 mb-12">

          {/* Left: Image Gallery */}
          <div className="lg:sticky lg:top-24 h-fit">
            <ProductImageGallery product={product} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <a
                href={`https://wa.me/${SITE.whatsapp_digits}?text=${encodeURIComponent(`I'm interested in ${product.name} (${product.series || ''}). Please provide pricing.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold w-full"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
                  <path d="M12.003 2A10 10 0 0 0 2.2 11.96c0 1.9.52 3.69 1.43 5.25L2 22l5.02-1.31A10 10 0 1 0 12.003 2z" fill="var(--color-whatsapp)"/>
                  <path d="M16.94 14.22c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.14-.18.27-.7 1-.86 1.18-.16.18-.32.2-.59.07a7.44 7.44 0 0 1-2.19-1.35 8.16 8.16 0 0 1-1.52-1.9c-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.28.27-.46a.52.52 0 0 0-.02-.48c-.07-.15-.61-1.48-.84-2.02-.22-.54-.45-.47-.61-.48h-.53c-.18 0-.48.07-.73.34A2.78 2.78 0 0 0 6.5 9.77c0 1.63.78 3.2 1.34 3.96a11.9 11.9 0 0 0 5.09 4.5c.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3 1.8-1.42-.07-.13-.27-.2-.54-.35z" fill="white"/>
                </svg>
                <span>WhatsApp Inquiry</span>
              </a>

              <button
                onClick={() => setActiveTab('inquiry')}
                className="btn-primary flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold w-full"
              >
                <span>Get a Quote</span>
              </button>
            </div>
          </div>

          {/* Right: Info & Variant Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">{categoryName}</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-secondary text-foreground border border-border">{brandName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">{product.name}</h1>
            {product.series && (
              <p className="text-xs text-muted-foreground font-mono mb-3">
                Series / Model: <span className="font-bold text-foreground">{product.series}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{product.short_description}</p>

            {/* Price Box */}
            <div className="p-5 rounded-xl bg-card border border-border mb-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Pricing</p>
              {currentPrice !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">{formatPrice(currentPrice)}</span>
                  <span className="text-xs text-muted-foreground">/ unit</span>
                </div>
              ) : product.price_range ? (
                <div className="text-2xl font-black text-foreground">
                  {formatPriceRange(product.price_range)}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">Price on Request</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">POR</span>
                </div>
              )}
            </div>

            {/* Variant Dropdown Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Select Variant / Ampere Rating ({product.variants.length} options)
                </label>
                <select
                  value={selectedVariantId || ''}
                  onChange={e => setSelectedVariantId(Number(e.target.value))}
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {product.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.description || v.cat_no} — {v.price ? formatPrice(v.price) : 'Price on Request'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity & Cart */}
            <div className="flex items-center gap-4 mb-8">
              <div className="qty-stepper shrink-0">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 disabled:opacity-40 disabled:cursor-not-allowed"
                >-</button>
                <span>{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10"
                >+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 min-h-10 py-3 px-6 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  inCart ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'btn-primary'
                }`}
              >
                {inCart ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6 overflow-x-auto">
              {(['variants', 'specs', 'inquiry'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`min-h-10 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            {activeTab === 'variants' && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        selectedVariantId === v.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-foreground">{v.description || v.cat_no}</p>
                        {v.cat_no && <p className="text-[10px] font-mono text-muted-foreground">{v.cat_no}</p>}
                      </div>
                      <span className="font-bold text-primary">{v.price ? formatPrice(v.price) : 'Quote'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground py-4">No specific variants listed. Standard model configuration.</p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-3">
                {/* Technical specifications for the selected variant. These live
                    on ProductVariant.specs and were previously never rendered,
                    even though "specifications" is a contracted deliverable. */}
                {activeVariant && Object.keys(activeVariant.specs || {}).length > 0 && (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-2.5 bg-secondary/50 border-b border-border flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Technical Specifications
                      </span>
                      {activeVariant.cat_no && (
                        <span className="text-[10px] font-mono text-muted-foreground">{activeVariant.cat_no}</span>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <tbody>
                          {Object.entries(activeVariant.specs).map(([key, value], i) => (
                            <tr key={key} className={i % 2 ? 'bg-secondary/20' : ''}>
                              <td className="px-4 py-2.5 font-semibold text-foreground w-2/5 align-top">{key}</td>
                              <td className="px-4 py-2.5 text-muted-foreground">{String(value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* General attributes */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-secondary/50 border-b border-border">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Product Details
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <tbody>
                        {[
                          ['Brand', brandName],
                          ['Category', categoryName],
                          ['Series', product.series],
                          ['Catalogue No', activeVariant?.cat_no],
                          ['Variants Available', product.variants?.length ? String(product.variants.length) : null],
                        ].filter(([, v]) => v).map(([label, value], i) => (
                          <tr key={label as string} className={i % 2 ? 'bg-secondary/20' : ''}>
                            <td className="px-4 py-2.5 font-semibold text-foreground w-2/5 align-top">{label}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {product.full_description && (
                  <div className="p-4 bg-card rounded-xl border border-border text-xs leading-relaxed text-muted-foreground">
                    {product.full_description}
                  </div>
                )}

                {product.datasheet_url && (
                  <a
                    href={product.datasheet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2"
                  >
                    Download Datasheet
                  </a>
                )}
              </div>
            )}

            {activeTab === 'inquiry' && (
              <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                {inquirySent ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-2">✅</div>
                    <h4 className="font-bold text-foreground text-sm">Inquiry Submitted!</h4>
                    <p className="text-xs text-muted-foreground mt-1">Our sales team will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text" required placeholder="Full Name *"
                        value={inquiryForm.name}
                        onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full min-h-10 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                      />
                      <input
                        type="email" required placeholder="Email Address *"
                        value={inquiryForm.email}
                        onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full min-h-10 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="tel" placeholder="Phone Number"
                        value={inquiryForm.phone}
                        onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full min-h-10 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                      />
                      <input
                        type="text" placeholder="Company Name"
                        value={inquiryForm.company}
                        onChange={e => setInquiryForm(f => ({ ...f, company: e.target.value }))}
                        className="w-full min-h-10 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <textarea
                      rows={3} required placeholder={`Inquiry regarding ${product.name}...`}
                      value={inquiryForm.message}
                      onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary resize-none"
                    />
                    <button
                      type="submit" disabled={inquirySubmitting}
                      className="btn-primary w-full min-h-10 py-2.5 text-xs font-bold justify-center disabled:opacity-60"
                    >
                      {inquirySubmitting ? 'Sending...' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
          <div className="mt-16 border-t border-border pt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {product.related_products.map(rel => (
                <ProductCard key={rel.slug} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
