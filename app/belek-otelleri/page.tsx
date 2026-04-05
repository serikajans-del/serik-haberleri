import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Belek Otelleri | Belek Otel ve Tatil Köyleri 2026",
  description: "Belek'teki 5 yıldızlı oteller, tatil köyleri ve apart oteller. Belek otel fiyatları, yorumlar ve rezervasyon bilgileri.",
  keywords: ["Belek otelleri", "Belek otel", "Belek tatil köyleri", "Belek 5 yıldızlı otel", "Antalya Belek otel", "Belek otel fiyatları"],
  openGraph: {
    title: "Belek Otelleri 2026",
    description: "Belek'in en iyi otel ve tatil köyleri. Fiyatlar ve rezervasyon.",
  },
};

const hotels = [
  {
    name: "Regnum Carya Golf & Spa Resort",
    stars: 5,
    type: "Tatil Köyü",
    area: "Belek",
    features: ["Golf Sahası", "Spa", "Özel Plaj", "Su Parkı"],
    price: "₺8.500",
    priceNote: "kişi/gece (All Inclusive)",
    image: "🏌️",
  },
  {
    name: "Maxx Royal Belek Golf Resort",
    stars: 5,
    type: "Tatil Köyü",
    area: "Belek",
    features: ["18 Delik Golf", "Spa", "5 Havuz", "Plaj"],
    price: "₺9.200",
    priceNote: "kişi/gece (Ultra AI)",
    image: "🌊",
  },
  {
    name: "Gloria Serenity Resort",
    stars: 5,
    type: "Otel",
    area: "Belek",
    features: ["Aquapark", "Golf", "Spa", "Plaj"],
    price: "₺6.800",
    priceNote: "kişi/gece (All Inclusive)",
    image: "🏊",
  },
  {
    name: "Ela Quality Resort",
    stars: 5,
    type: "Tatil Köyü",
    area: "Belek",
    features: ["Tenis", "Plaj", "Spa", "Çocuk Kulübü"],
    price: "₺7.100",
    priceNote: "kişi/gece (All Inclusive)",
    image: "🎾",
  },
  {
    name: "Kaya Palazzo Golf Resort",
    stars: 5,
    type: "Otel",
    area: "Belek",
    features: ["Golf", "Spa", "Plaj", "Restoranlar"],
    price: "₺7.800",
    priceNote: "kişi/gece (All Inclusive)",
    image: "⛳",
  },
  {
    name: "Susesi Luxury Resort",
    stars: 5,
    type: "Otel",
    area: "Boğazkent",
    features: ["Plaj", "Spa", "Havuz", "Restoranlar"],
    price: "₺5.500",
    priceNote: "kişi/gece (All Inclusive)",
    image: "🌴",
  },
];

const categories = [
  { name: "5 Yıldızlı", count: 18, icon: "⭐" },
  { name: "Golf Otelleri", count: 9, icon: "⛳" },
  { name: "Spa Otelleri", count: 14, icon: "💆" },
  { name: "Aile Otelleri", count: 12, icon: "👨‍👩‍👧" },
  { name: "Ultra AI", count: 6, icon: "🍽️" },
  { name: "Apart Otel", count: 8, icon: "🏠" },
];

export default function BelekOtellerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Belek Otelleri",
    description: "Belek'teki otel ve tatil köyleri listesi",
    url: "https://www.serikhaberleri.com/belek-otelleri",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f4c2a 0%, #1a6b3a 60%, #22c55e 150%)" }} className="text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-xs text-green-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Belek Otelleri</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">🏨 Belek Otelleri 2026</h1>
          <p className="text-green-100 text-sm max-w-xl">
            Dünyanın önde gelen golf destinasyonu Belek'te lüks otel ve tatil köyleri. Fiyatlar, özellikler ve rezervasyon bilgileri.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["All Inclusive", "Golf Resort", "Spa", "Plaj", "Çocuk Kulübü"].map((tag) => (
              <span key={tag} className="text-xs bg-white bg-opacity-20 px-2.5 py-1 rounded-full font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c.name}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all"
            >
              <span>{c.icon}</span>
              {c.name}
              <span className="text-gray-400 font-normal">({c.count})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Otel Listesi */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Öne Çıkan Oteller
              </h2>
              <span className="text-sm text-gray-500">{hotels.length} otel listelendi</span>
            </div>

            <div className="space-y-4">
              {hotels.map((h) => (
                <div key={h.name} className="business-card flex gap-4">
                  <div
                    className="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center text-4xl"
                    style={{ backgroundColor: "#f0fdf4" }}
                  >
                    {h.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-base text-gray-900">{h.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-yellow-500 text-sm">{"★".repeat(h.stars)}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{h.type}</span>
                          <span className="text-xs text-gray-500">{h.area}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-lg" style={{ color: "#cc0000" }}>{h.price}</div>
                        <div className="text-xs text-gray-400">{h.priceNote}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {h.features.map((f) => (
                        <span key={f} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Fiyatlar yaklaşık olup değişkenlik gösterebilir. Rezervasyon için oteli doğrudan arayın.
              </p>
            </div>
          </div>

          {/* Sağ */}
          <div className="space-y-4">

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-800 mb-2">⛳ Belek Hakkında</h3>
              <ul className="text-sm text-green-700 space-y-1.5">
                <li>• 30&apos;dan fazla golf sahası</li>
                <li>• 25 km sahil şeridi</li>
                <li>• Antalya&apos;ya 30 dk uzaklık</li>
                <li>• Yıl boyunca sıcak iklim</li>
                <li>• Dünya çapında lüks oteller</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-3">📞 Diğer Bilgiler</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>🚌 <strong>Antalya Havalimanı:</strong> ~30 dk</p>
                <p>🏥 <strong>En yakın hastane:</strong> Serik Devlet</p>
                <p>💊 <strong>Nöbetçi Eczane:</strong>{" "}
                  <Link href="/eczane" className="text-red-600 hover:underline">Görüntüle</Link>
                </p>
                <p>🌤️ <strong>Hava Durumu:</strong>{" "}
                  <Link href="/hava-durumu" className="text-red-600 hover:underline">Görüntüle</Link>
                </p>
              </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-lg text-center py-8 bg-white">
              <p className="text-gray-400 text-xs uppercase tracking-widest">Reklam Alanı</p>
              <Link href="/reklam" className="text-xs mt-1 block" style={{ color: "#cc0000" }}>
                Reklam ver →
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
