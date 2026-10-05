import type { Metadata } from "next";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import AdBanner from "@/components/AdBanner";
import { searchNewsFromDB } from "@/lib/db";

export const metadata: Metadata = {
  title: "Arama",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchNewsFromDB(query, 24) : [];

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
      <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1">
        <Link href="/" className="hover:text-red-700">Ana Sayfa</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">Arama</span>
      </nav>

      <form action="/arama" method="get" className="mb-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Haberlerde ara..."
          className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-sm text-sm font-semibold text-white"
          style={{ backgroundColor: "#cc0000" }}
        >
          Ara
        </button>
      </form>

      <div className="flex items-center gap-2 border-b-2 pb-1 mb-4" style={{ borderColor: "#cc0000" }}>
        <span className="w-1.5 h-6 rounded-sm" style={{ backgroundColor: "#cc0000" }} />
        <h1 className="text-xl font-bold uppercase tracking-wide">
          {query ? `"${query}" için arama sonuçları` : "Arama"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          {!query ? (
            <div className="bg-white rounded-sm p-8 text-center text-gray-500 shadow-sm">
              Aramak istediğiniz kelimeyi yukarıya yazın.
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-sm p-8 text-center text-gray-500 shadow-sm">
              &quot;{query}&quot; ile ilgili haber bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {results.map((item) => (
                <NewsCard key={item.id} news={item} variant="default" />
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <AdBanner size="rectangle" className="mb-4" />
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
