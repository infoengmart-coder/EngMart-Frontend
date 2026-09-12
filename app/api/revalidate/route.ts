/**
 * On-demand cache purge for catalog pages.
 *
 * ── The bug this fixes ──
 *
 * `/products/[slug]` and `/categories/[slug]` are rendered on the server and
 * cached by Vercel (`export const revalidate`). Next.js serves that cache
 * stale-while-revalidate: the FIRST request after it expires gets the old page
 * and only *triggers* a rebuild in the background, so the new content appears
 * two or three reloads later.
 *
 * That is precisely the reported symptom — "I update a product, it shows the
 * old one, then after about 3 reloads it updates". Django already purges its
 * own response cache on every write, and the browser cache is cleared too, but
 * nothing told VERCEL that the page it had rendered was now wrong.
 *
 * This endpoint closes that gap. Django calls it after a catalog write (see
 * apps/common/revalidate.py) and the affected paths are dropped immediately,
 * so the next request renders fresh.
 *
 * ── Security ──
 *
 * Purging is cheap but not free — an open endpoint would let anyone force
 * repeated re-renders of 4,788 product pages, which is a denial-of-wallet
 * problem on a metered host. It therefore requires a shared secret, compared
 * in constant time, and refuses to run at all when the secret is unset rather
 * than defaulting to open.
 */

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'crypto'

/** Never cache the purge endpoint itself. */
export const dynamic = 'force-dynamic'

const SECRET = (process.env.REVALIDATE_SECRET || '').trim()

/** Length-safe constant-time compare — timingSafeEqual throws on a mismatch. */
function secretMatches(provided: string): boolean {
  if (!SECRET || !provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(SECRET)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Only catalog paths may be purged, so a leaked secret cannot clear the site. */
function isAllowed(path: string): boolean {
  return (
    path === '/' ||
    path === '/products' ||
    path === '/categories' ||
    path === '/brands' ||
    /^\/products\/[A-Za-z0-9._~-]+$/.test(path) ||
    /^\/categories\/[A-Za-z0-9._~-]+$/.test(path) ||
    /^\/brands\/[A-Za-z0-9._~-]+$/.test(path)
  )
}

export async function POST(request: Request) {
  if (!SECRET) {
    // Deliberately a 503, not a silent 200: a misconfigured deploy must be
    // visible in the Django logs rather than looking like a successful purge.
    return NextResponse.json(
      { revalidated: false, error: 'REVALIDATE_SECRET is not configured on this deployment.' },
      { status: 503 },
    )
  }

  const provided =
    request.headers.get('x-revalidate-secret') ||
    new URL(request.url).searchParams.get('secret') ||
    ''

  if (!secretMatches(provided)) {
    return NextResponse.json({ revalidated: false, error: 'Unauthorized' }, { status: 401 })
  }

  let paths: string[] = []
  try {
    const body = await request.json()
    paths = Array.isArray(body?.paths) ? body.paths : []
  } catch {
    return NextResponse.json({ revalidated: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  // A cap, so one call cannot be turned into thousands of re-renders.
  const accepted = paths.filter(p => typeof p === 'string' && isAllowed(p)).slice(0, 50)
  const rejected = paths.filter(p => typeof p !== 'string' || !isAllowed(p))

  for (const path of accepted) {
    revalidatePath(path)
  }

  return NextResponse.json({
    revalidated: true,
    purged: accepted,
    ...(rejected.length ? { ignored: rejected } : {}),
    at: Date.now(),
  })
}
