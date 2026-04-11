import { getLatestNewsFromDB } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

export async function GET() {
  // Google News Sitemap - Son 30 günün haberleri (DB'den)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const allNews = await getLatestNewsFromDB(200);
  const recentNews = allNews.filter(
    (news) => new Date(news.publishedAt) >= thirtyDaysAgo
  );

  const newsEntries = recentNews
    .map(
      (news) => `
  <url>
    <loc>${SITE_URL}/haber/${news.slug}</loc>
    <lastmod>${new Date(news.publishedAt).toISOString()}</lastmod>
    <news:news>
      <news:publication>
        <news:name>Serik Haberleri</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${new Date(news.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(news.title)}</news:title>
      <news:keywords>${news.tags ? escapeXml(news.tags.join(", ")) : ""}</news:keywords>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${newsEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
