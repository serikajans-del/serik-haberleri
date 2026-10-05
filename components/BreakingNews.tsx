import { getLatestNewsFromDB } from "@/lib/db";
import Link from "next/link";

export default async function BreakingNews() {
  const latest = await getLatestNewsFromDB(20);
  if (latest.length === 0) return null;
  // Az haber olsa da şerit dolsun diye liste en az 8 öğeye tamamlanır, kesintisiz döngü için iki kez basılır
  const base = Array.from({ length: Math.max(8, latest.length) }, (_, i) => latest[i % latest.length]);
  const items = [...base, ...base];

  return (
    <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #eef0f3" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4 overflow-hidden">
        <span className="flex-shrink-0 text-base font-black py-2.5" style={{ color: "#d90000" }}>Güncel</span>
        <div className="flex-1 overflow-hidden relative py-2.5">
          <div className="ticker-track" style={{ animationDuration: `${base.length * 9}s` }}>
            {items.map((news, i) => (
              <Link
                key={`${news.id}-${i}`}
                href={`/haber/${news.slug}`}
                className="inline-flex items-center gap-2 pr-8 text-sm whitespace-nowrap group"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#cbd5e1" }} />
                <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#d90000" }}>{news.category}</span>
                <span className="font-bold uppercase transition-colors group-hover:text-red-600" style={{ color: "#111827" }}>{news.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
