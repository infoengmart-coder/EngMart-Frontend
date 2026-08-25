import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Electrical Brands Price List Pakistan — ABB, Siemens, Schneider, CHINT, Himel',
  description:
    'Genuine supply of ABB, Siemens, Schneider Electric, CHINT, Himel, Hyundai, LS Electric, '
    + 'Fuji Electric, Lovato, Terasaki and 50+ more. Manufacturer warranty, trade prices, '
    + 'delivery across Pakistan.',
  path: '/brands',
  // /products/[slug] etc. are children of this layout and need the suffix.
  childTitleTemplate: true,
  keywords: [
    'ABB price list Pakistan',
    'Siemens electrical price Pakistan',
    'Schneider Electric price Pakistan',
    'CHINT distributor Karachi',
    'Himel Pakistan price',
    'LS Electric Pakistan',
    'Hyundai circuit breaker Pakistan',
  ],
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
