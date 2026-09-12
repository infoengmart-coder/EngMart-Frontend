/**
 * Product detail — server component.
 *
 * This exists so the product's name, price, variants and specifications are in
 * the HTML that crawlers receive. Before, the page was a client component that
 * fetched in `useEffect`, so the served body contained a loading skeleton and
 * nothing else: the JSON-LD promised a price that appeared nowhere on the page.
 *
 * The interactive UI is unchanged — it lives in product-detail-client.tsx and
 * is handed its data as a prop, which means it renders fully during the server
 * pass rather than waiting for JavaScript.
 */

import { notFound } from 'next/navigation'
import { fetchProductServer } from '@/lib/catalog-server'
import ProductDetailClient from './product-detail-client'

// Rendered on demand and cached. Statically generating 4,788 product pages
// would make every deploy take hours; this gives the same crawler-visible HTML
// with a build that finishes.
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await fetchProductServer(slug)

  // A real 404 for a slug that does not exist, rather than a soft "not found"
  // page returning HTTP 200 — Google treats those as thin content and can
  // index them.
  if (!product) notFound()

  return <ProductDetailClient slug={slug} initialProduct={product} />
}
