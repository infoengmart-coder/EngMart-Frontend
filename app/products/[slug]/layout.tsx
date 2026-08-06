import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'Product', description: 'Industrial electrical product at Eng-Mart.' }
  }

  // The detail serializer nests the brand as an object; list responses use brand_name.
  const brandName = product.brand?.name || product.brand_name || ''

  // Stored meta_title already ends with "| Eng-Mart" and the root layout appends
  // the same suffix via its title template — strip it to avoid doubling up.
  const rawTitle = product.meta_title || `${product.name} — ${brandName}`
  const title = rawTitle.replace(/\s*\|\s*Eng-Mart\s*$/i, '')

  const description =
    product.meta_description ||
    product.short_description ||
    `Buy ${product.name} by ${brandName} in Pakistan. Genuine product from Eng-Mart, Karachi.`
  const image = absoluteImage(product.image)
  const url = `${SITE_URL}/products/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Eng-Mart',
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function ProductLayout({ children, params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  // Product structured data so search engines can show rich results.
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.short_description || product.meta_description || '',
        sku: product.first_variant?.cat_no || product.variants?.[0]?.cat_no || undefined,
        mpn: product.first_variant?.cat_no || product.variants?.[0]?.cat_no || undefined,
        brand: { '@type': 'Brand', name: product.brand?.name || product.brand_name || '' },
        category: product.category?.name || product.category_name || undefined,
        image: absoluteImage(product.image) ? [absoluteImage(product.image)] : undefined,
        url: `${SITE_URL}/products/${slug}`,
        ...(product.price_range && !product.has_price_on_request
          ? {
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'PKR',
                lowPrice: product.price_range.min,
                highPrice: product.price_range.max,
                offerCount: product.variant_count || 1,
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'Eng-Mart' },
              },
            }
          : {}),
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
