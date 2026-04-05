import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Serik Nöbetçi Eczane | Bugün Nöbetçi Eczaneler",
  description: "Serik ilçesindeki nöbetçi eczaneler, telefon numaraları ve adresleri. Serik'te bugün hangi eczane nöbetçi?",
  keywords: ["Serik nöbetçi eczane", "Serik eczane", "Serik bugün nöbetçi eczane", "Antalya Serik eczane"],
  openGraph: {
    title: "Serik Nöbetçi Eczane",
    description: "Serik'te bugün nöbetçi eczaneler ve iletişim bilgileri.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Serik Nöbetçi Eczane",
  description: "Serik ilçesindeki nöbetçi eczanelerin listesi",
  url: "https://www.serikhaberleri.com/eczane",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://www.serikhaberleri.com" },
      { "@type": "ListItem", position: 2, name: "Nöbetçi Eczane" },
    ],
  },
};

const pharmacies = [
  {
    name: "Serik Merkez Eczanesi",
    address: "Atatürk Cad. No:12, Serik Merkez",
    phone: "0242 753 10 01",
    district: "Merkez",
    open24: true,
  },
  {
    name: "Side Eczanesi",
    address: "Side Cad. No:45, Serik/Side",
    phone: "0242 753 20 15",
    district: "Side",
    open24: false,
  },
  {
    name: "Boğazkent Eczanesi",
    address: "Sahil Yolu No:8, Boğazkent",
    phone: "0242 753 30 22",
    district: "Boğazkent",
    open24: false,
  },
  {
    name: "Belek Eczanesi",
    address: "Belek Cad. No:3, Belek",
    phone: "0242 715 41 10",
    district: "Belek",
    open24: true,
  },
];

const nearbyHospitals = [
  { name: "Serik Devlet Hastanesi", phone: "0242 753 10 00", type: "Devlet" },
  { name: "Serik Ağız ve Diş Sağlığı", phone: "0242 753 15 00", type: "Devlet" },
  { name: "Medikal Side Hastanesi", phone: "0242 753 80 00", type: "Özel" },
];

export default function EczanePage() {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <div className="seo-page-hero">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-xs text-red-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Nöbetçi Eczane</span>
          </nav>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏥</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">Serik Nöbetçi Eczane</h1>
              <p className="text-red-200 text-sm mt-1">{today}</p>
            </div>
          </div>
          <p className="text-red-100 text-sm max-w-xl">
            Serik, Side, Belek ve Boğazkent bölgelerindeki bugünkü nöbetçi eczaneler aşağıda listelenmiştir.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sol: Eczane Listesi */}
          <div className="lg:col-span-2 space-y-4">

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="text-amber-500 text-xl flex-shrink-0">⚠️</span>
              <div className="text-sm text-amber-800">
                <strong>Önemli:</strong> Nöbet bilgileri günlük değişmektedir. En güncel nöbet bilgisi için{" "}
                <a href="tel:182" className="underline font-bold">182 (Alo ALO)</a>&apos;yı arayabilirsiniz.
              </div>
            </div>

            <h2 className="text-lg font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Bugün Nöbetçi Eczaneler
            </h2>

            <div className="space-y-3">
              {pharmacies.map((p) => (
                <div key={p.name} className="business-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base text-gray-900">{p.name}</h3>
                        {p.open24 && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            24 Saat
                          </span>
                        )}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{p.district}</span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.address}
                      </p>
                    </div>
                    <a
                      href={`tel:${p.phone.replace(/\s/g, "")}`}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-85"
                      style={{ backgroundColor: "#cc0000" }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Ara
                    </a>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{p.phone}</span>
                    <span className="text-xs text-gray-400">Nöbet: 09:00 – 09:00 (ertesi gün)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ: Sidebar */}
          <div className="space-y-4">

            {/* Acil */}
            <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-600 px-4 py-2">
                <span className="text-white font-black text-sm uppercase tracking-wide">🚨 Acil Hatlar</span>
              </div>
              <div className="divide-y divide-red-100">
                {[
                  { name: "Ambulans", no: "112" },
                  { name: "Alo ALO (Eczane)", no: "182" },
                  { name: "İtfaiye", no: "110" },
                  { name: "Polis", no: "155" },
                ].map((h) => (
                  <div key={h.no} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm font-semibold text-gray-700">{h.name}</span>
                    <a href={`tel:${h.no}`} className="text-lg font-black text-red-600 hover:text-red-800">{h.no}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Yakın Hastaneler */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2">
                <span className="text-white font-black text-sm uppercase tracking-wide">🏥 Hastaneler</span>
              </div>
              <div className="divide-y divide-gray-100">
                {nearbyHospitals.map((h) => (
                  <div key={h.name} className="px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800">{h.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${h.type === "Devlet" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{h.type}</span>
                    </div>
                    <a href={`tel:${h.phone.replace(/\s/g, "")}`} className="text-sm text-gray-500 hover:text-red-600 mt-0.5 block">{h.phone}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Reklam */}
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
