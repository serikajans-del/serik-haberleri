import Link from "next/link";
import Image from "next/image";
import { NewsItem } from "@/lib/news";

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function MostReadBlock({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;

  return (
    <div style={{ backgroundColor: "#161616", borderBottom: "1px solid #252525" }} className="py-3">
      <div className="max-w-7xl mx-auto px-3 md:px-4">

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#d90000" }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#d90000" }}>
              Son Haberler
            </span>
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: "#2a2a2a" }} />
          <Link href="/kategori/gundem" className="text-xs" style={{ color: "#555" }}>
            Tümü »
          </Link>
        </div>

        {/* Haber kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {items.slice(0, 5).map((news) => (
            <Link
              key={news.id}
              href={`/haber/${news.slug}`}
              className="flex lg:flex-col gap-3 group"
            >
              {/* Görsel */}
              <div className="relative flex-shrink-0 overflow-hidden w-20 h-16 lg:w-full lg:h-28 rounded-sm">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 80px, 20vw"
                />
                {/* Kategori etiketi */}
                <span
                  className="absolute bottom-0 left-0 text-white text-xs font-bold px-1.5 py-0.5"
                  style={{ backgroundColor: "rgba(217,0,0,0.9)", fontSize: "10px" }}
                >
                  {news.category}
                </span>
              </div>

              {/* Başlık + okuma sayısı */}
              <div className="flex-1 min-w-0 lg:mt-1">
                <h4
                  className="text-xs font-bold leading-snug line-clamp-3 group-hover:text-red-400 transition-colors"
                  style={{ color: "#ddd" }}
                >
                  {news.title}
                </h4>
                <span className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "#555" }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {(news.views ?? 0) > 0 ? formatViews(news.views ?? 0) : "Yeni"} okuma
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
