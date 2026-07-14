import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SmoothScroll } from '@/lib/smooth-scroll'
import { CartProvider } from '@/lib/cart'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
import { AccountProvider } from '@/lib/account-context'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
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
      </head>
      <body className="font-sans antialiased bg-background text-slate-900">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <AccountProvider>
                <SmoothScroll>
                  <div id="scroll-progress" />
                  {children}
                </SmoothScroll>
              </AccountProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

