import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import Sidebar from "@/components/Sidebar";
import AdBanner from "@/components/AdBanner";
import { categories, getCategoryBySlug } from "@/lib/news";
import { getNewsByCategoryFromDB } from "@/lib/db";

export const revalidate = 60;

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";
  return {
    title: `${category.name} Haberleri`,
    description: `Serik'ten en güncel ${category.name.toLowerCase()} haberleri.`,
    alternates: { canonical: `${SITE_URL}/kategori/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const news = await getNewsByCategoryFromDB(slug, 24);

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
      <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1">
        <Link href="/" className="hover:text-red-700">Ana Sayfa</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">{category.name}</span>
      </nav>

      <div className="flex items-center gap-2 border-b-2 pb-1 mb-4" style={{ borderColor: "#cc0000" }}>
        <span className="w-1.5 h-6 rounded-sm" style={{ backgroundColor: "#cc0000" }} />
        <h1 className="text-xl font-bold uppercase tracking-wide">{category.name} Haberleri</h1>
      </div>

      {/* Kategori başlığı altı reklam */}
      <AdBanner size="leaderboard" className="mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          {news.length === 0 ? (
            <div className="bg-white rounded-sm p-8 text-center text-gray-500 shadow-sm">
              Bu kategoride henüz haber bulunmuyor.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {news.slice(0, 6).map((item) => (
                  <NewsCard key={item.id} news={item} variant="default" />
                ))}
              </div>
              {news.length > 6 && (
                <>
                  <AdBanner size="small" className="my-4" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {news.slice(6).map((item) => (
                      <NewsCard key={item.id} news={item} variant="default" />
                    ))}
                  </div>
                </>
              )}
            </>
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
