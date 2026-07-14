'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SITE, CATEGORIES, BRANDS } from '@/lib/data'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-background text-foreground relative overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-10">
          
          {/* Logo column */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/header_logo.png"
                alt="Eng-Mart Logo"
                width={150}
                height={38}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs font-medium">
              Authorized distributor supplying premium industrial electrical products to Karachi and across Pakistan.
            </p>

            <div className="space-y-3">
              <a href={`tel:${SITE.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all font-semibold">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all font-semibold">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {SITE.email}
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground font-semibold leading-relaxed max-w-[240px]">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {SITE.address}
              </div>
            </div>
          </div>

          {/* Categories 1 */}
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">Categories</h3>
            <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
              {CATEGORIES.slice(0, 5).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="hover:text-primary transition-colors">
                    {cat.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories 2 */}
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">More Categories</h3>
            <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
              {CATEGORIES.slice(5, 10).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="hover:text-primary transition-colors">
                    {cat.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">Top Brands</h3>
            <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
              {BRANDS.slice(0, 5).map(brand => (
                <li key={brand.slug}>
                  <Link href={`/brands/${brand.slug}`} className="hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.color }} />
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'All Products', href: '/products' },
                { label: 'Track Order', href: '/products' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Admin Login', href: '/login' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="pt-8 mt-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-muted-foreground">
          <p>© {year} Eng-Mart. All rights reserved. Karachi, Pakistan.</p>
          
          {/* Payment Methods and Trust Badges */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Accepted: Bank Transfer / Cash on Delivery / PayOrder</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

      </div>


    </footer>
  )
}
