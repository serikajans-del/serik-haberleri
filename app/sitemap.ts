import type { MetadataRoute } from "next";
import { categories } from "@/lib/news";
import { getLatestNewsFromDB } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import { KATEGORILER as OKUR_KATEGORILER, MAHALLELER, mahalleSlug, type Paylasim } from "@/lib/okur";
import { dizinlenebilir } from "@/lib/okur-sunucu/veri";

export const dynamic = "force-dynamic"; // her istekte veritabanından üretilir: ISR ile yalnızca yayına alımda yenileniyordu, yeni haberler haritaya girmiyordu

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/hakkimizda`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/yazar/atakan-simsir`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/sikayet`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/hava-durumu`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    { url: `${SITE_URL}/eczane`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/belek-otelleri`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/trend`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
    { url: `${SITE_URL}/ustam`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/ustam/usta-ol`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/gizlilik-politikasi`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/kvkk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/yayin-ilkeleri`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/reklam`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

  // Okur Haberleri: bölüm, kategori ve mahalle sayfaları + dizinlenebilir okur paylaşımları (news-sitemap'e GİRMEZ)
  let okurPages: MetadataRoute.Sitemap = [];
  try {
    okurPages = [
      { url: `${SITE_URL}/okur`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
      { url: `${SITE_URL}/okur/liderler`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
      ...OKUR_KATEGORILER.map((k) => ({ url: `${SITE_URL}/okur/kategori/${k.slug}`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.7 })),
      ...MAHALLELER.filter((m) => m !== "Diğer").map((m) => ({ url: `${SITE_URL}/okur/mahalle/${mahalleSlug(m)}`, changeFrequency: "daily" as const, priority: 0.4 })),
    ];
    const { data } = await supabaseAdmin.from("meydan_paylasimlar")
      .select("slug, icerik, fotolar, durum, begeni_sayisi, yorum_sayisi, faydali_sayisi, yayin_at, created_at")
      .eq("durum", "yayinda").order("yayin_at", { ascending: false }).limit(5000);
    okurPages.push(...((data ?? []) as Paylasim[]).filter(dizinlenebilir).map((p) => ({
      url: `${SITE_URL}/okur/konu/${p.slug}`, lastModified: new Date(p.yayin_at ?? p.created_at), changeFrequency: "daily" as const, priority: 0.6,
    })));
  } catch {
    // okur tabloları yoksa yalnız haber sayfaları yayınlanır
  }

  let categoryPages: MetadataRoute.Sitemap = [];
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const dbNews = await getLatestNewsFromDB(500);
    // Yalnızca haberi olan kategoriler listelenir
    categoryPages = categories
      .filter((cat) => dbNews.some((n) => n.categorySlug === cat.slug))
      .map((cat) => ({
        url: `${SITE_URL}/kategori/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      }));
    newsPages = dbNews.map((news) => ({
      url: `${SITE_URL}/haber/${news.slug}`,
      lastModified: new Date(news.updatedAt ?? news.publishedAt),
      changeFrequency: "never",
      priority: 0.9,
    }));
  } catch {
    // DB erişilemezse statik + kategori sayfaları yayınlanır
  }

  return [...staticPages, ...categoryPages, ...newsPages, ...okurPages];
}
