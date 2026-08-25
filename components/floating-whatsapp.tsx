'use client'

import { usePathname } from 'next/navigation'
import { useSiteSettings, whatsappLink } from '@/lib/site-settings'

/**
 * Floating WhatsApp button shown on storefront pages.
 * Hidden on admin screens.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname()
  const { settings } = useSiteSettings()

  if (pathname?.startsWith('/admin')) return null
  if (!settings.whatsapp_digits) return null

  const href = whatsappLink(
    settings.whatsapp_digits,
    `Hi ${settings.name}, I need help with electrical products.`,
  )

  return (
    // Lifted above the mobile safe area and pushed up on small screens so it
    // never covers a page's sticky bottom action bar — on checkout it sat
    // directly on top of "Place Order" and swallowed the tap, so the button
    // looked dead. z-30 keeps it BELOW any sticky CTA (z-40).
    <div className="wa-wrap fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-3">
      {/* Tooltip */}
      <div className="wa-tooltip bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
        💬 Chat with us on WhatsApp
        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-slate-900" />
      </div>

      {/* WhatsApp Button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${settings.name} on WhatsApp`}
        className="wa-btn w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 hover:scale-110"
        style={{ backgroundColor: 'var(--color-whatsapp)' }}
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* White Speech Bubble Shape */}
          <path
            d="M12.003 2.002a9.999 9.999 0 00-8.49 15.27L2 22l4.87-1.49a9.993 9.993 0 005.131 1.41 10 10 0 000-20z"
            fill="white"
          />
          {/* Green Telephone Icon Shape */}
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
            fill="var(--color-whatsapp)"
          />
        </svg>
      </a>
    </div>
  )
}
