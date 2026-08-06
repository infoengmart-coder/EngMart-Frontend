import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from '@/lib/smooth-scroll'
import { MotionProvider } from '@/lib/motion-provider'
import { CartProvider } from '@/lib/cart'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
import { AccountProvider } from '@/lib/account-context'
import { SiteSettingsProvider } from '@/lib/site-settings'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eng-mart.com').replace(/\/$/, '')

export const metadata: Metadata = {
  // Makes every relative OG/canonical URL across the app resolve correctly.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Eng-Mart | Premium Industrial Electrical Products — Karachi, Pakistan',
    template: '%s | Eng-Mart',
  },
  description:
    "Eng-Mart is Pakistan's premier supplier of premium industrial electrical products — MCBs, MCCBs, Contactors, Current Transformers, Panel Meters from ABB, CHINT, Himel, FICO, PCE, Tense, Kondas & Opas.",
  keywords: [
    'industrial electrical products Pakistan',
    'MCB price Pakistan',
    'MCCB Karachi',
    'ABB contactor Pakistan',
    'CHINT MCB Karachi',
    'Himel MCCB Pakistan',
    'current transformer Pakistan',
    'panel meter Karachi',
    'switchgear supplier Karachi',
  ],
  authors: [{ name: 'Eng-Mart' }],
  creator: 'Eng-Mart',
  publisher: 'Eng-Mart',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://eng-mart.com',
    siteName: 'Eng-Mart',
    title: 'Eng-Mart | Premium Industrial Electrical Products',
    description: "Pakistan's premier supplier of industrial electrical equipment.",
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
      </head>
      {/* text-foreground (not a hardcoded slate) or the token system is dead on arrival */}
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <SiteSettingsProvider>
            <AuthProvider>
              <CartProvider>
                <AccountProvider>
                  <MotionProvider>
                    <SmoothScroll>
                      {children}
                    </SmoothScroll>
                  </MotionProvider>
                </AccountProvider>
              </CartProvider>
            </AuthProvider>
            <FloatingWhatsApp />
          </SiteSettingsProvider>
        </ThemeProvider>

      </body>
    </html>
  )
}
