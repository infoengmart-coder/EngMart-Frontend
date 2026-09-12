/**
 * Category product-photo lookup.
 *
 * The three places a category is shown — the homepage grid, the navbar
 * dropdown and /categories — all rendered an emoji or a generic outline SVG.
 * The client supplied real product photographs instead, and they live in
 * `public/categories/` as static assets.
 *
 * This deliberately mirrors `lib/brand-logos.ts`, which solves the identical
 * problem for manufacturer wordmarks. Keeping the two consistent means there
 * is one obvious place to add an asset, and one obvious precedence rule.
 *
 * ── Precedence at every call site ──
 *
 *     API `category.image` (admin upload)  →  this static map  →  emoji icon
 *
 * The uploaded image wins so the client can replace any of these from the
 * admin panel later without a code change. The static map is the reliable
 * default; the emoji remains as the last resort for the ~170 categories that
 * have no photograph, so nothing ever renders as an empty box.
 *
 * ── Adding a new one ──
 *
 *   1. Save the file as `public/categories/<category-slug>.webp`
 *   2. Add a line to BY_SLUG below
 *
 * Names are matched on slug only. Category NAMES are not unique in this
 * catalogue — there are two "Current Transformers", two "Switches", two
 * "Timers" — so matching on name would attach a photo to whichever row
 * happened to be found first.
 */

/** Encoded once here so callers can drop the result straight into `src`. */
const f = (file: string) => `/categories/${encodeURIComponent(file)}`

// Files are WebP, generated from the client's JPEG originals in
// `categories-pic/` by scripts/build-category-images.py: each is trimmed of its
// background border, squared on white so every product fills its tile the same
// amount, and capped at 400px. That pipeline turned 391 KB of mixed-size JPEGs
// into 118 KB of consistently-framed assets.

/**
 * Keyed by category slug, as it appears in the database and in the URL.
 *
 * Several slugs below are duplicates of each other in the catalogue (`mcb` and
 * `mcb-2`, `mccb` / `mccb-2`, …). Both are mapped on purpose: the homepage
 * uses the canonical slug while /categories lists every row, and a visitor
 * should not see a photo on one card and an emoji on its near-identical
 * neighbour.
 */
const BY_SLUG: Record<string, string> = {
  // ── Circuit protection ──
  mcb: f('mcb.webp'),
  'mcb-2': f('mcb.webp'),
  mccb: f('mccb.webp'),
  'mccb-2': f('mccb.webp'),
  acb: f('acb.webp'),
  'acb-2': f('acb.webp'),
  rccb: f('rccb.webp'),
  'rccb-2': f('rccb.webp'),
  'hrc-fuses': f('fuses.webp'),
  fuses: f('fuses.webp'),
  'fuses-2': f('fuses.webp'),

  // ── Switching & control ──
  contactors: f('contactors.webp'),
  'contactors-2': f('contactors.webp'),
  'cam-switches': f('cam-switches.webp'),
  'selector-switches': f('cam-switches.webp'),
  'selector-switches-2': f('cam-switches.webp'),
  'changeover-switches': f('changeover-switches.webp'),
  'changeover-switches-2': f('changeover-switches.webp'),
  'push-buttons': f('push-buttons.webp'),
  'push-buttons-2': f('push-buttons.webp'),
  'protection-relays': f('protection-relays.webp'),
  relays: f('protection-relays.webp'),
  'relays-2': f('protection-relays.webp'),

  // ── Measurement ──
  'panel-meters': f('panel-meters.webp'),
  'panel-meters-2': f('panel-meters.webp'),
  'multi-meters': f('panel-meters.webp'),
  'current-transformers': f('current-transformers.webp'),
  'current-transformers-2': f('current-transformers.webp'),

  // ── Power & drives ──
  vfd: f('vfd.webp'),
  vfds: f('vfd.webp'),
  capacitors: f('capacitors.webp'),
  'capacitors-2': f('capacitors.webp'),

  // ── Wiring & enclosures ──
  'wiring-devices': f('wiring-devices.webp'),
  'wiring-devices-2': f('wiring-devices.webp'),
  'wiring-accessories': f('wiring-devices.webp'),
  sockets: f('wiring-devices.webp'),
  'industrial-sockets': f('plugs-sockets.webp'),
  'plugs-sockets': f('plugs-sockets.webp'),
  'distribution-boards': f('distribution-boards.webp'),
  'consumer-boxes': f('distribution-boards.webp'),
  'pilot-lamps': f('pilot-lamps.webp'),
  'indicator-lights': f('pilot-lamps.webp'),
  'indication-lights': f('pilot-lamps.webp'),
  indicators: f('pilot-lamps.webp'),

  // ── Parent groupings ──
  // These are the top-level rows /categories renders. Most carry no products
  // of their own — they exist to group children — but they are the LARGEST
  // cards on the page, so leaving them on emoji while their children have
  // photographs looks like the feature half-shipped. Only groupings whose
  // meaning is unambiguous are mapped; "Surge Protection", "Power Quality" and
  // similar have no supplied photo that honestly depicts them, and keep the
  // emoji rather than borrowing a misleading one.
  'switches-indicators': f('pilot-lamps.webp'),
  metering: f('panel-meters.webp'),
  'power-factor-correction': f('capacitors.webp'),
  'power-correction': f('capacitors.webp'),
  'motor-control': f('contactors.webp'),
  'contactors-relays': f('contactors.webp'),
  enclosures: f('distribution-boards.webp'),
  'enclosures-accessories': f('distribution-boards.webp'),
}

/**
 * Static photograph for a category slug, or null when there is not one.
 *
 * Returning null rather than a placeholder path is what lets each call site
 * fall back to its own icon treatment — the homepage tile, the navbar row and
 * the /categories card all style their fallback differently.
 */
export function categoryImage(slug: string | null | undefined): string | null {
  if (!slug) return null
  return BY_SLUG[slug.trim().toLowerCase()] || null
}

/**
 * The photo to show for a category, applying the full precedence rule.
 *
 * `apiImage` is `category.image` from the API — already an absolute or
 * media-relative URL, and the caller is expected to have run it through
 * `mediaUrl()`. Pass it and this handles the rest.
 */
export function resolveCategoryImage(
  slug: string | null | undefined,
  apiImage?: string | null,
): string | null {
  return apiImage || categoryImage(slug)
}

/** Slugs that currently have a photograph — used by the homepage ordering. */
export const CATEGORIES_WITH_IMAGES = new Set(Object.keys(BY_SLUG))
