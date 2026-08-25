'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart'
import { getProducts, formatPrice, type Product } from '@/lib/api'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useWelcomeDiscount } from '@/lib/welcome-discount'
import * as Lucide from 'lucide-react'

export default function CartPage() {
  const { items, count, subtotal, remove, update, clear, add, isInCart, getItemKey, hydrated } = useCart()
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [confirmClear, setConfirmClear] = useState(false)

  // First-order welcome discount, if the server says this customer has one.
  const { discountFor, percent: welcomePercent } = useWelcomeDiscount()
  const welcomeDiscount = discountFor(subtotal)

  // Fetch related/suggested products from API.
  // Keyed on the set of slugs in the cart (not the items array) so quantity
  // changes don't refetch; waits for hydration so we filter the real cart.
  const cartSlugKey = items.map(i => i.slug).sort().join(',')
  useEffect(() => {
    if (!hydrated) return
    getProducts({ page_size: 6, is_featured: true })
      .then(res => {
        const slugsInCart = new Set(cartSlugKey.split(','))
        setRelatedProducts(res.results.filter(p => !slugsInCart.has(p.slug)).slice(0, 3))
      })
      .catch(() => {})
  }, [hydrated, cartSlugKey])

  const porItemCount = items.filter(i => i.isPriceOnRequest).length

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />

      {/* Page header */}
      <div className="pt-12 bg-card border-b border-border/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="breadcrumb mb-3" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Cart</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground leading-tight">
                Your Cart
              </h1>
              {hydrated ? (
                <p className="text-muted-foreground text-sm mt-1">{count} item{count !== 1 ? 's' : ''} in your cart</p>
              ) : (
                <div className="skeleton h-4 w-28 mt-2" aria-hidden="true" />
              )}
            </div>
            {hydrated && items.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="min-h-10 sm:min-h-0 text-xs text-muted-foreground hover:text-red-500 hover:no-underline font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lucide.Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!hydrated ? (
          // Cart-shaped loading skeleton — mirrors line items + order summary
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="skeleton h-[132px] rounded-2xl" />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="skeleton h-[420px] rounded-2xl" />
            </div>
          </div>
        ) : items.length === 0 ? (
          // Empty state
          <motion.div
            className="text-center py-24 bg-card rounded-[2rem] border border-border/60 shadow-sm max-w-2xl mx-auto px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Lucide.ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed text-sm">
              Browse our catalog and add products. You can also submit a B2B quote request directly from any product page.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/products" className="btn-primary text-xs px-6 py-2.5">Browse Products</Link>
              <Link href="/contact" className="btn-secondary text-xs px-6 py-2.5">Request a Quote</Link>
            </div>
          </motion.div>
        ) : (
          // On mobile the grid stacks in DOM order: line items → order summary
          // (with checkout CTA) → cross-sell last. On lg the summary sits in
          // the right column spanning both rows so sticky still works.
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const key = getItemKey(item.slug, item.variantId)
                  const imgSrc = item.image || '/product-placeholder.svg'
                  return (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.28 }}
                      className="glow-card block overflow-hidden bg-card border border-border/60 p-4 sm:p-5 flex items-start gap-4 hover:border-primary/20 transition-[border-color,box-shadow] duration-300 shadow-sm hover:shadow-md"
                    >
                      {/* Product Image */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-card overflow-hidden flex items-center justify-center shrink-0 border border-border/50 p-1">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/product-placeholder.svg' }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">{item.category}</p>
                            <h3 className="text-sm font-bold text-foreground leading-tight mb-0.5">{item.name}</h3>
                            {item.catNo && (
                              <p className="text-[11px] text-muted-foreground font-mono">Cat: {item.catNo}</p>
                            )}
                            {item.variantDescription && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">{item.variantDescription}</p>
                            )}
                          </div>
                          <button
                            onClick={() => remove(key)}
                            aria-label={`Remove ${item.name}`}
                            className="shrink-0 w-10 h-10 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                          >
                            <Lucide.X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Brand + Qty */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-border/60">
                          <div className="flex items-center gap-3">
                            <span
                              className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full"
                              style={{ background: item.brandColor || 'var(--primary)' }}
                            >
                              {item.brand}
                            </span>
                            {item.isPriceOnRequest ? (
                              <span className="text-[11px] font-bold text-amber-600">
                                Price on Request
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-muted-foreground">
                                {formatPrice(item.unitPrice)} each
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            {!item.isPriceOnRequest && (
                              <span className="text-sm font-black text-foreground">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </span>
                            )}

                            {/* Quantity control */}
                            <div className="qty-stepper shrink-0">
                              <button
                                onClick={() => update(key, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                aria-label="Decrease quantity"
                                className="min-w-10 min-h-10 sm:min-w-8 sm:min-h-8 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Lucide.Minus className="w-3.5 h-3.5" />
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={() => update(key, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="min-w-10 min-h-10 sm:min-w-8 sm:min-h-8"
                              >
                                <Lucide.Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Continue shopping */}
              <div className="flex justify-between items-center mt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 min-h-10 sm:min-h-0 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group"
                >
                  <Lucide.ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1 lg:row-span-2">
              <div className="glow-card block overflow-hidden bg-card border border-border/60 p-6 sticky top-24 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-5">Order Summary</h2>

                {/* Item list summary */}
                <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const key = getItemKey(item.slug, item.variantId)
                    return (
                      <div key={key} className="flex justify-between text-xs items-center">
                        <span className="text-foreground font-semibold truncate max-w-[65%]">
                          {item.name} <span className="text-muted-foreground font-medium">×{item.quantity}</span>
                        </span>
                        <span className="text-foreground font-bold">
                          {item.isPriceOnRequest ? 'POR' : formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border/60 pt-4 mb-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <span>Total Items</span>
                    <span>{count}</span>
                  </div>
                  {porItemCount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-amber-600">
                      <span>Price on Request</span>
                      <span>{porItemCount} item{porItemCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {/* Welcome discount. Shown only when the SERVER has confirmed
                      this customer is eligible, and recalculated there again at
                      checkout — the figure here can never overstate the saving. */}
                  {welcomeDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Lucide.BadgePercent className="w-3.5 h-3.5" />
                        Welcome discount ({welcomePercent}%)
                      </span>
                      <span>-{formatPrice(welcomeDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-border">
                    <span className="text-sm font-bold text-foreground">
                      {welcomeDiscount > 0 ? 'Total' : 'Subtotal'}
                    </span>
                    {subtotal > 0 ? (
                      <span className="flex items-baseline gap-2">
                        {welcomeDiscount > 0 && (
                          <span className="text-sm font-bold text-muted-foreground line-through">
                            {formatPrice(subtotal)}
                          </span>
                        )}
                        <span className="text-xl font-black text-primary">
                          {formatPrice(subtotal - welcomeDiscount)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xl font-black text-primary">TBD</span>
                    )}
                  </div>

                  {welcomeDiscount > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed">
                      🎉 Your {welcomePercent}% first-order discount is applied automatically at checkout.
                    </p>
                  )}
                  {porItemCount > 0 && (
                    <p className="text-[11px] text-amber-600 mt-2 leading-relaxed font-semibold">
                      ⚠ {porItemCount} item{porItemCount > 1 ? 's have' : ' has'} price on request. Final pricing will be confirmed by our team.
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Final B2B terms and delivery charges will be calculated during checkout review.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    className="btn-primary w-full text-xs py-2.5 justify-center cursor-pointer"
                  >
                    Proceed to Checkout
                    <Lucide.ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/contact" className="btn-secondary w-full text-xs py-2.5 justify-center cursor-pointer">
                    Request B2B Quote
                  </Link>
                </div>

                {/* Trust */}
                <div className="mt-6 pt-5 border-t border-border/60 space-y-2">
                  {[
                    { icon: 'ShieldCheck', text: '100% genuine manufactured products' },
                    { icon: 'Truck', text: 'Free dispatch inside Karachi above PKR 50k' },
                    { icon: 'Award', text: 'Original manufacturer warranty' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold">
                      {(() => {
                        // @ts-ignore
                        const Icon = Lucide[t.icon]
                        return <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      })()}
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Related Products — last on mobile, under the line items on lg */}
            {relatedProducts.length > 0 && (
              <div className="lg:col-span-2 pt-8 border-t border-border/60">
                <h3 className="text-base font-extrabold text-foreground mb-6 flex items-center gap-2">
                  <Lucide.ShoppingBag className="w-4 h-4 text-primary" /> You May Also Need
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedProducts.map((p) => {
                    const itemKey = getItemKey(p.slug)
                    const inCart = isInCart(itemKey)
                    const price = p.price_range ? p.price_range.min : 0
                    const imgSrc = p.image || '/product-placeholder.svg'
                    return (
                      <div key={p.slug} className="glow-card bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/25 transition-colors p-4 flex flex-col justify-between sm:h-[280px] shadow-sm">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-xl bg-background overflow-hidden flex items-center justify-center border border-border/60 shrink-0 p-1">
                            <img src={imgSrc} alt={p.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/product-placeholder.svg' }} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">{p.category_name}</span>
                            <h4 className="text-xs font-bold text-foreground mt-1 hover:text-primary transition-colors line-clamp-2 leading-snug">{p.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.first_variant?.cat_no}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/60 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">From</p>
                            <p className="text-xs font-extrabold text-foreground">
                              {p.has_price_on_request ? 'Get a Quote' : formatPrice(price)}
                            </p>
                          </div>
                          <button
                            onClick={() => add({
                              slug: p.slug,
                              productId: p.id,
                              variantId: null,
                              name: p.name,
                              brand: p.brand_name,
                              brandColor: p.brand?.color || 'var(--primary)',
                              category: p.category_name,
                              catNo: p.first_variant?.cat_no || '',
                              variantDescription: p.first_variant?.description || '',
                              image: imgSrc,
                              unitPrice: price,
                              isPriceOnRequest: p.has_price_on_request,
                            })}
                            className={`min-h-10 sm:min-h-0 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                              inCart
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-900 hover:bg-primary text-white border-transparent'
                            }`}
                          >
                            {inCart ? '✓ Added' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear cart?"
        message={`This removes all ${count} item${count !== 1 ? 's' : ''} from your cart. This can't be undone.`}
        confirmLabel="Clear Cart"
        danger
        onConfirm={() => { clear(); setConfirmClear(false) }}
        onClose={() => setConfirmClear(false)}
      />

      <Footer />
    </div>
  )
}
