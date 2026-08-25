/**
 * Site-wide structured data (JSON-LD).
 *
 * Three schemas, each doing a specific job in search results:
 *
 *  • Organization  — lets Google associate the brand, logo and contact details,
 *    which is what produces the knowledge panel for "Eng-Mart".
 *  • LocalBusiness — this is a Karachi shop with a real address and hours, and
 *    it is what gets it into local / "near me" results and Maps.
 *  • WebSite + SearchAction — enables the sitelinks search box, so someone can
 *    search the catalogue straight from the Google result.
 *
 * Server component on purpose: search crawlers must see this in the initial
 * HTML, not after hydration.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Eng-Mart',
  alternateName: 'Engineering Mart',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/header_logo.png` },
  description:
    "Pakistan's supplier of industrial electrical products — MCBs, MCCBs, ACBs, "
    + 'contactors, current transformers and panel meters from ABB, CHINT, Himel, '
    + 'Schneider, Siemens, Hyundai and LS Electric.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+92-21-32763951',
    contactType: 'sales',
    areaServed: 'PK',
    availableLanguage: ['en', 'ur'],
  },
}

const LOCAL_BUSINESS = {
  '@type': ['Store', 'ElectricalContractor'],
  '@id': `${SITE_URL}/#store`,
  name: 'Eng-Mart',
  image: `${SITE_URL}/header_logo.png`,
  url: SITE_URL,
  telephone: '+92-21-32763951',
  email: 'info@eng-mart.com',
  priceRange: 'PKR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shop No. 5, Pak Chamber, Sarafa Bazar',
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
      urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export function SiteStructuredData() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [ORGANIZATION, LOCAL_BUSINESS, WEBSITE],
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
