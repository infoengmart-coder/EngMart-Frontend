'use server'

/**
 * Purge the storefront's rendered pages, straight from the admin dashboard.
 *
 * ── Why this exists alongside the Django-side purge ──
 *
 * `apps/common/revalidate.py` also purges, by POSTing to /api/revalidate. That
 * covers every write path including the Django admin — but it needs a
 * REVALIDATE_SECRET configured on BOTH Render and Vercel, and if either is
 * missing the purge silently degrades to the 120-second timer.
 *
 * 120 seconds is still "I edited a product and had to wait two minutes", which
 * is the complaint in the first place. So the path the client actually uses —
 * saving a product in the dashboard — must not depend on configuration that
 * can be forgotten.
 *
 * A server action needs none. It runs inside this deployment, called by code
 * the admin is already authenticated into, so there is no cross-service secret
 * to set up and nothing to misconfigure. It works the moment this deploys.
 *
 * Layered deliberately, most-specific first:
 *   1. this server action  — dashboard saves, instant, zero config
 *   2. the Django purge    — Django admin / API writes, needs the secret
 *   3. revalidate = 120    — backstop if both are unavailable
 */

import { revalidatePath } from 'next/cache'

/**
 * Drop every cached page whose content depends on this product.
 *
 * Never throws: a failed purge must not surface as a failed save. The product
 * IS saved by the time this runs — the worst outcome of an error here is that
 * the page waits for its timer, which is the old behaviour, not data loss.
 */
export async function revalidateProductPages(
  slug: string,
  categorySlug?: string | null,
  brandSlug?: string | null,
): Promise<{ ok: boolean; purged: string[] }> {
  const paths = ['/', '/products']
  if (slug) paths.push(`/products/${slug}`)
  // The category and brand listings embed this product's card — its name and
  // price are wrong on those pages too until they re-render.
  if (categorySlug) paths.push(`/categories/${categorySlug}`)
  if (brandSlug) paths.push(`/brands/${brandSlug}`)

  try {
    for (const path of paths) {
      revalidatePath(path)
    }
    return { ok: true, purged: paths }
  } catch {
    return { ok: false, purged: [] }
  }
}

/**
 * Purge after a delete.
 *
 * The product page itself is included so the now-dead URL stops serving a
 * cached copy of a product that no longer exists — it should 404 immediately,
 * not in two minutes.
 */
export async function revalidateAfterProductDelete(
  slug: string,
): Promise<{ ok: boolean }> {
  try {
    revalidatePath('/')
    revalidatePath('/products')
    revalidatePath('/categories')
    if (slug) revalidatePath(`/products/${slug}`)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
