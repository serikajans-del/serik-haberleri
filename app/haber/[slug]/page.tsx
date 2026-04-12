import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import ReadingProgress from "@/components/ReadingProgress";
import ViewTracker from "@/components/ViewTracker";
import { formatDate } from "@/lib/news";
import { getNewsBySlugFromDB, getLatestNewsFromDB, getNewsByCategoryFromDB } from "@/lib/db";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlugFromDB(slug);
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
  const news = await getNewsBySlugFromDB(slug);
  if (!news) notFound();

  // Önce aynı kategoriden ilgili haberler, yoksa son haberler
  const [categoryNews, latest] = await Promise.all([
    getNewsByCategoryFromDB(news.categorySlug, 6),
    getLatestNewsFromDB(8),
  ]);
  const related = [
    ...categoryNews.filter((n) => n.slug !== slug),
    ...latest.filter((n) => n.slug !== slug && !categoryNews.some((c) => c.slug === n.slug)),
  ].slice(0, 3);
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
      <ReadingProgress />
      <ViewTracker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4">
        <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-red-700">Ana Sayfa</Link>
          <span>›</span>
          <Link href={`/kategori/${news.categorySlug}`} className="hover:text-red-700">{news.category}</Link>
          <span>›</span>
          <span className="text-gray-700 line-clamp-1">{news.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <article className="lg:col-span-3">
            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: "#1d1d1d", border: "1px solid #2e2e2e" }}>
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

              <div className="p-4 md:p-7">
                <Link href={`/kategori/${news.categorySlug}`}>
                  <span className="inline-block text-white text-xs font-bold px-2.5 py-1 mb-4 rounded-sm uppercase tracking-wider" style={{ backgroundColor: "#d90000" }}>
                    {news.category}
                  </span>
                </Link>

                <h1
                  className="text-2xl md:text-3xl font-black leading-snug mb-4"
                  style={{ color: "#f0f0f0", letterSpacing: "-0.01em" }}
                >
                  {news.title}
                </h1>

                <p className="text-base md:text-lg border-l-4 pl-4 py-3 mb-5 rounded-r" style={{ borderColor: "#d90000", backgroundColor: "#1e1e1e", color: "#c8c8c8", fontStyle: "normal", lineHeight: "1.7", fontWeight: 500 }}>
                  {news.summary}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs py-3 mb-6" style={{ borderTop: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a", color: "#666" }}>
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
                  {/* Okuma süresi */}
                  {(() => {
                    const words = news.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
                    const mins = Math.max(1, Math.round(words / 200));
                    return (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {mins} dk okuma
                      </span>
                    );
                  })()}
                  {/* Görüntülenme sayısı — her zaman göster */}
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {(news.views ?? 0) > 0 ? `${news.views} okuma` : "Yeni"}
                  </span>
                  <Link
                    href={`/kategori/${news.categorySlug}`}
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: "#cc0000" }}
                  >
                    {news.category}
                  </Link>
                </div>

                {/* Paylaşım Butonları */}
                <div className="flex flex-wrap items-center gap-2 mb-6 py-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
                  <span className="text-xs font-bold uppercase tracking-wide mr-1" style={{ color: "#888" }}>Paylaş:</span>
                  {[
                    { label: "Facebook", color: "#1877f2", href: `https://www.facebook.com/sharer/sharer.php?u=${SITE_URL}/haber/${news.slug}`, icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                    { label: "X", color: "#000", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(SITE_URL + "/haber/" + news.slug)}`, icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                    { label: "WhatsApp", color: "#25d366", href: `https://api.whatsapp.com/send?text=${encodeURIComponent(news.title + "\n" + SITE_URL + "/haber/" + news.slug)}`, icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
                    { label: "Telegram", color: "#0088cc", href: `https://t.me/share/url?url=${encodeURIComponent(SITE_URL + "/haber/" + news.slug)}&text=${encodeURIComponent(news.title)}`, icon: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded transition-opacity hover:opacity-85"
                      style={{ backgroundColor: s.color }}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                      {s.label}
                    </a>
                  ))}
                </div>

                <div
                  className="article-content py-2"
                  dangerouslySetInnerHTML={{
                    __html: news.content
                      .replace(/^[\s\n]*-->[\s\n]*/g, "")
                      .replace(/^(<p[^>]*>\s*-->\s*<\/p>\s*)+/g, "")
                  }}
                />

                {/* Kaynak kutusu */}
                <div className="mt-6 pt-4 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: "1px solid #2e2e2e" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ backgroundColor: "#2a2a2a" }}>📰</div>
                    <div>
                      <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "#555" }}>Kaynak</div>
                      <div className="text-sm font-bold" style={{ color: "#e0e0e0" }}>{news.author}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base" style={{ backgroundColor: "#2a2a2a" }}>✍️</div>
                    <div>
                      <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "#555" }}>Yayımlayan</div>
                      <div className="text-sm font-bold" style={{ color: "#e0e0e0" }}>Serik Haberleri</div>
                    </div>
                  </div>
                </div>

                {/* Etiketler — Alanya Postası pill tarzı */}
                {news.tags && news.tags.length > 0 && (
                  <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop: "1px solid #2e2e2e" }}>
                    {news.tags.map((tag) => (
                      <span key={tag} className="inline-block text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors" style={{ border: "1px solid #333", color: "#888", backgroundColor: "#252525" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sosyal Medya Takip CTA */}
            <div className="mt-5 follow-cta">
              <p className="text-sm text-gray-300 mb-3">Bu haberi beğendiyseniz bizi takip edin:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { name: "Facebook", color: "#1877f2", href: "https://facebook.com/serikhaberleri", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { name: "Instagram", color: "#e1306c", href: "https://instagram.com/serikhaberleri", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                  { name: "YouTube", color: "#ff0000", href: "https://youtube.com/@serikhaberleri", icon: "M21.582 7.186a2.506 2.506 0 00-1.768-1.768C18.267 5 12 5 12 5s-6.268 0-7.814.418a2.506 2.506 0 00-1.768 1.768C2 8.733 2 12 2 12s0 3.267.418 4.814a2.506 2.506 0 001.768 1.768C5.732 19 12 19 12 19s6.268 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 15.267 22 12 22 12s0-3.267-.418-4.814zM10 15V9l5.2 3-5.2 3z" },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white font-bold text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
                    style={{ backgroundColor: s.color }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.icon} />
                    </svg>
                    {s.name}
                  </a>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Serik&apos;ten anlık haberler için sosyal medyamızı takip edin
              </p>
            </div>

            {related.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 border-b-2 pb-1 mb-3" style={{ borderColor: "#d90000" }}>
                  <span className="w-1 h-5 rounded-sm" style={{ backgroundColor: "#d90000" }} />
                  <h2 className="font-bold text-sm uppercase tracking-wide text-white">İlgili Haberler</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map((item) => (
                    <NewsCard key={item.id} news={item} variant="default" />
                  ))}
                </div>
              </div>
            )}
          </article>

          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
