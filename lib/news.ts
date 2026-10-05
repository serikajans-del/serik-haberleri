export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  categorySlug: string;
  image: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featured?: boolean;
  tags?: string[];
  views?: number;
};

export const categories = [
  { name: "Gündem", slug: "gundem" },
  { name: "Antalya", slug: "antalya" },
  { name: "Asayiş", slug: "asayis" },
  { name: "Ekonomi", slug: "ekonomi" },
  { name: "Spor", slug: "spor" },
  { name: "Sağlık", slug: "saglik" },
  { name: "Eğitim", slug: "egitim" },
  { name: "Yaşam", slug: "yasam" },
  { name: "Turizm", slug: "turizm" },
];

// Veritabanına ulaşılamadığında kullanılan yedek liste. Örnek/uydurma haber içermez.
export const newsData: NewsItem[] = [];

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return newsData.find((n) => n.slug === slug);
}

export function getNewsByCategory(categorySlug: string): NewsItem[] {
  return newsData.filter((n) => n.categorySlug === categorySlug);
}

export function getFeaturedNews(): NewsItem[] {
  return newsData.filter((n) => n.featured);
}

export function getLatestNews(count = 10): NewsItem[] {
  return [...newsData]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} saniye önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}
