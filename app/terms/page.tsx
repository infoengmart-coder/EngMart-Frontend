'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useSiteSettings } from '@/lib/site-settings'
import {
  ChevronDown, Copyright, FileCheck, FileText, Gavel, Landmark, Lock,
  MessageCircleQuestion, Package, RotateCcw, Scale, ScrollText, ShieldAlert,
  Tag, Truck, UserCog, type LucideIcon,
} from 'lucide-react'

// Icons referenced by name from the SECTIONS list below.
const ICONS: Record<string, LucideIcon> = {
  Copyright, FileCheck, Gavel, Landmark, Lock, Package, RotateCcw, Scale,
  ShieldAlert, Tag, Truck, UserCog,
}

/**
 * Terms & Conditions.
 *
 * The commercial terms below reflect how Eng-Mart actually trades (bank
 * transfer to Meezan Bank, Pakistan-only delivery, quote-based pricing).
 * Contact details and bank details are pulled from Site Settings so they stay
 * correct when the client edits them in the admin panel.
 */
export default function TermsPage() {
  const { settings: SITE } = useSiteSettings()

  const SECTIONS = [
    {
      id: 'acceptance',
      icon: 'FileCheck',
      title: '1. Acceptance of Terms',
      body: [
        `By accessing this website, placing an order, or requesting a quotation from ${SITE.name}, you agree to be bound by these Terms and Conditions.`,
        'If you do not agree with any part of these terms, please do not use this website or place an order.',
        'We may update these terms from time to time. The version published on this page at the time of your order applies to that order.',
      ],
    },
    {
      id: 'products',
      icon: 'Package',
      title: '2. Products & Specifications',
      body: [
        'All products supplied are genuine articles sourced from authorised distributors and manufacturers.',
        'Product images are for illustration only. Actual items may differ in appearance, packaging, or minor revision. Technical specifications, catalogue numbers, and ratings take precedence over images.',
        'Some products in our catalogue are listed with model number, specification, and price only, without an image or extended description. This does not affect the product supplied.',
        'We make every effort to keep specifications accurate, but manufacturers may revise designs without notice. Where a specification is critical to your application, please confirm with our technical team before ordering.',
      ],
    },
    {
      id: 'pricing',
      icon: 'Tag',
      title: '3. Pricing & Quotations',
      body: [
        'All prices are quoted in Pakistani Rupees (PKR) and are exclusive of any applicable government taxes and duties unless stated otherwise.',
        'Prices displayed on the website are indicative and subject to change without notice, as import costs and exchange rates fluctuate.',
        'Items marked "Get a Quote" or "Price on Request" carry no published price. A binding price is provided only in a written quotation issued by our sales team.',
        'A quotation is valid for the period stated on it. If no period is stated, quotations are valid for 7 working days from the date of issue.',
        'An order is confirmed only once we have acknowledged it and, where applicable, received payment. Placing an order on the website does not by itself create a binding contract.',
      ],
    },
    {
      id: 'payment',
      icon: 'Landmark',
      title: '4. Payment Terms',
      body: [
        `Payment is accepted by direct bank transfer to our ${SITE.bank_name || 'Meezan Bank'} account, or by cash on delivery where we have agreed to it in advance.`,
        'For bank transfers, please upload your payment slip on the order confirmation page or send it to us on WhatsApp. Quote your order number with every payment.',
        'Goods remain the property of Eng-Mart until payment has been received in full and cleared.',
        'We do not collect or store card details on this website. No online card payment is processed here.',
        'Any bank charges, remittance fees, or transfer costs are borne by the customer.',
      ],
    },
    {
      id: 'delivery',
      icon: 'Truck',
      title: '5. Delivery',
      body: [
        'We deliver within Pakistan only. We do not currently ship internationally.',
        'Delivery timelines quoted are estimates in good faith and are not guaranteed. Stock availability, courier performance, and circumstances outside our control may affect them.',
        'Risk in the goods passes to the customer on delivery. Please inspect goods on receipt.',
        'Delivery charges, where applicable, are advised before the order is confirmed. Collection from our Karachi premises is available by prior arrangement.',
        'It is the customer\'s responsibility to provide a complete and accurate delivery address and a reachable contact number.',
      ],
    },
    {
      id: 'returns',
      icon: 'RotateCcw',
      title: '6. Returns & Warranty',
      body: [
        'Claims for damaged, defective, or incorrectly supplied goods must be raised within 7 days of delivery, with photographs and your order number.',
        'Goods returned must be unused, in original condition and packaging, with all documentation.',
        'Products are covered by the original manufacturer\'s warranty where one is offered. Warranty claims are handled in accordance with the manufacturer\'s policy and timelines.',
        'Warranty does not cover damage caused by incorrect installation, misuse, over-loading, unauthorised repair, water ingress, power surges, or normal wear.',
        'Specially imported or custom-ordered items are non-returnable unless faulty.',
      ],
    },
    {
      id: 'installation',
      icon: 'ShieldAlert',
      title: '7. Installation & Safety',
      body: [
        'The products sold on this website are industrial electrical equipment. They must be selected, installed, commissioned, and maintained by a suitably qualified and licensed electrical professional.',
        'Product selection remains the responsibility of the customer and their engineer. Any guidance our team offers is given in good faith as general assistance and does not replace a qualified engineering assessment of your installation.',
        `${SITE.name} accepts no liability for injury, loss, or damage arising from incorrect selection, installation, or use of any product supplied.`,
      ],
    },
    {
      id: 'accounts',
      icon: 'UserCog',
      title: '8. Accounts & Acceptable Use',
      body: [
        'You are responsible for keeping your account credentials confidential and for all activity that takes place under your account.',
        'Please provide accurate and current information when registering or placing an order.',
        'You may not use this website to attempt unauthorised access, disrupt service, scrape content at scale, or for any unlawful purpose.',
        'We may suspend or close any account that we reasonably believe is being misused.',
      ],
    },
    {
      id: 'ip',
      icon: 'Copyright',
      title: '9. Intellectual Property',
      body: [
        `All content on this website — including text, layout, graphics, and the ${SITE.name} name and logo — is our property or is used under licence, and may not be reproduced without written permission.`,
        'Manufacturer brand names, logos, and trademarks (ABB, CHINT, Himel, FICO, PCE and others) remain the property of their respective owners and are shown to identify the products we supply.',
      ],
    },
    {
      id: 'liability',
      icon: 'Scale',
      title: '10. Limitation of Liability',
      body: [
        'To the fullest extent permitted by law, our total liability in connection with any order is limited to the value of the goods supplied under that order.',
        'We are not liable for indirect or consequential loss, including loss of profit, loss of production, downtime, or loss of contracts.',
        'Nothing in these terms limits liability that cannot be limited under the applicable law of Pakistan.',
      ],
    },
    {
      id: 'privacy',
      icon: 'Lock',
      title: '11. Privacy',
      body: [
        'We collect only the information needed to process your enquiry, quotation, or order — such as your name, contact details, company, and delivery address.',
        'We do not sell your personal information. It is shared only with parties involved in fulfilling your order, such as couriers.',
        'Payment slips you upload are used solely to verify your payment.',
        `To request a copy or deletion of your information, contact us at ${SITE.email}.`,
      ],
    },
    {
      id: 'law',
      icon: 'Gavel',
      title: '12. Governing Law',
      body: [
        'These Terms and Conditions are governed by the laws of the Islamic Republic of Pakistan.',
        'Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Karachi, Sindh.',
      ],
    },
  ]

  const icon = (name: string, className = 'w-5 h-5') => {
    const Ico = ICONS[name] || FileText
    return <Ico className={className} />
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-card border-b border-border pt-10 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="breadcrumb mb-5">
            <Link href="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Terms &amp; Conditions</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <ScrollText className="w-3.5 h-3.5" /> Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Terms &amp; Conditions
            </h1>
            <p className="text-muted-foreground text-sm mt-3 max-w-2xl leading-relaxed">
              These terms govern your use of this website and any order placed with {SITE.name}.
              Please read them before placing an order or requesting a quotation.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-[220px_1fr] gap-8">

          {/* Contents */}
          <aside>
            {/* Mobile: collapsible TOC */}
            <details className="md:hidden store-card group">
              <summary className="flex items-center justify-between gap-2 p-4 min-h-[44px] cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                On this page
                <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="px-4 pb-3 space-y-0.5">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center min-h-[40px] leading-snug"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            {/* md+: always visible */}
            <div className="hidden md:block sticky top-24 store-card p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                On this page
              </p>
              <ul className="space-y-1.5">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors block leading-snug"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Sections */}
          <div className="space-y-6">
            {SECTIONS.map((s, i) => (
              <motion.section
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.15) }}
                className="store-card p-5 sm:p-6 scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shrink-0">
                    {icon(s.icon, 'w-4 h-4')}
                  </div>
                  <h2 className="text-base font-bold text-foreground">{s.title}</h2>
                </div>
                <div className="space-y-2.5 pl-0 sm:pl-12">
                  {s.body.map((p, pi) => (
                    <p key={pi} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
                  ))}
                </div>
              </motion.section>
            ))}

            {/* Contact */}
            <div className="store-card p-5 sm:p-6 bg-primary/5 border-primary/20">
              <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <MessageCircleQuestion className="w-4 h-4 text-primary" />
                Questions about these terms?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Contact us and our team will be happy to clarify anything before you order.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/contact" className="btn-primary text-xs py-2 px-4">Contact Us</Link>
                {SITE.email && (
                  <a href={`mailto:${SITE.email}`} className="btn-secondary text-xs py-2 px-4">
                    {SITE.email}
                  </a>
                )}
                {SITE.phone && (
                  <a href={`tel:${SITE.phone}`} className="btn-secondary text-xs py-2 px-4">
                    {SITE.phone}
                  </a>
                )}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center pt-2">
              {SITE.address && <>Registered address: {SITE.address}<br /></>}
              These terms apply to orders placed within Pakistan.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
