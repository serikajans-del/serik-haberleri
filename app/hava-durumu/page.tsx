import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Serik Hava Durumu | 5 Günlük Hava Tahmini",
  description: "Serik, Side, Belek ve Boğazkent hava durumu. Anlık sıcaklık, rüzgar, nem ve 5 günlük tahmin.",
  keywords: ["Serik hava durumu", "Serik hava", "Side hava durumu", "Belek hava", "Antalya Serik hava"],
  openGraph: {
    title: "Serik Hava Durumu",
    description: "Serik ve çevresinin 5 günlük hava durumu tahmini.",
  },
};

const forecast = [
  { day: "Bugün", icon: "☀️", high: 28, low: 18, desc: "Güneşli", wind: 12, humidity: 55 },
  { day: "Yarın", icon: "🌤️", high: 26, low: 17, desc: "Az Bulutlu", wind: 15, humidity: 60 },
  { day: "Çarşamba", icon: "⛅", high: 24, low: 16, desc: "Parçalı Bulutlu", wind: 18, humidity: 65 },
  { day: "Perşembe", icon: "🌦️", high: 22, low: 15, desc: "Sağanak", wind: 22, humidity: 75 },
  { day: "Cuma", icon: "☀️", high: 27, low: 17, desc: "Güneşli", wind: 10, humidity: 52 },
];

const regions = [
  { name: "Serik Merkez", temp: 28, icon: "☀️" },
  { name: "Side", temp: 27, icon: "🌤️" },
  { name: "Belek", temp: 28, icon: "☀️" },
  { name: "Boğazkent", temp: 26, icon: "⛅" },
  { name: "Kadriye", temp: 27, icon: "☀️" },
];

export default function HavaDurumuPage() {
  return (
    <>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #38bdf8 100%)" }} className="text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-xs text-blue-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Hava Durumu</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-1">🌤️ Serik Hava Durumu</h1>
              <p className="text-blue-100 text-sm">Serik, Side, Belek ve çevresi — 5 günlük tahmin</p>
            </div>
            <div className="flex items-center gap-4 bg-white bg-opacity-15 rounded-2xl px-6 py-4">
              <span className="text-6xl">{forecast[0].icon}</span>
              <div>
                <div className="text-5xl font-black">{forecast[0].high}°</div>
                <div className="text-blue-100 text-sm">{forecast[0].desc}</div>
                <div className="text-blue-200 text-xs mt-1">
                  💨 {forecast[0].wind} km/s · 💧 %{forecast[0].humidity}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">

            {/* 5 Günlük Tahmin */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700">5 Günlük Tahmin</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {forecast.map((f, i) => (
                  <div key={f.day} className={`flex items-center px-4 py-3 ${i === 0 ? "bg-blue-50" : ""}`}>
                    <div className="w-28 font-semibold text-sm text-gray-700">{f.day}</div>
                    <div className="text-2xl mx-4">{f.icon}</div>
                    <div className="flex-1 text-sm text-gray-500">{f.desc}</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-black text-gray-800">{f.high}°</span>
                      <span className="text-gray-400">{f.low}°</span>
                    </div>
                    <div className="hidden md:flex items-center gap-3 ml-4 text-xs text-gray-400">
                      <span>💨 {f.wind}</span>
                      <span>💧 {f.humidity}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bölgesel Sıcaklıklar */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700">📍 Bölgesel Sıcaklıklar</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
                {regions.map((r) => (
                  <div key={r.name} className="flex flex-col items-center py-4 px-2 text-center">
                    <div className="text-3xl mb-1">{r.icon}</div>
                    <div className="text-xl font-black text-gray-800">{r.temp}°</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bilgi */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              <strong>Not:</strong> Hava durumu bilgileri yaklaşık tahminlere dayanmaktadır. Anlık ve doğru bilgi için{" "}
              <a href="https://mgm.gov.tr" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                Meteoroloji Genel Müdürlüğü
              </a>&apos;nün sitesini ziyaret edin.
            </div>

          </div>

          {/* Sağ Sidebar */}
          <div className="space-y-4">

            {/* Hava durumu ipuçları */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-blue-500 px-4 py-2">
                <span className="text-white font-black text-sm">💡 Serik'te Hava</span>
              </div>
              <div className="p-4 text-sm text-gray-600 space-y-2">
                <p>🏖️ <strong>Sahil bölgeleri</strong> genellikle 2-3°C daha serin.</p>
                <p>🌊 <strong>Deniz suyu</strong> Nisan-Mayıs: 20-22°C</p>
                <p>🌅 <strong>En iyi ay:</strong> Mayıs-Haziran, Eylül-Ekim</p>
                <p>🌬️ <strong>Rüzgar:</strong> Batı ve güneybatı yönlü</p>
              </div>
            </div>

            {/* Reklam */}
            <div className="border border-dashed border-gray-300 rounded-lg text-center py-8 bg-white">
              <p className="text-gray-400 text-xs uppercase tracking-widest">Reklam Alanı</p>
              <Link href="/reklam" className="text-xs mt-1 block" style={{ color: "#cc0000" }}>
                Reklam ver →
              </Link>
            </div>

            {/* İlgili Linkler */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-700">Diğer Servisler</span>
              </div>
              {[
                { label: "🏥 Nöbetçi Eczane", href: "/eczane" },
                { label: "🏨 Belek Otelleri", href: "/belek-otelleri" },
                { label: "🏢 Firma Rehberi", href: "/firmarehberi" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-700">{l.label}</span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
