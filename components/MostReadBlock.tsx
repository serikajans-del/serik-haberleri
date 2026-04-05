import Link from "next/link";
import Image from "next/image";
import { NewsItem } from "@/lib/news";

// Deterministik sahte görüntülenme sayısı (ID'ye göre sabit)
function viewCount(id: string): number {
  let h = 5381;
  for (const c of id) h = (((h << 5) + h) ^ c.charCodeAt(0)) >>> 0;
  return 1000 + (h % 49000);
}

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function MostReadBlock({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;

  return (
    <div className="bg-white border-y border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#cc0000" }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#cc0000" }}>
              En Çok Okunan
            </span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {items.slice(0, 5).map((news, idx) => (
            <Link
              key={news.id}
              href={`/haber/${news.slug}`}
              className="flex lg:flex-col gap-3 group"
            >
              {/* Resim kutusu: mobilde 80x60, masaüstünde tam genişlik 120px yüksek */}
              <div className="relative flex-shrink-0 overflow-hidden rounded-sm w-20 h-16 lg:w-full lg:h-28">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 80px, 20vw"
                />
                {/* Sıra numarası */}
                <div
                  className="absolute top-0 left-0 w-5 h-5 flex items-center justify-center text-white text-xs font-black z-10"
                  style={{ backgroundColor: idx === 0 ? "#cc0000" : "rgba(0,0,0,0.65)" }}
                >
                  {idx + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0 lg:mt-1">
                <h4
                  className="text-xs font-bold leading-snug line-clamp-3 group-hover:text-red-700 transition-colors"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {news.title}
                </h4>
                <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {formatViews(viewCount(news.id))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
