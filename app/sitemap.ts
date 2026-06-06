import type { MetadataRoute } from "next";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB } from "@/lib/db";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/sikayet`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/hava-durumu`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    { url: `${SITE_URL}/eczane`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/firmarehberi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/belek-otelleri`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/trend`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
    { url: `${SITE_URL}/gizlilik-politikasi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/kvkk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/yayin-ilkeleri`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/reklam`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/kategori/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const dbNews = await getLatestNewsFromDB(500);
    newsPages = dbNews.map((news) => ({
      url: `${SITE_URL}/haber/${news.slug}`,
      lastModified: new Date(news.publishedAt),
      changeFrequency: "never",
      priority: 0.9,
    }));
  } catch {
    // DB erişilemezse statik + kategori sayfaları yayınlanır
  }

  return [...staticPages, ...categoryPages, ...newsPages];
}
