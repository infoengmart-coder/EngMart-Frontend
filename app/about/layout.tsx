import type { Metadata } from 'next'

// Metadata for a client-rendered page must live in a server layout — the page
// itself is 'use client' and cannot export `metadata`. Without this the page
// inherited only the generic site title and competed for nothing.
export const metadata: Metadata = {
  title: 'About Eng-Mart — Industrial Electrical Supplier in Karachi',
  description:
    "Eng-Mart supplies genuine industrial electrical equipment to contractors, panel builders and factories across Pakistan. Based in Sarafa Bazar, Karachi.",
  keywords: ['electrical supplier Karachi', 'industrial electrical distributor Pakistan', 'switchgear supplier Karachi'],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Eng-Mart — Industrial Electrical Supplier in Karachi | Eng-Mart',
    description: "Eng-Mart supplies genuine industrial electrical equipment to contractors, panel builders and factories across Pakistan. Based in Sarafa Bazar, Karachi.",
    url: '/about',
    siteName: 'Eng-Mart',
    locale: 'en_PK',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
