import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const roboto = Roboto({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "Zbc0szRmiRECdtx5WBiYTphkbwPYtO1blkNf8B73BP0",
  },
  title: {
    default: "Serik Haberleri - Serik Son Dakika Haberleri",
    template: "%s | Serik Haberleri",
  },
  description:
    "Serik Haberleri — Antalya Serik ilçesinden güncel haberler, son dakika gelişmeleri, asayiş, ekonomi, spor ve yerel haberler. Side, Belek, Boğazkent'ten de haberler.",
  keywords: [
    "Serik haberleri",
    "Serik son dakika",
    "Serik haber",
    "Antalya Serik",
    "Side haberleri",
    "Belek haberleri",
    "Serik gündem",
    "Serik asayiş",
    "Serik ekonomi",
    "Serik spor",
    "Serik yerel haber",
    "serikhaberleri.com",
  ],
  authors: [{ name: "Serik Haberleri", url: SITE_URL }],
  creator: "Serik Haberleri",
  publisher: "Serik Haberleri",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Serik Haberleri",
    title: "Serik Haberleri - Serik Son Dakika Haberleri",
    description:
      "Serik Haberleri — Antalya Serik ilçesinden güncel haberler ve son dakika gelişmeleri. Side, Belek, Boğazkent'ten haberler.",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Serik Haberleri" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@serikhaberleri",
    creator: "@serikhaberleri",
    title: "Serik Haberleri - Son Dakika",
    description: "Serik'ten güncel ve son dakika haberler",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  other: {
    "geo.region": "TR-07",
    "geo.placename": "Serik, Antalya",
    "geo.position": "36.9333;31.1167",
    "ICBM": "36.9333, 31.1167",
    "DC.language": "tr",
    "DC.publisher": "Serik Haberleri",
    "DC.coverage": "Serik, Antalya, Türkiye",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Serik Haberleri",
  url: SITE_URL,
  description: "Serik'in dijital haber portalı — Antalya Serik'ten güncel haberler.",
  inLanguage: "tr",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/arama?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "Serik Haberleri",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 600,
    height: 60,
  },
  image: DEFAULT_OG_IMAGE,
  description: "Antalya Serik ilçesinin dijital haber portalı.",
  foundingDate: "2024",
  inLanguage: "tr",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Serik",
    addressRegion: "Antalya",
    addressCountry: "TR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@serikhaberleri.com",
    contactType: "editorial",
  },
  sameAs: [
    "https://facebook.com/serikhaberleri",
    "https://twitter.com/serikhaberleri",
    "https://instagram.com/serikhaberleri",
    "https://youtube.com/@serikhaberleri",
  ],
  publishingPrinciples: `${SITE_URL}/yayin-ilkeleri`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={roboto.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://tzkatjzoqxziskxovvac.supabase.co" />
      </head>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
