import type { Metadata } from 'next'

// Metadata for a client-rendered page must live in a server layout — the page
// itself is 'use client' and cannot export `metadata`. Without this the page
// inherited only the generic site title and competed for nothing.
export const metadata: Metadata = {
  title: 'Electrical Brands We Stock — ABB, CHINT, Himel, Schneider, Siemens',
  description:
    "Authorized supply of ABB, CHINT, Himel, FICO, PCE, Schneider Electric, Siemens, Hyundai, LS Electric and more. Genuine products with warranty, supplied across Pakistan from Karachi.",
  keywords: ['ABB dealer Pakistan', 'CHINT distributor Karachi', 'Himel Pakistan', 'Schneider Electric Karachi', 'Siemens electrical Pakistan', 'LS Electric Pakistan'],
  alternates: { canonical: '/brands' },
  openGraph: {
    title: 'Electrical Brands We Stock — ABB, CHINT, Himel, Schneider, Siemens | Eng-Mart',
    description: "Authorized supply of ABB, CHINT, Himel, FICO, PCE, Schneider Electric, Siemens, Hyundai, LS Electric and more. Genuine products with warranty, supplied across Pakistan from Karachi.",
    url: '/brands',
    siteName: 'Eng-Mart',
    locale: 'en_PK',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
