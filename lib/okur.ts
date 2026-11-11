// OKUR HABERLERİ (serikhaberleri.com/okur) — ortak tanımlar. İstemci bileşenlerinden de içe aktarılır; sunucuya özel kod lib/okur-sunucu/ altında.
// Veritabanı tabloları tarihsel olarak "meydan_" önekli (supabase/meydan.sql).

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com").replace(/\/$/, "");
export const SITE_ADI = "Okur Haberleri";
// Serik Haberleri editör hesabı: paylaşımları "Editör" rozetiyle görünür, Ayın Liderleri yarışına katılmaz.
// (Kayıtta "serikhaberleri" içeren rumuzlar yasak; bu ad başkasına verilemez.)
export const EDITOR_RUMUZ = "SerikHaberleri";
export const SLOGAN = "Serik'te olup biten, Seriklilerden";

export type Kategori = { slug: string; ad: string; kisa: string; ikon: string; renk: string; zemin: string; aciklama: string; ipucu: string };

export const KATEGORILER: Kategori[] = [
  { slug: "sikayet", ad: "Şikâyet", kisa: "Şikâyet", ikon: "📣", renk: "#C2410C", zemin: "#FFF1E8", aciklama: "Serik'te yaşanan sorunlar ve vatandaş şikâyetleri", ipucu: "Sorunu, yerini ve ne zamandır sürdüğünü yaz." },
  { slug: "yol-altyapi", ad: "Yol ve Altyapı", kisa: "Yol/Altyapı", ikon: "🚧", renk: "#B45309", zemin: "#FEF6E4", aciklama: "Bozuk yol, su, elektrik, kanalizasyon ve aydınlatma bildirimleri", ipucu: "Çukur, kaçak, kesinti… Fotoğraf ve konum çok işe yarar." },
  { slug: "ariyorum", ad: "Arıyorum / Yardım", kisa: "Arıyorum", ikon: "🔎", renk: "#1D4ED8", zemin: "#EAF1FF", aciklama: "Serik'te bir şey arayanlar ve yardım isteyenler", ipucu: "Ne aradığını açık yaz; bilen biri mutlaka yanıtlar." },
  { slug: "tavsiye", ad: "İşletme Tavsiyesi", kisa: "Tavsiye", ikon: "⭐", renk: "#047857", zemin: "#E7F8F1", aciklama: "Seriklilerin memnun kaldığı işletme, usta ve hizmet tavsiyeleri", ipucu: "Neden memnun kaldığını anlat. Kişisel saldırı içermesin." },
  { slug: "gorus", ad: "Görüş ve Öneri", kisa: "Görüş", ikon: "💬", renk: "#6D28D9", zemin: "#F3EEFF", aciklama: "Serik için fikirler, öneriler ve görüşler", ipucu: "Şehir için ne değişmeli? Önerini gerekçesiyle yaz." },
  { slug: "istek", ad: "İstek", kisa: "İstek", ikon: "🙏", renk: "#BE185D", zemin: "#FFEEF6", aciklama: "Belediyeden, kurumlardan ve işletmelerden istekler", ipucu: "Kimden ne istediğini ve neden gerektiğini yaz." },
  { slug: "trafik-kaza", ad: "Trafik ve Kaza", kisa: "Trafik", ikon: "🚦", renk: "#B91C1C", zemin: "#FFECEC", aciklama: "Anlık trafik, kaza ve yol kapanışı bilgileri", ipucu: "Saat ve yeri mutlaka yaz. Yaralı/plaka fotoğrafı paylaşma." },
  { slug: "kayip-buluntu", ad: "Kayıp / Buluntu", kisa: "Kayıp", ikon: "🐾", renk: "#0F766E", zemin: "#E6F7F5", aciklama: "Kayıp eşya, evcil hayvan ve buluntu duyuruları", ipucu: "Nerede, ne zaman kayboldu/bulundu? Ayırt edici özelliği yaz." },
  { slug: "etkinlik", ad: "Etkinlik", kisa: "Etkinlik", ikon: "🎉", renk: "#7C3AED", zemin: "#F2ECFF", aciklama: "Serik'teki etkinlikler, konserler, pazarlar ve buluşmalar", ipucu: "Tarih, saat ve yeri eksiksiz yaz." },
  { slug: "bilgi", ad: "Bilgi / Duyuru", kisa: "Bilgi", ikon: "📌", renk: "#334155", zemin: "#EEF2F6", aciklama: "Herkesin bilmesi gereken bilgiler ve duyurular", ipucu: "Bilginin kaynağını belirt." },
];
export const kategoriBul = (slug: string) => KATEGORILER.find((k) => k.slug === slug);
export const SIKAYET_TURU = ["sikayet", "yol-altyapi", "istek"];

export const MAHALLELER = [
  "Merkez", "Orta", "Kökez", "Yeni", "Cumhuriyet", "Pınarcık", "Akçaalan", "Karadayı", "Gebiz", "Abdurrahmanlar",
  "Belek", "Kadriye", "Boğazkent", "Kumköy", "Kocayatak", "Bucak", "Deniztepesi", "Kızılot", "Gökçepınar", "Diğer",
];
export const mahalleSlug = (m: string) => slugify(m);
export const mahalleBul = (slug: string) => MAHALLELER.find((m) => slugify(m) === slug);

export const CINSIYET: Record<string, { ad: string; ikon: string; renk: string }> = {
  kadin: { ad: "Kadın", ikon: "♀", renk: "#DB2777" },
  erkek: { ad: "Erkek", ikon: "♂", renk: "#2563EB" },
  belirtilmedi: { ad: "Belirtilmedi", ikon: "", renk: "#64748B" },
};

export const COZUM: Record<string, { ad: string; renk: string; zemin: string }> = {
  acik: { ad: "Bekliyor", renk: "#B45309", zemin: "#FEF3C7" },
  iletildi: { ad: "Yetkililere iletildi", renk: "#1D4ED8", zemin: "#DBEAFE" },
  cozuldu: { ad: "Çözüldü", renk: "#047857", zemin: "#D1FAE5" },
};

export const BILDIR_NEDENLERI = ["Hakaret veya küfür", "Asılsız suçlama / iftira", "Kişisel bilgi (telefon, adres, yüz, plaka)", "Reklam veya spam", "Yanlış bilgi", "Diğer"];

export type Paylasim = {
  id: number; slug: string; uye_id: number; kategori: string; baslik: string; icerik: string; fotolar: string[];
  mahalle: string; yer: string; olay_tarihi: string | null; olay_saati: string; isletme_adi: string;
  durum: string; cozum: string; red_nedeni: string; begeni_sayisi: number; yorum_sayisi: number; faydali_sayisi: number;
  goruntulenme: number; created_at: string; yayin_at: string | null;
  uye?: { rumuz: string; cinsiyet: string } | null;
};
export type Yorum = { id: number; paylasim_id: number; uye_id: number; icerik: string; durum: string; created_at: string; uye?: { rumuz: string; cinsiyet: string } | null };
export type Lider = { uye_id: number; rumuz: string; cinsiyet: string; puan: number; paylasim: number; begeni: number; yorum: number; faydali: number };
export type AyKazanani = { ay: string; rumuz: string; cinsiyet: string; puan: number };

export function slugify(s: string): string {
  const tr: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u", Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u", Â: "a" };
  return s.replace(/[çğıöşüâîûÇĞİIÖŞÜÂ]/g, (c) => tr[c] ?? c).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
export const ayAdi = (ay: number) => AYLAR[ay];

// "2026-11-01" → "Kasım 2026"
export function ayEtiketi(isoAy: string): string {
  const [y, m] = isoAy.split("-").map(Number);
  return `${AYLAR[m - 1]} ${y}`;
}

export function gecenZaman(iso: string): string {
  const fark = (Date.now() - new Date(iso).getTime()) / 1000;
  if (fark < 60) return "az önce";
  if (fark < 3600) return `${Math.floor(fark / 60)} dk önce`;
  if (fark < 86400) return `${Math.floor(fark / 3600)} sa önce`;
  if (fark < 86400 * 7) return `${Math.floor(fark / 86400)} gün önce`;
  return tarihYaz(iso);
}

export function tarihYaz(iso: string, saatli = false): string {
  return new Date(iso).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul", day: "numeric", month: "long", year: "numeric", ...(saatli ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

// "2026-11-11" → "11 Kasım 2026"
export function gunYaz(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${AYLAR[m - 1]} ${y}`;
}

export function ozet(metin: string, n = 160): string {
  const t = metin.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
}

// Rumuz: 3-20 karakter, harf/rakam/alt çizgi/nokta, Türkçe harf serbest
export const rumuzGecerli = (r: string) => /^[A-Za-z0-9ÇĞİÖŞÜçğıöşü_.]{3,20}$/.test(r);
