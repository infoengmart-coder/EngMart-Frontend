'use client'

// =============================================================
// Shared confirmation dialog + body scroll lock.
// Replaces native confirm()/alert() calls so destructive actions
// (cancel order, delete address, clear cart…) get a consistent,
// token-styled, touch-friendly dialog everywhere.
// =============================================================

import { useEffect, useRef } from 'react'

/**
 * Locks body scroll while `active` is true. Shared by every overlay
 * (this dialog, the navbar drawer, the address modal) so overlays never
 * scroll the page behind them. Restores the previous overflow value and
 * compensates for the scrollbar so the page doesn't shift sideways.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [active])
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** Renders the confirm button in destructive red. Default true — most uses are destructive. */
  danger?: boolean
  /** Disables both buttons and shows a spinner while the action runs. */
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = true,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useScrollLock(open)
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Esc closes; focus lands on the confirm button when opened.
  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={busy ? undefined : onClose}
      />

      {/* Panel — bottom sheet on mobile, centered card on larger screens */}
      <div className="relative w-full sm:max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 sm:p-6 animate-scale-in">
        <h2 id="confirm-dialog-title" className="text-base font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{message}</p>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-secondary flex-1 min-h-11 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            onClick={onConfirm}
            disabled={busy}
            className={`${danger ? 'btn-danger' : 'btn-primary'} flex-1 min-h-11 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {busy ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-label="Working…" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
