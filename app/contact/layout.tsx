import type { Metadata } from 'next'

// Metadata for a client-rendered page must live in a server layout — the page
// itself is 'use client' and cannot export `metadata`. Without this the page
// inherited only the generic site title and competed for nothing.
export const metadata: Metadata = {
  title: 'Contact Eng-Mart — Get a Quote on Industrial Electrical Products',
  description:
    "Request a quotation or bulk pricing on industrial electrical products. Call +92-21-32763951, WhatsApp us, or send an enquiry. Shop No. 5, Pak Chamber, Sarafa Bazar, Karachi.",
  keywords: ['electrical supplier contact Karachi', 'request quote electrical Pakistan', 'bulk electrical pricing Pakistan'],
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Eng-Mart — Get a Quote on Industrial Electrical Products | Eng-Mart',
    description: "Request a quotation or bulk pricing on industrial electrical products. Call +92-21-32763951, WhatsApp us, or send an enquiry. Shop No. 5, Pak Chamber, Sarafa Bazar, Karachi.",
    url: '/contact',
    siteName: 'Eng-Mart',
    locale: 'en_PK',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
