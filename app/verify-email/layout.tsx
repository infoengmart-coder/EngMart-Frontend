import { privateMetadata } from '@/lib/seo'

// Private route, and one whose URL carries the customer's email in the query
// string — keeping it out of search results matters more here than on most
// pages. See app/login/layout.tsx for why both robots.txt and noindex are set.
export const metadata = privateMetadata('Verify Your Email', '/verify-email')

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
