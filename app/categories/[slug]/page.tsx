'use client'

import { use, useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { notFound } from 'next/navigation'
import {
  getCategory, getCategories, getProducts,
  type Category, type Product as ApiProduct,
} from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'

const PAGE_SIZE = 24

function getCategoryIcon(short: string) {
  switch (short) {
    case 'MCBs':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'MCCBs':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
      )
    case 'Contactors':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    case 'CTs':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
        </svg>
      )
    case 'Panel Meters':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    case 'Capacitors':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
      )
    case 'Protection Relays':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'Cam Switches':
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    default:
      return (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
  }
}

// Hoisted to module level so parent re-renders don't remount the sidebar and
// drop focus/scroll position (same bug the products page had).
function FilterSidebar({
  categories, brands, activeSlug, selectedBrands, onToggleBrand,
}: {
  categories: Category[]
  brands: { name: string; count: number }[]
  activeSlug: string
  selectedBrands: string[]
  onToggleBrand: (brand: string) => void
}) {
  return (
    <div className="space-y-8">
      {/* Categories — links, not filters: this page is scoped to one category,
          so ticking others previously made it list the entire catalog. */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Categories</p>
        <div className="space-y-1.5 max-h-72 overflow-y-auto overscroll-contain pr-1">
          {categories.map(cat => {
            const active = cat.slug === activeSlug
            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`flex items-center justify-between gap-2 group w-full text-left py-1 min-h-10 lg:min-h-0 ${
                  active ? 'font-bold text-primary' : 'font-medium text-muted-foreground hover:text-primary'
                } transition-colors`}
              >
                <span className="text-sm truncate">{cat.short_name || cat.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">{cat.product_count}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Brands — derived from the products actually in this category, so the
          list never offers a brand that filters down to zero results. */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Brands</p>
        <div className="space-y-2 max-h-72 overflow-y-auto overscroll-contain pr-1">
          {brands.map(brand => (
            <button key={brand.name} onClick={() => onToggleBrand(brand.name)} className="flex items-center gap-3 cursor-pointer group w-full text-left min-h-10 lg:min-h-0">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                selectedBrands.includes(brand.name)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border bg-card group-hover:border-primary/40'
              }`}>
                {selectedBrands.includes(brand.name) && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm flex-1 truncate ${selectedBrands.includes(brand.name) ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'} group-hover:text-primary transition-colors`}>
                {brand.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">{brand.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundErr, setNotFoundErr] = useState(false)

  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sortParam, setSortParam] = useState('relevance')
  const [page, setPage] = useState(1)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Sidebar reference data — categories to jump between.
  useEffect(() => {
    getCategories().then(rows => setAllCategories(rows.filter(c => (c.product_count ?? 0) > 0))).catch(() => {})
  }, [])

  // This category plus its products, straight from the API. Previously the page
  // filtered a hardcoded demo array, so /categories/<slug> listed every fake
  // product regardless of the slug and most cards linked to 404s.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFoundErr(false)
    setCategory(null)
    setProducts([])
    setSelectedBrands([])
    setPage(1)

    Promise.all([
      getCategory(slug).catch(() => null),
      getProducts({ category: slug, page_size: 100 }).catch(() => null),
    ]).then(async ([cat, prods]) => {
      if (cancelled) return
      if (!cat) { setNotFoundErr(true); setLoading(false); return }
      setCategory(cat)
      let rows = prods?.results || []
      setProducts(rows)
      setLoading(false)
      // Follow remaining pages in the background so large categories aren't
      // silently truncated (previously a hard 60-product cap hid the rest).
      let hasNext = Boolean(prods?.next)
      let nextPage = 2
      while (hasNext && !cancelled) {
        const more = await getProducts({ category: slug, page_size: 100, page: nextPage }).catch(() => null)
        if (!more || cancelled) break
        rows = [...rows, ...more.results]
        setProducts(rows)
        hasNext = Boolean(more.next)
        nextPage += 1
      }
    })

    return () => { cancelled = true }
  }, [slug])

  const toggleBrand = (brand: string) => {
    setPage(1)
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])
  }

  /** Lowest real price for a product, used for price sorting. */
  const priceOf = (p: ApiProduct) => {
    if (p.price_range?.min) return p.price_range.min
    const v = p.first_variant?.price
    return v ? parseFloat(v) : Number.MAX_SAFE_INTEGER
  }

  // Brand filter options come from the products actually loaded for this
  // category — not the sitewide brand list.
  const availableBrands = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      const name = p.brand_name || p.brand?.name || ''
      if (!name) continue
      counts.set(name, (counts.get(name) || 0) + 1)
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const filteredProducts = useMemo(() => {
    let p = products

    if (selectedBrands.length > 0) {
      p = p.filter(prod => selectedBrands.includes(prod.brand_name || prod.brand?.name || ''))
    }

    if (sortParam === 'az') p = [...p].sort((a, b) => a.name.localeCompare(b.name))
    else if (sortParam === 'za') p = [...p].sort((a, b) => b.name.localeCompare(a.name))
    else if (sortParam === 'price-low') p = [...p].sort((a, b) => priceOf(a) - priceOf(b))
    else if (sortParam === 'price-high') p = [...p].sort((a, b) => priceOf(b) - priceOf(a))

    return p
  }, [products, selectedBrands, sortParam])

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE)
  const pagedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page],
  )

  const clearFilters = () => { setSelectedBrands([]); setPage(1) }

  if (notFoundErr) notFound()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero directly matched for Category */}
      <section className="relative overflow-hidden pt-12 pb-12 border-b border-border bg-card transition-colors">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div
          className="absolute right-0 top-0 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: `radial-gradient(circle, ${category?.color || "var(--primary)"} 0%, transparent 70%)` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-border">/</span>
            <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
            <span className="text-border">/</span>
            {category ? (
              <span className="text-foreground font-bold">{category.short_name || category.name}</span>
            ) : (
              <span className="skeleton inline-block h-4 w-24 align-middle" />
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="flex-1">
              {category ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-sm"
                      style={{ background: `${category.color || "#3B82F6"}10`, borderColor: `${category.color || "#3B82F6"}30` }}
                    >
                      {category.icon || getCategoryIcon(category.short_name || "")}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{category.product_count ?? 0} Products Catalog</p>
                      <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
                        {category.name}
                      </h1>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{category.description}</p>
                </>
              ) : (
                <>
                  {/* Skeleton hero — never flash an empty title or "0 Products" */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="skeleton w-16 h-16 rounded-2xl" />
                    <div>
                      <div className="skeleton h-3 w-36 mb-2" />
                      <div className="skeleton h-9 w-64 max-w-full" />
                    </div>
                  </div>
                  <div className="skeleton h-4 w-full max-w-2xl" />
                </>
              )}
            </div>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors px-4 py-2 min-h-10 border border-border bg-card rounded-lg cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters {selectedBrands.length > 0 && `(${selectedBrands.length})`}
            </button>
          </div>
        </div>
      </section>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar exactly matching Products Page */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain p-6 bg-card rounded-3xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-foreground">Filters</h2>
                {selectedBrands.length > 0 && (
                  <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    Clear All
                  </button>
                )}
              </div>
              <FilterSidebar
                categories={allCategories}
                brands={availableBrands}
                activeSlug={slug}
                selectedBrands={selectedBrands}
                onToggleBrand={toggleBrand}
              />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-foreground/30 z-[200] lg:hidden backdrop-blur-sm"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-card z-[201] p-6 overflow-y-auto shadow-2xl lg:hidden"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-foreground">Filters</h2>
                    <button onClick={() => setMobileFilterOpen(false)} aria-label="Close filters" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-muted-foreground cursor-pointer">
                      ✕
                    </button>
                  </div>
                  <FilterSidebar
                    categories={allCategories}
                    brands={availableBrands}
                    activeSlug={slug}
                    selectedBrands={selectedBrands}
                    onToggleBrand={toggleBrand}
                  />
                  <div className="mt-8 pt-6 border-t border-border">
                    <button onClick={() => setMobileFilterOpen(false)} className="btn-primary w-full py-3.5 font-bold shadow-lg shadow-primary/20">
                      Show {filteredProducts.length} Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                {loading ? (
                  <span className="skeleton inline-block h-6 w-48 max-w-full align-middle" />
                ) : (
                  <>
                    {category?.short_name || category?.name} Products <span className="text-muted-foreground font-medium text-sm sm:text-lg ml-2">({filteredProducts.length} items)</span>
                  </>
                )}
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select
                  value={sortParam}
                  onChange={e => { setSortParam(e.target.value); setPage(1) }}
                  className="bg-card border border-border text-sm font-semibold text-foreground rounded-lg px-3 py-2 min-h-10 outline-none focus:border-primary cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="az">Name: A to Z</option>
                  <option value="za">Name: Z to A</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active filters badges */}
            {selectedBrands.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedBrands.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-full text-xs font-bold text-foreground shadow-sm">
                    {tag}
                    <button onClick={() => toggleBrand(tag)} aria-label={`Remove ${tag} filter`} className="hover:text-primary text-[10px] p-2 -m-2 cursor-pointer">
                      ✕
                    </button>
                  </span>
                ))}
                <button onClick={clearFilters} className="text-xs font-bold text-muted-foreground hover:text-foreground ml-2 py-2 -my-2 cursor-pointer">
                  Clear All
                </button>
              </div>
            )}

            {loading ? (
              /* Skeleton grid shaped like real product cards — no spinner,
                 no "No products found" flash while data is in flight. */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="skeleton aspect-[4/3] w-full mb-4" />
                    <div className="skeleton h-3 w-1/3 mb-2" />
                    <div className="skeleton h-4 w-3/4 mb-2" />
                    <div className="skeleton h-4 w-1/2 mb-4" />
                    <div className="skeleton h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pagedProducts.map((product) => (
                    <motion.div
                      key={product.slug}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border shadow-sm p-6">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-black text-foreground mb-2">No products found</h3>
                    <p className="text-muted-foreground max-w-md mb-6 text-sm leading-relaxed">
                      We couldn't find any products matching your current filters. Try adjusting your search criteria.
                    </p>
                    <button onClick={clearFilters} className="btn-primary px-6 py-2.5 shadow-lg shadow-primary/20">
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border mt-8 pt-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 min-h-10 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-secondary text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      ← Previous Page
                    </button>

                    <div className="text-xs text-muted-foreground font-medium">
                      Page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span>
                    </div>

                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2 min-h-10 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-secondary text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Next Page →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

        </div>
      </div>

      <Footer />
    </div>
  )
}
