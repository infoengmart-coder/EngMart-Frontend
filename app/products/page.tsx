/**
 * Product listing — server component.
 *
 * Renders the unfiltered first page of products into the HTML. This page is
 * the crawl hub for the whole catalog: it is how Googlebot discovers the 4,788
 * product URLs, and it previously served zero product links because everything
 * was fetched in `useEffect`.
 *
 * Filtering, sorting, search and paging remain entirely client-side — they run
 * off `useSearchParams` and user input, neither of which belongs on the server.
 * The client simply starts from this data instead of from an empty array.
 */

import {
  fetchProductsServer, fetchCategoriesServer, fetchBrandsServer,
} from '@/lib/catalog-server'
import ProductsPageClient from './products-page-client'

/**
 * Rendered per request, NOT prerendered.
 *
 * The client half calls `useSearchParams` (for ?q=) inside a Suspense
 * boundary. During a static prerender Next.js cannot know the query string, so
 * it emits the Suspense *fallback* — which is why this page still served zero
 * product links even after the server fetch was added. Dynamic rendering makes
 * the search params known at render time, so the grid is server-rendered for
 * real.
 *
 * The cost is one uncached render per visit for this single URL. Product pages
 * — the 4,788 that actually rank — keep their 10-minute ISR cache.
 */
export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const [listing, categories, brands] = await Promise.all([
    fetchProductsServer({ page_size: 24 }),
    fetchCategoriesServer(),
    fetchBrandsServer(),
  ])

  return (
    <ProductsPageClient
      initialProducts={listing.products}
      initialCount={listing.count}
      initialCategories={categories}
      // Brands flagged `show_in_filters: false` are the client's own trade
      // suppliers rather than manufacturer marques — same rule the client
      // applies, kept identical so the filter list does not change on hydration.
      initialBrands={brands.filter((b: any) => b.show_in_filters !== false)}
    />
  )
}
