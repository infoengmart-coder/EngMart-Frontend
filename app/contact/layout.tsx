import { pageMetadata } from '@/lib/seo'

// NOTE: the street address that used to sit in this description was removed at
// the client's request — no physical address is published anywhere on the site,
// and a meta description is exactly where Google would surface one.
export const metadata = pageMetadata({
  title: 'Contact Us — Get a Quote on Industrial Electrical Products',
  description:
    'Request a quotation or bulk trade pricing on MCBs, MCCBs, ACBs, contactors and panel '
    + 'meters. Call or WhatsApp our sales engineers, or send an enquiry and get a reply the '
    + 'same working day.',
  path: '/contact',
  keywords: [
    'electrical supplier contact Karachi',
    'request quote electrical Pakistan',
    'bulk electrical pricing Pakistan',
    'switchgear quotation Karachi',
  ],
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
