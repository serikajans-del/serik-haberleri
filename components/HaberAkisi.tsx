import Link from "next/link";
import Image from "next/image";
import { NewsItem, formatDate } from "@/lib/news";

// Kronolojik haber akışı: görsel + kategori + başlık + özet + yayın saati.
export default function HaberAkisi({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", borderRadius: "3px" }}>
      {items.map((n, i) => (
        <article
          key={n.id}
          style={{ borderBottom: i === items.length - 1 ? "none" : "1px solid #f0f0f0" }}
        >
          <Link href={`/haber/${n.slug}`} className="flex gap-3 md:gap-4 p-3 group">
            <div
              className="relative flex-shrink-0 w-28 h-20 md:w-48 md:h-28 overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              <Image
                src={n.image}
                alt={n.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 112px, 192px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#d90000" }}>
                {n.category}
              </span>
              <h3
                className="text-sm md:text-lg font-bold leading-snug line-clamp-3 md:line-clamp-2 mt-0.5 transition-colors group-hover:text-red-600"
                style={{ color: "#1a1a1a" }}
              >
                {n.title}
              </h3>
              <p className="text-sm mt-1 line-clamp-2 hidden md:block" style={{ color: "#666" }}>
                {n.summary}
              </p>
              <time dateTime={n.publishedAt} className="text-xs mt-1.5 block" style={{ color: "#999" }}>
                {formatDate(n.publishedAt)}
              </time>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
