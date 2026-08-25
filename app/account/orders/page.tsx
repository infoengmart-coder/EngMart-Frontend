'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount, OrderStatus } from '@/lib/account-context'
import { mediaUrl } from '@/lib/api'
import { subscribeEngmartEvents } from '@/lib/events'
import {
  Search,
  ChevronRight,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Inbox
} from 'lucide-react'

// Color configs for status badges (matching Admin Orders Page)
const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; border: string; icon: any }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', icon: Clock },
  Confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/50', icon: CheckCircle2 },
  Packaging: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/50', icon: Package },
  Shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/50', icon: Truck },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: CheckCircle2 },
  Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/50', icon: AlertCircle },
  'Return Requested': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/50', icon: AlertCircle }
}

const TAB_OPTIONS: (OrderStatus | 'All')[] = [
  'All',
  'Pending',
  'Confirmed',
  'Packaging',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Return Requested'
]

export default function OrderHistory() {
  const { orders, ordersLoaded, refreshOrders } = useAccount()
  const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    refreshOrders()
    return subscribeEngmartEvents(() => {
      refreshOrders()
    })
  }, [refreshOrders])

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (activeTab !== 'All' && order.status !== activeTab) return false

    // Search query filter
    if (search.trim()) {
      const query = search.toLowerCase()
      const matchesId = order.id.toLowerCase().includes(query)
      const matchesItem = order.items.some(item =>
        item.name.toLowerCase().includes(query) || item.catNo.toLowerCase().includes(query)
      )
      return matchesId || matchesItem
    }

    return true
  })

  const hasActiveFilter = activeTab !== 'All' || search.trim() !== ''

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground leading-tight">Order History</h2>
          <p className="text-xs text-muted-foreground font-medium">Track shipping, request returns, and view invoice summaries.</p>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders by Order #, catalog number, or product name..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-lg bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Horizontal scrollable status tabs */}
        <div className="w-full overflow-x-auto scrollbar-none flex gap-1 border-b border-slate-100 pb-1">
          {TAB_OPTIONS.map(tab => {
            const count = tab === 'All'
              ? orders.length
              : orders.filter(o => o.status === tab).length

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 min-h-10 text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <span>{tab}</span>
                {ordersLoaded && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {!ordersLoaded ? (
          /* Skeleton rows shaped like real order cards while the API load settles */
          [0, 1, 2].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm" aria-hidden="true">
              <div className="bg-background/50 border-b border-slate-100 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-4 sm:gap-8">
                  <div className="space-y-1.5"><div className="skeleton h-2.5 w-16" /><div className="skeleton h-3.5 w-20" /></div>
                  <div className="space-y-1.5"><div className="skeleton h-2.5 w-16" /><div className="skeleton h-3.5 w-24" /></div>
                  <div className="hidden sm:block space-y-1.5"><div className="skeleton h-2.5 w-12" /><div className="skeleton h-3.5 w-20" /></div>
                </div>
                <div className="space-y-1.5"><div className="skeleton h-2.5 w-14" /><div className="skeleton h-3.5 w-24" /></div>
              </div>
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                  {[0, 1].map(j => (
                    <div key={j} className="flex gap-3 items-center">
                      <div className="skeleton w-12 h-12 rounded-lg shrink-0" />
                      <div className="space-y-1.5">
                        <div className="skeleton h-3 w-40 max-w-full" />
                        <div className="skeleton h-2.5 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                  <div className="skeleton h-6 w-24 rounded-full" />
                  <div className="skeleton h-10 w-28 rounded-lg" />
                </div>
              </div>
            </div>
          ))
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const badge = STATUS_CONFIG[order.status]
            const StatusIcon = badge.icon
            const fallbackImg = '/product-placeholder.svg'

            return (
              <div
                key={order.id}
                className="bg-card border border-border hover:border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-[border-color,box-shadow] group"
              >
                {/* Order Top Banner */}
                <div className="bg-background/50 border-b border-slate-100 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-muted-foreground">
                  <div className="flex gap-4 sm:gap-8">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Order Placed</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Total Cost</p>
                      <p className="text-foreground mt-0.5">PKR {order.total.toLocaleString('en-PK')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Ship To</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{order.shippingAddress.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">Order ID</p>
                    <p className="text-slate-950 font-extrabold mt-0.5">{order.id}</p>
                  </div>
                </div>

                {/* Items & Status Info */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Item previews */}
                  <div className="flex-1 space-y-3">
                    {order.items.slice(0, 2).map((item, idx) => {
                      const itemImg = item.image ? (mediaUrl(item.image) || fallbackImg) : fallbackImg
                      return (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-border shrink-0 p-1 flex items-center justify-center">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg }}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium font-mono mt-0.5">
                              {item.catNo} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {order.items.length > 2 && (
                      <p className="text-[10px] text-muted-foreground font-bold pl-15">
                        + {order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''} in this order
                      </p>
                    )}
                  </div>

                  {/* Right: Order Action & status badge */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.status}
                      </span>
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="px-4 py-2 text-[11px] font-bold rounded-lg border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      Track Order <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        ) : orders.length === 0 ? (
          /* Truly no orders yet */
          <div className="bg-card border border-border rounded-2xl text-center py-16 px-4">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-extrabold text-foreground">No orders yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
              You haven't placed an order yet. Orders you place will appear here with live status tracking.
            </p>
            <Link href="/products" className="btn-primary text-xs px-6 py-3 mt-5 inline-flex">
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Orders exist, but none match the active search/filter */
          <div className="bg-card border border-border rounded-2xl text-center py-16 px-4">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-extrabold text-foreground">No matching orders</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
              {search.trim()
                ? <>No orders match &ldquo;{search.trim()}&rdquo;{activeTab !== 'All' ? ` in ${activeTab}` : ''}. Try a different Order #, part number, or product name.</>
                : <>You have no orders with the &ldquo;{activeTab}&rdquo; status.</>}
            </p>
            {hasActiveFilter && (
              <button
                onClick={() => { setSearch(''); setActiveTab('All') }}
                className="btn-secondary text-xs px-6 py-3 mt-5 inline-flex"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
