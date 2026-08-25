import type { Metadata } from 'next'
import { BreadcrumbStructuredData } from '@/components/structured-data'
import {
  SITE_NAME, SITE_URL, absoluteUrl, clampDescription, freshnessStamp, pageMetadata,
} from '@/lib/seo'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}/`, { next: { revalidate: 600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** Absolute URL for an image path that may be relative to the API host. */
function absoluteImage(image: string | null): string | undefined {
  if (!image) return undefined
  if (image.startsWith('http')) return image
  const origin = API_BASE.replace(/\/api\/?$/, '')
  return `${origin}${image.startsWith('/') ? '' : '/'}${image}`
}

/** Ampere ratings this product is sold in, for the title and description. */
function ratingRange(product: any): string {
  const amps = (product.variants || [])
    .map((v: any) => {
      const src = v.specs?.rating || v.description || v.cat_no || ''
      const m = String(src).match(/(\d+(?:\.\d+)?)\s*A\b/i)
      return m ? parseFloat(m[1]) : NaN
    })
    .filter((n: number) => Number.isFinite(n))
    .sort((a: number, b: number) => a - b)

  if (amps.length === 0) return ''
  const min = amps[0]
  const max = amps[amps.length - 1]
  return min === max ? `${min}A` : `${min}A–${max}A`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  const path = `/products/${slug}`

  if (!product) {
    return pageMetadata({
      title: 'Product Not Found',
      description: `This product is no longer listed. Browse the full ${SITE_NAME} catalogue instead.`,
      path,
      noindex: true,
    })
  }

  const brandName = product.brand?.name || product.brand_name || ''
  const categoryName = product.category?.name || product.category_name || ''
  const catNo = product.first_variant?.cat_no || product.series || ''
  const range = ratingRange(product)

  // "ABB SH 201 Miniature Circuit Breaker 6A–63A Price in Pakistan" — brand,
  // model, type, rating, then the price-intent phrase this market searches on.
  //
  // Many product names in this catalogue already begin with the brand ("ABB
  // S 201 MCB"), so prepending it unconditionally produced "ABB ABB S 201".
  // Only add each part when it is not already present.
  const has = (needle: string) =>
    !!needle && product.name.toLowerCase().includes(needle.toLowerCase())

  const title = [
    has(brandName) ? '' : brandName,
    has(catNo) ? '' : catNo,
    product.name,
    range,
    'Price in Pakistan',
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

  const priced = product.price_range && !product.has_price_on_request
  const priceLine = priced
    ? `From PKR ${Number(product.price_range.min).toLocaleString('en-PK')}. `
    : ''

  const description = clampDescription(
    `${priceLine}${has(brandName) ? '' : `${brandName} `}${product.name}`
    + `${range ? ` (${range})` : ''}${categoryName ? ` — ${categoryName}` : ''}. `
    + `${product.short_description || ''} `
    + `Genuine stock, delivered across Pakistan. Updated ${freshnessStamp()}.`,
  )

  return pageMetadata({
    title,
    description,
    path,
    image: absoluteImage(product.image),
    imageAlt: `${brandName} ${product.name}`.trim(),
    keywords: [
      `${has(brandName) ? '' : `${brandName} `}${product.name} price`.trim(),
      catNo ? `${catNo} price in Pakistan` : '',
      `${categoryName} price in Pakistan`,
      `${brandName} Pakistan`,
      `${product.name} Karachi`,
    ].filter(Boolean),
  })
}

export default async function ProductLayout({ children, params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  const brandName = product?.brand?.name || product?.brand_name || ''
  const categoryName = product?.category?.name || product?.category_name || ''
  const categorySlug = product?.category?.slug || ''
  const catNo = product?.first_variant?.cat_no || product?.variants?.[0]?.cat_no || undefined
  const priced = product?.price_range && !product?.has_price_on_request

  // Product structured data so search engines can show rich results.
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.short_description || product.meta_description || '',
        sku: catNo,
        mpn: catNo,
        brand: { '@type': 'Brand', name: brandName },
        category: categoryName || undefined,
        image: absoluteImage(product.image) ? [absoluteImage(product.image)] : undefined,
        url: absoluteUrl(`/products/${slug}`),
        ...(priced
          ? {
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'PKR',
                lowPrice: product.price_range.min,
                highPrice: product.price_range.max,
                offerCount: product.variant_count || product.variants?.length || 1,
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
                seller: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}/#organization` },
              },
            }
          : {}),
      }
    : null

  // Breadcrumbs render the crumb chain into the search result itself, which
  // both reads better and pushes the ugly URL out of the listing.
  const crumbs = product
    ? [
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
        ...(categoryName && categorySlug
          ? [{ name: categoryName, url: `/categories/${categorySlug}` }]
          : []),
        { name: product.name, url: `/products/${slug}` },
      ]
    : []

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {crumbs.length > 0 && <BreadcrumbStructuredData items={crumbs} />}
      {children}
    </>
  )
}
