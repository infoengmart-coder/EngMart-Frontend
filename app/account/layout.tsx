import { privateMetadata } from '@/lib/seo'
import { AccountShell } from '@/components/account-shell'

// This route's UI is a client component, which cannot export `metadata` — so
// the shell moved to components/ and this thin server layout carries the SEO.
// Private area: robots.txt disallows it, but only a meta robots noindex
// actually keeps a linked URL out of the index.
export const metadata = privateMetadata('My Account', '/account')

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>
}
