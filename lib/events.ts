/**
 * Cross-tab real-time event bus for Eng-Mart.
 * Uses localStorage `storage` event (fires in ALL other tabs reliably)
 * + CustomEvent for same-tab listeners.
 * No timers, no polling — purely event-driven.
 */

export type EngmartEvent = 'ORDER_CREATED' | 'ORDER_UPDATED' | 'CUSTOMER_UPDATED'
const STORAGE_KEY = 'engmart_evt'

export function emitEngmartEvent(type: EngmartEvent = 'ORDER_CREATED', data?: any) {
  if (typeof window === 'undefined') return
  try {
    // Write a unique value each time so the storage event always fires
    const payload = JSON.stringify({ type, ts: Date.now(), data })
    localStorage.setItem(STORAGE_KEY, payload)
    // Same-tab: storage event doesn't fire for the originating tab, so dispatch manually
    window.dispatchEvent(new CustomEvent('engmart:sync', { detail: { type, data } }))
  } catch {}
}

export function subscribeEngmartEvents(
  callback: (type: EngmartEvent, data?: any) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  // Other tabs pick up changes via storage event
  const handleStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return
    try {
      const { type, data } = JSON.parse(e.newValue)
      callback(type as EngmartEvent, data)
    } catch {
      callback('ORDER_CREATED')
    }
  }

  // Same tab picks up changes via CustomEvent
  const handleCustom = (e: Event) => {
    const d = (e as CustomEvent).detail
    callback((d?.type as EngmartEvent) || 'ORDER_CREATED', d?.data)
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener('engmart:sync', handleCustom)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener('engmart:sync', handleCustom)
  }
}
