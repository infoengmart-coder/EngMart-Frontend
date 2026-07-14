'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import * as Lucide from 'lucide-react'

const CATEGORY_LUCIDE_ICONS: Record<string, string> = {
  MCBs: 'Zap',
  MCCBs: 'Power',
  Contactors: 'Boxes',
  'Current Transformers': 'RefreshCw',
  'Panel Meters': 'Gauge',
  Capacitors: 'Cpu',
  'Industrial Sockets': 'Plug',
  'Variable Frequency Drives': 'Sliders',
  'Protection Relays': 'ShieldCheck',
  'Cam Switches': 'RotateCw'
}

export default function CartPage() {
  const { items, count, remove, update, clear } = useCart()

  const renderCategoryIcon = (categoryName: string, className: string = "w-6 h-6") => {
    const iconName = CATEGORY_LUCIDE_ICONS[categoryName] || 'Zap'
    // @ts-ignore
    const IconComp = Lucide[iconName] || Lucide.Zap
    return <IconComp className={className} />
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors">
      <Navbar />

      {/* Page header */}
      <div className="pt-12 bg-white border-b border-slate-200/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-slate-200">/</span>
            <span className="text-slate-700 font-medium">Cart</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                Your Cart
              </h1>
              <p className="text-slate-500 text-sm mt-1">{count} item{count !== 1 ? 's' : ''} in your cart</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="text-xs text-slate-450 hover:text-red-500 hover:no-underline font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lucide.Trash2 className="w-3.5 h-3.5" /> Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          // Empty state
          <motion.div
            className="text-center py-24 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm max-w-2xl mx-auto px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Lucide.ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
              Browse our catalog and add products. You can also submit a B2B quote request directly from any product page.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/products" className="btn-primary text-xs px-6 py-2.5">Browse Products</Link>
              <Link href="/contact" className="btn-secondary text-xs px-6 py-2.5">Request a Quote</Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.28 }}
                    className="glow-card block overflow-hidden bg-white border border-slate-200/60 p-4 sm:p-5 flex items-start gap-4 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {/* Product icon */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200/50">
                      {renderCategoryIcon(item.category, "w-6 h-6 sm:w-7 sm:h-7")}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">{item.category}</p>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{item.name}</h3>
                          <p className="text-[11px] text-slate-400 font-mono">Cat: {item.catNo}</p>
                        </div>
                        <button
                          onClick={() => remove(item.slug)}
                          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer"
                        >
                          <Lucide.X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Brand + Qty */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                        <span
                          className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full"
                          style={{ background: item.badgeColor }}
                        >
                          {item.brand}
                        </span>

                        {/* Quantity control */}
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200/60 overflow-hidden">
                          <button
                            onClick={() => update(item.slug, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Lucide.Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 min-w-[24px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => update(item.slug, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          >
                            <Lucide.Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue shopping */}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-all mt-4 group"
              >
                <Lucide.ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="glow-card block overflow-hidden bg-white border border-slate-200/60 p-6 sticky top-24 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>

                {/* Item list summary */}
                <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.slug} className="flex justify-between text-xs">
                      <span className="text-slate-650 font-semibold truncate max-w-[65%]">{item.name} <span className="text-slate-400">×{item.quantity}</span></span>
                      <span className="text-slate-400 font-bold">Quote Item</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-950">Total Items</span>
                    <span className="text-xl font-black text-primary">{count}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Pricing is provided upon quote request validation. Submit your cart details for a formal estimation.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    className="btn-primary w-full text-xs py-2.5 justify-center"
                  >
                    Proceed to Checkout
                    <Lucide.ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/contact" className="btn-secondary w-full text-xs py-2.5 justify-center">
                    Request B2B Quote
                  </Link>
                </div>

                {/* Trust */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  {[
                    { icon: 'ShieldCheck', text: '105% genuine manufactured products' },
                    { icon: 'Truck', text: 'Free dispatch inside Karachi above PKR 50k' },
                    { icon: 'Award', text: 'Original manufacturer warranty' },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                      {(() => {
                        // @ts-ignore
                        const Icon = Lucide[t.icon]
                        return <Icon className="w-3.5 h-3.5 text-slate-400" />
                      })()}
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
