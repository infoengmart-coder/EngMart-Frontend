import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Regenerate the sitemap hourly rather than on every crawl.
export const revalidate = 3600

type SlugRow = { slug: string; updated_at?: string }

/** Fetch an unpaginated list endpoint (products/slugs, brands, categories). */
async function fetchList(path: string): Promise<SlugRow[]> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data.results || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/brands`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  // The catalog is the SEO surface that matters — never let a failed fetch
  // break the build, just emit the static routes.
  let products: SlugRow[] = []
  let brands: SlugRow[] = []
  let categories: SlugRow[] = []
  try {
    // /products/slugs/ is unpaginated by design — one request for the whole
    // catalog instead of ~130 pages, which would time out the build.
    ;[products, brands, categories] = await Promise.all([
      fetchList('/products/slugs/'),
      fetchList('/brands/'),
      fetchList('/categories/'),
    ])
  } catch {
    // fall through with whatever was collected
  }

  const productRoutes: MetadataRoute.Sitemap = products
    .filter(p => p.slug)
    .map(p => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  const brandRoutes: MetadataRoute.Sitemap = brands
    .filter(b => b.slug)
    .map(b => ({
      url: `${SITE_URL}/brands/${b.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter(c => c.slug)
    .map(c => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  return [...staticRoutes, ...productRoutes, ...brandRoutes, ...categoryRoutes]
}
