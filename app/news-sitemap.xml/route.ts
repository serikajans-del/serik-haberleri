import { newsData } from "@/lib/news";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

export async function GET() {
  // Google News Sitemap - Son 2 günün haberleri
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentNews = newsData.filter(
    (news) => new Date(news.publishedAt) >= twoDaysAgo
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
