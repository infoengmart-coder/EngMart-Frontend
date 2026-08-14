// =============================================================
// Eng-Mart API Client — connects frontend to Django REST backend
// =============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ─── Types ───────────────────────────────────────────────────

export type Brand = {
  id: number
  name: string
  slug: string
  logo: string | null
  color: string
  origin_country?: string
  supplier_name?: string
  product_count?: number
  categories?: CategoryChild[]
}

export type CategoryChild = {
  id: number
  name: string
  slug: string
  short_name: string
  icon: string
  color: string
  product_count: number
}

export type Category = CategoryChild & {
  description?: string
  image?: string | null
  order?: number
  children?: CategoryChild[]
  parent?: CategoryChild | null
  brands?: Brand[]
}

export type ProductVariant = {
  id: number
  cat_no: string
  description: string
  price: string | null
  price_on_request: boolean
  specs: Record<string, string>
  order: number
}

export type ProductImage = {
  id: number
  image: string
  alt_text: string
  is_primary: boolean
  order: number
}

export type Product = {
  id: number
  name: string
  slug: string
  brand: Brand
  brand_name: string
  category: CategoryChild
  category_name: string
  series: string
  short_description: string
  image: string | null
  is_featured: boolean
  price_range: { min: number; max: number } | null
  has_price_on_request: boolean
  variant_count: number
  first_variant: {
    // Sent by the backend serializer; the admin form round-trips it so edits
    // update the existing variant row instead of appending a duplicate.
    id?: number
    cat_no: string
    description: string
    price: string | null
    price_on_request: boolean
    specs: Record<string, string>
  } | null
}

export type ProductDetail = Product & {
  full_description: string
  datasheet_url: string
  meta_title: string
  meta_description: string
  variants: ProductVariant[]
  images: ProductImage[]
  related_products: Product[]
  created_at: string
  updated_at: string
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ProductFilters = {
  brand?: string
  category?: string
  search?: string
  is_featured?: boolean
  /** Minimum variant price, in PKR. */
  min_price?: number
  /** Maximum variant price, in PKR. */
  max_price?: number
  /** Specification text, e.g. "32A", "3 Pole", "IP67". */
  spec?: string
  /** Exclude "Price on Request" items. */
  priced_only?: boolean
  ordering?: string
  page?: number
  page_size?: number
}

/** Bounds and suggestions used to render the product filter controls. */
export type ProductFilterMeta = {
  min_price: number
  max_price: number
  spec_suggestions: string[]
}

export async function getProductFilterMeta(): Promise<ProductFilterMeta> {
  return apiClientFetch<ProductFilterMeta>('/products/filter-meta/')
}

// ─── Client-side cache: stale-while-revalidate + request dedupe ──
//
// Navigating back to a page you have already visited should feel instant, so a
// cached response is returned immediately and refreshed in the background when
// it is older than FRESH_TTL. Entries older than MAX_AGE are treated as absent
// and are awaited normally.
//
// `_inflight` collapses concurrent requests for the same URL into one network
// call — React re-mounts effects (twice in StrictMode) and several components
// on a page often want the same data.

const FRESH_TTL = 60_000        // serve without refetching
const MAX_AGE = 10 * 60_000     // beyond this, treat as a cold miss

const _cache = new Map<string, { data: unknown; ts: number }>()
const _inflight = new Map<string, Promise<unknown>>()

type CacheLookup<T> = { data: T; stale: boolean } | null

function getCached<T>(key: string): CacheLookup<T> {
  const entry = _cache.get(key)
  if (!entry) return null
  const age = Date.now() - entry.ts
  if (age > MAX_AGE) {
    _cache.delete(key)
    return null
  }
  return { data: entry.data as T, stale: age > FRESH_TTL }
}

function setCache<T>(key: string, data: T): T {
  _cache.set(key, { data, ts: Date.now() })
  return data
}

export function invalidateCache(prefix?: string) {
  if (!prefix) { _cache.clear(); _inflight.clear(); return }
  for (const key of _cache.keys()) {
    if (key.startsWith(prefix)) _cache.delete(key)
  }
  for (const key of _inflight.keys()) {
    if (key.startsWith(prefix)) _inflight.delete(key)
  }
}

/** Fetch a URL once even if several callers ask for it at the same time. */
function dedupedFetch<T>(url: string): Promise<T> {
  const existing = _inflight.get(url)
  if (existing) return existing as Promise<T>

  const request = fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    .then(async (res) => {
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
      return setCache(url, await res.json())
    })
    .finally(() => { _inflight.delete(url) })

  _inflight.set(url, request)
  return request as Promise<T>
}

// ─── Fetch helper ────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  // In the browser, go through the shared cache so repeated calls for the same
  // resource (navbar, footer and page body all want categories/brands) collapse
  // into one request and stay cached across client-side navigations. Next's
  // `revalidate` hint only applies on the server, so without this every mount
  // issued a fresh network call.
  if (typeof window !== 'undefined') {
    return apiClientFetch<T>(endpoint, params)
  }

  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Client-side fetch: instant from cache, refreshed in the background
async function apiClientFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  const key = url.toString()
  const cached = getCached<T>(key)

  if (cached) {
    // Refresh in the background when stale, but return the cached copy now so
    // the page paints immediately instead of showing a spinner.
    if (cached.stale) void dedupedFetch<T>(key).catch(() => {})
    return cached.data
  }

  return dedupedFetch<T>(key)
}

/**
 * Warm the cache for a URL without blocking. Safe to call on link hover or
 * after first paint — repeat calls collapse into a single request.
 */
export function prefetch(endpoint: string, params?: Record<string, string>) {
  if (typeof window === 'undefined') return
  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }
  const key = url.toString()
  if (getCached(key)) return
  void dedupedFetch(key).catch(() => {})
}

// ─── Products API ────────────────────────────────────────────

export async function getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params: Record<string, string> = {}
  if (filters?.brand) params.brand = filters.brand
  if (filters?.category) params.category = filters.category
  if (filters?.search) params.search = filters.search
  if (filters?.is_featured !== undefined) params.is_featured = String(filters.is_featured)
  if (filters?.min_price !== undefined) params.min_price = String(filters.min_price)
  if (filters?.max_price !== undefined) params.max_price = String(filters.max_price)
  if (filters?.spec) params.spec = filters.spec
  if (filters?.priced_only) params.priced_only = 'true'
  if (filters?.ordering) params.ordering = filters.ordering
  if (filters?.page) params.page = String(filters.page)
  if (filters?.page_size) params.page_size = String(filters.page_size)

  return apiClientFetch<PaginatedResponse<Product>>('/products/', params)
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/products/${slug}/`)
}

export async function searchProducts(query: string): Promise<PaginatedResponse<Product>> {
  return apiClientFetch<PaginatedResponse<Product>>('/products/search/', { q: query })
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/products/featured/')
}

// ─── Brands API ──────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
  return apiFetch<Brand[]>('/brands/')
}

export async function getBrand(slug: string): Promise<Brand> {
  return apiFetch<Brand>(`/brands/${slug}/`)
}

// ─── Categories API ──────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories/')
}

export async function getCategory(slug: string): Promise<Category> {
  return apiFetch<Category>(`/categories/${slug}/`)
}

// ─── Inquiries Submission API ─────────────────────────────────

export type InquiryPayload = {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  product_interest?: string
}

export async function submitInquiry(data: InquiryPayload & { product_slug?: string }): Promise<{ message: string }> {
  // Map product_slug → product_interest for backend compatibility
  const { product_slug, ...rest } = data
  const payload = {
    ...rest,
    product_interest: data.product_interest || product_slug || '',
  }

  const res = await fetch(`${API_BASE}/inquiries/submit/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Submit failed: ${res.status}`)
  }

  return res.json()
}

// ─── Utility: Format price ──────────────────────────────────

export function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined) return 'Get a Quote'
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return 'Get a Quote'
  return `PKR ${num.toLocaleString('en-PK')}`
}

export function formatPriceRange(range: { min: number; max: number } | null): string {
  if (!range) return 'Get a Quote'
  if (range.min === range.max) return formatPrice(range.min)
  return `PKR ${range.min.toLocaleString('en-PK')} – ${range.max.toLocaleString('en-PK')}`
}

// ─── Orders API ──────────────────────────────────────────────

export type OrderItemPayload = {
  product_id: number
  variant_id?: number | null
  product_name: string
  variant_description?: string
  cat_no?: string
  brand_name?: string
  quantity: number
  unit_price: number
  is_price_on_request: boolean
}

export type OrderPayload = {
  customer_name: string
  customer_email: string
  customer_phone: string
  company_name?: string
  shipping_address: string
  city?: string
  notes?: string
  payment_method: 'cod' | 'bank' | 'whatsapp'
  promo_code?: string
  items: OrderItemPayload[]
}

export type OrderResponse = {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  company_name: string
  subtotal: string
  discount_amount: string
  total: string
  promo_code_text: string
  status: string
  payment_method: string
  payment_status: string
  items: {
    id: number
    // Live catalog references (null if the product was deleted after ordering).
    product_id: number | null
    variant_id: number | null
    product_slug: string | null
    product_image: string | null
    product_name: string
    variant_description: string
    cat_no: string
    brand_name: string
    quantity: number
    unit_price: string
    line_total: string
    is_price_on_request: boolean
  }[]
  created_at: string
}

export async function createOrder(data: OrderPayload): Promise<OrderResponse> {
  // Send the token when the buyer is signed in. Checkout stays open to guests
  // (the endpoint is AllowAny), but WITHOUT this header the backend sees an
  // anonymous request and never links the order to the account — so the buyer's
  // own order never appeared under My Orders or in the account totals.
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || JSON.stringify(err) || `Order failed: ${res.status}`)
  }

  return res.json()
}

// ─── Payment slip upload ─────────────────────────────────────

export type PaymentSlipResult = {
  message: string
  order_number: string
  payment_slip: string
  payment_reference: string
}

/**
 * Upload proof of a bank transfer against an order.
 * Public — guests check out without an account, so the order number is the key.
 */
export async function uploadPaymentSlip(
  orderNumber: string, file: File, reference?: string,
): Promise<PaymentSlipResult> {
  const fd = new FormData()
  fd.append('payment_slip', file)
  if (reference) fd.append('payment_reference', reference)

  const res = await fetch(`${API_BASE}/orders/${orderNumber}/payment-slip/`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload failed: ${res.status}`)
  }
  return res.json()
}

// ─── Promo Code API ──────────────────────────────────────────

export type PromoValidationResult = {
  valid: boolean
  code?: string
  discount_type?: 'percentage' | 'fixed'
  discount_value?: string
  discount_amount?: string
  description?: string
  error?: string
}

export async function validatePromoCode(code: string, subtotal: number): Promise<PromoValidationResult> {
  const res = await fetch(`${API_BASE}/promo/validate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ code, subtotal }),
  })

  const data = await res.json()
  return data
}

// ─── Admin API Functions ─────────────────────────────────────

export type AdminStatsResponse = {
  total_revenue: number
  monthly_revenue: number
  total_orders: number
  pending_orders: number
  total_customers: number
  total_products: number
  new_inquiries: number
  total_inquiries: number
  recent_orders: OrderResponse[]
  recent_inquiries: InquiryResponse[]
  // Optional: the backend does not send these yet. The dashboard renders
  // honest empty states until it does — do not fake values client-side.
  revenue_chart?: { label: string; value: number }[]
  low_stock_items?: { name: string; stock?: number }[]
  top_selling?: { product_name: string; total_sold?: number; revenue?: number }[]
}

export type InquiryResponse = {
  id: number
  name: string
  company: string
  phone: string
  email: string
  message: string
  product_interest: string
  status: 'new' | 'read' | 'replied' | 'closed'
  notes: string
  created_at: string
  updated_at: string
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return authFetch<AdminStatsResponse>('/orders/stats/')
}

export async function getAdminOrders(params?: { search?: string; status?: string }): Promise<PaginatedResponse<OrderResponse>> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return authFetch<PaginatedResponse<OrderResponse>>(`/orders/list/${qs}`)
}

export async function updateOrderStatus(orderNumber: string, data: Partial<OrderResponse>): Promise<OrderResponse> {
  return authFetch<OrderResponse>(`/orders/${orderNumber}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function createProduct(data: any): Promise<ProductDetail> {
  return authFetch<ProductDetail>('/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProduct(slug: string, data: any): Promise<ProductDetail> {
  invalidateCache() // clear product cache after edit
  return authFetch<ProductDetail>(`/products/${slug}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteProduct(slug: string): Promise<void> {
  invalidateCache() // clear product cache after delete
  await authFetch(`/products/${slug}/`, { method: 'DELETE' })
}

// ─── Admin: Product image upload ─────────────────────────────
// Files go to dedicated endpoints. The product body stays JSON because DRF's
// multipart parser cannot round-trip the nested `variants` list — sending both
// together would silently discard variant edits.

/** Upload or replace a product's main image. */
export async function uploadProductImage(slug: string, file: File): Promise<ProductDetail> {
  const fd = new FormData()
  fd.append('image', file)
  invalidateCache()
  return authFetch<ProductDetail>(`/products/${slug}/image/`, { method: 'POST', body: fd })
}

/** Remove a product's main image. */
export async function deleteProductImage(slug: string): Promise<void> {
  invalidateCache()
  await authFetch(`/products/${slug}/image/`, { method: 'DELETE' })
}

/** Add an image to a product's gallery. */
export async function uploadProductGalleryImage(
  slug: string, file: File, altText?: string,
): Promise<ProductImage> {
  const fd = new FormData()
  fd.append('image', file)
  if (altText) fd.append('alt_text', altText)
  invalidateCache()
  return authFetch<ProductImage>(`/products/${slug}/images/`, { method: 'POST', body: fd })
}

/** Delete one gallery image by id. */
export async function deleteProductGalleryImage(id: number): Promise<void> {
  invalidateCache()
  await authFetch(`/products/images/${id}/`, { method: 'DELETE' })
}

export async function getInquiries(params?: { search?: string; status?: string }): Promise<PaginatedResponse<InquiryResponse>> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return authFetch<PaginatedResponse<InquiryResponse>>(`/inquiries/${qs}`)
}

export async function updateInquiryStatus(id: number, data: Partial<InquiryResponse>): Promise<InquiryResponse> {
  return authFetch<InquiryResponse>(`/inquiries/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// createInquiry is an alias for submitInquiry (both POST to /inquiries/submit/)
export const createInquiry = submitInquiry


// ─── Auth-Protected Fetch Helper ─────────────────────────────

function getAuthToken(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('engmart_tokens') : null
    return raw ? JSON.parse(raw).access : null
  } catch { return null }
}

async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const url = `${API_BASE}${endpoint}`
  // For FormData uploads, let the browser set the multipart Content-Type + boundary.
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || JSON.stringify(err) || `API error: ${res.status}`)
  }

  // 204 No Content (e.g. DELETE) has no body to parse.
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

// ─── SWR-compatible fetcher ──────────────────────────────────
export const swrFetcher = (endpoint: string) => authFetch(endpoint)

// ─── Customers API ───────────────────────────────────────────

export type CustomerData = {
  name: string
  company: string
  email: string
  phone: string
  type: 'Retail' | 'Wholesale'
  total_orders: number
  lifetime_value: number
  joined: string
}

export async function getCustomers(params?: { search?: string; type?: string }): Promise<{ results: CustomerData[]; count: number }> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.type) query.set('type', params.type)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return authFetch(`/orders/customers/${qs}`)
}

// ─── Reports API ─────────────────────────────────────────────

export type ReportData = {
  total_revenue: number
  monthly_revenue: number
  avg_order_value: number
  revenue_change: number
  total_orders: number
  monthly_chart: { month: string; value: number }[]
  top_selling: { rank: number; product_name: string; brand_name: string; cat_no: string; units: number; revenue: number; category: string }[]
  brand_performance: { brand_name: string; revenue: number; percentage: number }[]
}

export async function getReports(): Promise<ReportData> {
  return authFetch('/orders/reports/')
}

// ─── Promo Code CRUD API ─────────────────────────────────────

export type PromoCodeData = {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: string
  min_order_amount: string
  max_discount_amount: string | null
  max_uses: number
  times_used: number
  is_active: boolean
  valid_from: string
  valid_until: string | null
  created_at: string
}

export async function getPromoCodes(): Promise<PromoCodeData[]> {
  return authFetch('/promo/')
}

export async function createPromoCode(data: Partial<PromoCodeData>): Promise<PromoCodeData> {
  return authFetch('/promo/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updatePromoCode(id: number, data: Partial<PromoCodeData>): Promise<PromoCodeData> {
  return authFetch(`/promo/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deletePromoCode(id: number): Promise<void> {
  await authFetch(`/promo/${id}/`, { method: 'DELETE' })
}

// ─── Admin: Categories CRUD ──────────────────────────────────

export type AdminCategory = {
  id: number
  name: string
  slug: string
  parent: number | null
  parent_name?: string
  short_name: string
  description: string
  icon: string
  image: string | null
  color: string
  order: number
  is_active: boolean
  product_count: number
  created_at: string
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  // ?all=true returns every category (incl. inactive & subcategories) as a flat list
  return authFetch<AdminCategory[]>('/categories/?all=true')
}

export async function createCategory(data: FormData | Record<string, unknown>): Promise<AdminCategory> {
  invalidateCache('http') // catalog cache references categories
  return authFetch<AdminCategory>('/categories/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
}

export async function updateCategory(slug: string, data: FormData | Record<string, unknown>): Promise<AdminCategory> {
  invalidateCache('http')
  return authFetch<AdminCategory>(`/categories/${slug}/`, {
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
}

export async function deleteCategory(slug: string): Promise<void> {
  invalidateCache('http')
  await authFetch(`/categories/${slug}/`, { method: 'DELETE' })
}

// ─── Admin: Brands CRUD ──────────────────────────────────────

export type AdminBrand = {
  id: number
  name: string
  slug: string
  logo: string | null
  origin_country: string
  supplier_name: string
  supplier_contact: string
  description: string
  color: string
  website: string
  order: number
  is_active: boolean
  product_count: number
  created_at: string
}

export async function getAdminBrands(): Promise<AdminBrand[]> {
  return authFetch<AdminBrand[]>('/brands/?all=true')
}

export async function createBrand(data: FormData | Record<string, unknown>): Promise<AdminBrand> {
  invalidateCache('http')
  return authFetch<AdminBrand>('/brands/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
}

export async function updateBrand(slug: string, data: FormData | Record<string, unknown>): Promise<AdminBrand> {
  invalidateCache('http')
  return authFetch<AdminBrand>(`/brands/${slug}/`, {
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
}

export async function deleteBrand(slug: string): Promise<void> {
  invalidateCache('http')
  await authFetch(`/brands/${slug}/`, { method: 'DELETE' })
}

// ─── Banners API ─────────────────────────────────────────────

export type BannerType = 'hero' | 'carousel' | 'sidebar'

export type BannerData = {
  id: number
  type: BannerType
  title: string
  subtitle: string
  badge: string
  cta_text: string
  cta_link: string
  cta_text_2: string
  cta_link_2: string
  image: string | null
  image_url: string
  image_src: string
  video_url: string
  highlights: string[]
  accent_color: string
  text_color: string
  bg_color: string
  is_active: boolean
  order: number
}

/** Public: active banners only. Pass a type to fetch one placement. */
export async function getBanners(type?: BannerType): Promise<BannerData[]> {
  const params: Record<string, string> = {}
  if (type) params.type = type
  return apiClientFetch<BannerData[]>('/banners/', params)
}

/** Admin: every banner, including inactive ones. */
export async function getAdminBanners(): Promise<BannerData[]> {
  return authFetch<BannerData[]>('/banners/?all=true')
}

export async function createBanner(data: FormData | Record<string, unknown>): Promise<BannerData> {
  invalidateCache('http')
  return authFetch<BannerData>('/banners/', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
}

export async function updateBanner(id: number, data: FormData | Record<string, unknown>): Promise<BannerData> {
  invalidateCache('http')
  return authFetch<BannerData>(`/banners/${id}/`, {
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
}

export async function deleteBanner(id: number): Promise<void> {
  invalidateCache('http')
  await authFetch(`/banners/${id}/`, { method: 'DELETE' })
}

// ─── Customer Account API (authenticated) ────────────────────

/** The signed-in customer's own order history. */
export async function getMyOrders(): Promise<PaginatedResponse<OrderResponse>> {
  return authFetch<PaginatedResponse<OrderResponse>>('/account/orders/')
}

/** One of the signed-in customer's own orders. */
export async function getMyOrder(orderNumber: string): Promise<OrderResponse> {
  return authFetch<OrderResponse>(`/account/orders/${orderNumber}/`)
}

/** Quote requests raised by the signed-in customer. */
export async function getMyQuotes(): Promise<{ count: number; results: QuotationData[] }> {
  return authFetch('/account/quotes/')
}

/**
 * Ask for a password reset link.
 *
 * Answers the same whether or not the email is registered — do not "improve"
 * this by reporting unknown addresses, or the form becomes a way to test which
 * of the client's customers have accounts.
 */
export async function requestPasswordReset(email: string): Promise<{ detail: string }> {
  const res = await fetch(`${API_BASE}/auth/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || data.email?.[0] || 'Request failed')
  return data
}

/** Complete a password reset using the emailed uid + token. */
export async function confirmPasswordReset(
  payload: { uid: string; token: string; password: string },
): Promise<{ detail: string }> {
  const res = await fetch(`${API_BASE}/auth/password-reset/confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || data.password?.[0] || 'Reset failed')
  return data
}

/** Public headline catalog numbers for the storefront hero. */
export type CatalogStats = { products: number; brands: number; categories: number }

export async function getCatalogStats(): Promise<CatalogStats> {
  return apiClientFetch<CatalogStats>('/products/stats/')
}

// ─── Notifications ───────────────────────────────────────────

export type NotificationItem = {
  id: number
  kind: string
  title: string
  body: string
  link: string
  created_at: string
  is_read: boolean
}

export async function getNotifications(): Promise<{ results: NotificationItem[]; unread: number }> {
  return authFetch('/notifications/')
}

/** Mark specific notifications read, or all of them when ids is omitted. */
export async function markNotificationsRead(ids?: number[]): Promise<void> {
  await authFetch('/notifications/read/', {
    method: 'POST',
    body: JSON.stringify(ids ? { ids } : {}),
  })
}

/** Send the shop's reply to a customer inquiry (emails them). */
export async function replyToInquiry(id: number, reply: string): Promise<InquiryResponse> {
  return authFetch(`/inquiries/${id}/reply/`, {
    method: 'POST',
    body: JSON.stringify({ reply }),
  })
}

/** Cancel one of the signed-in customer's own orders (pending/confirmed only). */
export async function cancelMyOrder(orderNumber: string): Promise<OrderResponse> {
  return authFetch(`/account/orders/${orderNumber}/cancel/`, { method: 'POST' })
}

/** Request a return on a delivered order. */
export async function requestMyOrderReturn(orderNumber: string): Promise<OrderResponse> {
  return authFetch(`/account/orders/${orderNumber}/return/`, { method: 'POST' })
}

/** Contact/support messages sent by the signed-in customer. */
export async function getMyInquiries(): Promise<{ count: number; results: InquiryResponse[] }> {
  return authFetch('/account/inquiries/')
}

// ─── Saved addresses ─────────────────────────────────────────

export type SavedAddressData = {
  id: number
  name: string
  company: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  province: string
  postal_code: string
  country: string
  is_default: boolean
}

export async function getSavedAddresses(): Promise<SavedAddressData[]> {
  return authFetch<SavedAddressData[]>('/account/addresses/')
}

export async function createSavedAddress(
  data: Partial<SavedAddressData>,
): Promise<SavedAddressData> {
  return authFetch<SavedAddressData>('/account/addresses/', {
    method: 'POST', body: JSON.stringify(data),
  })
}

export async function updateSavedAddress(
  id: number, data: Partial<SavedAddressData>,
): Promise<SavedAddressData> {
  return authFetch<SavedAddressData>(`/account/addresses/${id}/`, {
    method: 'PATCH', body: JSON.stringify(data),
  })
}

export async function deleteSavedAddress(id: number): Promise<void> {
  await authFetch(`/account/addresses/${id}/`, { method: 'DELETE' })
}

// ─── Wishlist ────────────────────────────────────────────────

export type WishlistEntry = {
  id: number
  product: Product
  created_at: string
}

export async function getWishlist(): Promise<WishlistEntry[]> {
  return authFetch<WishlistEntry[]>('/account/wishlist/')
}

/** Add a product to the wishlist. Safe to call twice. */
export async function addToWishlist(productId: number): Promise<WishlistEntry> {
  return authFetch<WishlistEntry>(`/account/wishlist/${productId}/`, { method: 'POST' })
}

export async function removeFromWishlist(productId: number): Promise<void> {
  await authFetch(`/account/wishlist/${productId}/`, { method: 'DELETE' })
}

/** Update the signed-in user's own profile. */
export async function updateMyProfile(
  data: { first_name?: string; last_name?: string; email?: string },
): Promise<{ id: number; username: string; email: string; first_name: string; last_name: string; is_admin: boolean }> {
  return authFetch('/auth/me/', { method: 'PATCH', body: JSON.stringify(data) })
}

// ─── Quotations (RFQ) API ────────────────────────────────────

export type QuotationItemData = {
  id?: number
  product?: number | null
  product_name: string
  variant_description?: string
  cat_no?: string
  brand_name?: string
  quantity: number
  quoted_price?: string | null
  line_total?: string
  notes?: string
}

export type QuotationData = {
  id: number
  quote_number: string
  name: string
  company: string
  email: string
  phone: string
  notes: string
  admin_notes: string
  status: 'pending' | 'quoted' | 'converted' | 'expired'
  source: 'product' | 'cart' | 'whatsapp' | 'contact'
  quoted_total: string
  valid_until: string | null
  quoted_at: string | null
  converted_order: number | null
  items: QuotationItemData[]
  item_count: number
  created_at: string
  updated_at: string
}

export type QuotationSubmitPayload = {
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  source?: QuotationData['source']
  items?: Omit<QuotationItemData, 'id' | 'line_total' | 'quoted_price'>[]
}

/** Public: submit a quote request from the storefront. */
export async function submitQuotation(
  data: QuotationSubmitPayload,
): Promise<{ message: string; quote_number: string }> {
  const res = await fetch(`${API_BASE}/quotations/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || JSON.stringify(err) || `Submit failed: ${res.status}`)
  }
  return res.json()
}

/** Admin: list quotations. */
export async function getQuotations(
  params?: { search?: string; status?: string },
): Promise<PaginatedResponse<QuotationData>> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return authFetch<PaginatedResponse<QuotationData>>(`/quotations/${qs}`)
}

/** Admin: update a quotation (status, quoted prices, internal notes). */
export async function updateQuotation(
  id: number, data: Partial<QuotationData>,
): Promise<QuotationData> {
  return authFetch<QuotationData>(`/quotations/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/** Admin: delete a quotation. */
export async function deleteQuotation(id: number): Promise<void> {
  await authFetch(`/quotations/${id}/`, { method: 'DELETE' })
}

// ─── Site Settings API ───────────────────────────────────────

export type SiteSettingsData = {
  id: number
  name: string
  tagline: string
  description: string
  url: string
  logo: string | null
  phone: string
  mobile: string
  email: string
  address: string
  hours: string
  hours_note: string
  whatsapp: string
  whatsapp_digits: string
  map_embed_url: string
  map_link_url: string
  facebook_url: string
  instagram_url: string
  linkedin_url: string
  twitter_url: string
  youtube_url: string
  cod_enabled: boolean
  bank_transfer_enabled: boolean
  mobile_wallet_enabled: boolean
  whatsapp_order_enabled: boolean
  bank_name: string
  bank_account_title: string
  bank_account_number: string
  bank_iban: string
  bank_branch: string
  bank_swift: string
  bank_name_2: string
  bank_account_title_2: string
  bank_account_number_2: string
  bank_iban_2: string
  bank_branch_2: string
  bank_transfer_note: string
  jazzcash_number: string
  jazzcash_title: string
  easypaisa_number: string
  easypaisa_title: string
  free_shipping_threshold: string
  footer_payment_note: string
  copyright_text: string
}

/** Public: store configuration used across the storefront. */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  return apiClientFetch<SiteSettingsData>('/settings/')
}

/** Admin: persist store configuration changes. */
export async function updateSiteSettings(
  data: FormData | Partial<SiteSettingsData>,
): Promise<SiteSettingsData> {
  invalidateCache('http')
  return authFetch<SiteSettingsData>('/settings/', {
    method: 'PATCH',
    body: data instanceof FormData ? data : JSON.stringify(data),
  })
}

// Prepend the backend origin to a relative media path (logos, images).
export function mediaUrl(path: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = API_BASE.replace(/\/api\/?$/, '')
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
}

