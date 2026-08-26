import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  // Storefront deployed without its API: block everything rather than let
  // Google index an empty catalogue. Set NEXT_PUBLIC_NOINDEX=true for that,
  // and remove it (then redeploy) once the backend is live.
  if ((process.env.NEXT_PUBLIC_NOINDEX || '').toLowerCase() === 'true') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private / transactional areas should never be indexed.
        disallow: ['/admin', '/admin/', '/account', '/account/', '/checkout', '/cart', '/login', '/register'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
