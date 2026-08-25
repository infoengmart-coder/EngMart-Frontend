import type { Metadata } from 'next'
import { BreadcrumbStructuredData } from '@/components/structured-data'
import { SITE_NAME, clampDescription, freshnessStamp, pageMetadata } from '@/lib/seo'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getBrand(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/brands/${slug}/`, { next: { revalidate: 600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug)
  const path = `/brands/${slug}`

  if (!brand) {
    return pageMetadata({
      title: 'Brand Not Found',
      description: `Browse every brand stocked by ${SITE_NAME}.`,
      path,
      noindex: true,
    })
  }

  const count = brand.product_count ?? 0
  const categories: string[] = (brand.categories || [])
    .map((c: { name: string }) => c.name)
    .slice(0, 4)

  // "ABB Price List in Pakistan — Updated August 2026". The competing pages
  // that own these queries are titled "ABB Official Price in Pakistan
  // Updated <Month Year>", so this matches the intent without copying them.
  const title = `${brand.name} Price List in Pakistan — Updated ${freshnessStamp()}`

  const description = clampDescription(
    `${count > 0 ? `${count.toLocaleString('en-PK')} genuine ${brand.name} products` : `Genuine ${brand.name} products`}`
    + `${categories.length ? ` — ${categories.join(', ')}` : ''}`
    + `${brand.origin_country ? `. Made in ${brand.origin_country}` : ''}. `
    + 'Trade prices, Karachi stock, delivery across Pakistan.',
  )

  return pageMetadata({
    title,
    description,
    path,
    keywords: [
      `${brand.name} price in Pakistan`,
      `${brand.name} price list`,
      `${brand.name} Karachi`,
      `${brand.name} distributor Pakistan`,
      `${brand.name} MCB MCCB price`,
    ],
  })
}

export default async function BrandLayout({ children, params }: Props) {
  const { slug } = await params
  const brand = await getBrand(slug)

  return (
    <>
      {brand && (
        <BreadcrumbStructuredData
          items={[
            { name: 'Home', url: '/' },
            { name: 'Brands', url: '/brands' },
            { name: brand.name, url: `/brands/${slug}` },
          ]}
        />
      )}
      {children}
    </>
  )
}
