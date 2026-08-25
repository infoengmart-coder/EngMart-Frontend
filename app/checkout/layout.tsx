import { privateMetadata } from '@/lib/seo'

// Private route. robots.txt disallows crawling, but a disallowed URL can still
// be INDEXED if something links to it — only a meta robots noindex actually
// keeps it out of results, and Google cannot read that tag if it is also
// blocked from fetching. Both are set deliberately.
export const metadata = privateMetadata('Checkout', '/checkout')

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
