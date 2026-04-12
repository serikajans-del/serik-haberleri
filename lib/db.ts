import { supabaseAdmin } from "./supabase";
import { newsData } from "./news";
import type { NewsItem } from "./news";

// İçerik kalitesi yetersizse filtrele (placeholder/boş metin tespiti)
const PLACEHOLDER_PHRASES = [
  "hakkında bilgi yok",
  "detaylı bilgi bulunmamaktadır",
  "açıklama beklenmektedir",
  "bilgi girilmemiştir",
  "içerik hazırlanıyor",
  "yakında eklenecek",
  "lorem ipsum",
];

function isQualityContent(item: NewsItem): boolean {
  const combined = (item.title + " " + item.summary + " " + item.content).toLowerCase();
  if (PLACEHOLDER_PHRASES.some((p) => combined.includes(p))) return false;
  // Çok kısa içerik (200 karakterden az gövde)
  const textContent = item.content.replace(/<[^>]+>/g, "").trim();
  if (textContent.length < 80) return false;
  return true;
}

function mapToNewsItem(row: Record<string, unknown>): NewsItem {
  return {
    id: String(row.id),
    slug: row.slug as string,
    title: row.title as string,
    summary: row.summary as string,
    content: row.content as string,
    category: row.category as string,
    categorySlug: row.category_slug as string,
    image: row.image as string,
    author: row.author as string,
    publishedAt: row.published_at as string,
    featured: row.featured as boolean,
    tags: (row.tags as string[]) || [],
    views: (row.views as number) || 0,
  };
}

// En çok okunan haberler (gerçek views sıralamasıyla)
export async function getMostReadFromDB(count = 10): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("haberler")
      .select("*")
      .order("views", { ascending: false })
      .limit(count * 2);
    if (!error && data && data.length > 0) {
      return data.map(mapToNewsItem).filter(isQualityContent).slice(0, count);
    }
  } catch {}
  // Fallback: son haberler
  return [...newsData].filter(isQualityContent).slice(0, count);
}

export async function getLatestNewsFromDB(count = 12): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("haberler")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(count * 4); // fazla çek, filtrelemeden sonra yeterli kalsın
    if (!error && data && data.length > 0) {
      return data.map(mapToNewsItem).filter(isQualityContent).slice(0, count);
    }
  } catch {}
  return [...newsData]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter(isQualityContent)
    .slice(0, count);
}

export async function getNewsBySlugFromDB(slug: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("haberler")
      .select("*")
      .eq("slug", slug)
      .single();
    if (!error && data) return mapToNewsItem(data);
  } catch {}
  return newsData.find((n) => n.slug === slug) ?? null;
}

export async function getNewsByCategoryFromDB(categorySlug: string, count = 12): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("haberler")
      .select("*")
      .eq("category_slug", categorySlug)
      .order("published_at", { ascending: false })
      .limit(count * 2);
    if (!error && data && data.length > 0) {
      return data.map(mapToNewsItem).filter(isQualityContent).slice(0, count);
    }
  } catch {}
  return newsData
    .filter((n) => n.categorySlug === categorySlug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter(isQualityContent)
    .slice(0, count);
}

export async function getFeaturedNewsFromDB(): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("haberler")
      .select("*")
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(12);
    if (!error && data && data.length > 0) {
      return data.map(mapToNewsItem).filter(isQualityContent).slice(0, 6);
    }
  } catch {}
  return newsData.filter((n) => n.featured === true).filter(isQualityContent).slice(0, 6);
}
