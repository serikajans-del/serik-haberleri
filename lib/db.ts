import { supabaseAdmin } from "./supabase";
import type { NewsItem } from "./news";

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
  };
}

export async function getLatestNewsFromDB(count = 12): Promise<NewsItem[]> {
  const { data, error } = await supabaseAdmin
    .from("haberler")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(count);
  if (error || !data) return [];
  return data.map(mapToNewsItem);
}

export async function getNewsBySlugFromDB(slug: string): Promise<NewsItem | null> {
  const { data, error } = await supabaseAdmin
    .from("haberler")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return mapToNewsItem(data);
}

export async function getNewsByCategoryFromDB(categorySlug: string, count = 12): Promise<NewsItem[]> {
  const { data, error } = await supabaseAdmin
    .from("haberler")
    .select("*")
    .eq("category_slug", categorySlug)
    .order("published_at", { ascending: false })
    .limit(count);
  if (error || !data) return [];
  return data.map(mapToNewsItem);
}

export async function getFeaturedNewsFromDB(): Promise<NewsItem[]> {
  const { data, error } = await supabaseAdmin
    .from("haberler")
    .select("*")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(6);
  if (error || !data) return [];
  return data.map(mapToNewsItem);
}
