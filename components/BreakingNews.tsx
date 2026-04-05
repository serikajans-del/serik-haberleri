import { getLatestNewsFromDB } from "@/lib/db";
import Link from "next/link";

export default async function BreakingNews() {
  // 20 farklı haber al — ticker döngüsü için 2x yapılsa bile tekrar geç fark edilir
  const latest = await getLatestNewsFromDB(20);
  const items = [...latest, ...latest]; // Seamless ticker loop için iki kopya gereklidir

  return (
    <div className="flex items-stretch overflow-hidden border-b border-gray-200 bg-white">
      <div
        className="flex-shrink-0 px-4 py-2 flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest"
        style={{ backgroundColor: "#cc0000" }}
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
                className="text-xs font-semibold text-gray-700 hover:text-red-700 transition-colors whitespace-nowrap"
              >
                {news.title}
              </Link>
              <span className="text-red-400 font-black">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
