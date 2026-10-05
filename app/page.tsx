import Link from "next/link";
import Image from "next/image";
import BreakingNews from "@/components/BreakingNews";
import MansetSlider from "@/components/MansetSlider";
import NewsCard from "@/components/NewsCard";
import AdBanner from "@/components/AdBanner";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB, getMostReadFromDB, getNewsByCategoryFromDB } from "@/lib/db";

export const revalidate = 30;

export default async function HomePage() {
  const latest = await getLatestNewsFromDB(21);

  if (latest.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black mb-3" style={{ color: "#111827" }}>Serik Haberleri</h1>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Yayın hazırlıklarımız sürüyor. Serik, Belek, Boğazkent ve Kadriye&apos;den haberler çok yakında burada olacak.
        </p>
      </div>
    );
  }

  const slider = latest.slice(0, 15);
  // Sol sütun: öne çıkarılan haberler, yoksa manşetin devamı
  const featured = latest.filter((n) => n.featured).slice(0, 2);
  const leftCol = latest.length > 3 ? (featured.length === 2 ? featured : latest.slice(15, 17).length === 2 ? latest.slice(15, 17) : latest.slice(1, 3)) : [];
  const mostRead = latest.length > 3 ? await getMostReadFromDB(6) : [];

  const categoryBlocks = (
    await Promise.all(
      categories.map(async (cat) => ({ cat, news: await getNewsByCategoryFromDB(cat.slug, 6) }))
    )
  ).filter((b) => b.news.length > 0);

  return (
    <>
      <h1 className="sr-only">Serik Haberleri: Serik, Belek, Kadriye ve Boğazkent&apos;ten güncel haberler</h1>
      <BreakingNews />

      {/* Manşet alanı */}
      <section className="max-w-7xl mx-auto px-4 pt-6" aria-label="Manşet">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {leftCol.length > 0 && (
            <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-3">
              <span className="tk-badge self-start">Öne Çıkanlar</span>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 flex-1">
                {leftCol.map((n) => (
                  <Link key={n.id} href={`/haber/${n.slug}`} className="relative block overflow-hidden tk-radius group" style={{ minHeight: "220px", backgroundColor: "#0f172a" }}>
                    <Image src={n.image} alt={n.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 25vw" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 65%, transparent 100%)" }}>
                      <h3 className="text-white text-sm font-extrabold uppercase leading-snug line-clamp-3">{n.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className={`order-1 lg:order-2 ${leftCol.length > 0 ? "lg:col-span-5" : mostRead.length > 0 ? "lg:col-span-8" : "lg:col-span-8 lg:col-start-3"} lg:min-h-[420px]`}>
            <MansetSlider items={slider} />
          </div>

          {mostRead.length > 0 && (
            <div className="lg:col-span-4 order-3 flex flex-col gap-3">
              <span className="tk-badge self-start">Çok Okunanlar</span>
              <div className="tk-card flex-1 divide-y" style={{ borderColor: "#eef0f3" }}>
                {mostRead.map((n) => (
                  <Link key={n.id} href={`/haber/${n.slug}`} className="flex items-center gap-3.5 p-3.5 group" style={{ borderColor: "#eef0f3" }}>
                    <div className="relative flex-shrink-0 w-14 h-14 overflow-hidden" style={{ borderRadius: "10px", backgroundColor: "#e9ecf1" }}>
                      <Image src={n.image} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                    <h3 className="text-sm font-extrabold uppercase leading-snug line-clamp-2 transition-colors group-hover:text-red-600" style={{ color: "#111827" }}>
                      {n.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Kategori bölümleri */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        {categoryBlocks.map(({ cat, news }, idx) => (
          <section key={cat.slug} className="mt-12">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span className="tk-eyebrow">Kategori</span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-1" style={{ color: "#111827" }}>{cat.name}</h2>
              </div>
              <Link href={`/kategori/${cat.slug}`} className="tk-pill">
                Tümü <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {news.map((n) => (
                <NewsCard key={n.id} news={n} variant="default" />
              ))}
            </div>
            {idx === 1 && <AdBanner size="leaderboard" className="mt-8" />}
          </section>
        ))}

        {/* Hızlı erişim */}
        <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Nöbetçi Eczane", href: "/eczane" },
            { label: "Hava Durumu", href: "/hava-durumu" },
            { label: "Belek Otelleri", href: "/belek-otelleri" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="tk-card py-5 px-3 text-center text-sm font-extrabold uppercase transition-colors hover:text-red-600" style={{ color: "#111827" }}>
              {l.label}
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
