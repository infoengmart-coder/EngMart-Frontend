'use client'

/**
 * Store configuration provider.
 *
 * Values come from the backend (`/api/settings/`) so the client can edit contact
 * details, WhatsApp number, bank details etc. from the admin dashboard. The
 * static `SITE` object in lib/data.ts stays as the synchronous fallback so the
 * first paint — and any request where the API is unreachable — still renders
 * real contact details instead of empty `tel:` / `mailto:` links.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSiteSettings, type SiteSettingsData } from '@/lib/api'
import { SITE } from '@/lib/data'

/** Fallback built from the static SITE constant. */
const FALLBACK: SiteSettingsData = {
  id: 0,
  name: SITE.name,
  tagline: SITE.tagline,
  description: SITE.description,
  url: SITE.url,
  logo: null,
  phone: SITE.phone,
  mobile: SITE.mobile,
  email: SITE.email,
  address: SITE.address,
  hours: SITE.hours,
  hours_note: '',
  whatsapp: SITE.whatsapp,
  whatsapp_digits: SITE.whatsapp.replace(/[^0-9]/g, ''),
  map_embed_url: '',
  map_link_url: 'https://maps.google.com',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  twitter_url: '',
  youtube_url: '',
  cod_enabled: true,
  bank_transfer_enabled: true,
  mobile_wallet_enabled: false,
  whatsapp_order_enabled: true,
  bank_name: '',
  bank_account_title: '',
  bank_account_number: '',
  bank_iban: '',
  bank_branch: '',
  bank_swift: '',
  bank_name_2: '',
  bank_account_title_2: '',
  bank_account_number_2: '',
  bank_iban_2: '',
  bank_branch_2: '',
  bank_transfer_note: '',
  jazzcash_number: '',
  jazzcash_title: '',
  easypaisa_number: '',
  easypaisa_title: '',
  free_shipping_threshold: '50000',
  footer_payment_note: '',
  copyright_text: '',
}

type Ctx = {
  settings: SiteSettingsData
  loading: boolean
  /** Re-fetch after the admin saves changes. */
  refresh: () => Promise<void>
}

const SiteSettingsContext = createContext<Ctx>({
  settings: FALLBACK,
  loading: true,
  refresh: async () => {},
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsData>(FALLBACK)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await getSiteSettings()
      // Object spread would overwrite a default whenever the key is PRESENT —
      // including when the API sends an empty string, which the model does for
      // every unfilled field. Skip blanks explicitly so an unconfigured store
      // never renders `tel:` / `mailto:` / `wa.me/` with nothing after them.
      const merged: SiteSettingsData = { ...FALLBACK }
      for (const [key, value] of Object.entries(data)) {
        const isBlank = value === '' || value === null || value === undefined
        if (!isBlank) (merged as Record<string, unknown>)[key] = value
      }
      setSettings(merged)
    } catch {
      setSettings(FALLBACK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

/** Read store settings anywhere in the client tree. */
export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}

/** Build a wa.me link with a prefilled message using the configured number. */
export function whatsappLink(digits: string, message?: string) {
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
