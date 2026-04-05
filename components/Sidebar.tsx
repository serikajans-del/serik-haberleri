import Link from "next/link";
import Image from "next/image";
import { categories, getLatestNews } from "@/lib/news";
import SocialFollowBox from "./SocialFollowBox";

function viewCount(id: string): number {
  let h = 5381;
  for (const c of id) h = (((h << 5) + h) ^ c.charCodeAt(0)) >>> 0;
  return 1000 + (h % 49000);
}
function formatViews(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export default function Sidebar() {
  const latest = getLatestNews(8);

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
    { label: "🏥 Nöbetçi Eczane", href: "/eczane" },
    { label: "🌤️ Hava Durumu", href: "/hava-durumu" },
    { label: "🏨 Belek Otelleri", href: "/belek-otelleri" },
    { label: "🏢 Firma Rehberi", href: "/firmarehberi" },
    { label: "📍 Side Haberleri", href: "/kategori/turizm" },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">

      {/* En Çok Okunan */}
      <div className="wp-widget">
        <div className="wp-widget-title">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            En Çok Okunan
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {latest.slice(0, 5).map((news, idx) => (
            <Link
              key={news.id}
              href={`/haber/${news.slug}`}
              className="flex gap-2 group px-3 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <span
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white text-xs font-black rounded mt-0.5"
                style={{ backgroundColor: idx === 0 ? "#cc0000" : "#bbb" }}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-red-700 transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {news.title}
                </p>
                <span className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {formatViews(viewCount(news.id))} görüntülenme
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
        <div className="divide-y divide-gray-100">
          {quickServices.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm font-semibold text-gray-700 group-hover:text-red-700 transition-colors">{s.label}</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Son Haberler */}
      <div className="wp-widget">
        <div className="wp-widget-title">Son Haberler</div>
        <div className="px-3 py-1">
          {latest.slice(5, 8).map((news) => (
            <Link
              key={news.id}
              href={`/haber/${news.slug}`}
              className="flex gap-3 group py-2.5 border-b border-gray-100 last:border-0"
            >
              <div className="flex-shrink-0 relative w-20 h-14 overflow-hidden rounded">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold leading-snug line-clamp-3 group-hover:text-red-700 transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {news.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sosyal Medya Takip */}
      <SocialFollowBox />

      {/* Kategoriler */}
      <div className="wp-widget">
        <div className="wp-widget-title">Kategoriler</div>
        <ul className="divide-y divide-gray-100 px-3">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/kategori/${cat.slug}`}
                className="flex items-center justify-between py-2.5 text-sm font-medium hover:text-red-700 transition-colors group"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-150">{cat.name}</span>
                <span className="text-gray-400 text-xs">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Reklam 300x250 */}
      <div className="wp-widget border border-dashed border-gray-300 text-center py-10">
        <p className="text-gray-400 text-xs uppercase tracking-widest">Reklam Alanı</p>
        <p className="text-gray-300 text-xs">300×250</p>
        <Link href="/reklam" className="text-xs mt-2 block transition-colors" style={{ color: "#cc0000" }}>
          Reklam ver →
        </Link>
      </div>

      {/* Döviz */}
      <div className="wp-widget">
        <div className="wp-widget-title">Döviz Kurları</div>
        <div className="px-3 divide-y divide-gray-100">
          {exchangeRates.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium text-gray-700">{r.name}</span>
              <div className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold">₺{r.value}</span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${r.up ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}
                >
                  {r.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 px-3 pb-3">* Yaklaşık değerler</p>
      </div>

      {/* Namaz Vakitleri */}
      <div className="wp-widget">
        <div className="wp-widget-title">
          <span>Namaz Vakitleri</span>
          <span className="text-xs text-gray-500 font-normal tracking-normal normal-case">Serik</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-gray-100 m-3 rounded overflow-hidden">
          {prayerTimes.map((pt) => (
            <div
              key={pt.name}
              className="flex justify-between items-center bg-white px-3 py-2 text-xs"
            >
              <span className="text-gray-500">{pt.name}</span>
              <span className="font-bold">{pt.time}</span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
