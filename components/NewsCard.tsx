import Link from "next/link";
import Image from "next/image";
import { NewsItem, timeAgo } from "@/lib/news";

type Props = {
  news: NewsItem;
  variant?: "default" | "featured" | "featured-small" | "horizontal" | "list" | "text-only";
};

export default function NewsCard({ news, variant = "default" }: Props) {

  if (variant === "featured") {
    return (
      <Link href={`/haber/${news.slug}`} className="block group relative overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: "56%" }}>
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <span className="inline-block text-white text-xs font-bold px-2 py-0.5 mb-2 uppercase tracking-wider" style={{ backgroundColor: "#d90000" }}>
              {news.category}
            </span>
            <h2
              className="text-white text-xl md:text-3xl font-black leading-tight line-clamp-3 transition-colors"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              {news.title}
            </h2>
            <p className="text-sm mt-2 line-clamp-2 hidden md:block" style={{ color: "#bbb" }}>{news.summary}</p>
            <span className="text-xs mt-2 block" style={{ color: "#888" }}>{timeAgo(news.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured-small") {
    return (
      <Link href={`/haber/${news.slug}`} className="block group relative overflow-hidden h-full">
        <div className="relative w-full h-full" style={{ minHeight: "160px" }}>
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="33vw"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <span className="inline-block text-white text-xs font-bold px-1.5 py-0.5 mb-1.5 uppercase tracking-wider" style={{ backgroundColor: "#d90000" }}>
              {news.category}
            </span>
            <h3
              className="text-white text-sm font-bold leading-snug line-clamp-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {news.title}
            </h3>
            <span className="text-xs mt-1 block" style={{ color: "#999" }}>{timeAgo(news.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link href={`/haber/${news.slug}`} className="flex gap-3 group">
        <div className="flex-shrink-0 relative w-24 h-16 overflow-hidden" style={{ borderRadius: "2px" }}>
          <Image src={news.image} alt={news.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
        </div>
        <div className="flex-1 min-w-0 pb-2" style={{ borderBottom: "1px solid #2e2e2e" }}>
          <h4
            className="text-sm font-bold leading-snug line-clamp-2 transition-colors"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ddd" }}
          >
            {news.title}
          </h4>
          <span className="text-xs mt-0.5 block" style={{ color: "#666" }}>{timeAgo(news.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <Link href={`/haber/${news.slug}`} className="flex items-start gap-2 group py-2 last:border-0" style={{ borderBottom: "1px solid #2e2e2e" }}>
        <span className="font-black flex-shrink-0 mt-0.5 text-base leading-none" style={{ color: "#d90000" }}>›</span>
        <div>
          <h4
            className="text-sm font-semibold leading-snug line-clamp-2 transition-colors"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ddd" }}
          >
            {news.title}
          </h4>
          <span className="text-xs" style={{ color: "#666" }}>{timeAgo(news.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  if (variant === "text-only") {
    return (
      <Link href={`/haber/${news.slug}`} className="flex gap-3 group py-3 last:border-0" style={{ borderBottom: "1px solid #2e2e2e" }}>
        <div className="flex-shrink-0 relative w-20 h-14 overflow-hidden" style={{ borderRadius: "2px" }}>
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wide block mb-0.5" style={{ color: "#d90000" }}>
            {news.category}
          </span>
          <h4
            className="text-xs font-bold leading-snug line-clamp-2 transition-colors"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#ddd" }}
          >
            {news.title}
          </h4>
          <span className="text-xs mt-0.5 block" style={{ color: "#666" }}>{timeAgo(news.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  // default — HalkTV overlay stili: resim üstüne gradient + metin
  return (
    <Link href={`/haber/${news.slug}`} className="block group relative overflow-hidden wp-card" style={{ borderRadius: "3px" }}>
      <div className="relative overflow-hidden" style={{ paddingBottom: "62%" }}>
        <Image
          src={news.image}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.08) 100%)" }}
        />
        {/* Kategori etiketi */}
        <span
          className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 uppercase tracking-wider z-10"
          style={{ backgroundColor: "#d90000" }}
        >
          {news.category}
        </span>
        {/* Metin overlay — alt */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3
            className="font-bold text-sm leading-snug line-clamp-3 text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {news.title}
          </h3>
          <span className="text-xs mt-1.5 block" style={{ color: "#999" }}>{timeAgo(news.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
