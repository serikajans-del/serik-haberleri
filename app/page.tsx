import Link from "next/link";
import BreakingNews from "@/components/BreakingNews";
import HeroSlider from "@/components/HeroSlider";
import MostReadBlock from "@/components/MostReadBlock";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import ExchangeTicker from "@/components/ExchangeTicker";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB, getNewsByCategoryFromDB } from "@/lib/db";

export const revalidate = 30;

export default async function HomePage() {
  const latest = await getLatestNewsFromDB(25);
  const sliderItems = latest.slice(0, 5);
  const sonHaberler = latest.slice(5, 15);
  const gridNews = latest.slice(5, 11);

  return (
    <div style={{ backgroundColor: "#f4f4f4" }}>
      <BreakingNews />
      <ExchangeTicker />
      <HeroSlider items={sliderItems} />
      <MostReadBlock items={sonHaberler} />

      {/* Ana içerik */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-5">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sol — haber içeriği */}
          <div className="lg:col-span-3 space-y-6">

            {/* Son Haberler grid */}
            <section>
              <div className="section-heading">
                <span>Son Haberler</span>
                <Link href="/kategori/gundem" className="text-xs font-normal normal-case tracking-normal transition-colors hover:text-red-600" style={{ color: "#999", fontFamily: "inherit" }}>
                  Tümünü Gör »
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {gridNews.map((news) => (
                  <NewsCard key={news.id} news={news} variant="default" />
                ))}
              </div>
            </section>

            {/* Reklam banner */}
            <div
              className="relative overflow-hidden text-center py-5"
              style={{ border: "1px dashed #ddd", borderRadius: "3px", backgroundColor: "#fff" }}
            >
              <div className="absolute top-1 left-2 text-xs" style={{ color: "#bbb" }}>Reklam</div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#bbb" }}>728×90 — Reklam Alanı</p>
              <Link href="/reklam" className="text-xs mt-1 block transition-colors hover:text-red-700" style={{ color: "#d90000" }}>
                Reklam vermek için tıklayın →
              </Link>
            </div>

            {/* Kategori blokları */}
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
                      className="text-xs font-normal normal-case tracking-normal transition-colors hover:text-red-600"
                      style={{ color: "#999", fontFamily: "inherit" }}
                    >
                      Tümünü Gör »
                    </Link>
                  </div>

                  {idx % 2 === 0 ? (
                    /* Büyük + yan liste layout */
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="md:col-span-3">
                        <NewsCard news={catMain} variant="default" />
                      </div>
                      <div className="md:col-span-2 flex flex-col justify-between">
                        {catRest.slice(0, 3).map((n) => (
                          <NewsCard key={n.id} news={n} variant="text-only" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* 3 eşit kart */
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {catNews.slice(0, 3).map((n) => (
                        <NewsCard key={n.id} news={n} variant="default" />
                      ))}
                    </div>
                  )}

                  <div className="mt-4" style={{ borderTop: "1px dashed #e0e0e0" }} />
                </section>
              );
            }))}

            {/* Hızlı erişim */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Nöbetçi Eczane", href: "/eczane" },
                { label: "Hava Durumu", href: "/hava-durumu" },
                { label: "Belek Otelleri", href: "/belek-otelleri" },
                { label: "Firma Rehberi", href: "/firmarehberi" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex flex-col items-center gap-2 py-4 px-3 text-center transition-all group hover:border-red-300"
                  style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "3px" }}
                >
                  <div className="text-xs font-bold transition-colors group-hover:text-red-600" style={{ color: "#333" }}>
                    {l.label}
                  </div>
                </Link>
              ))}
            </section>

            {/* Sponsorlu alan */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "3px" }} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs border px-1.5 py-0.5 rounded uppercase tracking-wide" style={{ color: "#bbb", borderColor: "#ddd" }}>Sponsorlu</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#eee" }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded p-4 text-center" style={{ borderColor: "#ddd", borderStyle: "dashed" }}>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#bbb" }}>Sponsor İçerik</p>
                  <Link href="/reklam" className="text-xs mt-2 block hover:text-red-700" style={{ color: "#d90000" }}>
                    Bu alan için reklam ver →
                  </Link>
                </div>
                <div className="border rounded p-4 text-center" style={{ borderColor: "#ddd", borderStyle: "dashed" }}>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#bbb" }}>Sponsor İçerik</p>
                  <Link href="/reklam" className="text-xs mt-2 block hover:text-red-700" style={{ color: "#d90000" }}>
                    Bu alan için reklam ver →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Sağ — Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
