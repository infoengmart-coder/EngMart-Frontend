import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for purchasing industrial electrical products from Eng-Mart — pricing, payment by bank transfer, delivery within Pakistan, returns and warranty.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/terms`,
    title: 'Terms & Conditions | Eng-Mart',
    description: 'Terms governing orders and quotations from Eng-Mart, Karachi.',
    siteName: 'Eng-Mart',
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
