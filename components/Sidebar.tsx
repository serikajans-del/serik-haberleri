import Link from "next/link";
import Image from "next/image";
import { categories, getLatestNews } from "@/lib/news";

export default function Sidebar() {
  const latest = getLatestNews(6);

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

  return (
    <aside className="space-y-5">

      {/* Son Haberler */}
      <div>
        <div className="section-heading">Son Haberler</div>
        <div className="space-y-0">
          {latest.map((news) => (
            <Link key={news.id} href={`/haber/${news.slug}`} className="flex gap-2 group py-2 border-b border-dashed border-gray-300 last:border-0">
              <div className="flex-shrink-0 relative w-20 h-14 overflow-hidden">
                <Image src={news.image} alt={news.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
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

      {/* Kategoriler */}
      <div>
        <div className="section-heading">Kategoriler</div>
        <ul className="divide-y divide-dashed divide-gray-300">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link href={`/kategori/${cat.slug}`} className="flex items-center justify-between py-2 text-sm font-medium hover:text-red-700 transition-colors group">
                <span className="group-hover:translate-x-1 transition-transform duration-150">{cat.name}</span>
                <span className="text-gray-400 text-xs">›</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Döviz */}
      <div>
        <div className="section-heading">Döviz Kurları</div>
        <div className="divide-y divide-dashed divide-gray-300">
          {exchangeRates.map((r) => (
            <div key={r.name} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">{r.name}</span>
              <div className="flex items-center gap-2 text-right">
                <span className="text-sm font-bold">₺{r.value}</span>
                <span className={`text-xs font-bold px-1 rounded ${r.up ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
                  {r.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">* Yaklaşık değerler</p>
      </div>

      {/* Namaz Vakitleri */}
      <div>
        <div className="section-heading">
          <span>Namaz Vakitleri</span>
          <span className="text-xs text-gray-500 font-normal tracking-normal" style={{ fontFamily: "inherit" }}>Serik</span>
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {prayerTimes.map((pt) => (
            <div key={pt.name} className="flex justify-between items-center bg-white bg-opacity-70 px-2 py-1.5 text-xs border border-gray-200">
              <span className="text-gray-500">{pt.name}</span>
              <span className="font-bold">{pt.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reklam */}
      <div className="border border-dashed border-gray-400 text-center py-8 bg-white bg-opacity-50">
        <p className="text-gray-400 text-xs uppercase tracking-widest">Reklam Alanı</p>
        <p className="text-gray-300 text-xs">300×250</p>
        <Link href="/reklam" className="text-xs mt-1 block transition-colors" style={{ color: "#cc0000" }}>
          Reklam ver
        </Link>
      </div>
    </aside>
  );
}
