import { getLatestNewsFromDB } from "@/lib/db";
import Link from "next/link";

export default async function BreakingNews() {
  const latest = await getLatestNewsFromDB(20);
  const items = [...latest, ...latest];

  return (
    <div className="flex items-stretch overflow-hidden" style={{ backgroundColor: "#fff", borderBottom: "1px solid #e0e0e0" }}>
      <div
        className="flex-shrink-0 px-4 py-2 flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest"
        style={{ backgroundColor: "#d90000" }}
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Son Dakika
      </div>
      <div className="flex-1 overflow-hidden relative py-2">
        <div className="ticker-track">
          {items.map((news, i) => (
            <span key={`${news.id}-${i}`} className="inline-flex items-center gap-3 pr-10">
              <Link
                href={`/haber/${news.slug}`}
                className="text-xs font-semibold whitespace-nowrap transition-colors hover:text-red-600"
                style={{ color: "#333" }}
              >
                {news.title}
              </Link>
              <span className="font-black" style={{ color: "#d90000" }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
