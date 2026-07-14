'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CATEGORIES, BRANDS, ALL_PRODUCTS } from '@/lib/data'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'

export default function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sortParam, setSortParam] = useState('relevance')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Mock deterministic price generator for sorting purposes
  const getPrice = (slug: string) => {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash % 50000) + 1000;
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])
  }

  const filteredProducts = useMemo(() => {
    let p = ALL_PRODUCTS

    if (selectedCategories.length > 0 || selectedBrands.length > 0) {
      const validStrings = CATEGORIES.filter(c => selectedCategories.includes(c.name)).flatMap(c => [
        c.name, c.short,
        c.short === 'CTs' ? 'Current Transformers' : '',
        c.short === 'Industrial Plugs' ? 'Industrial Sockets' : ''
      ])
      
      p = p.filter(product => {
        const catMatch = selectedCategories.length > 0 && validStrings.includes(product.category)
        const brandMatch = selectedBrands.length > 0 && selectedBrands.includes(product.brand)
        return catMatch || brandMatch
      })
    }

    // Sort
    if (sortParam === 'az') {
      p = [...p].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortParam === 'za') {
      p = [...p].sort((a, b) => b.name.localeCompare(a.name))
    } else if (sortParam === 'price-low') {
      p = [...p].sort((a, b) => getPrice(a.slug) - getPrice(b.slug))
    } else if (sortParam === 'price-high') {
      p = [...p].sort((a, b) => getPrice(b.slug) - getPrice(a.slug))
    } else if (sortParam === 'newest') {
      p = [...p].sort((a, b) => b.slug.localeCompare(a.slug))
    }

    return p
  }, [selectedCategories, selectedBrands, sortParam])

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Categories</p>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => toggleCategory(cat.name)} className="flex items-center gap-3 cursor-pointer group w-full text-left">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                selectedCategories.includes(cat.name)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border bg-card group-hover:border-primary/40'
              }`}>
                {selectedCategories.includes(cat.name) && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-xs font-semibold ${selectedCategories.includes(cat.name) ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-primary transition-colors`}>
                {cat.short}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Brands</p>
        <div className="space-y-2">
          {BRANDS.map(brand => (
            <button key={brand.slug} onClick={() => toggleBrand(brand.name)} className="flex items-center gap-3 cursor-pointer group w-full text-left">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                selectedBrands.includes(brand.name)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border bg-card group-hover:border-primary/40'
              }`}>
                {selectedBrands.includes(brand.name) && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-xs font-semibold ${selectedBrands.includes(brand.name) ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-primary transition-colors`}>
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

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
              className="lg:hidden flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters {(selectedBrands.length > 0 || selectedCategories.length > 0) && `(${selectedBrands.length + selectedCategories.length})`}
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-32 p-5 bg-card rounded-lg border border-border shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-foreground">Filters</h2>
                {(selectedBrands.length > 0 || selectedCategories.length > 0) && (
                  <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    Clear All
                  </button>
                )}
              </div>
              <FilterSidebar />
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
                  className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-card z-[201] p-6 overflow-y-auto shadow-2xl lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-foreground">Filters</h2>
                    <button onClick={() => setMobileFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground cursor-pointer">
                      ✕
                    </button>
                  </div>
                  <FilterSidebar />
                  <div className="mt-6 pt-5 border-t border-border">
                    <button onClick={() => setMobileFilterOpen(false)} className="btn-primary w-full py-3 text-xs justify-center cursor-pointer">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Industrial Electrical Products
                <span className="text-muted-foreground font-normal text-xs sm:text-sm ml-2">({filteredProducts.length} items)</span>
              </h1>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Sort by:</span>
                <select
                  value={sortParam}
                  onChange={e => setSortParam(e.target.value)}
                  className="bg-card border border-border text-xs font-semibold text-foreground rounded-lg px-2.5 py-1.5 outline-none focus:border-primary cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="az">Name: A to Z</option>
                  <option value="za">Name: Z to A</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Active filters badges */}
            {(selectedBrands.length > 0 || selectedCategories.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {[...selectedCategories, ...selectedBrands].map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-full text-xs font-bold text-foreground shadow-sm">
                    {tag}
                    <button onClick={() => { selectedCategories.includes(tag) ? toggleCategory(tag) : toggleBrand(tag) }} className="hover:text-primary text-[10px] cursor-pointer">
                      ✕
                    </button>
                  </span>
                ))}
                <button onClick={clearFilters} className="text-xs font-bold text-muted-foreground hover:text-foreground ml-2 cursor-pointer">
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredProducts.map((product) => (
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
            </motion.div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-lg border border-border p-6 shadow-sm">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-base font-bold text-foreground mb-1">No products found</h3>
                <p className="text-muted-foreground max-w-sm mb-5 text-xs leading-relaxed">
                  We couldn't find any products matching your current filters. Try adjusting your search criteria.
                </p>
                <button onClick={clearFilters} className="btn-primary text-xs py-2 px-5 cursor-pointer">
                  Clear All Filters
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}
