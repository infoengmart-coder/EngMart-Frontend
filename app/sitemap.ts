import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Generated per request, NOT at build time.
 *
 * This used to be `export const revalidate = 3600`, which makes Next prerender
 * the sitemap during `next build`. The API lives on Render's free tier, which
 * sleeps after 15 minutes idle and takes ~50s to wake — so a Vercel build had
 * every chance of running while the backend was asleep. The fetches would fail
 * silently, the catch below would return `[]`, and the deployed sitemap.xml
 * would ship containing SIX static URLs.
 *
 * That is not a small bug. A sitemap listing 6 URLs where 4,794 used to be is
 * read by Google as "those pages are gone", which is a de-indexing signal for
 * the entire catalogue. It was reproduced locally: a build with the backend
 * stopped produced exactly that.
 *
 * Rendering on demand costs one API round trip per fetch. Google requests a
 * sitemap at most a few times a day, so the cost is irrelevant next to the
 * risk.
 */
export const dynamic = 'force-dynamic'

type SlugRow = { slug: string; updated_at?: string }

/**
 * Fetch an unpaginated list endpoint, retrying a sleeping backend.
 *
 * Render's free tier answers the first request after idling with a ~50s cold
 * start. One attempt would time out against that and hand back an empty list,
 * which is the failure mode this whole file is now written to prevent.
 */
async function fetchList(path: string, attempts = 3): Promise<SlugRow[]> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        // Generous: a cold Render container legitimately needs this long.
        signal: AbortSignal.timeout(30_000),
      })
      if (res.ok) {
        const data = await res.json()
        return Array.isArray(data) ? data : data.results || []
      }
    } catch {
      // fall through to the retry
    }
    if (attempt < attempts) {
      await new Promise(resolve => setTimeout(resolve, attempt * 2000))
    }
  }
  return []
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

  // /products/slugs/ is unpaginated by design — one request for the whole
  // catalog instead of ~200 pages, which would take minutes.
  const [products, brands, categories] = await Promise.all([
    fetchList('/products/slugs/'),
    fetchList('/brands/'),
    fetchList('/categories/'),
  ])

  // An empty product list means the API is down, not that the shop has no
  // products — a real catalogue does not drop from 4,788 to nothing.
  //
  // Throwing yields a 500, which Google treats as "try again later" and leaves
  // the last good sitemap in place. Returning the static routes instead would
  // publish a sitemap that actively asks Google to forget the catalogue. Of
  // the two failure modes, only one is recoverable.
  if (products.length === 0) {
    throw new Error(
      'Sitemap aborted: the catalog API returned no products. Refusing to '
      + 'publish a sitemap that omits every product page.',
    )
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
