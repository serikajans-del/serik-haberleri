import Link from "next/link";
import BreakingNews from "@/components/BreakingNews";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import { categories, getLatestNews, getNewsByCategory } from "@/lib/news";

export default function HomePage() {
  const latest = getLatestNews(12);
  const [hero, second, third, ...rest] = latest;
  const gridNews = rest.slice(0, 6);

  return (
    <div style={{ backgroundColor: "#f0ece4" }}>
      <BreakingNews />

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">

        {/* ═══ MANŞET ═══ */}
        {/* Masaüstü: büyük sol + 2 küçük sağ */}
        <div className="hidden md:grid md:grid-cols-12 gap-1 mb-1" style={{ height: "420px" }}>
          <div className="md:col-span-8 h-full">
            {hero && <NewsCard news={hero} variant="featured" />}
          </div>
          <div className="md:col-span-4 grid grid-rows-2 gap-1 h-full">
            {second && <NewsCard news={second} variant="featured-small" />}
            {third && <NewsCard news={third} variant="featured-small" />}
          </div>
        </div>

        {/* Mobil: büyük haber + 2'li grid */}
        <div className="md:hidden space-y-1 mb-3">
          {hero && <NewsCard news={hero} variant="featured" />}
          <div className="grid grid-cols-2 gap-1">
            {second && <NewsCard news={second} variant="featured-small" />}
            {third && <NewsCard news={third} variant="featured-small" />}
          </div>
        </div>

        {/* Çift çizgi ayırıcı */}
        <div className="my-4 border-t-4 border-double border-gray-800" />

        {/* ═══ ANA İÇERİK + SIDEBAR ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sol: Haberler */}
          <div className="lg:col-span-3 space-y-6">

            {/* Son Haberler */}
            <section>
              <div className="section-heading">
                <span>Son Haberler</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {gridNews.map((news) => (
                  <NewsCard key={news.id} news={news} variant="default" />
                ))}
              </div>
            </section>

            <hr className="border-t border-dashed border-gray-400" />

            {/* Reklam */}
            <div className="border border-dashed border-gray-400 rounded text-center py-5 bg-white bg-opacity-60">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Reklam Alanı — 728×90</p>
              <Link href="/reklam" className="text-xs mt-1 block transition-colors" style={{ color: "#cc0000" }}>
                Reklam vermek için tıklayın
              </Link>
            </div>

            {/* ═══ KATEGORİ BLOKLARI ═══ */}
            {categories.slice(0, 6).map((cat, idx) => {
              const catNews = getNewsByCategory(cat.slug);
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
                    /* Masaüstü: Büyük sol + metin listesi sağ | Mobil: üst üste */
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-3">
                        <NewsCard news={catMain} variant="default" />
                      </div>
                      <div className="md:col-span-2">
                        {catRest.slice(0, 3).map((n) => (
                          <NewsCard key={n.id} news={n} variant="text-only" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* 2 kolon mobil, 3 kolon masaüstü */
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {catNews.slice(0, 3).map((n) => (
                        <NewsCard key={n.id} news={n} variant="default" />
                      ))}
                    </div>
                  )}

                  <div className="mt-4 border-t border-dashed border-gray-400" />
                </section>
              );
            })}
          </div>

          {/* Sağ: Sidebar — mobilde alta gider */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
