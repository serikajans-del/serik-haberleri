import Link from "next/link";
import BreakingNews from "@/components/BreakingNews";
import Manset from "@/components/Manset";
import HaberAkisi from "@/components/HaberAkisi";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import ExchangeTicker from "@/components/ExchangeTicker";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB, getNewsByCategoryFromDB } from "@/lib/db";
import AdBanner from "@/components/AdBanner";

export const revalidate = 30;

export default async function HomePage() {
  const latest = await getLatestNewsFromDB(25);
  const mansetItems = latest.slice(0, 5);
  const akis = latest.slice(5, 17);

  if (latest.length === 0) {
    return (
      <div style={{ backgroundColor: "#f4f4f4" }}>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-black mb-3" style={{ color: "#1a1a1a" }}>Serik Haberleri</h1>
          <p className="text-sm" style={{ color: "#666" }}>
            Yayın hazırlıklarımız sürüyor. Serik, Belek, Boğazkent ve Kadriye&apos;den haberler çok yakında burada olacak.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f4f4f4" }}>
      <BreakingNews />
      <ExchangeTicker />
      <Manset items={mansetItems} />

      {/* Ana içerik */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-5">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sol — haber içeriği */}
          <div className="lg:col-span-3 space-y-6">

            {/* Son haberler akışı */}
            {akis.length > 0 && (
              <section>
                <div className="section-heading">
                  <span>Son Haberler</span>
                </div>
                <HaberAkisi items={akis} />
              </section>
            )}

            {/* Reklam banner */}
            <AdBanner size="leaderboard" />

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

                  {idx === 2 && <AdBanner size="leaderboard" className="mt-4" />}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AdBanner size="rectangle" />
              <AdBanner size="rectangle" />
            </div>

          </div>

          {/* Sağ — Sidebar */}
          <div className="lg:col-span-1">
            <AdBanner size="rectangle" className="mb-4" />
            <Sidebar />
            <AdBanner size="rectangle" className="mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
