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

// A literal, not the shared CATALOG_REVALIDATE constant: Next.js statically
// analyses segment config exports at build time and rejects an imported
// value outright ("Invalid segment configuration export detected").
// Keep this in step with CATALOG_REVALIDATE in lib/catalog-server.ts.
export const revalidate = 600

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
