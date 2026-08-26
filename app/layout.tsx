import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from '@/lib/smooth-scroll'
import { MotionProvider } from '@/lib/motion-provider'
import { CartProvider } from '@/lib/cart'
import { AuthGateProvider } from '@/lib/auth-gate'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
import { AccountProvider } from '@/lib/account-context'
import { SiteSettingsProvider } from '@/lib/site-settings'
import { OptionalClerkProvider } from '@/lib/clerk-provider'
import { WelcomeDiscountProvider } from '@/lib/welcome-discount'
import { WelcomeDiscountModal } from '@/components/welcome-discount-modal'
import { SiteChrome } from '@/components/site-chrome'
import { SiteStructuredData } from '@/components/structured-data'
import {
  SITE_URL, SITE_NAME, SITE_LEGAL_NAME, OG_IMAGE, CORE_KEYWORDS, clampDescription,
  NOINDEX_SITE,
} from '@/lib/seo'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  // Makes every relative OG/canonical URL across the app resolve correctly.
  metadataBase: new URL(SITE_URL),
  title: {
    // Leads with the price intent this market actually searches on, not with
    // the shop name — see the research note in lib/seo.ts.
    default: 'Industrial Electrical Products Price in Pakistan — MCB, MCCB, ACB, Contactors | Eng-Mart',
    template: '%s | Eng-Mart',
  },
  description: clampDescription(
    'Buy industrial electrical products in Pakistan at trade prices. 4,700+ MCBs, '
    + 'MCCBs, ACBs, contactors, current transformers and panel meters from ABB, '
    + 'Siemens, Schneider, CHINT, Himel and Hyundai. Karachi-based, nationwide delivery.',
  ),
  keywords: [
    ...CORE_KEYWORDS,
    'MCB price in Pakistan',
    'MCCB price in Pakistan',
    'ACB price Pakistan',
    'magnetic contactor price Pakistan',
    'current transformer price Pakistan',
    'digital panel meter price Karachi',
    'ABB Pakistan distributor',
    'Siemens switchgear Pakistan',
    'Schneider Electric Pakistan price',
    'CHINT Pakistan price list',
    'electrical shop Karachi',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_LEGAL_NAME }],
  creator: SITE_LEGAL_NAME,
  publisher: SITE_LEGAL_NAME,
  category: 'Industrial Electrical Equipment',
  alternates: { canonical: SITE_URL },
  formatDetection: { telephone: true, address: false, email: true },
  // NEXT_PUBLIC_NOINDEX=true blocks the whole site — used while the storefront
  // is live but its API is not, so Google never sees an empty catalogue.
  robots: NOINDEX_SITE
    ? { index: false, follow: false, nocache: true,
        googleBot: { index: false, follow: false } }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          // Lets Google use full-size image previews and untruncated snippets,
          // which materially improves click-through on product results.
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Industrial Electrical Products Price in Pakistan — MCB, MCCB, ACB, Contactors',
    description:
      '4,700+ industrial electrical products at trade prices from 60+ global brands. '
      + 'Karachi-based, delivery across Pakistan.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Eng-Mart — industrial electrical products and switchgear' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Electrical Products Price in Pakistan | Eng-Mart',
    description: '4,700+ MCBs, MCCBs, ACBs and contactors from 60+ global brands. Karachi, Pakistan.',
    images: [OG_IMAGE],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={`${inter.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                } catch(e) {}
              })();
            `,
          }}
        />
        <style>{`
          @keyframes wa-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.55); }
            50% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
          }
          .wa-btn { animation: wa-pulse 2.2s ease-in-out infinite; }
          .wa-btn:hover { animation: none; }
          .wa-tooltip {
            opacity: 0;
            transform: translateX(8px);
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          .wa-wrap:hover .wa-tooltip {
            opacity: 1;
            transform: translateX(0);
          }
        `}</style>
        <SiteStructuredData />
      </head>
      {/* text-foreground (not a hardcoded slate) or the token system is dead on arrival */}
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        {/* Outermost so the Google button can reach Clerk from any page.
            Renders nothing extra when Clerk is not configured. */}
        <OptionalClerkProvider>
        <ThemeProvider>
          <SiteSettingsProvider>
            <AuthProvider>
              <CartProvider>
                <AccountProvider>
                  {/* Inside AuthProvider and SiteSettingsProvider — it needs
                      both the sign-in state and the configured percentage. */}
                  <WelcomeDiscountProvider>
                  <AuthGateProvider>
                  <MotionProvider>
                    <SmoothScroll>
                      {children}
                    </SmoothScroll>
                    <WelcomeDiscountModal />
                  </MotionProvider>
                  </AuthGateProvider>
                  </WelcomeDiscountProvider>
                </AccountProvider>
              </CartProvider>
            </AuthProvider>
            <SiteChrome />
          </SiteSettingsProvider>
        </ThemeProvider>
        </OptionalClerkProvider>

      </body>
    </html>
  )
}
