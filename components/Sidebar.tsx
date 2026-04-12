import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB } from "@/lib/db";
import SocialFollowBox from "./SocialFollowBox";

function formatViews(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export default async function Sidebar() {
  const latest = await getLatestNewsFromDB(12);

  const exchangeRates = [
    { name: "Dolar", value: "38.45", change: "+0.12", up: true },
    { name: "Euro", value: "41.20", change: "-0.05", up: false },
    { name: "Sterlin", value: "48.90", change: "+0.08", up: true },
    { name: "Altın (gr)", value: "3.240", change: "+15", up: true },
  ];

  const prayerTimes = [
    { name: "İmsak", time: "05:12" },
    { name: "Güneş", time: "06:42" },
    { name: "Öğle", time: "13:05" },
    { name: "İkindi", time: "16:28" },
    { name: "Akşam", time: "19:22" },
    { name: "Yatsı", time: "20:48" },
  ];

  const quickServices = [
    { label: "Nöbetçi Eczane", href: "/eczane" },
    { label: "Hava Durumu", href: "/hava-durumu" },
    { label: "Belek Otelleri", href: "/belek-otelleri" },
    { label: "Firma Rehberi", href: "/firmarehberi" },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">

      {/* Son Haberler — DB'den gerçek son haberler */}
      <div className="wp-widget">
        <div className="wp-widget-title">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#d90000" }}>
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
            </svg>
            Son Haberler
          </span>
        </div>
        <div>
          {latest.slice(0, 7).map((news) => (
            <Link
              key={news.id}
              href={`/haber/${news.slug}`}
              className="flex gap-2.5 group px-3 py-2.5 transition-colors hover:bg-white/5"
              style={{ borderBottom: "1px solid #222" }}
            >
              {/* Küçük görsel */}
              <div className="relative flex-shrink-0 w-16 h-12 overflow-hidden rounded-sm">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="64px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-red-400 transition-colors"
                  style={{ color: "#ccc" }}
                >
                  {news.title}
                </p>
                {/* Okuma sayısı — her zaman göster */}
                <span className="text-xs mt-1 flex items-center gap-1" style={{ color: "#555" }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {(news.views ?? 0) > 0 ? formatViews(news.views ?? 0) + " okuma" : "Yeni"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hızlı Servisler */}
      <div className="wp-widget">
        <div className="wp-widget-title" style={{ borderTopColor: "#1a6b3a" }}>
          Hızlı Erişim
        </div>
        <div>
          {quickServices.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center justify-between px-3 py-2.5 transition-colors group hover:bg-white/5"
              style={{ borderBottom: "1px solid #2a2a2a" }}
            >
              <span className="text-sm font-semibold transition-colors" style={{ color: "#ccc" }}>{s.label}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#555" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Sosyal Medya Takip */}
      <SocialFollowBox />

      {/* Kategoriler */}
      <div className="wp-widget">
        <div className="wp-widget-title">Kategoriler</div>
        <ul className="px-3">
          {categories.map((cat) => (
            <li key={cat.slug} style={{ borderBottom: "1px solid #2a2a2a" }}>
              <Link
                href={`/kategori/${cat.slug}`}
                className="flex items-center justify-between py-2.5 text-sm font-medium transition-colors group"
                style={{ color: "#bbb" }}
              >
                <span className="group-hover:translate-x-1 transition-transform duration-150">{cat.name}</span>
                <span style={{ color: "#555" }}>›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Reklam 300x250 */}
      <div className="wp-widget text-center py-10" style={{ borderStyle: "dashed", borderColor: "#333" }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: "#555" }}>Reklam Alanı</p>
        <p className="text-xs" style={{ color: "#444" }}>300×250</p>
        <Link href="/reklam" className="text-xs mt-2 block transition-colors" style={{ color: "#d90000" }}>
          Reklam ver →
        </Link>
      </div>

      {/* Döviz */}
      <div className="wp-widget">
        <div className="wp-widget-title">Döviz Kurları</div>
        <div className="px-3">
          {exchangeRates.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid #2a2a2a" }}>
              <span className="text-sm font-medium" style={{ color: "#bbb" }}>{r.name}</span>
              <div className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold text-white">₺{r.value}</span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: r.up ? "#4ade80" : "#f87171",
                    backgroundColor: r.up ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)"
                  }}
                >
                  {r.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs px-3 pb-3" style={{ color: "#555" }}>* Yaklaşık değerler</p>
      </div>

      {/* Namaz Vakitleri */}
      <div className="wp-widget">
        <div className="wp-widget-title">
          <span>Namaz Vakitleri</span>
          <span className="text-xs font-normal tracking-normal normal-case" style={{ color: "#666" }}>Serik</span>
        </div>
        <div className="grid grid-cols-2 gap-px m-3 rounded overflow-hidden" style={{ backgroundColor: "#2a2a2a" }}>
          {prayerTimes.map((pt) => (
            <div
              key={pt.name}
              className="flex justify-between items-center px-3 py-2 text-xs"
              style={{ backgroundColor: "#1d1d1d" }}
            >
              <span style={{ color: "#888" }}>{pt.name}</span>
              <span className="font-bold text-white">{pt.time}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
