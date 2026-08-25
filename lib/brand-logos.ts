/**
 * Brand wordmark lookup.
 *
 * The manufacturer logos live in `public/Logo/` as static assets. The Brand
 * rows in the database have a `logo` ImageField, but none of them are
 * populated yet — so every brand surface (cards, product badges, the footer,
 * the scrolling marquee) fell back to a coloured dot.
 *
 * `brandLogo()` resolves a brand to its wordmark by slug first, then by a
 * normalised name, so it works whether the caller has a full API `Brand`
 * object or just the brand name snapshotted onto a product/cart line.
 *
 * Precedence at the call sites is always: uploaded `brand.logo` from the API →
 * this static map → coloured monogram. That way the client can override any of
 * these from the admin panel later without a code change.
 */

/** Encode once here so callers can drop the result straight into `src`. */
const f = (file: string) => `/Logo/${encodeURIComponent(file)}`

/**
 * Keyed by brand slug. Several database brands are combined marques
 * ("Panasonic/Sunx", "SAMWHA/Schneider") and intentionally resolve to the
 * logo of the marque the client actually sells under.
 */
const BY_SLUG: Record<string, string> = {
  abb: f('ABB.jpg'),
  ana: f('Ana.png'),
  autonics: f('Autonics.png'),
  bemis: f('Bemis.png'),
  breter: f('Breter.png'),
  chint: f('Chint.png'),
  dehn: f('Dehn.png'),
  'df-electric': f('DF.png'),
  'e-power': f('e-power.jpg'),
  ekon: f('Ekon.jpg'),
  elcontrol: f('Elcontrol.png'),
  emirel: f('emirel.png'),
  entesinter: f('Entes.jpg'),
  eti: f('ETI.png'),
  famatel: f('Famatel.webp'),
  farady: f('Farady.jpg'),
  fenwal: f('Fenwal.png'),
  fico: f('Fico hi-tech.jpg'),
  finder: f('Finder.png'),
  fuji: f('Fuji electric.jpg'),
  'fuji-electric': f('Fuji electric.jpg'),
  gave: f('Gave.png'),
  hager: f('Hager.jpg'),
  hanyoung: f('hanyoung.png'),
  himel: f('Himel.png'),
  hyundai: f('hyundai.jpg'),
  inter: f('Inter.jpg'),
  kawamura: f('Kawamura.png'),
  'kraus-naimer': f('Kraus Naimer.png'),
  krk: f('KRK.png'),
  lovato: f('Lovato.png'),
  ls: f('LS Electric.png'),
  'ls-electric': f('LS Electric.png'),
  lutron: f('Lutron.png'),
  maruyasu: f('Maruyasu.png'),
  nancal: f('Nancal.png'),
  nationalnais: f('Nais.png'),
  nokian: f('Nokian.png'),
  optex: f('Optex.png'),
  pakosan: f('Pakosan.png'),
  panasonic: f('Panasonic.webp'),
  panasonicnational: f('Panasonic.webp'),
  panasonicsunx: f('Sunx.png'),
  panasonictogami: f('togami.png'),
  pce: f('PEC.png'),
  pogliano: f('pogliano.png'),
  revalco: f('Revalco.png'),
  rtr: f('RTR.jpg'),
  saci: f('Saci.png'),
  samwhaschneider: f('Samwha.png'),
  schneider: f('Schneider.webp'),
  'schneider-electric': f('Schneider.webp'),
  selco: f('Selco.png'),
  sew: f('SEW.png'),
  shizuki: f('Shizuki.jpg'),
  siemens: f('Seimons.png'),
  smc: f('SMC.jpg'),
  socomec: f('Socomec.png'),
  tecnologic: f('Tecnologic.png'),
  telemecanique: f('TELemecanique.webp'),
  terasaki: f('Terasaki.png'),
  tmc: f('TMC.jpg'),
  togami: f('togami.png'),
  ueda: f('Ueda.jpg'),
  voltran: f('Voltran.png'),
}

/**
 * Keyed by a normalised brand NAME, for callers that only have the display
 * string (product cards and cart lines snapshot `brand_name`, not the slug).
 * Normalisation strips everything that is not a letter or digit, so
 * "FICO Hi-Tech", "fico hi tech" and "FICOHITECH" all collide onto one key.
 */
const BY_NAME: Record<string, string> = {
  abb: BY_SLUG.abb,
  ana: BY_SLUG.ana,
  autonics: BY_SLUG.autonics,
  bemis: BY_SLUG.bemis,
  breter: BY_SLUG.breter,
  chint: BY_SLUG.chint,
  dehn: BY_SLUG.dehn,
  dfelectric: BY_SLUG['df-electric'],
  epower: BY_SLUG['e-power'],
  ekon: BY_SLUG.ekon,
  elcontrol: BY_SLUG.elcontrol,
  emirel: BY_SLUG.emirel,
  entes: BY_SLUG.entesinter,
  entesinter: BY_SLUG.entesinter,
  eti: BY_SLUG.eti,
  famatel: BY_SLUG.famatel,
  farady: BY_SLUG.farady,
  fenwal: BY_SLUG.fenwal,
  fico: BY_SLUG.fico,
  ficohitech: BY_SLUG.fico,
  finder: BY_SLUG.finder,
  fuji: BY_SLUG.fuji,
  fujielectric: BY_SLUG.fuji,
  gave: BY_SLUG.gave,
  hager: BY_SLUG.hager,
  hanyoung: BY_SLUG.hanyoung,
  himel: BY_SLUG.himel,
  hyundai: BY_SLUG.hyundai,
  inter: BY_SLUG.inter,
  kawamura: BY_SLUG.kawamura,
  krausnaimer: BY_SLUG['kraus-naimer'],
  krk: BY_SLUG.krk,
  lovato: BY_SLUG.lovato,
  ls: BY_SLUG.ls,
  lselectric: BY_SLUG['ls-electric'],
  lutron: BY_SLUG.lutron,
  maruyasu: BY_SLUG.maruyasu,
  nancal: BY_SLUG.nancal,
  nais: BY_SLUG.nationalnais,
  nationalnais: BY_SLUG.nationalnais,
  nokian: BY_SLUG.nokian,
  optex: BY_SLUG.optex,
  pakosan: BY_SLUG.pakosan,
  panasonic: BY_SLUG.panasonic,
  panasonicnational: BY_SLUG.panasonicnational,
  panasonicsunx: BY_SLUG.panasonicsunx,
  panasonictogami: BY_SLUG.panasonictogami,
  pce: BY_SLUG.pce,
  pogliano: BY_SLUG.pogliano,
  revalco: BY_SLUG.revalco,
  rtr: BY_SLUG.rtr,
  saci: BY_SLUG.saci,
  samwha: BY_SLUG.samwhaschneider,
  samwhaschneider: BY_SLUG.samwhaschneider,
  schneider: BY_SLUG.schneider,
  schneiderelectric: BY_SLUG['schneider-electric'],
  selco: BY_SLUG.selco,
  sew: BY_SLUG.sew,
  shizuki: BY_SLUG.shizuki,
  siemens: BY_SLUG.siemens,
  smc: BY_SLUG.smc,
  socomec: BY_SLUG.socomec,
  sunx: BY_SLUG.panasonicsunx,
  tecnologic: BY_SLUG.tecnologic,
  telemecanique: BY_SLUG.telemecanique,
  terasaki: BY_SLUG.terasaki,
  tmc: BY_SLUG.tmc,
  togami: BY_SLUG.togami,
  ueda: BY_SLUG.ueda,
  voltran: BY_SLUG.voltran,
}

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Resolve a brand to its static wordmark.
 *
 * Pass whichever identifiers you have — slug is checked first because it is
 * unambiguous. Returns `null` when the brand has no logo on file, which the
 * caller should render as a monogram rather than a broken image.
 */
export function brandLogo(
  nameOrSlug?: string | null,
  slug?: string | null,
): string | null {
  if (slug) {
    const bySlug = BY_SLUG[normalise(slug)] || BY_SLUG[slug.toLowerCase()]
    if (bySlug) return bySlug
  }
  if (!nameOrSlug) return null
  const key = normalise(nameOrSlug)
  if (!key) return null
  // A caller may pass a slug through the first argument (product cards only
  // carry one brand string), so try both tables before giving up.
  return BY_NAME[key] || BY_SLUG[key] || null
}

/** Every brand that has a wordmark on file — used by the scrolling marquee. */
export const BRAND_LOGO_ENTRIES: { slug: string; name: string; logo: string }[] = [
  { slug: 'abb', name: 'ABB' },
  { slug: 'siemens', name: 'Siemens' },
  { slug: 'schneider-electric', name: 'Schneider Electric' },
  { slug: 'chint', name: 'CHINT' },
  { slug: 'himel', name: 'Himel' },
  { slug: 'hyundai', name: 'Hyundai' },
  { slug: 'ls-electric', name: 'LS Electric' },
  { slug: 'fuji-electric', name: 'Fuji Electric' },
  { slug: 'lovato', name: 'Lovato' },
  { slug: 'terasaki', name: 'Terasaki' },
  { slug: 'smc', name: 'SMC' },
  { slug: 'autonics', name: 'Autonics' },
  { slug: 'socomec', name: 'Socomec' },
  { slug: 'hager', name: 'Hager' },
  { slug: 'finder', name: 'Finder' },
  { slug: 'lutron', name: 'Lutron' },
  { slug: 'panasonic', name: 'Panasonic' },
  { slug: 'eti', name: 'ETI' },
  { slug: 'famatel', name: 'Famatel' },
  { slug: 'pce', name: 'PCE' },
  { slug: 'fico', name: 'FICO Hi-Tech' },
  { slug: 'optex', name: 'Optex' },
  { slug: 'telemecanique', name: 'Telemecanique' },
  { slug: 'dehn', name: 'Dehn' },
  { slug: 'df-electric', name: 'DF Electric' },
  { slug: 'entesinter', name: 'Entes' },
  { slug: 'revalco', name: 'Revalco' },
  { slug: 'saci', name: 'Saci' },
  { slug: 'selco', name: 'Selco' },
  { slug: 'kraus-naimer', name: 'Kraus & Naimer' },
  { slug: 'maruyasu', name: 'Maruyasu' },
  { slug: 'togami', name: 'Togami' },
  { slug: 'tecnologic', name: 'Tecnologic' },
  { slug: 'nokian', name: 'Nokian' },
  { slug: 'shizuki', name: 'Shizuki' },
  { slug: 'kawamura', name: 'Kawamura' },
  { slug: 'ueda', name: 'Ueda' },
  { slug: 'voltran', name: 'Voltran' },
  { slug: 'bemis', name: 'Bemis' },
  { slug: 'sew', name: 'SEW' },
]
  .map(b => ({ ...b, logo: BY_SLUG[b.slug] }))
  // Guard against a slug typo silently shipping a broken <img> to the marquee.
  .filter((b): b is { slug: string; name: string; logo: string } => Boolean(b.logo))
