import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getBrand(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/brands/${slug}/`, { next: { revalidate: 600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug)

  if (!brand) {
    return { title: 'Brand', description: 'Authorized electrical brands at Eng-Mart.' }
  }

  const title = `${brand.name} Products in Pakistan`
  const description =
    brand.description ||
    `Buy genuine ${brand.name} industrial electrical products in Pakistan${
      brand.origin_country ? ` — made in ${brand.origin_country}` : ''
    }. Authorized distributor, Karachi.`
  const url = `${SITE_URL}/brands/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description, siteName: 'Eng-Mart' },
  }
}

export default function BrandLayout({ children }: Props) {
  return <>{children}</>
}
