import type { Metadata } from 'next'

// Metadata for a client-rendered page must live in a server layout — the page
// itself is 'use client' and cannot export `metadata`. Without this the page
// inherited only the generic site title and competed for nothing.
export const metadata: Metadata = {
  title: 'Industrial Electrical Products in Pakistan — MCB, MCCB, ACB, Contactors',
  description:
    "Browse 4,700+ industrial electrical products with prices. MCBs, MCCBs, ACBs, contactors, current transformers and panel meters from ABB, CHINT, Himel, Schneider, Siemens and more. Karachi-based, delivery across Pakistan.",
  keywords: ['industrial electrical products Pakistan', 'MCB price Pakistan', 'MCCB price Karachi', 'ACB Pakistan', 'contactor price Pakistan', 'switchgear Karachi', 'electrical products online Pakistan'],
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Industrial Electrical Products in Pakistan — MCB, MCCB, ACB, Contactors | Eng-Mart',
    description: "Browse 4,700+ industrial electrical products with prices. MCBs, MCCBs, ACBs, contactors, current transformers and panel meters from ABB, CHINT, Himel, Schneider, Siemens and more. Karachi-based, delivery across Pakistan.",
    url: '/products',
    siteName: 'Eng-Mart',
    locale: 'en_PK',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
