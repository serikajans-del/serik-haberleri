// SERİK USTAM — ortak tanımlar. İstemci bileşenlerinden de içe aktarılır; sunucuya özel kod lib/ustam-db.ts içinde.

export const RENK = { lacivert: "#13263F", turkuaz: "#00A89D", turuncu: "#FF8A36", zemin: "#F7F9FC" };

export type Kategori = { slug: string; ad: string; ikon: string; aciklama: string };

export const KATEGORILER: Kategori[] = [
  { slug: "elektrikci", ad: "Elektrikçi", ikon: "⚡", aciklama: "Arıza, tesisat, priz ve aydınlatma" },
  { slug: "su-tesisatcisi", ad: "Su Tesisatçısı", ikon: "🚰", aciklama: "Kaçak, tıkanıklık, batarya ve tesisat" },
  { slug: "klima-servisi", ad: "Klima Servisi", ikon: "❄️", aciklama: "Bakım, gaz dolumu, montaj ve arıza" },
  { slug: "boya-badana", ad: "Boya ve Badana", ikon: "🎨", aciklama: "İç ve dış cephe boya, alçı" },
  { slug: "ev-temizligi", ad: "Ev Temizliği", ikon: "🧽", aciklama: "Ev, ofis ve inşaat sonrası temizlik" },
  { slug: "beyaz-esya-tamiri", ad: "Beyaz Eşya Tamiri", ikon: "🧺", aciklama: "Buzdolabı, çamaşır ve bulaşık makinesi" },
  { slug: "mobilya-montaji", ad: "Mobilya Montajı", ikon: "🪑", aciklama: "Kurulum, söküm ve tamir" },
  { slug: "cilingir", ad: "Çilingir", ikon: "🔑", aciklama: "Kapı açma, kilit değişimi" },
  { slug: "bahce-bakimi", ad: "Bahçe Bakımı", ikon: "🌿", aciklama: "Budama, çim, sulama sistemleri" },
  { slug: "fayans-seramik", ad: "Fayans ve Seramik", ikon: "🧱", aciklama: "Banyo, mutfak, zemin kaplama" },
  { slug: "insaat-tadilat", ad: "İnşaat ve Tadilat", ikon: "🏗️", aciklama: "Tadilat, onarım, yenileme" },
  { slug: "cam-pencere", ad: "Cam ve Pencere Tamiri", ikon: "🪟", aciklama: "PVC, cam değişimi, sineklik" },
  { slug: "gunes-enerjisi", ad: "Güneş Enerjisi Sistemleri", ikon: "☀️", aciklama: "Güneş paneli, termosifon bakımı" },
  { slug: "kamera-guvenlik", ad: "Kamera ve Güvenlik Sistemleri", ikon: "📹", aciklama: "Kamera, alarm, diafon kurulumu" },
  { slug: "cati-izolasyon", ad: "Çatı ve İzolasyon", ikon: "🏠", aciklama: "Çatı tamiri, su ve ısı yalıtımı" },
  { slug: "nakliye", ad: "Nakliye ve Taşımacılık", ikon: "🚚", aciklama: "Evden eve, parça eşya taşıma" },
];

export const kategoriBul = (slug: string) => KATEGORILER.find((k) => k.slug === slug);

// Bölgeler ve mahalleler (listeyi genişletmek için buraya ekle)
export const BOLGELER = ["Serik Merkez", "Belek", "Kadriye", "Boğazkent"];
export const MAHALLELER = [
  "Serik Merkez", "Kökez", "Orta", "Yeni", "Akçaalan", "Karadayı", "Gebiz", "Belek", "Kadriye", "Boğazkent", "Diğer",
];

export const ZAMANLAR = [
  { id: "en-kisa", ad: "En kısa sürede" },
  { id: "bugun", ad: "Bugün" },
  { id: "yarin", ad: "Yarın" },
  { id: "tarih", ad: "Tarih seç" },
];

export const PAKETLER = [
  { id: "ucretsiz", ad: "Ücretsiz Usta", fiyat: "0 TL", ozellikler: ["Temel profil", "Sınırlı teklif hakkı", "Standart listelenme"] },
  { id: "profesyonel", ad: "Profesyonel Usta", fiyat: "1.200 TL / ay", one: true, ozellikler: ["Daha yüksek teklif limiti", "Gelişmiş profil", "İş talebi bildirimleri", "Performans istatistikleri"] },
  { id: "premium", ad: "Premium Usta", fiyat: "2.000 TL / ay", ozellikler: ["Daha fazla teklif hakkı", "Sponsorlu alanlarda görünürlük", "Detaylı istatistikler", "Ek tanıtım imkânları"] },
];

export type Usta = {
  id: number; slug: string; ad: string; telefon: string; whatsapp: string; kategoriler: string[]; mahalleler: string[];
  deneyim_yil: number; isyeri: string; hakkinda: string; calisma_saatleri: string; foto: string; galeri: string[];
  belge_notu: string; dogrulandi: boolean; paket: string; tamamlanan_is: number; durum: "beklemede" | "onayli" | "reddedildi"; created_at?: string;
};

export type Talep = {
  id: number; kod: string; kategori: string; mahalle: string; aciklama: string; fotolar: string[]; zaman: string; tarih: string | null;
  ad: string; telefon: string; durum: string; yonetici_notu: string; istenen_usta: string; created_at?: string;
};

// Herkese açık profilde gösterilecek alanlar (telefon, belge notu gibi bilgiler sızmasın)
export type AcikUsta = Omit<Usta, "telefon" | "whatsapp" | "belge_notu">;
export function acikUsta(u: Usta): AcikUsta {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { telefon, whatsapp, belge_notu, ...geri } = u;
  return geri;
}

export function slugify(s: string): string {
  const tr: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
  return s.replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => tr[c] ?? c).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export const telTemiz = (t: string) => t.replace(/[^0-9+]/g, "");
export const telGecerli = (t: string) => /^(\+?90|0)?5\d{9}$/.test(telTemiz(t));
