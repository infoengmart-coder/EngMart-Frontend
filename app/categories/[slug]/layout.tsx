import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/categories/${slug}/`, { next: { revalidate: 600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Category', description: 'Industrial electrical categories at Eng-Mart.' }
  }

  const title = `${category.name} — Price in Pakistan`
  const description =
    category.description ||
    `Browse ${category.name} from ABB, CHINT, Himel, FICO and more. Genuine industrial electrical products supplied across Pakistan by Eng-Mart, Karachi.`
  const url = `${SITE_URL}/categories/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description, siteName: 'Eng-Mart' },
  }
}

export default function CategoryLayout({ children }: Props) {
  return <>{children}</>
}
