'use client'

// Notification bell for the navbar (customers) and admin panel (shop team).
//
// "Live" via polling, deliberately: WebSockets would need a separate ASGI
// server and a process the host keeps alive, which is a lot of moving parts for
// a shop this size. A 45s poll that pauses while the tab is hidden is plenty
// for order and quote updates, and it survives any deployment target.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getNotifications, markNotificationsRead, type NotificationItem } from '@/lib/api'
import { useAuth } from '@/lib/auth'

const POLL_MS = 45_000

const ICONS: Record<string, string> = {
  order_placed: '🧾',
  order_cancelled: '⚠️',
  order_status: '🚚',
  return_requested: '↩️',
  quote_request: '📄',
  quote_ready: '💰',
  inquiry: '💬',
  inquiry_reply: '✅',
  new_product: '✨',
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}

export function NotificationBell({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await getNotifications()
      setItems(res.results || [])
      setUnread(res.unread || 0)
    } catch { /* offline — keep whatever is on screen */ }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) { setItems([]); setUnread(0); return }
    load()
    const id = setInterval(() => {
      // Don't poll a tab nobody is looking at.
      if (document.visibilityState === 'visible') load()
    }, POLL_MS)
    // Refresh the moment they come back to the tab.
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [isAuthenticated, load])

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!isAuthenticated) return null

  const openPanel = async () => {
    const next = !open
    setOpen(next)
    if (next) await load()
  }

  const handleMarkAll = async () => {
    setUnread(0)
    setItems(prev => prev.map(i => ({ ...i, is_read: true })))
    try { await markNotificationsRead() } catch { load() }
  }

  const handleClick = async (n: NotificationItem) => {
    setOpen(false)
    if (!n.is_read) {
      setUnread(u => Math.max(0, u - 1))
      setItems(prev => prev.map(i => (i.id === n.id ? { ...i, is_read: true } : i)))
      try { await markNotificationsRead([n.id]) } catch {}
    }
    if (n.link) router.push(n.link)
  }

  const iconTone = tone === 'dark'
    ? 'text-slate-300 hover:text-white hover:bg-white/10'
    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={openPanel}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
        className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${iconTone}`}
      >
        <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10px] font-black flex items-center justify-center border-2 border-card">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[330px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-2xl z-[120] overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold text-foreground">Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-[11px] font-semibold text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto overscroll-contain">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs font-semibold text-foreground">Nothing yet</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Order updates and new arrivals will show up here.
                </p>
              </div>
            ) : (
              items.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-border/60 last:border-0 transition-colors hover:bg-secondary/60 ${
                    n.is_read ? '' : 'bg-primary/5'
                  }`}
                >
                  <span className="text-base leading-none mt-0.5 shrink-0">{ICONS[n.kind] || '🔔'}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs leading-snug ${n.is_read ? 'font-semibold text-foreground' : 'font-bold text-foreground'}`}>
                      {n.title}
                    </span>
                    {n.body && (
                      <span className="block text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</span>
                    )}
                    <span className="block text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</span>
                  </span>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
