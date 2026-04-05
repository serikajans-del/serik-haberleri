import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reklam | Serik Haberleri",
  description: "Serik Haberleri'nde reklam verin. Serik, Side ve Belek'teki 50.000+ okuyucuya ulaşın.",
};

const packages = [
  {
    name: "Başlangıç",
    price: "₺500",
    period: "/ay",
    color: "#6b7280",
    features: [
      "Banner Reklam (300×250)",
      "Ayda 15.000 gösterim",
      "1 kategori sayfası",
      "Temel istatistikler",
    ],
    cta: "Seç",
  },
  {
    name: "Popüler",
    price: "₺1.200",
    period: "/ay",
    color: "#cc0000",
    badge: "En Çok Tercih Edilen",
    features: [
      "Ana Sayfa Banner (728×90)",
      "Ayda 60.000 gösterim",
      "Tüm kategori sayfaları",
      "Sponsor haber (1/ay)",
      "Detaylı istatistikler",
    ],
    cta: "Seç",
  },
  {
    name: "Kurumsal",
    price: "₺2.500",
    period: "/ay",
    color: "#1a1a2e",
    features: [
      "Ana Sayfa Premium Alan",
      "Sınırsız gösterim",
      "Tüm sayfalar",
      "Sponsor haber (4/ay)",
      "Firma Rehberi Öne Çıkan",
      "Sosyal medya tanıtımı",
      "Özel raporlama",
    ],
    cta: "İletişime Geç",
  },
];

const adFormats = [
  { name: "Ana Sayfa Manşet Bandı", size: "728×90 px", location: "Ana sayfa üst bölüm", impressions: "~40K/ay" },
  { name: "Sidebar Reklam", size: "300×250 px", location: "Tüm sayfalarda sağ kolon", impressions: "~25K/ay" },
  { name: "Haber Arası Reklam", size: "728×90 px", location: "Haber içerikleri arası", impressions: "~30K/ay" },
  { name: "Sponsor Haber", size: "Tam makale", location: "Ana sayfa & kategori", impressions: "~15K/ay" },
  { name: "Firma Rehberi Öne Çıkan", size: "Kart görünümü", location: "Firma rehberi sayfası", impressions: "~8K/ay" },
  { name: "Son Dakika Sponsorluğu", size: "Logo + Metin", location: "Son dakika şeridi", impressions: "~50K/ay" },
];

export default function ReklamPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #cc0000 100%)" }} className="text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <nav className="text-xs text-red-200 mb-4 flex items-center justify-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Reklam</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black mb-3">📣 Reklam Verin, Büyüyün</h1>
          <p className="text-red-100 text-lg max-w-2xl mx-auto mb-6">
            Serik, Side ve Belek&apos;teki binlerce okuyucuya günlük ulaşın. Yerel işletmenizi dijitalde güçlendirin.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-center">
            {[
              { value: "50.000+", label: "Aylık Tekil Ziyaretçi" },
              { value: "180.000+", label: "Aylık Sayfa Görüntüleme" },
              { value: "12.000+", label: "Sosyal Medya Takipçisi" },
            ].map((s) => (
              <div key={s.label} className="bg-white bg-opacity-15 rounded-xl px-6 py-3">
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-red-200 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Paketler */}
        <h2 className="text-2xl font-black text-center mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Reklam Paketleri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {packages.map((p) => (
            <div
              key={p.name}
              className="bg-white border-2 rounded-xl overflow-hidden relative flex flex-col"
              style={{ borderColor: p.color }}
            >
              {p.badge && (
                <div className="text-center text-xs font-black text-white py-1.5" style={{ backgroundColor: p.color }}>
                  {p.badge}
                </div>
              )}
              <div className="p-6 flex-1">
                <h3 className="text-xl font-black mb-1" style={{ color: p.color }}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-gray-900">{p.price}</span>
                  <span className="text-gray-500 text-sm">{p.period}</span>
                </div>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: p.color }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pb-6">
                <a
                  href="mailto:reklam@serikhaberleri.com"
                  className="block w-full text-center text-white font-bold py-2.5 rounded-lg transition-opacity hover:opacity-85"
                  style={{ backgroundColor: p.color }}
                >
                  {p.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Reklam Formatları */}
        <h2 className="text-xl font-black mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Reklam Alanları ve Formatlar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {adFormats.map((f) => (
            <div key={f.name} className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2">{f.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📐 <strong>Boyut:</strong> {f.size}</p>
                <p>📍 <strong>Konum:</strong> {f.location}</p>
                <p>👁️ <strong>Gösterim:</strong> {f.impressions}</p>
              </div>
            </div>
          ))}
        </div>

        {/* İletişim */}
        <div className="follow-cta max-w-2xl mx-auto text-center">
          <div className="text-3xl mb-3">✉️</div>
          <h3 className="text-xl font-black mb-2">Özel Teklif Alın</h3>
          <p className="text-gray-300 text-sm mb-4">
            İhtiyacınıza özel reklam çözümleri için bizimle iletişime geçin. 24 saat içinde yanıt veriyoruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:reklam@serikhaberleri.com"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              ✉️ reklam@serikhaberleri.com
            </a>
            <a
              href="tel:+902427531000"
              className="inline-flex items-center gap-2 bg-white bg-opacity-15 hover:bg-opacity-25 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              📞 0242 753 10 00
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
