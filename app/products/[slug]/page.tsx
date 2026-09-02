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
// A literal, not the shared CATALOG_REVALIDATE constant: Next.js statically
// analyses segment config exports at build time and rejects an imported
// value outright ("Invalid segment configuration export detected").
// Keep this in step with CATALOG_REVALIDATE in lib/catalog-server.ts.
export const revalidate = 600

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
