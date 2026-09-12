/**
 * Category detail — server component.
 *
 * Renders the category and its first page of products into the HTML, so a
 * crawler sees real product cards instead of the loading skeleton this page
 * used to serve. The filtering / sorting UI is unchanged and still runs on the
 * client; it is simply handed its starting data.
 */

import { notFound } from 'next/navigation'
import {
  fetchCategoryServer, fetchCategoriesServer, fetchProductsServer,
} from '@/lib/catalog-server'
import CategoryDetailClient, { SERVER_PAGE_SIZE } from './category-detail-client'

// 120s, not 600s.
//
// This is now only the SAFETY NET: apps/common/revalidate.py purges the exact
// path the moment a product changes, so an edit is live immediately. The timer
// only matters for writes that bypass the API (a direct SQL change, a Django
// admin action on a model without the mixin) or if the purge call fails.
//
// It was 600s, and because Next serves this cache stale-while-revalidate that
// meant an edit could take two or three reloads to appear for up to ten
// minutes. Two minutes keeps most of the caching benefit while bounding the
// worst case to something a person would not file a bug about.
//
// A literal, not an imported constant: Next statically analyses segment config
// exports and rejects anything it cannot read at build time.
export const revalidate = 120

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // One round of parallel fetches rather than a waterfall — this runs on every
  // uncached request, so the latency is the visitor's.
  const [category, categories, listing] = await Promise.all([
    fetchCategoryServer(slug),
    fetchCategoriesServer(),
    fetchProductsServer({ category: slug, page_size: SERVER_PAGE_SIZE }),
  ])

  if (!category) notFound()

  return (
    <CategoryDetailClient
      slug={slug}
      initialCategory={category}
      initialProducts={listing.products}
      initialCategories={categories.filter(c => (c.product_count ?? 0) > 0)}
    />
  )
}
