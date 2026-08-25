import type { Metadata } from 'next'
import { BreadcrumbStructuredData } from '@/components/structured-data'
import {
  CATEGORY_KEYWORDS, SITE_NAME, clampDescription, freshnessStamp, pageMetadata,
} from '@/lib/seo'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/categories/${slug}/`, { next: { revalidate: 600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  const path = `/categories/${slug}`

  if (!category) {
    return pageMetadata({
      title: 'Category Not Found',
      description: `Browse the full ${SITE_NAME} catalogue of industrial electrical products.`,
      path,
      noindex: true,
    })
  }

  const count = category.product_count ?? 0

  // Mirrors the shape that ranks for these queries today:
  // "MCCBs Price in Pakistan Updated July 2026".
  const title = `${category.name} Price in Pakistan — Updated ${freshnessStamp()}`

  const description = clampDescription(
    `${count > 0 ? `${count.toLocaleString('en-PK')} ` : ''}${category.name} in stock at trade prices. `
    + `${category.description || 'Genuine products from ABB, Siemens, Schneider, CHINT, Himel and Hyundai.'} `
    + 'Karachi-based supplier, delivery across Pakistan.',
  )

  return pageMetadata({
    title,
    description,
    path,
    keywords: [
      `${category.name} price in Pakistan`,
      `${category.name} Karachi`,
      `${category.name} price list`,
      ...(CATEGORY_KEYWORDS[slug] || []),
    ],
  })
}

export default async function CategoryLayout({ children, params }: Props) {
  const { slug } = await params
  const category = await getCategory(slug)

  return (
    <>
      {category && (
        <BreadcrumbStructuredData
          items={[
            { name: 'Home', url: '/' },
            { name: 'Categories', url: '/categories' },
            { name: category.name, url: `/categories/${slug}` },
          ]}
        />
      )}
      {children}
    </>
  )
}
