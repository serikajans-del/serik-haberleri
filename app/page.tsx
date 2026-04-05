import Link from "next/link";
import BreakingNews from "@/components/BreakingNews";
import HeroSlider from "@/components/HeroSlider";
import MostReadBlock from "@/components/MostReadBlock";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB, getNewsByCategoryFromDB } from "@/lib/db";

export const revalidate = 60;

const quickLinks = [
  { label: "🏥 Nöbetçi Eczane", href: "/eczane", desc: "Serik nöbetçi eczaneler" },
  { label: "🌤️ Hava Durumu", href: "/hava-durumu", desc: "5 günlük tahmin" },
  { label: "🏨 Belek Otelleri", href: "/belek-otelleri", desc: "Otel ve tatil köyleri" },
  { label: "🏢 Firma Rehberi", href: "/firmarehberi", desc: "Yerel işletmeler" },
];

export default async function HomePage() {
  const latest = await getLatestNewsFromDB(20);
  const sliderItems = latest.slice(0, 5);
  const mostRead = latest.slice(0, 10);
  // Slider'daki haberler (0-4) grid'e dahil edilmez — tekrarı önler
  const gridNews = latest.slice(5, 11);

  return (
    <div style={{ backgroundColor: "#f2f3f5" }}>
      <BreakingNews />

      {/* ═══ HERO SLIDER ═══ */}
      <HeroSlider items={sliderItems} />

      {/* ═══ EN ÇOK OKUNAN BANT ═══ */}
      <MostReadBlock items={mostRead} />

      {/* ═══ HIZLI ERİŞİM ═══ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-all"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SOSYAL MEDYA TAKİP BANNER ═══ */}
      <div style={{ background: "linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)" }} className="border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-black uppercase tracking-widest">📲 Bizi Takip Et</span>
              <span className="text-gray-500 hidden sm:block">—</span>
              <span className="text-gray-400 text-xs hidden sm:block">Serik&apos;ten anlık gelişmeler için</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { name: "Facebook", color: "#1877f2", count: "12.4K", href: "https://facebook.com/serikhaberleri", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { name: "Instagram", color: "#e1306c", count: "8.7K", href: "https://instagram.com/serikhaberleri", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                { name: "YouTube", color: "#ff0000", count: "3.2K", href: "https://youtube.com/@serikhaberleri", icon: "M21.582 7.186a2.506 2.506 0 00-1.768-1.768C18.267 5 12 5 12 5s-6.268 0-7.814.418a2.506 2.506 0 00-1.768 1.768C2 8.733 2 12 2 12s0 3.267.418 4.814a2.506 2.506 0 001.768 1.768C5.732 19 12 19 12 19s6.268 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 15.267 22 12 22 12s0-3.267-.418-4.814zM10 15V9l5.2 3-5.2 3z" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-85"
                  style={{ backgroundColor: s.color }}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                  <span className="hidden sm:inline">{s.name}</span>
                  <span className="font-black">{s.count}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">

        <div className="my-3 border-t-4 border-double border-gray-800" />

        {/* ═══ ANA İÇERİK + SIDEBAR ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <div className="lg:col-span-3 space-y-6">

            {/* Son Haberler */}
            <section>
              <div className="section-heading">
                <span>Son Haberler</span>
                <Link href="/kategori/gundem" className="text-xs font-normal normal-case tracking-normal text-gray-500 hover:text-red-700 transition-colors" style={{ fontFamily: "inherit" }}>
                  Tümünü Gör »
                </Link>
              </div>

              {/* Mobil: TikTok/Instagram akış stili */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {gridNews.map((news) => (
                  <NewsCard key={news.id} news={news} variant="default" />
                ))}
              </div>
            </section>

            {/* Reklam Banner */}
            <div className="relative overflow-hidden border border-dashed border-gray-300 rounded text-center py-5 bg-white bg-opacity-60">
              <div className="absolute top-1 left-2 text-gray-300 text-xs">Reklam</div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">728×90 — Reklam Alanı</p>
              <Link href="/reklam" className="text-xs mt-1 block transition-colors" style={{ color: "#cc0000" }}>
                Reklam vermek için tıklayın →
              </Link>
            </div>

            {/* ═══ KATEGORİ BLOKLARI ═══ */}
            {await Promise.all(categories.slice(0, 6).map(async (cat, idx) => {
              const catNews = await getNewsByCategoryFromDB(cat.slug, 4);
              if (catNews.length === 0) return null;
              const [catMain, ...catRest] = catNews;

              return (
                <section key={cat.slug}>
                  <div className="section-heading">
                    <span>{cat.name}</span>
                    <Link
                      href={`/kategori/${cat.slug}`}
                      className="text-xs font-normal normal-case tracking-normal text-gray-500 hover:text-red-700 transition-colors"
                      style={{ fontFamily: "inherit" }}
                    >
                      Tümünü Gör »
                    </Link>
                  </div>

                  {idx % 2 === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-3">
                        <NewsCard news={catMain} variant="default" />
                      </div>
                      <div className="md:col-span-2 flex flex-col">
                        {catRest.slice(0, 3).map((n) => (
                          <NewsCard key={n.id} news={n} variant="text-only" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {catNews.slice(0, 3).map((n) => (
                        <NewsCard key={n.id} news={n} variant="default" />
                      ))}
                    </div>
                  )}

                  <div className="mt-4 border-t border-dashed border-gray-300" />
                </section>
              );
            }))}

            {/* ═══ HIZLI ERİŞİM KARTI (içerik arası) ═══ */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-lg py-4 px-3 text-center hover:border-red-300 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl">{l.label.split(" ")[0]}</span>
                  <div>
                    <div className="text-xs font-bold text-gray-800 group-hover:text-red-700 transition-colors">
                      {l.label.split(" ").slice(1).join(" ")}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{l.desc}</div>
                  </div>
                </Link>
              ))}
            </section>

            {/* Sponsor İçerik Alanı */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-400 border border-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wide">Sponsorlu</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-dashed border-gray-200 rounded p-4 text-center">
                  <p className="text-gray-300 text-xs uppercase tracking-widest">Sponsor İçerik</p>
                  <Link href="/reklam" className="text-xs mt-2 block" style={{ color: "#cc0000" }}>
                    Bu alan için reklam ver →
                  </Link>
                </div>
                <div className="border border-dashed border-gray-200 rounded p-4 text-center">
                  <p className="text-gray-300 text-xs uppercase tracking-widest">Sponsor İçerik</p>
                  <Link href="/reklam" className="text-xs mt-2 block" style={{ color: "#cc0000" }}>
                    Bu alan için reklam ver →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
