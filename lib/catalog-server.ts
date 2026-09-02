/**
 * Server-side catalog fetching, for pages that must be crawlable.
 *
 * ── Why this exists ──────────────────────────────────────────────────────
 * The product, category and listing pages were `'use client'` components that
 * fetched in `useEffect`. Their layouts emitted correct metadata and JSON-LD,
 * so the HTML *looked* fine — but the body a reader sees contained nothing:
 *
 *     /products/abb-acb-accessories -> 56KB of HTML
 *       JSON-LD Product schema ... present
 *       "Add to Cart" ............ 0 occurrences
 *       "Pricing" ................ 0 occurrences
 *       price anywhere in body ... 0 occurrences
 *
 * Googlebot renders JavaScript, but in a deferred second pass with a finite
 * budget — and this catalog is 4,788 products. Bing and the AI crawlers are
 * considerably worse at it. Worse, the structured data promised a price that
 * the visible page did not contain, which is exactly the mismatch that caps a
 * store's rankings.
 *
 * Fetching here, in a server component, puts the real content in the first
 * response. The interactive parts (cart, variant picker, quantity) stay client
 * components — they are simply handed their initial data as props, so they
 * render fully on the server pass instead of a loading skeleton.
 *
 * Every function returns null / an empty array rather than throwing: a page
 * that degrades to its client-side fetch is far better than a 500.
 */

import type { Product, ProductDetail, Category } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * How long a server-rendered catalog page may be reused.
 *
 * Ten minutes: long enough that Googlebot crawling thousands of pages does not
 * hammer the API (the backend is on a free tier that sleeps), short enough
 * that a price edit in the admin shows up the same session.
 */
export const CATALOG_REVALIDATE = 600

async function getJson<T>(path: string, revalidate = CATALOG_REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/**
 * Order variants by ampere rating, not database insertion order.
 *
 * Shared with the client component so the server pass and the hydrated pass
 * agree — a different order between the two is a React hydration mismatch,
 * which throws away the server HTML and re-renders the whole subtree.
 */
export function sortVariantsByRating<T extends {
  specs?: Record<string, string>
  description?: string
  cat_no?: string
}>(variants: T[]): T[] {
  const amps = (v: T) => {
    const src = v.specs?.rating || v.description || v.cat_no || ''
    const m = String(src).match(/(\d+(?:\.\d+)?)\s*A/i) || String(src).match(/^(\d+(?:\.\d+)?)/)
    return m ? parseFloat(m[1]) : Number.POSITIVE_INFINITY
  }
  return [...variants].sort((a, b) => amps(a) - amps(b))
}

/** One product, variants already in rating order. Null when it does not exist. */
export async function fetchProductServer(slug: string): Promise<ProductDetail | null> {
  const product = await getJson<ProductDetail>(`/products/${slug}/`)
  if (!product) return null
  if (product.variants && product.variants.length > 1) {
    product.variants = sortVariantsByRating(product.variants)
  }
  return product
}

/** One category, with its child list. */
export async function fetchCategoryServer(slug: string): Promise<Category | null> {
  return getJson<Category>(`/categories/${slug}/`)
}

/** All categories, for the listing page's filter rail. */
export async function fetchCategoriesServer(): Promise<Category[]> {
  const data = await getJson<Category[]>('/categories/')
  return Array.isArray(data) ? data : []
}

/** All brands, for the listing page's filter rail. */
export async function fetchBrandsServer(): Promise<any[]> {
  const data = await getJson<any[]>('/brands/')
  return Array.isArray(data) ? data : []
}

type PagedProducts = { count: number; results: Product[] }

/**
 * The first page of a product listing.
 *
 * Deliberately only the first page. The point is to give crawlers and the
 * first paint real product cards — names, prices, links — not to replicate the
 * whole filtered browsing experience on the server. Filtering, sorting and
 * paging past page one stay client-side where they belong.
 */
export async function fetchProductsServer(
  params: Record<string, string | number | undefined> = {},
): Promise<{ products: Product[]; count: number }> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }
  if (!query.has('page_size')) query.set('page_size', '24')

  const data = await getJson<PagedProducts>(`/products/?${query.toString()}`)
  return { products: data?.results || [], count: data?.count || 0 }
}
