import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for purchasing industrial electrical products from Eng-Mart — '
    + 'pricing, payment, delivery within Pakistan, returns and manufacturer warranty.',
  path: '/terms',
})

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
