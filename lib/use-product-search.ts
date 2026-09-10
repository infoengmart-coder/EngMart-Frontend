'use client'

/**
 * Live product suggestions for a search box.
 *
 * Extracted from the navbar so the catalogue page can use the identical
 * behaviour. That page previously required typing a term and then clicking
 * "Search Catalog" — two deliberate actions before seeing anything, on the one
 * page where people arrive specifically to find a product. The navbar already
 * suggested as you typed, so the same site taught two different habits.
 *
 * Three details matter here and are easy to get wrong:
 *
 *  • DEBOUNCE. Firing on every keystroke would put eight requests in flight
 *    for "NXB-63" and hammer an API on a free tier.
 *  • SEQUENCE GUARD. Responses can arrive out of order — a slow request for
 *    "NX" landing after a fast one for "NXB-63" would overwrite good results
 *    with stale ones. Only the newest sequence number is allowed to write.
 *  • MINIMUM LENGTH. One character matches most of the catalogue and is never
 *    a useful suggestion list.
 */

import { useEffect, useRef, useState } from 'react'
import { getProducts } from '@/lib/api'

export type SearchSuggestion = {
  name: string
  slug: string
  brand: string
  category: string
  catNo: string
  image: string | null
  price: number | null
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250

export function useProductSearch(query: string, limit = 6) {
  const [results, setResults] = useState<SearchSuggestion[]>([])
  const [searching, setSearching] = useState(false)
  const seqRef = useRef(0)

  useEffect(() => {
    const q = query.trim()
    if (q.length < MIN_QUERY_LENGTH) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    const seq = ++seqRef.current

    const timer = setTimeout(async () => {
      try {
        const res = await getProducts({ search: q, page_size: limit })
        if (seq !== seqRef.current) return // a newer keystroke won
        setResults(
          (res.results || []).map(p => ({
            name: p.name,
            slug: p.slug,
            brand: p.brand_name || p.brand?.name || '',
            category: p.category_name || p.category?.name || '',
            catNo: p.first_variant?.cat_no || p.series || '',
            image: p.image || null,
            price: p.price_range?.min ?? (p.first_variant?.price ? Number(p.first_variant.price) : null),
          })),
        )
      } catch {
        if (seq === seqRef.current) setResults([])
      } finally {
        if (seq === seqRef.current) setSearching(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, limit])

  return { results, searching }
}
