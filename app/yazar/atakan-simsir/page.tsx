import type { Metadata } from "next";
import Link from "next/link";
import { getLatestNewsFromDB } from "@/lib/db";
import { formatDate } from "@/lib/news";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";
const AD = "Atakan Şimşir";
const UNVAN = "İmtiyaz Sahibi ve Sorumlu Yazı İşleri Müdürü";

export const metadata: Metadata = {
  title: `${AD} | Yazar`,
  description: `${AD}, Serik Haberleri'nin imtiyaz sahibi ve sorumlu yazı işleri müdürü. Serik, Belek, Kadriye ve Boğazkent'ten yazdığı haberler.`,
};

export const revalidate = 600;

export default async function YazarPage() {
  const haberler = (await getLatestNewsFromDB(50)).filter((h) => h.author === AD);

  const profilJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: AD,
      jobTitle: UNVAN,
      url: `${SITE_URL}/yazar/atakan-simsir`,
      worksFor: { "@type": "NewsMediaOrganization", name: "Serik Haberleri", url: SITE_URL },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profilJsonLd) }} />
      <div className="seo-page-hero">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-xs text-red-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Yazar</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">{AD}</h1>
          <p className="text-red-100 text-sm max-w-xl">{UNVAN}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-700 leading-relaxed">
          <p>
            {AD}, Serik Haberleri&apos;nin imtiyaz sahibi ve sorumlu yazı işleri müdürüdür. Serik, Belek, Kadriye ve Boğazkent&apos;teki
            gelişmeleri yerinde takip ederek haberleştirir.
          </p>
          <p className="mt-2">
            Yayın ilkelerimiz için <Link href="/yayin-ilkeleri" className="underline font-bold" style={{ color: "#cc0000" }}>Yayın İlkeleri</Link>,
            künye ve iletişim bilgileri için <Link href="/hakkimizda" className="underline font-bold" style={{ color: "#cc0000" }}>Hakkımızda</Link> sayfasına bakabilirsiniz.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-black text-base text-gray-800">Son haberleri</h2>
          </div>
          {haberler.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-500">Henüz haber yok.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {haberler.map((h) => (
                <li key={h.slug} className="px-5 py-3">
                  <Link href={`/haber/${h.slug}`} className="font-bold text-gray-900 hover:underline">{h.title}</Link>
                  <div className="text-xs text-gray-500 mt-1">{h.category} · {formatDate(h.publishedAt)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
