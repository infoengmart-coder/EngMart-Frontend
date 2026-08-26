/**
 * Central SEO configuration.
 *
 * Every public page builds its metadata through `pageMetadata()` so titles,
 * canonicals, Open Graph and Twitter cards stay consistent and no page can
 * quietly ship without a canonical URL again.
 *
 * ── Why the titles read the way they do ──────────────────────────────────
 * The Pakistani market for this catalogue is dominated by price-intent
 * queries. The pages that rank for these terms today are titled, almost
 * without exception, in one shape:
 *
 *     "MCCBs Price in Pakistan Updated July 2026"
 *     "ABB S 201 Single Pole Miniature Circuit Breaker Price in Pakistan"
 *     "Circuit Breaker Price Pakistan 2026 — MCB MCCB ACB"
 *
 * So: `<entity> Price in Pakistan`, often with a freshness stamp and an
 * ampere range. Buyers here search for a price, not for a shop. Our titles
 * follow that pattern rather than leading with the brand name, which is what
 * they used to do ("Product | Eng-Mart") and which competes for nothing.
 *
 * The freshness stamp is only applied on request-rendered pages (product,
 * category and brand detail). Statically generated pages would freeze the
 * month at build time and slowly start lying, so those use no date.
 */

import type { Metadata } from 'next'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com'
).replace(/\/$/, '')

/**
 * Guard against the single most damaging deployment mistake available here.
 *
 * SITE_URL feeds every canonical tag, Open Graph URL, sitemap entry and the
 * robots.txt host. Shipping a production build with the local development
 * value tells Google that the canonical version of every page lives on
 * localhost — which de-indexes the entire site. Fail loudly at build time
 * rather than discovering it in Search Console six weeks later.
 */
if (
  process.env.NODE_ENV === 'production'
  && /localhost|127\.0\.0\.1|^http:\/\//i.test(SITE_URL)
) {
  console.warn(
    '\n[33m⚠  NEXT_PUBLIC_SITE_URL is "%s".\n'
    + '   Every canonical URL, OG tag and sitemap entry will point there.\n'
    + '   Set it to the live https:// domain before deploying.[0m\n',
    SITE_URL,
  )
}

/**
 * Site-wide "keep this out of Google" switch.
 *
 * Set NEXT_PUBLIC_NOINDEX=true while the storefront is deployed but the API
 * behind it is not. A frontend with no backend renders an empty catalogue, and
 * letting Google crawl that is actively harmful: it indexes thin pages, and
 * re-crawling to discover the real 4,700 products takes far longer than simply
 * not being indexed in the first place.
 *
 * Flip it to false (or delete it) once the API is live, then redeploy —
 * NEXT_PUBLIC_* values are baked in at build time, so a dashboard change alone
 * does nothing.
 */
export const NOINDEX_SITE =
  (process.env.NEXT_PUBLIC_NOINDEX || '').toLowerCase() === 'true'

export const SITE_NAME = 'Eng-Mart'
export const SITE_LEGAL_NAME = 'Engineering Mart'
export const OG_IMAGE = '/og-image.png'
export const LOCALE = 'en_PK'

/**
 * Terms that belong on nearly every page — the head terms this catalogue
 * competes for nationally.
 */
export const CORE_KEYWORDS = [
  'industrial electrical products Pakistan',
  'electrical products price in Pakistan',
  'switchgear supplier Karachi',
  'circuit breaker price Pakistan',
  'electrical wholesaler Pakistan',
]

/** Long-tail per product family, used on category and listing pages. */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  mcb: ['MCB price in Pakistan', 'miniature circuit breaker price', '1 pole 2 pole 3 pole MCB', '6A 10A 16A 32A 63A MCB'],
  mccb: ['MCCB price in Pakistan', 'moulded case circuit breaker price', '100A 250A 400A 630A MCCB'],
  acb: ['ACB price in Pakistan', 'air circuit breaker price Karachi'],
  contactors: ['magnetic contactor price in Pakistan', 'AC contactor 3 pole price'],
  'current-transformers': ['current transformer price in Pakistan', 'CT 100/5 200/5 price'],
  'panel-meters': ['digital panel meter price Pakistan', 'ammeter voltmeter price Karachi'],
  'plugs-sockets': ['industrial plug socket price Pakistan', 'IP44 IP67 socket price'],
  rccb: ['RCCB price in Pakistan', 'ELCB earth leakage circuit breaker price'],
  vfds: ['VFD price in Pakistan', 'variable frequency drive price Karachi'],
}

/** "August 2026" — only for pages rendered per request. See the docblock. */
export function freshnessStamp(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function currentYear(): number {
  return new Date().getFullYear()
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Trim a description to a length Google will actually render.
 *
 * Cuts on a word boundary rather than mid-word, which is what produces the
 * "…Karachi, Pakis…" truncation you see on badly-configured stores.
 */
export function clampDescription(text: string, max = 158): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-–—]$/, '')}…`
}

interface PageMetadataInput {
  title: string
  description: string
  /** Site-relative path, e.g. "/products". Becomes the canonical URL. */
  path: string
  keywords?: string[]
  /** Absolute or site-relative image. Defaults to the branded OG card. */
  image?: string | null
  imageAlt?: string
  /** `product` pages get og:type=website too — Next has no product type. */
  type?: 'website' | 'article'
  /** Set for pages that must never be indexed (account, admin, checkout). */
  noindex?: boolean
  /**
   * Re-declare the "%s | Eng-Mart" suffix for this segment's CHILDREN.
   *
   * Needed on any layout that has dynamic children. Once an intermediate
   * layout supplies a plain string title, Next stops passing the root
   * template further down, so /products/[slug] rendered its title with no
   * brand suffix at all until this was set on /products.
   */
  childTitleTemplate?: boolean
}

/**
 * Build a complete, consistent `Metadata` object for a public page.
 *
 * Always emits a canonical URL. A missing canonical is the single most common
 * cause of duplicate-content dilution on a catalogue this size, where the same
 * product is reachable through several filtered listing paths.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  childTitleTemplate = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  const desc = clampDescription(description)
  const ogImage = image || OG_IMAGE
  // The site-wide switch wins over any per-page setting.
  const blocked = noindex || NOINDEX_SITE

  return {
    title: childTitleTemplate
      ? { default: title, template: `%s | ${SITE_NAME}` }
      : title,
    description: desc,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    robots: blocked
      ? { index: false, follow: false, nocache: true,
          googleBot: { index: false, follow: false } }
      : { index: true, follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large',
                       'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      type,
      url,
      title,
      description: desc,
      siteName: SITE_NAME,
      locale: LOCALE,
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt || title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
    },
  }
}

/** Metadata for a private route — short, and firmly out of the index. */
export function privateMetadata(title: string, path: string): Metadata {
  return pageMetadata({
    title,
    description: `${title} — ${SITE_NAME}.`,
    path,
    noindex: true,
  })
}
