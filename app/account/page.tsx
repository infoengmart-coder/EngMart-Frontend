'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useAccount } from '@/lib/account-context'
import {
  ShoppingBag,
  Heart,
  FileText,
  MapPin,
  Settings,
  ArrowRight,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

// Simple status color/icon matching admin Orders status definitions
const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/50', icon: Clock },
  Confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/50', icon: CheckCircle2 },
  Packaging: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/50', icon: Package },
  Shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/50', icon: Truck },
  Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/50', icon: CheckCircle2 },
  Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200/50', icon: AlertCircle },
  'Return Requested': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200/50', icon: AlertCircle }
}

const FULFILLMENT_STEPS = ['Pending', 'Confirmed', 'Packaging', 'Shipped', 'Delivered']

export default function AccountOverview() {
  const { user } = useAuth()
  const { orders, wishlist, quotes, ordersLoaded } = useAccount()

  // Calculate statistics
  const totalOrders = orders.length
  const ordersInProgress = orders.filter(
    o => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length
  const wishlistCount = wishlist.length
  const activeQuotesCount = quotes.filter(q => q.status === 'Quoted' || q.status === 'Pending').length

  // Most recent order details
  const recentOrder = orders[0]

  // Config for status badge
  const recentOrderStatus = recentOrder?.status || 'Pending'
  const badgeConfig = STATUS_CONFIG[recentOrderStatus] || {
    bg: 'bg-secondary',
    text: 'text-slate-700',
    border: 'border-border/50',
    icon: Clock
  }
  const StatusIcon = badgeConfig.icon

  // Fulfillment progress as a 0–1 fraction (scaleX-driven bar)
  const fulfillmentIdx = FULFILLMENT_STEPS.indexOf(recentOrderStatus)
  const fulfillmentProgress = fulfillmentIdx > 0 ? fulfillmentIdx / (FULFILLMENT_STEPS.length - 1) : 0

  return (
    <div className="space-y-6">
      {/* ══ Welcome Card ══ */}
      <div className="panel-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--primary)_4%,transparent),transparent_60%)] pointer-events-none" />

        <div className="relative z-10">
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block mb-1">
            Account Dashboard
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
            Assalam-o-Alaikum, {user?.name}!
          </h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Logged in via <span className="text-foreground font-bold">{user?.email}</span>. Here's a summary of your account activity.
          </p>
        </div>
      </div>

      {/* ══ Stats Grid ══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {!ordersLoaded
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="panel-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton w-8 h-8 rounded-xl" />
                </div>
                <div className="skeleton h-7 w-12 mt-4" />
              </div>
            ))
          : [
              { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'In Progress', value: ordersInProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50' },
              { label: 'Saved Items', value: wishlistCount, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50/50' },
              { label: 'Active Quotes', value: activeQuotesCount, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50/50' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="panel-card p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-muted-foreground">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-foreground mt-4 leading-none">{stat.value}</p>
                </div>
              )
            })}
      </div>

      {/* ══ Recent Order Card ══ */}
      <div className="panel-card p-6">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Most Recent Order
          </h3>
          <Link href="/account/orders" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
            View All Orders <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {!ordersLoaded ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border border-border/50 p-4 rounded-2xl mb-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="skeleton h-14 w-full max-w-lg mb-5" />
            <div className="skeleton h-10 w-36" />
          </div>
        ) : recentOrder ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border border-border/50 p-4 rounded-2xl mb-4">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Order Number</p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{recentOrder.id}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Placed On</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{recentOrder.date}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Grand Total</p>
                <p className="text-sm font-extrabold text-foreground mt-0.5">PKR {recentOrder.total.toLocaleString('en-PK')}</p>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {recentOrder.status}
                </span>
              </div>
            </div>

            {/* Tracking Quick Timeline Preview */}
            <div className="mb-5 px-1 py-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase mb-3">Fulfillment Status</p>
              <div className="relative flex flex-row items-center justify-between w-full max-w-lg mx-auto sm:mx-0">
                {/* Visual horizontal track */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-secondary rounded z-0" />

                {/* Active progress indicator bar (scaleX — compositor-friendly) */}
                <div
                  className="absolute left-0 right-0 top-1/2 h-1 bg-primary rounded z-0 origin-left transition-transform duration-500"
                  style={{ transform: `translateY(-50%) scaleX(${fulfillmentProgress})` }}
                />

                {FULFILLMENT_STEPS.map((step, idx) => {
                  const currentIdx = FULFILLMENT_STEPS.indexOf(recentOrder.status)
                  const isCompleted = idx <= currentIdx && recentOrder.status !== 'Cancelled'

                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                        isCompleted
                          ? 'bg-primary border-primary text-white scale-110 shadow-sm'
                          : 'bg-card border-border text-muted-foreground'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold mt-1.5 hidden sm:block ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions for Recent Order */}
            <div className="flex items-center gap-3">
              <Link href={`/account/orders/${recentOrder.id}`} className="btn-primary text-xs px-5 py-2.5">
                Track Order
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No orders found.</p>
            <p className="text-xs text-muted-foreground mt-1">Start shopping from Pakistan's most trusted industrial catalog.</p>
            <Link href="/products" className="btn-primary text-xs px-5 py-2.5 mt-4 inline-flex">
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {/* ══ Shortcuts Grid ══ */}
      <div className="panel-card p-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 mb-4">
          Quick Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Purchase History', href: '/account/orders', desc: 'Orders & receipts', icon: ShoppingBag, color: 'text-primary bg-primary/10' },
            { label: 'Shipping Addresses', href: '/account/addresses', desc: 'Saved delivery details', icon: MapPin, color: 'text-emerald-500 bg-emerald-50' },
            { label: 'Saved Wishlist', href: '/account/wishlist', desc: 'Products you saved', icon: Heart, color: 'text-rose-500 bg-rose-50' },
            { label: 'Profile & Security', href: '/account/profile', desc: 'Security & options', icon: Settings, color: 'text-indigo-500 bg-indigo-50' }
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <Link key={index} href={item.href} className="group border border-border hover:border-primary/20 hover:bg-secondary/40 p-4 rounded-2xl transition-colors shadow-sm">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-foreground leading-tight mb-1">{item.label}</p>
                <p className="text-[10px] text-muted-foreground font-medium leading-none">{item.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
