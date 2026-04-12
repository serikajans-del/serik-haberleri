import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLatestNewsFromDB } from "@/lib/db";
import TweetButonu from "@/components/TweetButonu";
import Sidebar from "@/components/Sidebar";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Trend Haberler & Sosyal Medya | Serik Haberleri",
  description: "Günümüzün en çok konuşulan haberleri ve viral konular. Tek tıkla tweet'e dönüştür.",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

// Trend skoru: son haberler + kategori ağırlığı
const KATEGORI_AGIRLIK: Record<string, number> = {
  gundem: 10, antalya: 9, asayis: 8, ekonomi: 7,
  spor: 6, saglik: 5, turizm: 5, egitim: 4, yasam: 3,
};

export default async function TrendPage() {
  const haberler = await getLatestNewsFromDB(60);

  // Skora göre sırala (yeni + popüler kategori)
  const skorlu = haberler.map((h, i) => ({
    ...h,
    skor: (KATEGORI_AGIRLIK[h.categorySlug] || 5) + Math.max(0, 30 - i),
  })).sort((a, b) => b.skor - a.skor).slice(0, 30);

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-5">

      {/* Başlık */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: "#000", border: "1px solid #1e2a3a" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-sm font-black text-white">Trend & Sosyal Medya</span>
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: "#222" }} />
        </div>
        <p className="text-sm" style={{ color: "#666" }}>
          Günün en çok konuşulan haberleri — tek tıkla tweet'e dönüştür
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Ana içerik */}
        <div className="lg:col-span-3 space-y-3">
          {skorlu.map((haber, idx) => (
            <div
              key={haber.id}
              className="flex gap-4 rounded-lg overflow-hidden group"
              style={{ backgroundColor: "#161616", border: "1px solid #222" }}
            >
              {/* Sıra no */}
              <div
                className="flex-shrink-0 w-10 flex items-center justify-center text-lg font-black"
                style={{
                  backgroundColor: idx === 0 ? "#d90000" : idx < 3 ? "#7a0000" : "#1a1a1a",
                  color: idx < 3 ? "#fff" : "#444",
                  minHeight: "100px",
                }}
              >
                {idx + 1}
              </div>

              {/* Görsel */}
              <div className="relative flex-shrink-0 w-28 h-auto overflow-hidden" style={{ minHeight: "90px" }}>
                <Image
                  src={haber.image}
                  alt={haber.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="112px"
                />
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0 py-3 pr-4">
                {/* Kategori + skor */}
                <div className="flex items-center gap-2 mb-1.5">
                  <Link href={`/kategori/${haber.categorySlug}`}>
                    <span
                      className="text-white text-xs font-bold px-2 py-0.5 rounded-sm"
                      style={{ backgroundColor: "#d90000", fontSize: "10px" }}
                    >
                      {haber.category}
                    </span>
                  </Link>
                  <span className="text-xs flex items-center gap-1" style={{ color: "#555" }}>
                    🔥 Trend
                  </span>
                </div>

                {/* Başlık */}
                <Link href={`/haber/${haber.slug}`}>
                  <h3
                    className="text-sm font-bold leading-snug mb-2 group-hover:text-red-400 transition-colors line-clamp-2"
                    style={{ color: "#e8e8e8" }}
                  >
                    {haber.title}
                  </h3>
                </Link>

                {/* Özet */}
                <p className="text-xs mb-3 line-clamp-2" style={{ color: "#666", lineHeight: 1.6 }}>
                  {haber.summary}
                </p>

                {/* Tweet butonu */}
                <TweetButonu
                  baslik={haber.title}
                  ozet={haber.summary}
                  kategori={haber.categorySlug}
                  haberUrl={`${SITE_URL}/haber/${haber.slug}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Twitter hakkında bilgi kutusu */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e2a3a" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-bold text-white">Nasıl Kullanılır?</span>
            </div>
            <ol className="space-y-2">
              {[
                "Paylaşmak istediğin haberi seç",
                "'Tweet'e Dönüştür' butonuna bas",
                "AI tarafından yazılan tweeti gör",
                "'X'te Paylaş' ile doğrudan paylaş",
                "Ya da kopyalayıp kendin düzenle",
              ].map((adim, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#888" }}>
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "#1a1a1a", color: "#d90000", border: "1px solid #333" }}
                  >
                    {i + 1}
                  </span>
                  {adim}
                </li>
              ))}
            </ol>
          </div>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}
