import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB } from "@/lib/db";
import SocialFollowBox from "./SocialFollowBox";
import LiveExchangeRates from "./LiveExchangeRates";

function formatViews(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export default async function Sidebar() {
  const latest = await getLatestNewsFromDB(12);

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

      {/* Son Haberler */}
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
              className="flex gap-2.5 group px-3 py-2.5 transition-colors hover:bg-gray-50"
              style={{ borderBottom: "1px solid #f0f0f0" }}
            >
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
                <p className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors" style={{ color: "#1a1a1a" }}>
                  {news.title}
                </p>
                <span className="text-xs mt-1 flex items-center gap-1" style={{ color: "#999" }}>
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
              className="flex items-center justify-between px-3 py-2.5 transition-colors group hover:bg-gray-50"
              style={{ borderBottom: "1px solid #f0f0f0" }}
            >
              <span className="text-sm font-semibold transition-colors group-hover:text-red-600" style={{ color: "#333" }}>{s.label}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#bbb" }}>
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
            <li key={cat.slug} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <Link
                href={`/kategori/${cat.slug}`}
                className="flex items-center justify-between py-2.5 text-sm font-medium transition-colors group hover:text-red-600"
                style={{ color: "#333" }}
              >
                <span className="group-hover:translate-x-1 transition-transform duration-150">{cat.name}</span>
                <span style={{ color: "#ccc" }}>›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Reklam 300x250 */}
      <div className="wp-widget text-center py-10" style={{ borderStyle: "dashed", borderColor: "#ddd" }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: "#bbb" }}>Reklam Alanı</p>
        <p className="text-xs" style={{ color: "#ccc" }}>300×250</p>
        <Link href="/reklam" className="text-xs mt-2 block transition-colors hover:text-red-700" style={{ color: "#d90000" }}>
          Reklam ver →
        </Link>
      </div>

      {/* Canlı Döviz Kurları */}
      <LiveExchangeRates />

      {/* Namaz Vakitleri */}
      <div className="wp-widget">
        <div className="wp-widget-title">
          <span>Namaz Vakitleri</span>
          <span className="text-xs font-normal tracking-normal normal-case" style={{ color: "#999" }}>Serik</span>
        </div>
        <div className="grid grid-cols-2 gap-px m-3 rounded overflow-hidden" style={{ backgroundColor: "#e8e8e8" }}>
          {prayerTimes.map((pt) => (
            <div
              key={pt.name}
              className="flex justify-between items-center px-3 py-2 text-xs"
              style={{ backgroundColor: "#fff" }}
            >
              <span style={{ color: "#888" }}>{pt.name}</span>
              <span className="font-bold" style={{ color: "#1a1a1a" }}>{pt.time}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
