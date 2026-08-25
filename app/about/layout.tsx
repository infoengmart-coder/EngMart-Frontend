import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'About Us — Industrial Electrical Supplier in Karachi, Pakistan',
  description:
    'Eng-Mart supplies genuine industrial electrical equipment to contractors, panel builders '
    + 'and factories across Pakistan. 4,700+ products from 60+ global brands, with manufacturer '
    + 'warranty and technical support.',
  path: '/about',
  keywords: [
    'electrical supplier Karachi',
    'industrial electrical distributor Pakistan',
    'switchgear supplier Karachi',
    'panel builder supplier Pakistan',
  ],
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
