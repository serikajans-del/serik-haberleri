import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda | Serik Haberleri",
  description: "Serik Haberleri hakkında. Serik'in dijital haber portalı — ekibimiz, misyonumuz ve künyemiz.",
};

const team = [
  { title: "Genel Yayın Yönetmeni", note: "15 yıl yerel basın deneyimi" },
  { title: "Sorumlu Müdür", note: "Hukuki yayın sorumluluğu" },
  { title: "Haber Editörü", note: "Gündem, Asayiş, Yerel Haberler" },
  { title: "Dijital İçerik Editörü", note: "SEO, sosyal medya, video içerik" },
];

export default function HakkimizdaPage() {
  return (
    <>
      <div className="seo-page-hero">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-xs text-red-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Hakkımızda</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">📰 Serik Haberleri Hakkında</h1>
          <p className="text-red-100 text-sm max-w-xl">
            Serik, Side, Belek ve Boğazkent&apos;in dijital haber portalı. Yerel gazetecilik, dijital hız.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 text-gray-700 leading-relaxed text-sm">
          <p>
            <strong>Serik Haberleri</strong>, Antalya&apos;nın Serik ilçesinden güncel haberleri, son dakika gelişmelerini ve yerel haberleri okuyucularına en hızlı ve doğru şekilde ulaştırmayı hedefleyen bağımsız bir dijital haber portalıdır.
          </p>
          <p>
            Serik, Side, Boğazkent, Belek, Kadriye ve çevre bölgelerdeki gelişmeleri yakından takip ederek ilçe sakinlerine günün 24 saati kesintisiz haber hizmeti sunuyoruz.
          </p>
          <p>
            Haberlerimizde tarafsızlık, doğruluk ve şeffaflık ilkelerini benimsiyoruz. Okuyucularımızın güvenini kazanmak ve korumak en temel önceliğimizdir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h2 className="font-black text-base mb-2 flex items-center gap-2" style={{ color: "#cc0000" }}>
              🎯 Misyonumuz
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Serik ilçesi ve çevresindeki gelişmeleri anında, doğru ve tarafsız bir şekilde kamuoyuyla paylaşmak. Yerel gazetecilik anlayışıyla toplumun gündemine katkı sunmak.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h2 className="font-black text-base mb-2 flex items-center gap-2 text-gray-800">
              🔭 Vizyonumuz
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Serik&apos;in en güvenilir ve en çok okunan dijital haber kaynağı olmak. Okuyucu güveni, editoryal bağımsızlık ve teknolojik yenilikle yerel medyada referans nokta haline gelmek.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-black text-base text-gray-800">👥 Ekibimiz</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {team.map((m) => (
              <div key={m.title} className="flex items-center gap-4 px-5 py-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl flex-shrink-0">
                  👤
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-800">{m.title}</div>
                  <div className="text-xs text-gray-500">{m.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border-2 border-gray-800 rounded-xl p-5">
          <h2 className="font-black text-base mb-4">📋 Basın Künyesi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-xs">
            {([
              ["Yayın Adı", "Serik Haberleri"],
              ["Yayın Türü", "İnternet Haber Portalı"],
              ["Yayın Dili", "Türkçe"],
              ["Yayın Bölgesi", "Serik / Antalya"],
              ["Yayın Periyodu", "7/24 Sürekli"],
              ["Kuruluş Yılı", "2024"],
              ["Adres", "Serik, Antalya"],
              ["E-posta", "info@serikhaberleri.com"],
              ["Reklam", "reklam@serikhaberleri.com"],
              ["Şikayet/Düzeltme", "editor@serikhaberleri.com"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex gap-2 py-1.5 border-b border-gray-100">
                <span className="text-gray-500 w-36 flex-shrink-0">{label}:</span>
                <span className="font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-lg transition-opacity hover:opacity-85 text-sm"
            style={{ backgroundColor: "#cc0000" }}
          >
            İletişime Geç →
          </Link>
          <Link
            href="/yayin-ilkeleri"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Yayın İlkelerimiz →
          </Link>
        </div>

      </div>
    </>
  );
}
