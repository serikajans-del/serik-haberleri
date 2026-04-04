import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import { newsData, getNewsBySlug, getLatestNews, formatDate } from "@/lib/news";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return newsData.map((news) => ({ slug: news.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = getNewsBySlug(slug);
  if (!news) return {};
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";
  const url = `${SITE_URL}/haber/${slug}`;
  return {
    title: news.title,
    description: news.summary,
    keywords: news.tags,
    openGraph: {
      type: "article",
      title: news.title,
      description: news.summary,
      url,
      publishedTime: news.publishedAt,
      authors: [news.author],
      section: news.category,
      tags: news.tags,
      images: [{ url: news.image, width: 860, height: 504, alt: news.title }],
    },
    twitter: { card: "summary_large_image", title: news.title, description: news.summary, images: [news.image] },
    alternates: { canonical: url },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = getNewsBySlug(slug);
  if (!news) notFound();

  const related = getLatestNews(5).filter((n) => n.slug !== slug).slice(0, 3);
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.summary,
    image: [news.image],
    datePublished: news.publishedAt,
    dateModified: news.publishedAt,
    author: { "@type": "Organization", name: news.author, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Serik Haberleri",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/haber/${slug}` },
    articleSection: news.category,
    keywords: news.tags?.join(", "),
    inLanguage: "tr",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-red-700">Ana Sayfa</Link>
          <span>›</span>
          <Link href={`/kategori/${news.categorySlug}`} className="hover:text-red-700">{news.category}</Link>
          <span>›</span>
          <span className="text-gray-700 line-clamp-1">{news.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Makale */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-sm shadow-sm overflow-hidden">
              {/* Görsel */}
              <div className="relative w-full" style={{ paddingBottom: "58.6%" }}>
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  priority
                />
              </div>

              <div className="p-4 md:p-6">
                {/* Kategori */}
                <Link href={`/kategori/${news.categorySlug}`}>
                  <span className="inline-block text-white text-xs font-bold px-2 py-0.5 mb-3 rounded-sm uppercase" style={{ backgroundColor: "#cc0000" }}>
                    {news.category}
                  </span>
                </Link>

                {/* Başlık */}
                <h1 className="text-xl md:text-3xl font-bold leading-tight mb-3">{news.title}</h1>

                {/* Özet */}
                <p className="text-gray-600 text-sm md:text-base border-l-4 pl-4 py-1 mb-4 bg-gray-50 italic" style={{ borderColor: "#cc0000" }}>
                  {news.summary}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 border-b border-t border-gray-100 py-2 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {news.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <time dateTime={news.publishedAt}>{formatDate(news.publishedAt)}</time>
                  </span>
                </div>

                {/* Paylaş */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs text-gray-500">Paylaş:</span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${SITE_URL}/haber/${news.slug}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-white text-xs px-3 py-1.5 rounded-sm font-semibold"
                    style={{ backgroundColor: "#1877f2" }}
                  >Facebook</a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${SITE_URL}/haber/${news.slug}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-white text-xs px-3 py-1.5 rounded-sm font-semibold bg-black"
                  >Twitter</a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + " " + SITE_URL + "/haber/" + news.slug)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-white text-xs px-3 py-1.5 rounded-sm font-semibold"
                    style={{ backgroundColor: "#25d366" }}
                  >WhatsApp</a>
                </div>

                {/* İçerik */}
                <div
                  className="text-gray-700 leading-relaxed text-base space-y-4"
                  style={{ lineHeight: "1.9" }}
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {/* Etiketler */}
                {news.tags && news.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500 mr-2">Etiketler:</span>
                    {news.tags.map((tag) => (
                      <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mr-1 mb-1">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* İlgili Haberler */}
            {related.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 border-b-2 pb-1 mb-3" style={{ borderColor: "#cc0000" }}>
                  <span className="w-1 h-5 rounded-sm" style={{ backgroundColor: "#cc0000" }} />
                  <h2 className="font-bold text-sm uppercase tracking-wide">İlgili Haberler</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map((item) => (
                    <NewsCard key={item.id} news={item} variant="default" />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
