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
  featured?: boolean;
  tags?: string[];
};

export const categories = [
  { name: "Gündem", slug: "gundem" },
  { name: "Asayiş", slug: "asayis" },
  { name: "Ekonomi", slug: "ekonomi" },
  { name: "Spor", slug: "spor" },
  { name: "Sağlık", slug: "saglik" },
  { name: "Eğitim", slug: "egitim" },
  { name: "Yaşam", slug: "yasam" },
  { name: "Turizm", slug: "turizm" },
];

export const newsData: NewsItem[] = [
  {
    id: "1",
    slug: "serik-belediyesi-yeni-park-projesi-baslatti",
    title: "Serik Belediyesi Yeni Park Projesi Başlattı",
    summary: "Serik Belediyesi, ilçe genelinde 5 yeni park yapım çalışması başlattı. Proje kapsamında çocuk oyun alanları ve yürüyüş parkurları da yer alacak.",
    content: `<p>Serik Belediyesi, ilçe sakinlerinin yeşil alan taleplerini karşılamak amacıyla kapsamlı bir park projesi başlattığını duyurdu.</p>
<p>Belediye Başkanı'nın açıklamasına göre, proje kapsamında ilçenin farklı mahallelerinde 5 yeni park yapılacak. Parklar; çocuk oyun alanları, yürüyüş ve bisiklet yolları, oturma grupları ve spor aletlerinden oluşacak.</p>
<p>Çalışmaların 6 ay içinde tamamlanması planlanıyor. Proje, ilçe sakinleri tarafından büyük memnuniyetle karşılandı.</p>
<p>Belediye ayrıca mevcut parkların bakım ve onarımını da yapacak. Ağaçlandırma çalışmaları da projenin önemli bir parçasını oluşturuyor.</p>`,
    category: "Gündem",
    categorySlug: "gundem",
    image: "https://picsum.photos/seed/park1/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-04T09:00:00Z",
    featured: true,
    tags: ["belediye", "park", "yeşil alan"],
  },
  {
    id: "2",
    slug: "serik-te-trafik-kazasi-2-yarali",
    title: "Serik'te Trafik Kazası: 2 Yaralı",
    summary: "Serik ilçesinde meydana gelen trafik kazasında 2 kişi yaralandı. Yaralılar Serik Devlet Hastanesi'ne kaldırıldı.",
    content: `<p>Serik ilçesinde dün akşam meydana gelen trafik kazasında 2 kişi yaralandı.</p>
<p>Edinilen bilgilere göre, Antalya-Alanya karayolunun Serik geçişinde iki otomobilin çarpışması sonucu kaza meydana geldi.</p>
<p>Olay yerine gelen 112 Acil Servis ekipleri yaralıları ilk müdahalenin ardından Serik Devlet Hastanesi'ne kaldırdı. Yaralıların hayati tehlikelerinin bulunmadığı bildirildi.</p>
<p>Kazayla ilgili soruşturma jandarma tarafından sürdürülüyor.</p>`,
    category: "Asayiş",
    categorySlug: "asayis",
    image: "https://picsum.photos/seed/trafik2/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-04T08:30:00Z",
    featured: true,
    tags: ["trafik", "kaza", "asayiş"],
  },
  {
    id: "3",
    slug: "serik-esnafi-turizm-sezonunu-degerlendirdi",
    title: "Serik Esnafı Turizm Sezonunu Değerlendirdi",
    summary: "Serik esnafı, bu yılki turizm sezonuna ilişkin değerlendirmelerini paylaştı. Geçen yıla göre yüzde 20 artış bekleniyor.",
    content: `<p>Serik ilçesindeki esnaf ve iş insanları, yaklaşan turizm sezonuna büyük umutlarla bakıyor.</p>
<p>Serik Esnaf ve Sanatkarlar Odası Başkanı, yaptığı açıklamada bu yıl geçen yıla göre yüzde 20 daha fazla turist beklentisi içinde olduklarını belirtti.</p>
<p>Özellikle Boğazkent ve Side bölgelerindeki otellerin şimdiden yüksek doluluk oranlarına ulaştığı ifade edildi.</p>
<p>Esnaf, sezon boyunca daha fazla istihdam sağlayacaklarını da vurguladı.</p>`,
    category: "Ekonomi",
    categorySlug: "ekonomi",
    image: "https://picsum.photos/seed/esnaf3/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-04T07:45:00Z",
    featured: false,
    tags: ["turizm", "esnaf", "ekonomi"],
  },
  {
    id: "4",
    slug: "serikspor-play-off-yolunda",
    title: "Serikspor Play-Off Yolunda Kritik Galibiyet",
    summary: "Serikspor, kümede kalma mücadelesinin yanı sıra play-off hesapları yapan rakibini 2-0 yenerek kritik 3 puanı kaldı.",
    content: `<p>Serikspor, hafta sonu oynanan kritik maçta rakibini 2-0 mağlup ederek play-off yolunda önemli bir adım attı.</p>
<p>Maçın ilk golü 23. dakikada gelirken, ikinci gol 67. dakikada bulundu.</p>
<p>Teknik direktör maç sonrası yaptığı açıklamada, takımın bu galibiyetle birlikte özgüveninin arttığını belirtti.</p>
<p>Serikspor, gelecek hafta deplasmanda oynayacağı maça hazırlanıyor.</p>`,
    category: "Spor",
    categorySlug: "spor",
    image: "https://picsum.photos/seed/spor4/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-03T20:00:00Z",
    featured: false,
    tags: ["serikspor", "futbol", "spor"],
  },
  {
    id: "5",
    slug: "serik-devlet-hastanesine-yeni-cihazlar",
    title: "Serik Devlet Hastanesi'ne Yeni Cihazlar Alındı",
    summary: "Serik Devlet Hastanesi, modern tıbbi cihazlarla donatıldı. Yeni cihazlarla birlikte tanı ve tedavi süreçleri hızlanacak.",
    content: `<p>Serik Devlet Hastanesi, son teknoloji tıbbi cihazlara kavuştu. Sağlık Bakanlığı'nın destekleriyle gerçekleştirilen alımlarla hastanenin kapasitesi önemli ölçüde artırıldı.</p>
<p>Alınan cihazlar arasında dijital röntgen, ultrason ve biyokimya analizörü yer alıyor.</p>
<p>Hastane Başhekimi, yapılan yatırımın ilçe halkına büyük fayda sağlayacağını ifade etti.</p>`,
    category: "Sağlık",
    categorySlug: "saglik",
    image: "https://picsum.photos/seed/saglik5/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-03T14:00:00Z",
    featured: false,
    tags: ["sağlık", "hastane", "cihaz"],
  },
  {
    id: "6",
    slug: "serik-de-okullar-boya-ve-onarim-calismalari",
    title: "Serik'te Okullarda Boya ve Onarım Çalışmaları",
    summary: "İlçe Milli Eğitim Müdürlüğü, yaz dönemine hazırlık kapsamında okulların boya ve onarım çalışmalarını başlattı.",
    content: `<p>Serik İlçe Milli Eğitim Müdürlüğü, yaz dönemine hazırlık amacıyla ilçedeki okullarda kapsamlı bir bakım ve onarım seferberliği başlattı.</p>
<p>Çalışmalar kapsamında sınıflar, koridorlar ve tuvaletlerin boyası yenileniyor.</p>
<p>İlçe Milli Eğitim Müdürü, tüm okulların yeni eğitim yılına hazır hale getirileceğini açıkladı.</p>`,
    category: "Eğitim",
    categorySlug: "egitim",
    image: "https://picsum.photos/seed/egitim6/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-03T11:00:00Z",
    featured: false,
    tags: ["eğitim", "okul", "onarım"],
  },
  {
    id: "7",
    slug: "side-antik-kenti-rekor-ziyaretci",
    title: "Side Antik Kenti'nde Rekor Ziyaretçi Sayısı",
    summary: "Side Antik Kenti, bu yılın ilk çeyreğinde geçen yılın tamamını geride bırakan ziyaretçi sayısına ulaştı.",
    content: `<p>Serik ilçesinin tarihi turizm merkezi Side Antik Kenti, rekor kırmaya devam ediyor.</p>
<p>Kültür ve Turizm Bakanlığı'nın açıkladığı verilere göre Side Antik Kenti, 2026 yılının ilk çeyreğinde 850 bin ziyaretçiye ev sahipliği yaptı.</p>
<p>Bu rakam, geçen yılın aynı dönemine göre yüzde 35 artışa işaret ediyor.</p>`,
    category: "Turizm",
    categorySlug: "turizm",
    image: "https://picsum.photos/seed/turizm7/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-02T16:00:00Z",
    featured: false,
    tags: ["Side", "turizm", "antik kent"],
  },
  {
    id: "8",
    slug: "serik-te-esnaf-bulusmasi",
    title: "Serik'te Esnaf Buluşması Düzenlendi",
    summary: "Serik Esnaf ve Sanatkarlar Odası, aylık olağan toplantısını gerçekleştirdi. Toplantıda ilçenin sorunları ele alındı.",
    content: `<p>Serik Esnaf ve Sanatkarlar Odası, bu ayki toplantısını gerçekleştirdi.</p>
<p>Oda Başkanı, toplantının ardından yaptığı açıklamada, belediye ile ortak projeler geliştirmeye devam edeceklerini söyledi.</p>`,
    category: "Ekonomi",
    categorySlug: "ekonomi",
    image: "https://picsum.photos/seed/esnaf8/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-02T12:00:00Z",
    featured: false,
    tags: ["esnaf", "ekonomi", "toplantı"],
  },
  {
    id: "9",
    slug: "serik-de-saglikli-yasam-etkinligi",
    title: "Serik'te Sağlıklı Yaşam Etkinliği Düzenlendi",
    summary: "Serik Belediyesi ve Sağlık Müdürlüğü iş birliğiyle düzenlenen etkinlikte ücretsiz sağlık taraması yapıldı.",
    content: `<p>Serik Belediyesi ve İlçe Sağlık Müdürlüğü'nün ortak organizasyonuyla düzenlenen etkinlik büyük ilgi gördü.</p>
<p>Etkinlikte kan basıncı, kan şekeri ve kolesterol ölçümleri ücretsiz olarak yapıldı.</p>`,
    category: "Yaşam",
    categorySlug: "yasam",
    image: "https://picsum.photos/seed/yasam9/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-01T10:00:00Z",
    featured: false,
    tags: ["sağlık", "yaşam", "etkinlik"],
  },
  {
    id: "10",
    slug: "serik-de-hizli-market-soygununa-tutuklama",
    title: "Serik'te Market Soygununa Tutuklama",
    summary: "Serik'te bir marketi soyan zanlı, jandarma operasyonu sonucunda kısa sürede yakalanarak tutuklandı.",
    content: `<p>Serik ilçesinde bir marketi soyan zanlı, jandarma ekiplerinin kısa süreli takibinin ardından yakalandı.</p>
<p>Zanlı, çıkarıldığı mahkemece tutuklanarak cezaevine gönderildi.</p>`,
    category: "Asayiş",
    categorySlug: "asayis",
    image: "https://picsum.photos/seed/asayis10/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-01T08:00:00Z",
    featured: false,
    tags: ["asayiş", "jandarma", "soygun"],
  },
  {
    id: "11",
    slug: "serik-te-tarim-fuari-acildi",
    title: "Serik'te Tarım Fuarı Kapılarını Açtı",
    summary: "Serik'te bu yıl 3. kez düzenlenen Tarım Fuarı, çiftçi ve üreticilerin büyük ilgisiyle karşılandı.",
    content: `<p>Serik ilçesinde düzenlenen Tarım Fuarı, renkli açılış töreniyle kapılarını açtı. Fuar, ilçe çiftçilerine yeni tarım teknolojilerini tanıtma fırsatı sunuyor.</p>
<p>3 gün sürecek fuarda 50'den fazla firma stand açtı. Ziyaretçiler tarım makineleri, tohum, gübre ve sulama sistemleri hakkında bilgi edinebildi.</p>`,
    category: "Gündem",
    categorySlug: "gundem",
    image: "https://picsum.photos/seed/tarim11/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-04-01T07:00:00Z",
    featured: false,
    tags: ["tarım", "fuar", "çiftçi"],
  },
  {
    id: "12",
    slug: "serik-de-su-kesintisi-uyarisi",
    title: "Serik'te Yarın Su Kesintisi Yaşanacak",
    summary: "ANTALYA Su ve Kanalizasyon İdaresi, bakım çalışmaları kapsamında Serik'te yarın 6 saatlik su kesintisi yapılacağını duyurdu.",
    content: `<p>ASAT, Serik ilçesinde bazı mahallelerde yarın sabah 08.00-14.00 saatleri arasında su kesintisi uygulanacağını açıkladı.</p>
<p>Kesintinin Yenimahalle, Cumhuriyet Mahallesi ve Atatürk Mahallesi'ni kapsayacağı bildirildi. Vatandaşların önceden su biriktirmeleri önerildi.</p>`,
    category: "Gündem",
    categorySlug: "gundem",
    image: "https://picsum.photos/seed/su12/860/504",
    author: "Serik Haberleri",
    publishedAt: "2026-03-31T15:00:00Z",
    featured: false,
    tags: ["su kesintisi", "ASAT", "Serik"],
  },
];

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
