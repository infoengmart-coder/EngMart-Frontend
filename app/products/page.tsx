'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { FEATURED_PRODUCTS, CATEGORIES, BRANDS, ALL_PRODUCTS } from '@/lib/data'
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
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Categories</p>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button key={cat.slug} onClick={() => toggleCategory(cat.name)} className="flex items-center gap-3 cursor-pointer group w-full text-left">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                selectedCategories.includes(cat.name)
                  ? 'bg-primary border-primary text-white'
                  : 'border-slate-200 bg-white group-hover:border-primary/40'
              }`}>
                {selectedCategories.includes(cat.name) && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${selectedCategories.includes(cat.name) ? 'font-bold text-slate-900' : 'font-medium text-slate-650'} group-hover:text-primary transition-colors`}>
                {cat.short}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Brands</p>
        <div className="space-y-2">
          {BRANDS.map(brand => (
            <button key={brand.slug} onClick={() => toggleBrand(brand.name)} className="flex items-center gap-3 cursor-pointer group w-full text-left">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                selectedBrands.includes(brand.name)
                  ? 'bg-primary border-primary text-white'
                  : 'border-slate-200 bg-white group-hover:border-primary/40'
              }`}>
                {selectedBrands.includes(brand.name) && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${selectedBrands.includes(brand.name) ? 'font-bold text-slate-900' : 'font-medium text-slate-650'} group-hover:text-primary transition-colors`}>
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-28 bg-white border-b border-slate-200/60 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-slate-200">/</span>
              <span className="text-slate-800 font-bold">All Products</span>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters {(selectedBrands.length > 0 || selectedCategories.length > 0) && `(${selectedBrands.length + selectedCategories.length})`}
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-24 p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-900">Filters</h2>
                {(selectedBrands.length > 0 || selectedCategories.length > 0) && (
                  <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">
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
                  className="fixed inset-0 bg-slate-950/40 z-[200] lg:hidden backdrop-blur-sm"
                  onClick={() => setMobileFilterOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-[201] p-6 overflow-y-auto shadow-2xl lg:hidden"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-900">Filters</h2>
                    <button onClick={() => setMobileFilterOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 cursor-pointer">
                      ✕
                    </button>
                  </div>
                  <FilterSidebar />
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button onClick={() => setMobileFilterOpen(false)} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 cursor-pointer">
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
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Industrial Electrical <span className="text-slate-400 font-medium text-sm sm:text-lg ml-2">({filteredProducts.length} items)</span>
              </h1>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-500 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortParam}
                  onChange={e => setSortParam(e.target.value)}
                  className="bg-white border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer"
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
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                    {tag}
                    <button onClick={() => { selectedCategories.includes(tag) ? toggleCategory(tag) : toggleBrand(tag) }} className="hover:text-primary text-[10px] cursor-pointer">
                      ✕
                    </button>
                  </span>
                ))}
                <button onClick={clearFilters} className="text-xs font-bold text-slate-400 hover:text-slate-600 ml-2 cursor-pointer">
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.slug}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-500 max-w-md mb-6 text-sm leading-relaxed">
                  We couldn't find any products matching your current filters. Try adjusting your search criteria.
                </p>
                <button onClick={clearFilters} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all cursor-pointer">
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
