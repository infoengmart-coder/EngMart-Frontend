'use client'

/**
 * "WhatsApp Us" call-to-action button.
 *
 * Exists as its own client component so the homepage — a server component —
 * can still read the WhatsApp number from Site Settings. It previously had the
 * number hardcoded into the href, which is how the storefront ended up showing
 * a number the client did not recognise: editing it in the admin panel changed
 * every other page and quietly left this one behind.
 */

import { useSiteSettings, whatsappLink } from '@/lib/site-settings'

export function WhatsAppCta({
  message,
  label = 'WhatsApp Us',
  className = '',
}: {
  message?: string
  label?: string
  className?: string
}) {
  const { settings } = useSiteSettings()

  // No number configured means no button, rather than a wa.me link to nowhere.
  if (!settings.whatsapp_digits) return null

  return (
    <a
      href={whatsappLink(
        settings.whatsapp_digits,
        message || `Hi ${settings.name}, I need a quote for electrical products.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${settings.name} on WhatsApp`}
      className={
        className ||
        'inline-flex items-center gap-2 bg-[var(--color-whatsapp)] hover:opacity-90 text-white font-bold px-7 py-3 rounded-lg transition-opacity shadow-lg text-sm'
      }
    >
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2a10 10 0 00-8.49 15.27L2 22l4.87-1.49A10 10 0 1012 2z" />
      </svg>
      {label}
    </a>
  )
}
