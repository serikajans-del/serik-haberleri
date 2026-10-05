import type { Metadata } from "next";
import Link from "next/link";

const ECZACI_ODASI_URL = "https://www.antalyaeo.org.tr/tr/nobetci-eczaneler";

export const metadata: Metadata = {
  title: "Serik Nöbetçi Eczane | Güncel Nöbet Listesi",
  description: "Serik, Belek, Kadriye ve Boğazkent'te bugün nöbetçi eczaneler için Antalya Eczacı Odası'nın güncel nöbet listesine buradan ulaşın.",
  keywords: ["Serik nöbetçi eczane", "Serik eczane", "Serik bugün nöbetçi eczane", "Belek nöbetçi eczane"],
  alternates: { canonical: "https://www.serikhaberleri.com/eczane" },
  openGraph: {
    title: "Serik Nöbetçi Eczane",
    description: "Serik'te bugün nöbetçi eczaneler için güncel ve resmi liste.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Serik Nöbetçi Eczane",
  description: "Serik ilçesindeki nöbetçi eczaneler için resmi nöbet listesine yönlendirme",
  url: "https://www.serikhaberleri.com/eczane",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://www.serikhaberleri.com" },
      { "@type": "ListItem", position: 2, name: "Nöbetçi Eczane" },
    ],
  },
};

export default function EczanePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="seo-page-hero">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-xs text-red-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Nöbetçi Eczane</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">Serik Nöbetçi Eczane</h1>
          <p className="text-red-100 text-sm max-w-xl">
            Serik, Belek, Kadriye ve Boğazkent&apos;te bugün hangi eczanenin nöbetçi olduğunu resmi listeden öğrenin.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <div className="tk-card p-6 md:p-8 text-center">
          <h2 className="text-xl font-black mb-2" style={{ color: "#111827" }}>Güncel nöbet listesi</h2>
          <p className="text-sm leading-relaxed mb-5" style={{ color: "#4b5563" }}>
            Nöbetçi eczaneler her gün değişir. Yanlış bilgiye yer vermemek için listeyi kendimiz yayımlamıyor,
            sizi nöbet çizelgesini hazırlayan Antalya Eczacı Odası&apos;nın sayfasına yönlendiriyoruz.
            Açılan sayfada ilçe olarak <strong>Serik</strong>&apos;i seçin.
          </p>
          <a
            href={ECZACI_ODASI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#d90000", borderRadius: "10px" }}
          >
            Antalya Eczacı Odası nöbet listesini aç <span aria-hidden>→</span>
          </a>
        </div>

        <div className="tk-card p-6">
          <h2 className="text-base font-black mb-2" style={{ color: "#111827" }}>Acil durumda</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#4b5563" }}>
            Acil sağlık durumlarında <a href="tel:112" className="font-bold" style={{ color: "#d90000" }}>112</a>&apos;yi arayın.
            Nöbetçi eczaneye gitmeden önce telefonla arayıp açık olduğunu teyit etmeniz önerilir.
          </p>
        </div>
      </div>
    </>
  );
}
