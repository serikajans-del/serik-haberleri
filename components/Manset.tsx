import Link from "next/link";
import Image from "next/image";
import { NewsItem, formatDate } from "@/lib/news";

// Ana sayfa manşeti: solda büyük haber, sağda dört yan manşet.
// Sunucuda render edilir; tüm başlıklar HTML'de düz bağlantı olarak yer alır.
export default function Manset({ items }: { items: NewsItem[] }) {
  if (!items.length) return null;
  const [lead, ...rest] = items;
  const side = rest.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-3 md:px-4 pt-4" aria-label="Manşet">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Link
          href={`/haber/${lead.slug}`}
          className="lg:col-span-2 block group relative overflow-hidden"
          style={{ borderRadius: "3px", backgroundColor: "#000" }}
        >
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <Image
              src={lead.image}
              alt={lead.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <span
                className="inline-block text-white text-xs font-bold px-2 py-0.5 mb-2 uppercase tracking-wider"
                style={{ backgroundColor: "#d90000" }}
              >
                {lead.category}
              </span>
              <h2
                className="text-white text-xl md:text-4xl font-black leading-tight line-clamp-3"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
              >
                {lead.title}
              </h2>
              <p className="text-sm mt-2 line-clamp-2 hidden md:block" style={{ color: "#ddd" }}>
                {lead.summary}
              </p>
              <time dateTime={lead.publishedAt} className="text-xs mt-2 block" style={{ color: "#bbb" }}>
                {formatDate(lead.publishedAt)}
              </time>
            </div>
          </div>
        </Link>

        {side.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {side.map((n) => (
              <Link
                key={n.id}
                href={`/haber/${n.slug}`}
                className="flex flex-col lg:flex-row gap-2.5 group overflow-hidden"
                style={{ backgroundColor: "#fff", border: "1px solid #e8e8e8", borderRadius: "3px" }}
              >
                <div className="relative flex-shrink-0 w-full lg:w-32 overflow-hidden" style={{ minHeight: "84px" }}>
                  <Image
                    src={n.image}
                    alt={n.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 128px"
                  />
                </div>
                <div className="flex-1 min-w-0 px-2.5 pb-2.5 lg:pl-0 lg:py-2">
                  <span className="text-xs font-bold uppercase tracking-wide block mb-0.5" style={{ color: "#d90000" }}>
                    {n.category}
                  </span>
                  <h3
                    className="text-sm font-bold leading-snug line-clamp-3 transition-colors group-hover:text-red-600"
                    style={{ color: "#1a1a1a" }}
                  >
                    {n.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
