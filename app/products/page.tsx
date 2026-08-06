'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getProducts, getBrands, getCategories, getProductFilterMeta, Product as ApiProduct, Brand as ApiBrand, Category as ApiCategory, type ProductFilterMeta } from '@/lib/api'
import { ProductCard } from '@/components/product-card'
import { useScrollLock } from '@/components/confirm-dialog'
import Link from 'next/link'

interface FilterSidebarProps {
  categories: ApiCategory[]
  brands: ApiBrand[]
  filterMeta: ProductFilterMeta | null
  selectedCategory: string
  selectedBrand: string
  onSelectCategory: (slug: string) => void
  onSelectBrand: (slug: string) => void
  minPriceInput: string
  maxPriceInput: string
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onApplyPrice: () => void
  pricedOnly: boolean
  onPricedOnlyChange: (checked: boolean) => void
  specInput: string
  onSpecInputChange: (value: string) => void
  appliedSpec: string
  onApplySpec: (value: string) => void
  activeFilterCount: number
  onClearAll: () => void
}

// Hoisted to module scope: declaring this inside the page component created a
// new component type every render, remounting the whole tree and dropping
// focus from the price/spec inputs on every keystroke.
function FilterSidebar({
  categories, brands, filterMeta,
  selectedCategory, selectedBrand, onSelectCategory, onSelectBrand,
  minPriceInput, maxPriceInput, onMinPriceChange, onMaxPriceChange, onApplyPrice,
  pricedOnly, onPricedOnlyChange,
  specInput, onSpecInputChange, appliedSpec, onApplySpec,
  activeFilterCount, onClearAll,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Categories</p>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`flex items-center justify-between w-full text-left px-2 py-2 lg:py-1 min-h-10 lg:min-h-0 rounded text-xs font-semibold cursor-pointer transition-colors ${
              !selectedCategory ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug === selectedCategory ? '' : cat.slug)}
              className={`flex items-center justify-between w-full text-left px-2 py-2 lg:py-1 min-h-10 lg:min-h-0 rounded text-xs font-semibold cursor-pointer transition-colors ${
                selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <span className="truncate">{cat.short_name || cat.name}</span>
              <span className="text-[10px] font-mono opacity-70">({cat.product_count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Brands</p>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectBrand('')}
            className={`flex items-center justify-between w-full text-left px-2 py-2 lg:py-1 min-h-10 lg:min-h-0 rounded text-xs font-semibold cursor-pointer transition-colors ${
              !selectedBrand ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>All Brands</span>
          </button>
          {brands.map(brand => (
            <button
              key={brand.slug}
              onClick={() => onSelectBrand(brand.slug === selectedBrand ? '' : brand.slug)}
              className={`flex items-center justify-between w-full text-left px-2 py-2 lg:py-1 min-h-10 lg:min-h-0 rounded text-xs font-semibold cursor-pointer transition-colors ${
                selectedBrand === brand.slug ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <span className="truncate">{brand.name}</span>
              {brand.product_count !== undefined && (
                <span className="text-[10px] font-mono opacity-70">({brand.product_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Price range ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Price Range {filterMeta && (
            <span className="font-mono normal-case tracking-normal text-[9px] text-muted-foreground/70">
              (PKR {filterMeta.min_price.toLocaleString()} – {filterMeta.max_price.toLocaleString()})
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} inputMode="numeric"
            value={minPriceInput}
            onChange={(e) => onMinPriceChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onApplyPrice() }}
            placeholder="Min"
            className="w-full px-2.5 py-1.5 min-h-10 lg:min-h-0 border border-border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="number" min={0} inputMode="numeric"
            value={maxPriceInput}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onApplyPrice() }}
            placeholder="Max"
            className="w-full px-2.5 py-1.5 min-h-10 lg:min-h-0 border border-border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={onApplyPrice}
          className="btn-secondary mt-2 w-full py-2 text-[11px] font-bold min-h-10 lg:min-h-0"
        >
          Apply Price
        </button>
        <label className="flex items-center gap-2 mt-3 text-xs text-muted-foreground cursor-pointer min-h-10 lg:min-h-0">
          <input
            type="checkbox"
            checked={pricedOnly}
            onChange={(e) => onPricedOnlyChange(e.target.checked)}
            className="w-4 h-4 lg:w-3.5 lg:h-3.5 rounded"
          />
          Hide &quot;Price on Request&quot;
        </label>
      </div>

      {/* ── Specification ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Specification
        </p>
        <input
          type="text"
          value={specInput}
          onChange={(e) => onSpecInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onApplySpec(specInput) }}
          placeholder="e.g. 32A, 3 Pole, IP67"
          className="w-full px-2.5 py-1.5 min-h-10 lg:min-h-0 border border-border rounded-lg text-xs bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {(filterMeta?.spec_suggestions || []).slice(0, 10).map(s => (
            <button
              key={s}
              onClick={() => onApplySpec(appliedSpec === s ? '' : s)}
              className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 lg:py-0.5 min-h-10 lg:min-h-0 rounded-full border transition-colors cursor-pointer ${
                appliedSpec === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={onClearAll}
          className="w-full py-2 min-h-10 lg:min-h-0 text-[11px] font-bold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [brands, setBrands] = useState<ApiBrand[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [sortParam, setSortParam] = useState('relevance')
  const [page, setPage] = useState(1)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  useScrollLock(mobileFilterOpen)

  // ── Price range + specification filters (contracted) ──
  // Kept as draft strings so typing does not fire a request per keystroke;
  // `applied*` is what actually goes to the API.
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | undefined>()
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | undefined>()
  const [specInput, setSpecInput] = useState('')
  const [appliedSpec, setAppliedSpec] = useState('')
  const [pricedOnly, setPricedOnly] = useState(false)
  const [filterMeta, setFilterMeta] = useState<ProductFilterMeta | null>(null)

  useEffect(() => {
    getProductFilterMeta().then(setFilterMeta).catch(() => {})
  }, [])

  const applyPrice = () => {
    const min = minPriceInput.trim() === '' ? undefined : Number(minPriceInput)
    const max = maxPriceInput.trim() === '' ? undefined : Number(maxPriceInput)
    setAppliedMinPrice(Number.isFinite(min as number) ? min : undefined)
    setAppliedMaxPrice(Number.isFinite(max as number) ? max : undefined)
    setPage(1)
  }

  const applySpec = (value: string) => {
    setSpecInput(value)
    setAppliedSpec(value)
    setPage(1)
  }

  const clearAllFilters = () => {
    setSelectedCategory(''); setSelectedBrand('')
    setMinPriceInput(''); setMaxPriceInput('')
    setAppliedMinPrice(undefined); setAppliedMaxPrice(undefined)
    setSpecInput(''); setAppliedSpec('')
    setPricedOnly(false)
    setPage(1)
  }

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + (selectedBrand ? 1 : 0) +
    (appliedMinPrice !== undefined || appliedMaxPrice !== undefined ? 1 : 0) +
    (appliedSpec ? 1 : 0) + (pricedOnly ? 1 : 0)

  // Fetch categories and brands once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catData, brandData] = await Promise.all([
          getCategories(),
          getBrands(),
        ])
        setCategories(catData || [])
        setBrands(brandData || [])
      } catch (err) {
        console.error('Failed to load categories/brands', err)
      }
    }
    loadMeta()
  }, [])

  // Fetch products when filters or page change
  const fetchProductsList = useCallback(async () => {
    setLoading(true)
    try {
      let ordering = undefined
      if (sortParam === 'az') ordering = 'name'
      else if (sortParam === 'za') ordering = '-name'
      else if (sortParam === 'newest') ordering = '-created_at'

      const res = await getProducts({
        search: activeSearch,
        brand: selectedBrand,
        category: selectedCategory,
        min_price: appliedMinPrice,
        max_price: appliedMaxPrice,
        spec: appliedSpec || undefined,
        priced_only: pricedOnly || undefined,
        ordering,
        page,
        page_size: 24,
      })
      setProducts(res.results || [])
      setTotalCount(res.count || 0)
    } catch (err) {
      console.error('Failed to fetch products', err)
      setProducts([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [
    activeSearch, selectedBrand, selectedCategory, sortParam, page,
    appliedMinPrice, appliedMaxPrice, appliedSpec, pricedOnly,
  ])

  useEffect(() => {
    fetchProductsList()
  }, [fetchProductsList])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setActiveSearch(searchQuery.trim())
  }

  const clearFilters = () => {
    setSearchQuery('')
    setActiveSearch('')
    setSelectedCategory('')
    setSelectedBrand('')
    setSortParam('relevance')
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / 24)

  // Scroll the results grid back into view when the page changes (skips mount)
  const mainRef = useRef<HTMLElement>(null)
  const prevPageRef = useRef(page)
  useEffect(() => {
    if (prevPageRef.current !== page) {
      prevPageRef.current = page
      mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [page])

  const sidebarProps: FilterSidebarProps = {
    categories, brands, filterMeta,
    selectedCategory, selectedBrand,
    onSelectCategory: (slug) => { setSelectedCategory(slug); setPage(1) },
    onSelectBrand: (slug) => { setSelectedBrand(slug); setPage(1) },
    minPriceInput, maxPriceInput,
    onMinPriceChange: setMinPriceInput,
    onMaxPriceChange: setMaxPriceInput,
    onApplyPrice: applyPrice,
    pricedOnly,
    onPricedOnlyChange: (checked) => { setPricedOnly(checked); setPage(1) },
    specInput,
    onSpecInputChange: setSpecInput,
    appliedSpec,
    onApplySpec: applySpec,
    activeFilterCount,
    onClearAll: clearAllFilters,
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <Navbar />

      {/* Breadcrumb Sticky Bar */}
      <div className="bg-card border-b border-border py-3 z-30 sticky top-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-border">/</span>
              <span className="text-foreground font-semibold">All Products</span>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden btn-secondary px-3.5 py-2 min-h-10 text-xs font-bold -my-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Product Search Bar Section */}
        <div className="mb-8 bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products by model, brand, spec, or keyword (e.g. NXB-63, ABB, 32A Contactor)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => { setSearchQuery(''); setActiveSearch(''); setPage(1); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary py-3 px-6 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>Search Catalog</span>
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-32 p-5 bg-card rounded-lg border border-border shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-foreground">Filters</h2>
                {(selectedBrand || selectedCategory || activeSearch) && (
                  <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    Clear All
                  </button>
                )}
              </div>
              <FilterSidebar {...sidebarProps} />
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
                  className="fixed inset-0 bg-foreground/40 z-[200] lg:hidden"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-card z-[201] p-6 overflow-y-auto shadow-2xl lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-foreground">Filters</h2>
                    <button onClick={() => setMobileFilterOpen(false)} aria-label="Close filters" className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground cursor-pointer">
                      ✕
                    </button>
                  </div>
                  <FilterSidebar {...sidebarProps} />
                  <div className="mt-6 pt-5 border-t border-border">
                    <button onClick={() => setMobileFilterOpen(false)} className="btn-primary w-full py-3 text-xs justify-center cursor-pointer">
                      Show Results ({totalCount})
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main ref={mainRef} className="flex-1 min-w-0 scroll-mt-32">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Industrial Electrical Products
                <span className="text-muted-foreground font-normal text-xs sm:text-sm ml-2">({totalCount} items)</span>
              </h1>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select
                  value={sortParam}
                  onChange={e => { setSortParam(e.target.value); setPage(1); }}
                  className="bg-card border border-border text-xs font-semibold text-foreground rounded-lg px-2.5 py-1.5 min-h-10 sm:min-h-0 outline-none focus:border-primary cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="az">Name: A to Z</option>
                  <option value="za">Name: Z to A</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Active filters badges */}
            {(selectedBrand || selectedCategory || activeSearch) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeSearch && (
                  <span className="inline-flex items-center gap-1 pl-2.5 pr-0 sm:pr-1.5 sm:gap-1.5 min-h-10 sm:min-h-0 sm:py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary shadow-sm">
                    Search: "{activeSearch}"
                    <button aria-label="Clear search filter" onClick={() => { setActiveSearch(''); setSearchQuery(''); setPage(1); }} className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center hover:text-foreground text-[10px] cursor-pointer">
                      ✕
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 pl-2.5 pr-0 sm:pr-1.5 sm:gap-1.5 min-h-10 sm:min-h-0 sm:py-1 bg-card border border-border rounded-full text-xs font-bold text-foreground shadow-sm">
                    Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <button aria-label="Clear category filter" onClick={() => { setSelectedCategory(''); setPage(1); }} className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center hover:text-primary text-[10px] cursor-pointer">
                      ✕
                    </button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 pl-2.5 pr-0 sm:pr-1.5 sm:gap-1.5 min-h-10 sm:min-h-0 sm:py-1 bg-card border border-border rounded-full text-xs font-bold text-foreground shadow-sm">
                    Brand: {brands.find(b => b.slug === selectedBrand)?.name || selectedBrand}
                    <button aria-label="Clear brand filter" onClick={() => { setSelectedBrand(''); setPage(1); }} className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center hover:text-primary text-[10px] cursor-pointer">
                      ✕
                    </button>
                  </span>
                )}
                <button onClick={clearFilters} className="inline-flex items-center min-h-10 sm:min-h-0 text-xs font-bold text-muted-foreground hover:text-foreground ml-2 cursor-pointer">
                  Clear All
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border border-border overflow-hidden flex flex-col">
                    <div className="skeleton aspect-[4/3] w-full rounded-none" />
                    <div className="p-4 flex flex-col flex-1">
                      <div className="skeleton h-2.5 w-20" />
                      <div className="skeleton h-4 w-full mt-2" />
                      <div className="skeleton h-4 w-3/4 mt-1.5" />
                      <div className="skeleton h-3 w-24 mt-2" />
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="skeleton h-4 w-28 mb-2.5" />
                        <div className="skeleton h-10 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <motion.div
                        layout
                        key={product.slug}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Empty State */}
                {products.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-lg border border-border p-6 shadow-sm">
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-base font-bold text-foreground mb-1">No products found</h3>
                    <p className="text-muted-foreground max-w-sm mb-5 text-xs leading-relaxed">
                      We couldn't find any products matching your current search or filters. Try adjusting your criteria.
                    </p>
                    <button onClick={clearFilters} className="btn-primary text-xs py-2 px-5 cursor-pointer">
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border mt-8 pt-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="btn-secondary px-4 py-2 min-h-10 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Previous Page
                    </button>

                    <div className="text-xs text-muted-foreground font-medium">
                      Page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{totalPages}</span>
                    </div>

                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="btn-secondary px-4 py-2 min-h-10 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
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
