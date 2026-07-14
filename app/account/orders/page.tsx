'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAccount, OrderStatus } from '@/lib/account-context'
import {
  Search,
  ChevronRight,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
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
  const { orders } = useAccount()
  const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All')
  const [search, setSearch] = useState('')

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Order History</h2>
          <p className="text-xs text-slate-500 font-medium">Track shipping, request returns, and view invoice summaries.</p>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders by Order #, catalog number, or product name..."
            className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium"
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
                className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const badge = STATUS_CONFIG[order.status]
            const StatusIcon = badge.icon
            const itemsCount = order.items.reduce((acc, item) => acc + item.quantity, 0)
            const fallbackImg = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200'

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 hover:border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all group"
              >
                {/* Order Top Banner */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
                  <div className="flex gap-4 sm:gap-8">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Order Placed</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Total Cost</p>
                      <p className="text-slate-900 mt-0.5">PKR {order.total.toLocaleString('en-PK')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Ship To</p>
                      <p className="text-slate-800 font-semibold mt-0.5">{order.shippingAddress.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase">Order ID</p>
                    <p className="text-slate-950 font-extrabold mt-0.5">{order.id}</p>
                  </div>
                </div>

                {/* Items & Status Info */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Item previews */}
                  <div className="flex-1 space-y-3">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-150 flex-shrink-0">
                          <img
                            src={item.image || fallbackImg}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium font-mono mt-0.5">
                            {item.catNo} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-[10px] text-slate-400 font-bold pl-15">
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
                      className="btn-secondary text-[11px] font-bold px-4 py-2 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-1"
                    >
                      Track Order <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl text-center py-16 px-4">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-extrabold text-slate-900">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              We couldn't find any orders matching "{search || activeTab}". Start adding premium industrial switchgear to your cart.
            </p>
            <Link href="/products" className="btn-primary text-xs px-6 py-3 mt-5 inline-flex">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
