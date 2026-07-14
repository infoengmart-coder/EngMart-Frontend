'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
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
  ShieldCheck,
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

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, switchRole, logout, isAuthenticated, isLoading } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [activeItemLabel, setActiveItemLabel] = useState('Overview')

  // Auth gate check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Determine current active section for page titles and breadcrumbs
  useEffect(() => {
    const active = NAV_ITEMS.find(item => {
      if (item.matchExact) {
        return pathname === item.href
      }
      return pathname.startsWith(item.href)
    })
    if (active) {
      setActiveItemLabel(active.label)
    } else if (pathname.startsWith('/account/orders/')) {
      setActiveItemLabel('Order Details')
    }
  }, [pathname])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
          <div className="h-10 w-64 bg-slate-200 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-11 bg-slate-200 rounded-xl w-full" />
              ))}
            </div>
            <div className="lg:col-span-3 h-96 bg-slate-200 rounded-2xl w-full" />
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />

      {/* ══ DEMO PROFILE BAR (Fixed top helper) ══ */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary text-white text-xs py-2.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              Demo Controls:
            </span>
            <span>Active Profile is <strong>{user?.name}</strong> ({user?.role === 'wholesale' ? 'Wholesale Account' : 'Retail Account'})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60">Switch to check layouts:</span>
            <button
              onClick={() => switchRole('retail')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                user?.role === 'retail'
                  ? 'bg-white text-blue-600 shadow'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Retail Buyer
            </button>
            <button
              onClick={() => switchRole('wholesale')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                user?.role === 'wholesale'
                  ? 'bg-white text-blue-600 shadow'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Wholesale / B2B
            </button>
          </div>
        </div>
      </div>

      {/* ══ MAIN BODY ══ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4 flex items-center">
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              Customer Account
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Manage your orders, quotes, addresses, and account details.
            </p>
          </div>

          {/* Mini-Profile card in Header */}
          <div className="flex items-center gap-3.5 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {user?.role === 'wholesale' ? (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Wholesale
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5 flex items-center gap-1">
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
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 block">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/10'
                        : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              <div className="h-px bg-slate-100 my-4" />

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer group"
              >
                <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Mobile Scrollable Horizontal Tab Navigation */}
          <nav className="lg:hidden w-full overflow-x-auto scrollbar-none flex gap-1.5 bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm mb-2">
            {visibleNavItems.map(item => {
              const Icon = item.icon
              const isActive = item.matchExact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </nav>

          {/* Main content viewport */}
          <div className="lg:col-span-3 min-h-[500px]">
            {children}
          </div>
        </div>
      </main>

      <Footer />

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 text-xl mb-5">
              ⚠️
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Confirm Sign Out</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to sign out of your account? You will need to log back in to access order details, wholesale tiers, and inquiries.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-secondary text-xs py-3 justify-center"
              >
                No, Keep Session
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 btn-primary text-xs py-3 bg-rose-600 hover:bg-rose-700 text-white border-0 justify-center shadow-rose-200"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
