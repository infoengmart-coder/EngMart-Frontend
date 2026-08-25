import type { Metadata } from 'next'

// Metadata for a client-rendered page must live in a server layout — the page
// itself is 'use client' and cannot export `metadata`. Without this the page
// inherited only the generic site title and competed for nothing.
export const metadata: Metadata = {
  title: 'Product Categories — Switchgear, Protection & Control',
  description:
    "Shop by category: circuit protection (MCB, MCCB, ACB, RCCB), contactors and relays, motor control, metering, capacitors, industrial plugs and sockets. Genuine brands, priced and in stock in Karachi.",
  keywords: ['electrical categories Pakistan', 'circuit protection Karachi', 'motor control Pakistan', 'metering products Pakistan'],
  alternates: { canonical: '/categories' },
  openGraph: {
    title: 'Product Categories — Switchgear, Protection & Control | Eng-Mart',
    description: "Shop by category: circuit protection (MCB, MCCB, ACB, RCCB), contactors and relays, motor control, metering, capacitors, industrial plugs and sockets. Genuine brands, priced and in stock in Karachi.",
    url: '/categories',
    siteName: 'Eng-Mart',
    locale: 'en_PK',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
