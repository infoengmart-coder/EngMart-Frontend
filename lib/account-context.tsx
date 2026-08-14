'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useCart, CartItem } from './cart'
import { useAuth } from './auth'
import {
  getMyOrders, getMyQuotes, getWishlist, removeFromWishlist,
  getSavedAddresses, createSavedAddress, updateSavedAddress, deleteSavedAddress,
  cancelMyOrder, requestMyOrderReturn, submitInquiry, getMyInquiries,
  type OrderResponse, type QuotationData, type WishlistEntry, type SavedAddressData,
  type InquiryResponse,
} from './api'

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packaging' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested'

export type OrderItem = {
  slug: string
  /** Live catalog ids — null when the product was deleted after ordering,
   *  in which case the line renders from snapshots but cannot be reordered. */
  productId?: number | null
  variantId?: number | null
  name: string
  brand: string
  category: string
  catNo: string
  quantity: number
  price: number
  image?: string
}

export type Order = {
  id: string
  date: string
  items: OrderItem[]
  total: number
  subtotal: number
  shipping: number
  tax: number
  status: OrderStatus
  paymentStatus: 'Paid' | 'Unpaid' | 'COD'
  paymentMethod: string
  shippingAddress: Address
  billingAddress: Address
  courier?: string
  trackingNumber?: string
  trackingLink?: string
  timeline: { status: OrderStatus; timestamp: string }[]
}

export type Address = {
  id: string
  name: string
  company?: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode?: string
  country: string
  isDefault: boolean
}

export type QuoteStatus = 'Pending' | 'Quoted' | 'Accepted' | 'Expired'

export type QuoteItem = {
  slug: string
  name: string
  brand: string
  catNo: string
  quantity: number
  targetPrice?: number
  quotedPrice?: number
}

export type Quote = {
  id: string
  date: string
  items: QuoteItem[]
  status: QuoteStatus
  quotedTotal?: number
  notes?: string
}

export type Inquiry = {
  id: string
  date: string
  subject: string
  message: string
  status: 'Open' | 'Replied' | 'Resolved'
  replies: {
    sender: 'user' | 'admin'
    name: string
    message: string
    timestamp: string
  }[]
}

type AccountCtx = {
  orders: Order[]
  /** False until the API load has settled. Gate "not found" / empty states on
   *  this — orders start as [] and arrive async, so without the gate every
   *  direct visit to an order page flashes "Order Not Found" first. */
  ordersLoaded: boolean
  addresses: Address[]
  wishlist: string[] // product slugs
  /** Wishlist rows from the API, with full product data for rendering. */
  wishlistEntries: WishlistEntry[]
  quotes: Quote[]
  inquiries: Inquiry[]
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  cancelOrder: (id: string) => Promise<Order>
  requestReturn: (id: string) => Promise<Order>
  reorderItems: (orderItems: OrderItem[]) => void
  acceptQuote: (id: string) => void
  addInquiry: (subject: string, message: string) => Promise<void>
  toggleWishlist: (slug: string) => void
  isInWishlist: (slug: string) => boolean
}

const AccountContext = createContext<AccountCtx | null>(null)


/* ── Mappers: backend payloads → the shapes these account pages render ── */

function addressFromApi(a: SavedAddressData): Address {
  return {
    id: String(a.id),
    name: a.name,
    company: a.company || undefined,
    phone: a.phone,
    addressLine1: a.address_line1,
    addressLine2: a.address_line2 || undefined,
    city: a.city,
    province: a.province,
    postalCode: a.postal_code || undefined,
    country: a.country,
    isDefault: a.is_default,
  }
}

function addressToApi(a: Partial<Address>): Partial<SavedAddressData> {
  return {
    ...(a.name !== undefined ? { name: a.name } : {}),
    ...(a.company !== undefined ? { company: a.company } : {}),
    ...(a.phone !== undefined ? { phone: a.phone } : {}),
    ...(a.addressLine1 !== undefined ? { address_line1: a.addressLine1 } : {}),
    ...(a.addressLine2 !== undefined ? { address_line2: a.addressLine2 } : {}),
    ...(a.city !== undefined ? { city: a.city } : {}),
    ...(a.province !== undefined ? { province: a.province } : {}),
    ...(a.postalCode !== undefined ? { postal_code: a.postalCode } : {}),
    ...(a.country !== undefined ? { country: a.country } : {}),
    ...(a.isDefault !== undefined ? { is_default: a.isDefault } : {}),
  }
}

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Packaging',
  packaging: 'Packaging',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const PAYMENT_STATUS_MAP: Record<string, Order['paymentStatus']> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  partial: 'Unpaid',
  refunded: 'Unpaid',
  cod: 'COD',
}

const EMPTY_ADDRESS: Address = {
  id: 'shipping',
  name: '',
  phone: '',
  addressLine1: '',
  city: '',
  province: '',
  country: 'Pakistan',
  isDefault: true,
}

function apiOrderToAccountOrder(o: OrderResponse): Order {
  const address: Address = {
    ...EMPTY_ADDRESS,
    name: o.customer_name,
    company: o.company_name || undefined,
    phone: o.customer_phone,
    addressLine1: (o as any).shipping_address || '',
    city: (o as any).city || '',
  }
  const status = ORDER_STATUS_MAP[o.status] || 'Pending'
  return {
    id: o.order_number,
    // Pages render this string directly — keep the YYYY-MM-DD form the UI expects.
    date: (o.created_at || '').slice(0, 10),
    items: (o.items || []).map(i => ({
      slug: i.product_slug || '',
      productId: i.product_id ?? null,
      variantId: i.variant_id ?? null,
      name: i.product_name,
      brand: i.brand_name || '',
      category: '',
      catNo: i.cat_no || '',
      quantity: i.quantity,
      price: Number(i.unit_price) || 0,
      image: i.product_image || undefined,
    })),
    total: Number(o.total) || 0,
    subtotal: Number(o.subtotal) || 0,
    shipping: 0,
    tax: 0,
    status,
    paymentStatus:
      o.payment_method === 'cod' && o.payment_status !== 'paid'
        ? 'COD'
        : PAYMENT_STATUS_MAP[o.payment_status] || 'Unpaid',
    paymentMethod: o.payment_method,
    shippingAddress: address,
    billingAddress: address,
    timeline: [{ status, timestamp: o.created_at }],
  }
}

const QUOTE_STATUS_MAP: Record<string, QuoteStatus> = {
  pending: 'Pending',
  quoted: 'Quoted',
  converted: 'Accepted',
  expired: 'Expired',
}

const INQUIRY_STATUS_MAP: Record<string, Inquiry['status']> = {
  new: 'Open',
  read: 'Open',
  replied: 'Replied',
  closed: 'Resolved',
}

function apiInquiryToAccountInquiry(i: InquiryResponse): Inquiry {
  // The message is stored as "subject\n\nbody" (the contact form has no
  // separate subject field), so split it back for display.
  const raw = i.message || ''
  const sep = raw.indexOf('\n\n')
  const subject = i.product_interest || (sep > 0 ? raw.slice(0, sep) : raw.slice(0, 60))
  const body = sep > 0 ? raw.slice(sep + 2) : raw

  const replies: Inquiry['replies'] = [
    {
      sender: 'user',
      name: i.name,
      message: body,
      timestamp: (i.created_at || '').slice(0, 16).replace('T', ' '),
    },
  ]
  // `admin_reply` only — NOT `notes`, which is the shop's private working
  // remarks and must never be shown to the customer.
  if ((i as any).admin_reply) {
    replies.push({
      sender: 'admin',
      name: 'Eng-Mart Support',
      message: (i as any).admin_reply,
      timestamp: (((i as any).replied_at || (i as any).updated_at) || '').slice(0, 16).replace('T', ' '),
    })
  }

  return {
    id: `TKT-${i.id}`,
    date: (i.created_at || '').slice(0, 10),
    subject,
    message: body,
    status: INQUIRY_STATUS_MAP[i.status] || 'Open',
    replies,
  }
}

function apiQuoteToAccountQuote(q: QuotationData): Quote {
  return {
    id: q.quote_number,
    date: (q.created_at || '').slice(0, 10),
    items: (q.items || []).map(i => ({
      slug: '',
      name: i.product_name,
      brand: i.brand_name || '',
      catNo: i.cat_no || '',
      quantity: i.quantity,
      quotedPrice: i.quoted_price != null ? Number(i.quoted_price) : undefined,
    })),
    status: QUOTE_STATUS_MAP[q.status] || 'Pending',
    quotedTotal: Number(q.quoted_total) || undefined,
    notes: q.notes || undefined,
  }
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [wishlistEntries, setWishlistEntries] = useState<WishlistEntry[]>([])
  // True once we know a customer is signed in, so writes go to the API.
  const [authed, setAuthed] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const { add } = useCart()
  // Drives the API reload below — account data must follow the signed-in user.
  const { user } = useAuth()

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const getOrSet = (key: string, initial: any) => {
        const val = localStorage.getItem(key)
        if (val) return JSON.parse(val)
        localStorage.setItem(key, JSON.stringify(initial))
        return initial
      }

      // Empty defaults — never seed demo data. A guest who opens the account
      // area must see their own (empty) state, not a fabricated customer's.
      setOrders(getOrSet('engmart_orders', []))
      setAddresses(getOrSet('engmart_addresses', []))
      setWishlist(getOrSet('engmart_wishlist', []))
      setQuotes(getOrSet('engmart_quotes', []))
      setInquiries(getOrSet('engmart_inquiries', []))
    } catch {}
  }, [])

  // Replace the local placeholders with the signed-in customer's real orders
  // and quotes. Addresses / wishlist stay client-side for now — they have no
  // backend model yet.
  useEffect(() => {
    let cancelled = false

    async function loadFromApi() {
      // Show skeletons while a signed-in customer's data is being fetched,
      // instead of briefly rendering "no orders" with the previous state.
      setOrdersLoaded(false)
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('engmart_tokens')
      if (!hasToken) {
        // Signed out — never show a previous session's real data.
        setAuthed(false)
        localStorage.removeItem('engmart_orders')
        localStorage.removeItem('engmart_quotes')
        setOrders([])
        setQuotes([])
        setWishlistEntries([])
        setOrdersLoaded(true)
        return
      }

      setAuthed(true)
      try {
        const [orderRes, quoteRes, wishRes, addrRes, inqRes] = await Promise.all([
          getMyOrders().catch(() => null),
          getMyQuotes().catch(() => null),
          getWishlist().catch(() => null),
          getSavedAddresses().catch(() => null),
          getMyInquiries().catch(() => null),
        ])
        if (cancelled) return

        if (wishRes) {
          setWishlistEntries(wishRes)
          setWishlist(wishRes.map(w => w.product.slug))
        }
        if (addrRes) setAddresses(addrRes.map(addressFromApi))

        // Held in memory only. Persisting real orders would leave personal
        // data (addresses, phone numbers, totals) readable in this browser
        // after the customer signs out.
        if (orderRes) setOrders((orderRes.results || []).map(apiOrderToAccountOrder))
        if (quoteRes) setQuotes((quoteRes.results || []).map(apiQuoteToAccountQuote))
        if (inqRes) setInquiries((inqRes.results || []).map(apiInquiryToAccountInquiry))
      } catch {
        // Offline or API down — leave whatever is already in state.
      } finally {
        // Even on failure the load has settled; keep skeletons from spinning forever.
        if (!cancelled) setOrdersLoaded(true)
      }
    }

    loadFromApi()
    return () => { cancelled = true }
    // Re-run whenever the signed-in user changes.
    //
    // With an empty dependency array this ran ONCE, on mount — at which point
    // the visitor is signed out, so it loaded nothing and stopped. Logging in
    // updated the auth context but never re-triggered this, so the account
    // pages stayed empty until the user manually refreshed the page (which
    // remounted the provider). Keying on the user id also clears the previous
    // customer's data immediately on logout or account switch.
  }, [user?.id])

  const save = useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
  }, [])

  // Address Handlers
  const addAddress = useCallback((address: Omit<Address, 'id'>) => {
    // Signed in → persist to the API so the address survives a new device.
    if (authed) {
      createSavedAddress(addressToApi(address))
        .then(created => setAddresses(prev => {
          const mapped = addressFromApi(created)
          const others = mapped.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev
          return [...others, mapped]
        }))
        .catch(err => console.error('Failed to save address', err))
      return
    }
    setAddresses(prev => {
      const newAddress: Address = {
        ...address,
        id: `addr-${Date.now()}`,
        isDefault: prev.length === 0 ? true : address.isDefault
      }
      let updated = [...prev, newAddress]
      if (newAddress.isDefault) {
        updated = updated.map(a => a.id === newAddress.id ? a : { ...a, isDefault: false })
      }
      save('engmart_addresses', updated)
      return updated
    })
  }, [save])

  const updateAddress = useCallback((id: string, updatedFields: Partial<Address>) => {
    if (authed) {
      updateSavedAddress(Number(id), addressToApi(updatedFields))
        .then(updatedRow => setAddresses(prev => prev.map(a => {
          if (a.id === id) return addressFromApi(updatedRow)
          return updatedFields.isDefault ? { ...a, isDefault: false } : a
        })))
        .catch(err => console.error('Failed to update address', err))
      return
    }
    setAddresses(prev => {
      let updated = prev.map(a => a.id === id ? { ...a, ...updatedFields } : a)
      if (updatedFields.isDefault) {
        updated = updated.map(a => a.id === id ? a : { ...a, isDefault: false })
      }
      save('engmart_addresses', updated)
      return updated
    })
  }, [save])

  const deleteAddress = useCallback((id: string) => {
    if (authed) {
      deleteSavedAddress(Number(id))
        .then(() => setAddresses(prev => prev.filter(a => a.id !== id)))
        .catch(err => console.error('Failed to delete address', err))
      return
    }
    setAddresses(prev => {
      const deleted = prev.find(a => a.id === id)
      let updated = prev.filter(a => a.id !== id)
      if (deleted?.isDefault && updated.length > 0) {
        updated[0].isDefault = true
      }
      save('engmart_addresses', updated)
      return updated
    })
  }, [save])

  const setDefaultAddress = useCallback((id: string) => {
    if (authed) {
      updateSavedAddress(Number(id), { is_default: true })
        .then(() => setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id }))))
        .catch(err => console.error('Failed to set default address', err))
      return
    }
    setAddresses(prev => {
      const updated = prev.map(a => ({ ...a, isDefault: a.id === id }))
      save('engmart_addresses', updated)
      return updated
    })
  }, [save, authed])

  // Order Handlers
  /**
   * Cancel an order.
   *
   * These used to change React state only, so the shop never learned about a
   * cancellation and the order reverted to Pending on the next load. They now
   * call the API, which also emails the sales inbox, and return the server's
   * answer so the page can show a real error (e.g. "already shipped").
   */
  const cancelOrder = useCallback(async (id: string) => {
    const updated = await cancelMyOrder(id)
    const mapped = apiOrderToAccountOrder(updated)
    setOrders(prev => prev.map(o => (o.id === id ? mapped : o)))
    return mapped
  }, [])

  const requestReturn = useCallback(async (id: string) => {
    const updated = await requestMyOrderReturn(id)
    const mapped = apiOrderToAccountOrder(updated)
    setOrders(prev => prev.map(o => (o.id === id ? mapped : o)))
    return mapped
  }, [])

  // Reorder — rebuild cart lines from the live catalog references.
  const reorderItems = useCallback((orderItems: OrderItem[]) => {
    orderItems.forEach(item => {
      // A product deleted since the order can't be re-bought: checkout prices
      // every line from the catalog by id, so skip it rather than add a line
      // the server will reject.
      if (!item.productId) return
      add({
        slug: item.slug,
        productId: item.productId,
        variantId: item.variantId ?? null,
        name: item.name,
        brand: item.brand,
        category: item.category,
        catNo: item.catNo,
        image: item.image,
        unitPrice: item.price || 0,
        isPriceOnRequest: !(item.price > 0),
      }, item.quantity)
    })
  }, [add])

  // Quote Handlers
  const acceptQuote = useCallback((id: string) => {
    let orderToCreate: Order | null = null
    const defaultAddress: Address =
      addresses.find(a => a.isDefault) || addresses[0] || {
        id: 'none',
        name: '',
        phone: '',
        addressLine1: 'Address to be confirmed',
        city: '',
        province: '',
        country: 'Pakistan',
        isDefault: false,
      }

    setQuotes(prev => {
      const updated = prev.map(q => {
        if (q.id !== id) return q
        orderToCreate = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split('T')[0],
          items: q.items.map(item => ({
            slug: item.slug,
            name: item.name,
            brand: item.brand,
            category: 'Quoted Item',
            catNo: item.catNo,
            quantity: item.quantity,
            price: item.quotedPrice || 0,
          })),
          subtotal: q.quotedTotal || 0,
          shipping: 0,
          tax: 0,
          total: q.quotedTotal || 0,
          status: 'Confirmed',
          paymentStatus: 'COD',
          paymentMethod: 'Cash on Delivery (Quote Conversion)',
          // The customer's real default address — never a demo one.
          shippingAddress: defaultAddress,
          billingAddress: defaultAddress,
          timeline: [
            { status: 'Pending', timestamp: new Date().toLocaleString() },
            { status: 'Confirmed', timestamp: new Date().toLocaleString() }
          ]
        }
        return { ...q, status: 'Accepted' as QuoteStatus }
      })
      save('engmart_quotes', updated)
      return updated
    })

    if (orderToCreate) {
      setOrders(prev => {
        const updated = [orderToCreate!, ...prev]
        save('engmart_orders', updated)
        return updated
      })
    }
  }, [save])

  // Inquiries Handlers
  /**
   * Raise a support ticket.
   *
   * This used to build a fake ticket in local state with a random TKT number
   * and a hardcoded customer name — the shop never received anything. It now
   * posts to the real inquiries endpoint, which emails the sales inbox, then
   * re-reads the customer's tickets so the list shows the server's copy.
   */
  const addInquiry = useCallback(async (subject: string, message: string) => {
    await submitInquiry({
      name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Customer',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      company: (user as any)?.company || '',
      message: `${subject}\n\n${message}`,
      product_interest: subject,
    })
    const res = await getMyInquiries().catch(() => null)
    if (res) setInquiries((res.results || []).map(apiInquiryToAccountInquiry))
  }, [user])

  // Wishlist Handlers
  const toggleWishlist = useCallback((slug: string) => {
    // Signed in → remove server-side. The product id comes from the loaded
    // entries, since the UI only knows the slug.
    if (authed) {
      const entry = wishlistEntries.find(w => w.product.slug === slug)
      if (entry) {
        removeFromWishlist(entry.product.id)
          .then(() => {
            setWishlistEntries(prev => prev.filter(w => w.product.slug !== slug))
            setWishlist(prev => prev.filter(s => s !== slug))
          })
          .catch(err => console.error('Failed to update wishlist', err))
      }
      return
    }
    setWishlist(prev => {
      const exists = prev.includes(slug)
      const updated = exists ? prev.filter(s => s !== slug) : [...prev, slug]
      save('engmart_wishlist', updated)
      return updated
    })
  }, [save, authed, wishlistEntries])

  const isInWishlist = useCallback((slug: string) => wishlist.includes(slug), [wishlist])

  return (
    <AccountContext.Provider
      value={{
        orders,
        ordersLoaded,
        addresses,
        wishlist,
        wishlistEntries,
        quotes,
        inquiries,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        cancelOrder,
        requestReturn,
        reorderItems,
        acceptQuote,
        addInquiry,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within an AccountProvider')
  return ctx
}
