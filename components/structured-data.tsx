/**
 * Site-wide structured data (JSON-LD).
 *
 * Three schemas, each doing a specific job in search results:
 *
 *  • Organization  — lets Google associate the brand, logo and contact details,
 *    which is what produces the knowledge panel for "Eng-Mart".
 *  • LocalBusiness — city, hours and phone, which is what gets the shop into
 *    local / "near me" results. Deliberately NO street address: the client
 *    asked that none be published anywhere on the site.
 *  • WebSite + SearchAction — enables the sitelinks search box, so someone can
 *    search the catalogue straight from the Google result.
 *
 * Server component on purpose: search crawlers must see this in the initial
 * HTML, not after hydration.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

/**
 * Contact details, read from the same SiteSettings row the storefront renders.
 *
 * These used to be hardcoded here and had already drifted from the number the
 * admin actually configured — which is worse than useless in structured data,
 * because Google may surface a phone number that nobody answers.
 */
async function getContact() {
  const fallback = { phone: '', email: '', hours: '' }
  try {
    const res = await fetch(`${API_BASE}/settings/`, { next: { revalidate: 3600 } })
    if (!res.ok) return fallback
    const d = await res.json()
    return { phone: d.phone || '', email: d.email || '', hours: d.hours || '' }
  } catch {
    return fallback
  }
}

function organization(contact: { phone: string; email: string }) {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Eng-Mart',
    alternateName: 'Engineering Mart',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/header_logo.png` },
    image: `${SITE_URL}/og-image.png`,
    description:
      "Pakistan's supplier of industrial electrical products — MCBs, MCCBs, ACBs, "
      + 'contactors, current transformers and panel meters from ABB, CHINT, Himel, '
      + 'Schneider, Siemens, Hyundai and LS Electric.',
    ...(contact.phone || contact.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            ...(contact.phone ? { telephone: contact.phone } : {}),
            ...(contact.email ? { email: contact.email } : {}),
            contactType: 'sales',
            areaServed: 'PK',
            availableLanguage: ['en', 'ur'],
          },
        }
      : {}),
  }
}

function localBusiness(contact: { phone: string; email: string }) {
  return {
    '@type': ['Store', 'ElectricalContractor'],
    '@id': `${SITE_URL}/#store`,
    name: 'Eng-Mart',
    image: `${SITE_URL}/og-image.png`,
    url: SITE_URL,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    priceRange: 'PKR',
    // City and region only. The client asked that no street address appear
    // anywhere on the site, and JSON-LD is published data like any other —
    // Google will render it into a local result. Locality is enough to stay
    // relevant for "electrical supplier Karachi" without publishing the shop.
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      addressCountry: 'PK',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    }],
    areaServed: { '@type': 'Country', name: 'Pakistan' },
  }
}

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Eng-Mart',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      // `q` is the parameter /products reads. It was `search`, which the page
      // ignores, so the sitelinks search box led to an unfiltered catalogue.
      urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export async function SiteStructuredData() {
  const contact = await getContact()
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization(contact), localBusiness(contact), WEBSITE],
  }
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is data, not markup; escape the one sequence
      // that could break out of a <script> block.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/** Breadcrumb trail for a page — renders the crumb chain into search results. */
export function BreadcrumbStructuredData({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
