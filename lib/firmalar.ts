// NOT: Bu dosya istemci bileşenlerinden de import edilir (kayıt formu kategorileri).
// Bu yüzden sunucuya özel supabase içe aktarması BURADA olmamalı; DB işlevi lib/firmalar-db.ts içinde.

export type Isletme = {
  id: number;
  slug: string;
  ad: string;
  kategori: string;
  kategori_ad: string;
  adres: string;
  telefon: string;
  whatsapp: string;
  instagram: string;
  website: string;
  calisma_saatleri: string;
  harita: string;
  aciklama: string;
  gorsel: string;
  durum: "beklemede" | "onayli" | "reddedildi";
  created_at?: string;
};

// Kategoriye göre kart başlığı degrade rengi (fotoğraf yoksa kullanılır)
export const KATEGORI_RENK: Record<string, [string, string]> = {
  "yeme-icme": ["#f97316", "#ea580c"],
  "gida": ["#16a34a", "#15803d"],
  "giyim": ["#8b5cf6", "#6d28d9"],
  "guzellik": ["#ec4899", "#be185d"],
  "saglik": ["#0ea5e9", "#0369a1"],
  "otomotiv": ["#64748b", "#334155"],
  "konaklama": ["#0d9488", "#0f766e"],
  "egitim": ["#eab308", "#a16207"],
  "hizmet": ["#dc2626", "#991b1b"],
};

export function kategoriEmoji(slug: string): string {
  return KATEGORILER.find((k) => k.slug === slug)?.emoji ?? "🔧";
}

// Rehber kategorileri (slug → görünen ad). Yeni kategori eklemek için buraya satır ekle.
export const KATEGORILER: { slug: string; ad: string; emoji: string }[] = [
  { slug: "yeme-icme", ad: "Yeme & İçme", emoji: "🍽️" },
  { slug: "gida", ad: "Gıda & Market", emoji: "🛒" },
  { slug: "giyim", ad: "Giyim & Aksesuar", emoji: "👕" },
  { slug: "guzellik", ad: "Kuaför & Güzellik", emoji: "💈" },
  { slug: "saglik", ad: "Sağlık", emoji: "🩺" },
  { slug: "otomotiv", ad: "Otomotiv", emoji: "🚗" },
  { slug: "konaklama", ad: "Konaklama", emoji: "🏨" },
  { slug: "egitim", ad: "Eğitim & Kurs", emoji: "📚" },
  { slug: "hizmet", ad: "Hizmet & Diğer", emoji: "🔧" },
];

export function kategoriAd(slug: string): string {
  return KATEGORILER.find((k) => k.slug === slug)?.ad ?? "Hizmet & Diğer";
}

const TR: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };

export function slugify(s: string): string {
  return s
    .trim()
    .replace(/[çğıöşüİÇĞÖŞÜ]/g, (c) => TR[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
