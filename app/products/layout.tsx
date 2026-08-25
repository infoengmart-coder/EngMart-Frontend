import { pageMetadata, CORE_KEYWORDS } from '@/lib/seo'

// Metadata for a client-rendered page must live in a server layout — the page
// itself is 'use client' and cannot export `metadata`.
export const metadata = pageMetadata({
  title: 'Industrial Electrical Products Price in Pakistan — MCB, MCCB, ACB, Contactors',
  description:
    'Browse 4,700+ industrial electrical products with live prices. MCBs, MCCBs, ACBs, '
    + 'contactors, current transformers and panel meters from ABB, Siemens, Schneider, '
    + 'CHINT, Himel and Hyundai. Trade pricing, delivery across Pakistan.',
  path: '/products',
  // /products/[slug] etc. are children of this layout and need the suffix.
  childTitleTemplate: true,
  keywords: [
    ...CORE_KEYWORDS,
    'MCB price in Pakistan',
    'MCCB price in Pakistan',
    'ACB price Pakistan',
    'contactor price in Pakistan',
    'electrical products online Pakistan',
    'switchgear price list Pakistan',
  ],
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
