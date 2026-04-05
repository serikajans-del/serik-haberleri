import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Serik Firma Rehberi | Yerel İşletmeler ve Esnaf",
  description: "Serik'teki restoran, market, eczane, tamirci ve diğer yerel işletmeler. Firma rehberi ve iletişim bilgileri.",
  keywords: ["Serik firma rehberi", "Serik işletmeler", "Serik esnaf", "Serik restoran", "Serik market"],
  openGraph: {
    title: "Serik Firma Rehberi",
    description: "Serik'teki yerel işletmeler, esnaf ve firmalar.",
  },
};

const businessCategories = [
  { icon: "🍽️", name: "Restoran & Kafe", count: 48, slug: "restoran" },
  { icon: "🛒", name: "Market & Manav", count: 32, slug: "market" },
  { icon: "💊", name: "Eczane", count: 12, slug: "eczane" },
  { icon: "🔧", name: "Tamirci & Teknisyen", count: 24, slug: "tamirci" },
  { icon: "🏗️", name: "İnşaat & Yapı", count: 18, slug: "insaat" },
  { icon: "💇", name: "Güzellik & Kuaför", count: 21, slug: "guzellik" },
  { icon: "🏥", name: "Sağlık & Klinik", count: 15, slug: "saglik" },
  { icon: "🚗", name: "Oto Servis & Yedek Parça", count: 19, slug: "oto" },
  { icon: "📚", name: "Eğitim & Kurs", count: 11, slug: "egitim" },
  { icon: "🏨", name: "Konaklama", count: 35, slug: "konaklama" },
  { icon: "🧹", name: "Temizlik & Hizmet", count: 16, slug: "temizlik" },
  { icon: "⚡", name: "Elektrik & Elektronik", count: 14, slug: "elektrik" },
];

const featuredBusinesses = [
  {
    name: "Serik Balık Restaurant",
    category: "Restoran",
    address: "Sahil Cad. No:15, Serik",
    phone: "0242 753 45 67",
    rating: 4.8,
    reviewCount: 124,
    tags: ["Deniz Ürünleri", "Taze Balık", "Açık Alan"],
    premium: true,
  },
  {
    name: "Anatolian Market",
    category: "Market",
    address: "Atatürk Mah. No:32, Serik",
    phone: "0242 753 11 22",
    rating: 4.5,
    reviewCount: 67,
    tags: ["Organik Ürünler", "Yerel Üretim", "Teslimat"],
    premium: false,
  },
  {
    name: "Serik Oto Servis",
    category: "Oto Servis",
    address: "Sanayi Sitesi No:8, Serik",
    phone: "0242 753 88 99",
    rating: 4.7,
    reviewCount: 89,
    tags: ["Tüm Markalar", "Yedek Parça", "Lastik"],
    premium: true,
  },
  {
    name: "Side Güzellik Merkezi",
    category: "Güzellik",
    address: "Side Cad. No:22, Side",
    phone: "0242 753 55 44",
    rating: 4.9,
    reviewCount: 203,
    tags: ["Saç", "Cilt Bakımı", "Tırnak"],
    premium: false,
  },
];

export default function FirmaRehberiPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" }} className="text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-xs text-blue-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Firma Rehberi</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">🏢 Serik Firma Rehberi</h1>
          <p className="text-blue-100 text-sm max-w-xl mb-4">
            Serik, Side, Belek ve Boğazkent&apos;teki yerel işletmeler, esnaf ve firmalar. Hizmet alın veya firmanızı listeleyin.
          </p>

          {/* Arama */}
          <div className="flex max-w-lg">
            <input
              type="text"
              placeholder="Firma, kategori veya hizmet ara..."
              className="flex-1 px-4 py-2.5 text-gray-800 text-sm rounded-l-lg focus:outline-none"
              readOnly
            />
            <button
              className="px-5 py-2.5 font-bold text-sm rounded-r-lg transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#cc0000" }}
            >
              Ara
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Firma Ekle CTA */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-amber-800">İşletmenizi ücretsiz listeleyin!</p>
            <p className="text-sm text-amber-700">Binlerce Serik sakinine ulaşın. Temel listeleme tamamen ücretsiz.</p>
          </div>
          <Link
            href="/reklam"
            className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white flex-shrink-0 transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#cc0000" }}
          >
            Firma Ekle
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        {/* Kategoriler Grid */}
        <h2 className="font-black text-lg mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Kategoriler
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {businessCategories.map((cat) => (
            <button
              key={cat.slug}
              className="business-card flex flex-col items-center gap-2 py-4 text-center cursor-pointer"
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <div className="text-xs font-bold text-gray-700 leading-tight">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.count} firma</div>
              </div>
            </button>
          ))}
        </div>

        {/* Öne Çıkan İşletmeler */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Öne Çıkan İşletmeler
          </h2>
          <Link href="/reklam" className="text-xs font-semibold hover:text-red-700 transition-colors" style={{ color: "#cc0000" }}>
            Öne Çıkartın →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {featuredBusinesses.map((b) => (
            <div key={b.name} className="business-card relative">
              {b.premium && (
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    ⭐ Öne Çıkan
                  </span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {businessCategories.find((c) => b.category.toLowerCase().includes(c.name.split(" ")[0].toLowerCase()))?.icon || "🏢"}
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <h3 className="font-bold text-gray-900">{b.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{b.category}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-xs">{"★".repeat(Math.floor(b.rating))}</span>
                    <span className="text-xs font-bold text-gray-700">{b.rating}</span>
                    <span className="text-xs text-gray-400">({b.reviewCount} yorum)</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600 flex items-start gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {b.address}
              </div>

              <div className="flex flex-wrap gap-1 mt-2 mb-3">
                {b.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={`tel:${b.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#cc0000" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {b.phone}
              </a>
            </div>
          ))}
        </div>

        {/* Reklam CTA */}
        <div className="follow-cta">
          <div className="text-2xl mb-2">📣</div>
          <h3 className="font-black text-lg mb-1">İşletmenizi 50.000+ kişiye duyurun!</h3>
          <p className="text-gray-300 text-sm mb-4">
            Serik Haberleri&apos;nde reklam verin, yerel müşterilere ulaşın.
          </p>
          <Link
            href="/reklam"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Reklam Paketi İncele →
          </Link>
        </div>

      </div>
    </>
  );
}
