'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  FileText,
  Percent,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Building,
  Sparkles
} from 'lucide-react'

// Layout Sidebar / Mobile Tab navigation list
const NAV_ITEMS = [
  { label: 'Overview', href: '/account', icon: User, matchExact: true },
  { label: 'Order History', href: '/account/orders', icon: ShoppingBag, matchExact: false },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin, matchExact: false },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart, matchExact: false },
  { label: 'Quote Requests', href: '/account/quotes', icon: FileText, matchExact: false },
  { label: 'Wholesale Pricing', href: '/account/pricing', icon: Percent, matchExact: false, wholesaleOnly: true },
  { label: 'Support Inquiries', href: '/account/support', icon: MessageSquare, matchExact: false },
  { label: 'Profile & Security', href: '/account/profile', icon: Settings, matchExact: false },
]

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Mobile tab nav: scroll container + edge-fade visibility
  const tabNavRef = useRef<HTMLElement>(null)
  const [tabFades, setTabFades] = useState({ left: false, right: false })

  const updateTabFades = useCallback(() => {
    const el = tabNavRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setTabFades({ left: el.scrollLeft > 4, right: el.scrollLeft < maxScroll - 4 })
  }, [])

  // Auth gate check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Keep the active mobile tab in view and the edge fades accurate.
  useEffect(() => {
    const el = tabNavRef.current
    if (!el) return
    el.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    updateTabFades()
    window.addEventListener('resize', updateTabFades)
    return () => window.removeEventListener('resize', updateTabFades)
  }, [pathname, isLoading, isAuthenticated, user?.role, updateTabFades])

  // Current active section for page titles and breadcrumbs — derived from NAV_ITEMS
  const activeItemLabel =
    NAV_ITEMS.find(item => (item.matchExact ? pathname === item.href : pathname.startsWith(item.href)))?.label
    ?? (pathname.startsWith('/account/orders/') ? 'Order Details' : 'Overview')

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="skeleton h-6 w-32 mb-6" />
          <div className="skeleton h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-11 w-full rounded-xl" />
              ))}
            </div>
            <div className="lg:col-span-3 skeleton h-96 w-full rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Filter sidebar items by wholesale eligibility
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.wholesaleOnly && user?.role !== 'wholesale') return false
    return true
  })

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* The "Demo Controls" role-switcher bar that lived here is gone: it was
          demo scaffolding shown to real customers, and its switchRole() calls
          pointed at a function that never existed (crashed on click). */}

      {/* ══ MAIN BODY ══ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4 flex items-center print-hide-when-invoice">
          <Link href="/">Home</Link>
          <ChevronRight className="breadcrumb-separator w-3 h-3 mx-1" />
          <Link href="/account">My Account</Link>
          {activeItemLabel !== 'Overview' && (
            <>
              <ChevronRight className="breadcrumb-separator w-3 h-3 mx-1" />
              <span className="breadcrumb-current">{activeItemLabel}</span>
            </>
          )}
        </div>

        {/* Heading */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print-hide-when-invoice">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Customer Account
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Manage your orders, quotes, addresses, and account details.
            </p>
          </div>

          {/* Mini-Profile card in Header */}
          <div className="flex items-center gap-3.5 bg-card border border-border p-3 rounded-2xl shadow-sm self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {user?.role === 'wholesale' ? (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Wholesale
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary border border-border rounded-md px-1.5 py-0.5 flex items-center gap-1">
                    <User className="w-3 h-3" /> Retail Customer
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2 block">
                Account Sections
              </span>
              {visibleNavItems.map(item => {
                const Icon = item.icon
                const isActive = item.matchExact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors group ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/10'
                        : 'text-slate-600 hover:text-primary hover:bg-secondary'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              <div className="h-px bg-secondary my-4" />

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer group"
              >
                <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Mobile Scrollable Horizontal Tab Navigation */}
          <div className="lg:hidden relative mb-2">
            <nav
              ref={tabNavRef}
              onScroll={updateTabFades}
              className="w-full overflow-x-auto scrollbar-none flex gap-1.5 bg-card border border-border p-1.5 rounded-2xl shadow-sm"
            >
              {visibleNavItems.map(item => {
                const Icon = item.icon
                const isActive = item.matchExact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 px-4 py-2.5 min-h-10 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-primary text-white shadow'
                        : 'text-slate-600 hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 min-h-10 rounded-xl text-xs font-bold whitespace-nowrap text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Edge fades — hint that cut-off tabs scroll into view */}
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-px left-px w-8 rounded-l-2xl bg-gradient-to-r from-card to-transparent transition-opacity duration-200 ${tabFades.left ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-px right-px w-8 rounded-r-2xl bg-gradient-to-l from-card to-transparent transition-opacity duration-200 ${tabFades.right ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>

          {/* Main content viewport */}
          <div className="lg:col-span-3 min-h-[500px]">
            {children}
          </div>
        </div>
      </main>

      <Footer />

      {/* Logout confirmation dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of your account? You will need to log back in to access order details, wholesale tiers, and inquiries."
        confirmLabel="Yes, Sign Out"
        cancelLabel="No, Keep Session"
        danger
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}
