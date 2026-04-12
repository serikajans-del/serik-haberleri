import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLatestNewsFromDB } from "@/lib/db";
import TweetButonu from "@/components/TweetButonu";
import Sidebar from "@/components/Sidebar";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Trend Haberler & Sosyal Medya | Serik Haberleri",
  description: "Günümüzün en çok konuşulan haberleri ve viral konular. Tek tıkla tweet'e dönüştür.",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

const KATEGORI_AGIRLIK: Record<string, number> = {
  gundem: 10, antalya: 9, asayis: 8, ekonomi: 7,
  spor: 6, saglik: 5, turizm: 5, egitim: 4, yasam: 3,
};

function zaman(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
  return `${Math.floor(diff / 86400)}g`;
}

export default async function TrendPage() {
  const haberler = await getLatestNewsFromDB(60);

  // Son 12 haber — "Yeni Eklenenler" tweet bölümü için
  const yeniEklenenler = haberler.slice(0, 12);

  // Trend sıralaması (kalan haberler)
  const skorlu = haberler.map((h, i) => ({
    ...h,
    skor: (KATEGORI_AGIRLIK[h.categorySlug] || 5) + Math.max(0, 30 - i),
  })).sort((a, b) => b.skor - a.skor).slice(0, 20);

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-5">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Ana içerik */}
        <div className="lg:col-span-3 space-y-8">

          {/* ── YENİ EKLENENLER — Tweet Bölümü ─────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded"
                style={{ backgroundColor: "#d90000" }}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Yeni Eklenenler</span>
              </div>
              <div className="flex-1 h-px" style={{ backgroundColor: "#e0e0e0" }} />
              <span className="text-xs" style={{ color: "#999" }}>Son güncelleme: az önce</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {yeniEklenenler.map((haber) => (
                <div
                  key={haber.id}
                  className="rounded-xl overflow-hidden flex flex-col"
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #e1e8ed",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Tweet header */}
                  <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                      style={{ backgroundColor: "#d90000" }}
                    >
                      SH
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate" style={{ color: "#0f1419" }}>Serik Haberleri</p>
                      <p className="text-xs" style={{ color: "#536471" }}>@serikhaberleri · {zaman(haber.publishedAt)}</p>
                    </div>
                    {/* X logosu */}
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#0f1419" }}>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>

                  {/* Tweet metni */}
                  <div className="px-3 pb-2">
                    <Link href={`/haber/${haber.slug}`}>
                      <p
                        className="text-xs leading-relaxed line-clamp-3 hover:text-red-600 transition-colors"
                        style={{ color: "#0f1419" }}
                      >
                        {haber.summary || haber.title}
                      </p>
                    </Link>
                  </div>

                  {/* Görsel */}
                  {haber.image && (
                    <Link href={`/haber/${haber.slug}`} className="block px-3 pb-2">
                      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: "120px" }}>
                        <Image
                          src={haber.image}
                          alt={haber.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                        {/* Kategori etiketi */}
                        <span
                          className="absolute bottom-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: "rgba(217,0,0,0.85)", fontSize: "10px" }}
                        >
                          {haber.category}
                        </span>
                      </div>
                    </Link>
                  )}

                  {/* Tweet aksiyonları */}
                  <div className="px-3 py-2 flex items-center justify-between mt-auto" style={{ borderTop: "1px solid #eff3f4" }}>
                    <div className="flex items-center gap-4">
                      {/* Yorum */}
                      <button className="flex items-center gap-1 group">
                        <svg className="w-3.5 h-3.5 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "#536471" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-xs group-hover:text-blue-500 transition-colors" style={{ color: "#536471" }}>
                          {Math.floor(Math.random() * 20 + 1)}
                        </span>
                      </button>
                      {/* Retweet */}
                      <button className="flex items-center gap-1 group">
                        <svg className="w-3.5 h-3.5 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "#536471" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        <span className="text-xs group-hover:text-green-500 transition-colors" style={{ color: "#536471" }}>
                          {Math.floor(Math.random() * 50 + 5)}
                        </span>
                      </button>
                      {/* Beğeni */}
                      <button className="flex items-center gap-1 group">
                        <svg className="w-3.5 h-3.5 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: "#536471" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-xs group-hover:text-red-500 transition-colors" style={{ color: "#536471" }}>
                          {Math.floor(Math.random() * 100 + 10)}
                        </span>
                      </button>
                    </div>
                    {/* Paylaş */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(haber.title + " " + SITE_URL + "/haber/" + haber.slug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-2 py-1 rounded-full transition-colors hover:bg-blue-50"
                      style={{ color: "#1d9bf0", border: "1px solid #1d9bf0" }}
                    >
                      Paylaş
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── TREND LİSTESİ ─────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded"
                style={{ backgroundColor: "#000", border: "1px solid #333" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-xs font-black text-white uppercase tracking-wider">Trend & Sosyal</span>
              </div>
              <div className="flex-1 h-px" style={{ backgroundColor: "#e0e0e0" }} />
            </div>

            <div className="space-y-2">
              {skorlu.map((haber, idx) => (
                <div
                  key={haber.id}
                  className="flex gap-3 rounded-lg overflow-hidden group"
                  style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0" }}
                >
                  {/* Sıra */}
                  <div
                    className="flex-shrink-0 w-9 flex items-center justify-center text-base font-black"
                    style={{
                      backgroundColor: idx === 0 ? "#d90000" : idx < 3 ? "#7a0000" : "#f5f5f5",
                      color: idx < 3 ? "#fff" : "#bbb",
                      minHeight: "80px",
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Görsel */}
                  <div className="relative flex-shrink-0 w-24 overflow-hidden" style={{ minHeight: "80px" }}>
                    <Image
                      src={haber.image}
                      alt={haber.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="96px"
                    />
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 min-w-0 py-2.5 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/kategori/${haber.categorySlug}`}>
                        <span
                          className="text-white text-xs font-bold px-1.5 py-0.5 rounded-sm"
                          style={{ backgroundColor: "#d90000", fontSize: "10px" }}
                        >
                          {haber.category}
                        </span>
                      </Link>
                      <span className="text-xs" style={{ color: "#999" }}>🔥 {zaman(haber.publishedAt)}</span>
                    </div>
                    <Link href={`/haber/${haber.slug}`}>
                      <h3
                        className="text-sm font-bold leading-snug mb-1.5 group-hover:text-red-600 transition-colors line-clamp-2"
                        style={{ color: "#1a1a1a" }}
                      >
                        {haber.title}
                      </h3>
                    </Link>
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
          </section>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div
            className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#0f1419" }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-bold" style={{ color: "#0f1419" }}>Nasıl Kullanılır?</span>
            </div>
            <ol className="space-y-2">
              {[
                "Paylaşmak istediğin haberi seç",
                "'Tweet'e Dönüştür' butonuna bas",
                "AI tarafından hazırlanan tweeti gör",
                "'X'te Paylaş' ile doğrudan paylaş",
                "Ya da kopyalayıp kendin düzenle",
              ].map((adim, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#666" }}>
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "#fff0f0", color: "#d90000", border: "1px solid #fdd" }}
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
