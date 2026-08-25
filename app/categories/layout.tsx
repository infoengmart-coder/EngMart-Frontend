import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Electrical Product Categories — Circuit Protection, Motor Control & Metering',
  description:
    'Shop by category: circuit protection (MCB, MCCB, ACB, RCCB), contactors and relays, '
    + 'motor control, metering, capacitors and industrial plugs and sockets. Genuine brands, '
    + 'priced and in stock for delivery across Pakistan.',
  path: '/categories',
  // /products/[slug] etc. are children of this layout and need the suffix.
  childTitleTemplate: true,
  keywords: [
    'electrical categories Pakistan',
    'circuit protection price Pakistan',
    'motor control products Pakistan',
    'metering products price Karachi',
    'MCB MCCB ACB RCCB Pakistan',
  ],
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
