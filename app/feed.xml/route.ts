import { getLatestNewsFromDB } from "@/lib/db";
import type { NewsItem } from "@/lib/news";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

export const revalidate = 3600;

export async function GET() {
  let news: NewsItem[] = [];
  try {
    news = await getLatestNewsFromDB(20);
  } catch {
    news = [];
  }

  const items = news
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}/haber/${item.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/haber/${item.slug}</guid>
      <description>${escapeXml(item.summary)}</description>
      <pubDate>${new Date(item.publishedAt ?? "").toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <author>info@serikhaberleri.com (${escapeXml(item.author)})</author>
      ${item.image ? `<media:content url="${escapeXml(item.image)}" medium="image"/>` : ""}
      ${item.tags?.length ? item.tags.map((t: string) => `<category>${escapeXml(t)}</category>`).join("\n      ") : ""}
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
>
  <channel>
    <title>Serik Haberleri</title>
    <link>${SITE_URL}</link>
    <description>Serik'ten güncel haberler ve son dakika gelişmeleri — Antalya Serik, Side, Belek</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <copyright>Copyright ${new Date().getFullYear()} Serik Haberleri</copyright>
    <managingEditor>info@serikhaberleri.com (Serik Haberleri)</managingEditor>
    <webMaster>info@serikhaberleri.com</webMaster>
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>Serik Haberleri</title>
      <link>${SITE_URL}</link>
    </image>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
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
