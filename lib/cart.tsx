// =============================================================
// Eng-Mart Cart — localStorage + React Context
// Uses real API product data (variant IDs, prices, images)
// =============================================================
'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type CartItem = {
  // Product identifiers
  slug: string
  productId: number
  variantId?: number | null
  // Display info (snapshot at time of add)
  name: string
  brand: string
  /** Brand slug, so live discounts can be looked up without name matching. */
  brandSlug?: string
  brandColor?: string
  category: string
  catNo: string
  variantDescription?: string
  image?: string
  // Pricing
  quantity: number
  unitPrice: number       // 0 if price-on-request, and always BEFORE discount
  isPriceOnRequest: boolean
  /**
   * Brand discount running when this item was added.
   *
   * A snapshot only. The cart and checkout re-read today's percentage from
   * `useBrandDiscounts()` and prefer that, because a basket can sit in
   * localStorage long after the campaign it was added under has ended.
   */
  discountPercent?: number
}

type CartCtx = {
  items: CartItem[]
  count: number
  /** Sum of unit price x quantity, BEFORE any brand discount. */
  subtotal: number
  /** False until localStorage has been read. Gate "empty cart" UI on this,
   *  or returning customers see an empty-cart flash on every load. */
  hydrated: boolean
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  remove: (key: string) => void
  update: (key: string, qty: number) => void
  clear: () => void
  isInCart: (key: string) => boolean
  getItemKey: (slug: string, variantId?: number | null) => string
}

const CartContext = createContext<CartCtx | null>(null)

const LS_KEY = 'engmart_cart_v2'

/** Unique key for a cart item = slug + variant ID */
function makeKey(slug: string, variantId?: number | null): string {
  return variantId ? `${slug}__v${variantId}` : slug
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  // The saved cart can only be read after mount, so `items` starts empty on
  // every page load. `hydrated` must be STATE, not a ref: effects in the same
  // commit all see the pre-update `items`, so a ref flipped during hydration
  // would still let the persist effect below write that empty array and wipe
  // the customer's cart on every navigation.
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist on change — only once the saved cart has been read back
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const getItemKey = useCallback((slug: string, variantId?: number | null) => {
    return makeKey(slug, variantId)
  }, [])

  /**
   * Add an item to the cart.
   * `qty` defaults to 1 — the product page passes its stepper value, which was
   * previously ignored, so choosing 5 units only ever added 1.
   */
  const add = useCallback((item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    const amount = Math.max(1, Math.floor(qty) || 1)
    // Enforce the invariant here rather than trusting every call site: an item shown
    // as "Price on Request" must contribute nothing to the total. A caller was
    // passing a real unitPrice alongside isPriceOnRequest=true, so the cart
    // displayed "POR" while quietly adding PKR 32,500 to the subtotal.
    const safe: Omit<CartItem, 'quantity'> = item.isPriceOnRequest
      ? { ...item, unitPrice: 0 }
      : item
    setItems(prev => {
      const key = makeKey(safe.slug, safe.variantId)
      const exists = prev.find(i => makeKey(i.slug, i.variantId) === key)
      if (exists) {
        return prev.map(i =>
          makeKey(i.slug, i.variantId) === key
            ? { ...i, quantity: i.quantity + amount }
            : i
        )
      }
      return [...prev, { ...safe, quantity: amount }]
    })
  }, [])

  const remove = useCallback((key: string) => {
    setItems(prev => prev.filter(i => makeKey(i.slug, i.variantId) !== key))
  }, [])

  const update = useCallback((key: string, qty: number) => {
    if (qty < 1) return
    setItems(prev =>
      prev.map(i => makeKey(i.slug, i.variantId) === key ? { ...i, quantity: qty } : i)
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const isInCart = useCallback(
    (key: string) => items.some(i => makeKey(i.slug, i.variantId) === key),
    [items]
  )

  const count = items.reduce((s, i) => s + i.quantity, 0)
  // POR lines are excluded defensively too, so any cart already saved in a
  // customer's browser with the old bad data still totals correctly.
  const subtotal = items.reduce(
    (s, i) => s + (i.isPriceOnRequest ? 0 : i.unitPrice * i.quantity), 0)

  return (
    <CartContext.Provider value={{ items, count, subtotal, hydrated, add, remove, update, clear, isInCart, getItemKey }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
