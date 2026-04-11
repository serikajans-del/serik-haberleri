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
    <div style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }} className="py-3">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#d90000" }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#d90000" }}>
              En Çok Okunan
            </span>
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: "#2e2e2e" }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {items.slice(0, 5).map((news, idx) => (
            <Link
              key={news.id}
              href={`/haber/${news.slug}`}
              className="flex lg:flex-col gap-3 group"
            >
              <div className="relative flex-shrink-0 overflow-hidden w-20 h-16 lg:w-full lg:h-28" style={{ borderRadius: "2px" }}>
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 80px, 20vw"
                />
                <div
                  className="absolute top-0 left-0 w-5 h-5 flex items-center justify-center text-white text-xs font-black z-10"
                  style={{ backgroundColor: idx === 0 ? "#d90000" : "rgba(0,0,0,0.75)" }}
                >
                  {idx + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0 lg:mt-1">
                <h4
                  className="text-xs font-bold leading-snug line-clamp-3 transition-colors"
                  style={{ color: "#ddd" }}
                >
                  {news.title}
                </h4>
                {(news.views ?? 0) > 0 && (
                  <span className="text-xs mt-1 flex items-center gap-1" style={{ color: "#666" }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {formatViews(news.views ?? 0)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
