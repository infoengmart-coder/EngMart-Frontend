'use client'

import Link from 'next/link'
import { SITE, CATEGORIES, BRANDS } from '@/lib/data'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      {/* Background visual detail */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_center,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
          
          {/* Logo column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-black text-lg">
                E
              </div>
              <div>
                <div className="flex items-baseline font-extrabold text-[16px] tracking-tight text-white">
                  <span>Eng</span>
                  <span className="text-primary">-Mart</span>
                </div>
                <p className="text-[9px] text-slate-500 font-mono tracking-widest -mt-1 uppercase">Industrial</p>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Authorized distributor supplying premium industrial electrical products to Karachi and across Pakistan.
            </p>

            <div className="space-y-3">
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-all">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-all">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {SITE.email}
              </a>
              <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed max-w-[240px]">
                <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {SITE.address}
              </div>
            </div>
          </div>

          {/* Categories 1 */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">MCB & MCCB</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {CATEGORIES.slice(0, 5).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                    {cat.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories 2 */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Switchgear</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {CATEGORIES.slice(5).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                    {cat.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Official Brands</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {BRANDS.map(brand => (
                <li key={brand.slug}>
                  <Link href={`/brands/${brand.slug}`} className="hover:text-primary hover:translate-x-1 inline-flex items-center gap-2 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brand.color }} />
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Company</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {[
                { label: 'About', href: '/about' },
                { label: 'Products', href: '/products' },
                { label: 'Contact', href: '/contact' },
                { label: 'Login', href: '/login' },
                { label: 'My Cart', href: '/cart' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary hover:translate-x-1 inline-block transition-all">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="pt-8 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} Eng-Mart. All rights reserved. Karachi, Pakistan.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>

      </div>

      {/* WhatsApp float button */}
      <a
        href={`https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, '')}?text=Hi Eng-Mart, I need a quote for electrical products.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all bg-emerald-500 hover:bg-emerald-600 text-white w-12 h-12"
        aria-label="Contact WhatsApp"
      >
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.488 2.028 14.032.996 11.999.996 6.561.996 2.135 5.37 2.13 9.8c-.001 1.66.43 3.278 1.248 4.697l-.272.997-.999 3.65 3.754-.972.196.115c1.4.83 2.98 1.265 4.599 1.265zm9.825-7.391c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      </a>
    </footer>
  )
}
