import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

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
    "Serik Haberleri, Antalya Serik ilçesinden güncel haberler, son dakika gelişmeleri ve yerel haberler.",
  keywords: ["Serik haberleri", "Serik son dakika", "Serik haber", "Antalya Serik", "Side haberleri"],
  authors: [{ name: "Serik Haberleri", url: SITE_URL }],
  creator: "Serik Haberleri",
  publisher: "Serik Haberleri",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Serik Haberleri",
    title: "Serik Haberleri - Serik Son Dakika Haberleri",
    description: "Serik Haberleri, Antalya Serik ilçesinden güncel haberler ve son dakika gelişmeleri.",
  },
  twitter: { card: "summary_large_image", title: "Serik Haberleri", description: "Serik'ten güncel haberler" },
  alternates: { canonical: SITE_URL, types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
