'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useCart, CartItem } from './cart'

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packaging' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested'

export type OrderItem = {
  slug: string
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
  addresses: Address[]
  wishlist: string[] // product slugs
  quotes: Quote[]
  inquiries: Inquiry[]
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  cancelOrder: (id: string) => void
  requestReturn: (id: string) => void
  reorderItems: (orderItems: OrderItem[]) => void
  acceptQuote: (id: string) => void
  addInquiry: (subject: string, message: string) => void
  toggleWishlist: (slug: string) => void
  isInWishlist: (slug: string) => boolean
}

const AccountContext = createContext<AccountCtx | null>(null)

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'Engr. Kamran Ahmed',
    company: 'KA Electrical Works',
    phone: '+92-300-1234567',
    addressLine1: 'Suite 204, 2nd Floor, Progressive Plaza',
    addressLine2: 'Beaumont Road, Civil Lines',
    city: 'Karachi',
    province: 'Sindh',
    postalCode: '75530',
    country: 'Pakistan',
    isDefault: true,
  },
  {
    id: 'addr-2',
    name: 'Kamran Ahmed (Factory)',
    company: 'KA Electrical Works (Site office)',
    phone: '+92-311-2763951',
    addressLine1: 'Plot C-32, Korangi Industrial Area',
    addressLine2: 'Near Sector 15',
    city: 'Karachi',
    province: 'Sindh',
    postalCode: '74900',
    country: 'Pakistan',
    isDefault: false,
  }
]

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-1047',
    date: '2026-07-12',
    items: [
      { slug: 'chint-nxb63-mcb', name: 'CHINT NXB-63 MCB', brand: 'CHINT', category: 'MCBs', catNo: 'NXB-63', quantity: 24, price: 420 },
      { slug: 'abb-sh201-mcb', name: 'ABB SH201 MCB', brand: 'ABB', category: 'MCBs', catNo: 'SH201-C16', quantity: 10, price: 850 }
    ],
    subtotal: 18580,
    shipping: 500,
    tax: 0,
    total: 19080,
    status: 'Pending',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Bank Transfer (Awaiting Confirmation)',
    shippingAddress: MOCK_ADDRESSES[0],
    billingAddress: MOCK_ADDRESSES[0],
    timeline: [
      { status: 'Pending', timestamp: '2026-07-12 04:30 PM' }
    ]
  },
  {
    id: 'ORD-1046',
    date: '2026-07-11',
    items: [
      { slug: 'himel-hdm3-mccb', name: 'Himel HDM3 MCCB', brand: 'Himel', category: 'MCCBs', catNo: 'HDM3-125', quantity: 8, price: 8500 },
      { slug: 'abb-ax-contactor', name: 'ABB AX-Series Contactor', brand: 'ABB', category: 'Contactors', catNo: 'AX09-30-10', quantity: 4, price: 3200 }
    ],
    subtotal: 80800,
    shipping: 0, // Free over 50k
    tax: 0,
    total: 80800,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card / Visa',
    shippingAddress: MOCK_ADDRESSES[0],
    billingAddress: MOCK_ADDRESSES[0],
    timeline: [
      { status: 'Pending', timestamp: '2026-07-11 11:15 AM' },
      { status: 'Confirmed', timestamp: '2026-07-11 02:45 PM' }
    ]
  },
  {
    id: 'ORD-1043',
    date: '2026-07-09',
    items: [
      { slug: 'tense-dja96-ammeter', name: 'Tense DJA-96 Ammeter', brand: 'Tense', category: 'Panel Meters', catNo: 'DJA-96', quantity: 3, price: 2800 },
      { slug: 'pce-industrial-socket', name: 'PCE Industrial Socket', brand: 'PCE', category: 'Industrial Sockets', catNo: 'IP44-16A-3P', quantity: 5, price: 1800 }
    ],
    subtotal: 17400,
    shipping: 500,
    tax: 0,
    total: 17900,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash on Delivery (COD)',
    shippingAddress: MOCK_ADDRESSES[1],
    billingAddress: MOCK_ADDRESSES[0],
    courier: 'Leopards Courier',
    trackingNumber: 'LPD-98745612',
    trackingLink: 'https://www.leopardscourier.com/',
    timeline: [
      { status: 'Pending', timestamp: '2026-07-09 09:30 AM' },
      { status: 'Confirmed', timestamp: '2026-07-09 10:15 AM' },
      { status: 'Packaging', timestamp: '2026-07-09 02:00 PM' },
      { status: 'Shipped', timestamp: '2026-07-09 04:30 PM' },
      { status: 'Delivered', timestamp: '2026-07-10 11:00 AM' }
    ]
  }
]

const MOCK_QUOTES: Quote[] = [
  {
    id: 'RFQ-2041',
    date: '2026-07-12',
    items: [
      { slug: 'abb-emax-acb', name: 'ABB E-Max ACB', brand: 'ABB', catNo: 'EX-1200', quantity: 2, targetPrice: 150000 }
    ],
    status: 'Pending',
    notes: 'Please quote with drawing attachments and extra auxiliary contact blocks.'
  },
  {
    id: 'RFQ-2040',
    date: '2026-07-10',
    items: [
      { slug: 'kondas-znpp-capacitor', name: 'Kondas ZNPP Capacitor', brand: 'Kondas', catNo: 'ZNPP-25', quantity: 20, targetPrice: 4500, quotedPrice: 4100 },
      { slug: 'tense-star-delta-timer', name: 'Tense Star-Delta Timer', brand: 'Tense', catNo: 'SD-T1', quantity: 10, targetPrice: 3300, quotedPrice: 3100 }
    ],
    status: 'Quoted',
    quotedTotal: 113000,
    notes: 'Volume discount pricing applied. Valid for 7 working days.'
  }
]

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 'TKT-3012',
    date: '2026-07-11',
    subject: 'CHINT MCB stock availability',
    message: 'Hi, I need 100 units of CHINT NXB-63 32A 3P MCBs. Do you have this ready stock in Karachi?',
    status: 'Replied',
    replies: [
      { sender: 'user', name: 'Engr. Kamran Ahmed', message: 'Hi, I need 100 units of CHINT NXB-63 32A 3P MCBs. Do you have this ready stock in Karachi?', timestamp: '2026-07-11 10:00 AM' },
      { sender: 'admin', name: 'Eng-Mart Sales', message: 'Yes, we have 150 units of the NXB-63 32A 3P in stock at our Sarafa Bazar warehouse. You can purchase directly online or we can issue a formal B2B invoice.', timestamp: '2026-07-11 04:00 PM' }
    ]
  },
  {
    id: 'TKT-3011',
    date: '2026-07-08',
    subject: 'Warranty claims for Tense Relay',
    message: 'One of the voltage relays model PR-100 is not tripping properly. It is under warranty. How do I claim replacement?',
    status: 'Resolved',
    replies: [
      { sender: 'user', name: 'Engr. Kamran Ahmed', message: 'One of the voltage relays model PR-100 is not tripping properly. It is under warranty. How do I claim replacement?', timestamp: '2026-07-08 09:15 AM' },
      { sender: 'admin', name: 'Eng-Mart Support', message: 'Please send or bring the relay to our Karachi shop. We will inspect it and issue a new replacement on the spot. Make sure to bring the invoice copy.', timestamp: '2026-07-08 11:30 AM' }
    ]
  }
]

const MOCK_WISHLIST = ['chint-nxb63-mcb', 'abb-sh201-mcb', 'himel-hdm3-mccb']

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const { add } = useCart()

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const getOrSet = (key: string, initial: any) => {
        const val = localStorage.getItem(key)
        if (val) return JSON.parse(val)
        localStorage.setItem(key, JSON.stringify(initial))
        return initial
      }

      setOrders(getOrSet('engmart_orders', MOCK_ORDERS))
      setAddresses(getOrSet('engmart_addresses', MOCK_ADDRESSES))
      setWishlist(getOrSet('engmart_wishlist', MOCK_WISHLIST))
      setQuotes(getOrSet('engmart_quotes', MOCK_QUOTES))
      setInquiries(getOrSet('engmart_inquiries', MOCK_INQUIRIES))
    } catch {}
  }, [])

  const save = useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
  }, [])

  // Address Handlers
  const addAddress = useCallback((address: Omit<Address, 'id'>) => {
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
    setAddresses(prev => {
      const updated = prev.map(a => ({ ...a, isDefault: a.id === id }))
      save('engmart_addresses', updated)
      return updated
    })
  }, [save])

  // Order Handlers
  const cancelOrder = useCallback((id: string) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id !== id) return o
        const timestamp = new Date().toLocaleString('en-US', { hour12: true })
        return {
          ...o,
          status: 'Cancelled' as OrderStatus,
          timeline: [...o.timeline, { status: 'Cancelled' as OrderStatus, timestamp }]
        }
      })
      save('engmart_orders', updated)
      return updated
    })
  }, [save])

  const requestReturn = useCallback((id: string) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id !== id) return o
        const timestamp = new Date().toLocaleString('en-US', { hour12: true })
        return {
          ...o,
          status: 'Return Requested' as OrderStatus,
          timeline: [...o.timeline, { status: 'Return Requested' as OrderStatus, timestamp }]
        }
      })
      save('engmart_orders', updated)
      return updated
    })
  }, [save])

  // Reorder
  const reorderItems = useCallback((orderItems: OrderItem[]) => {
    orderItems.forEach(item => {
      add({
        slug: item.slug,
        name: item.name,
        brand: item.brand,
        category: item.category,
        catNo: item.catNo,
        badge: '',
        badgeColor: '',
      })
    })
  }, [add])

  // Quote Handlers
  const acceptQuote = useCallback((id: string) => {
    let orderToCreate: Order | null = null

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
          shippingAddress: MOCK_ADDRESSES[0],
          billingAddress: MOCK_ADDRESSES[0],
          timeline: [
            { status: 'Pending', timestamp: new Date().toLocaleString() },
            { status: 'Confirmed', timestamp: new Date().toLocaleString() }
          ]
        }
        return { ...q, status: 'Accepted' }
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
  const addInquiry = useCallback((subject: string, message: string) => {
    setInquiries(prev => {
      const newInquiry: Inquiry = {
        id: `TKT-${Math.floor(3000 + Math.random() * 1000)}`,
        date: new Date().toISOString().split('T')[0],
        subject,
        message,
        status: 'Open',
        replies: [
          {
            sender: 'user',
            name: 'Engr. Kamran Ahmed',
            message,
            timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
      const updated = [newInquiry, ...prev]
      save('engmart_inquiries', updated)
      return updated
    })
  }, [save])

  // Wishlist Handlers
  const toggleWishlist = useCallback((slug: string) => {
    setWishlist(prev => {
      const exists = prev.includes(slug)
      const updated = exists ? prev.filter(s => s !== slug) : [...prev, slug]
      save('engmart_wishlist', updated)
      return updated
    })
  }, [save])

  const isInWishlist = useCallback((slug: string) => wishlist.includes(slug), [wishlist])

  return (
    <AccountContext.Provider
      value={{
        orders,
        addresses,
        wishlist,
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
