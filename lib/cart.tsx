// Simple cart store using localStorage + React context
'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type CartItem = {
  slug: string
  name: string
  brand: string
  category: string
  catNo: string
  badge: string
  badgeColor: string
  quantity: number
}

type CartCtx = {
  items: CartItem[]
  count: number
  add: (item: Omit<CartItem, 'quantity'>) => void
  remove: (slug: string) => void
  update: (slug: string, qty: number) => void
  clear: () => void
  isInCart: (slug: string) => boolean
}

const CartContext = createContext<CartCtx | null>(null)

const LS_KEY = 'engmart_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  // Persist on change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const exists = prev.find(i => i.slug === item.slug)
      if (exists) return prev.map(i => i.slug === item.slug ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const remove = useCallback((slug: string) => {
    setItems(prev => prev.filter(i => i.slug !== slug))
  }, [])

  const update = useCallback((slug: string, qty: number) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.slug === slug ? { ...i, quantity: qty } : i))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const isInCart = useCallback((slug: string) => items.some(i => i.slug === slug), [items])
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, add, remove, update, clear, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
