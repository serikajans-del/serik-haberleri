import Link from "next/link";
import { categories } from "@/lib/news";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      {/* Çift çizgi üst */}
      <div className="border-t-4 border-double border-gray-800" />

      <div style={{ backgroundColor: "#1a1a1a" }} className="text-gray-400 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4">

          {/* Masthead */}
          <div className="text-center mb-6 pb-6 border-b border-gray-700">
            <Link href="/">
              <span
                className="text-3xl font-black text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#cc0000" }}
              >
                SERİK HABERLERİ
              </span>
            </Link>
            <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">Serik&apos;in Haber Portalı</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-gray-700">Kategoriler</h4>
              <ul className="space-y-1.5">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/kategori/${cat.slug}`} className="text-xs hover:text-white transition-colors flex items-center gap-1">
                      <span style={{ color: "#cc0000" }}>›</span> {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-gray-700">Haberler</h4>
              <ul className="space-y-1.5">
                {categories.slice(4).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/kategori/${cat.slug}`} className="text-xs hover:text-white transition-colors flex items-center gap-1">
                      <span style={{ color: "#cc0000" }}>›</span> {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-gray-700">Kurumsal</h4>
              <ul className="space-y-1.5">
                {[
                  { name: "Hakkımızda", href: "/hakkimizda" },
                  { name: "İletişim", href: "/iletisim" },
                  { name: "Reklam", href: "/reklam" },
                  { name: "Yayın İlkeleri", href: "/yayin-ilkeleri" },
                  { name: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
                  { name: "KVKK", href: "/kvkk" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs hover:text-white transition-colors flex items-center gap-1">
                      <span style={{ color: "#cc0000" }}>›</span> {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-gray-700">İletişim</h4>
              <ul className="space-y-2 text-xs">
                <li>📍 Serik, Antalya</li>
                <li>
                  <a href="mailto:info@serikhaberleri.com" className="hover:text-white transition-colors">
                    ✉ info@serikhaberleri.com
                  </a>
                </li>
              </ul>
              <div className="flex gap-2 mt-4">
                {["Facebook", "Twitter", "Instagram", "YouTube"].map((s) => (
                  <a key={s} href={`https://${s.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer" aria-label={s}
                    className="w-7 h-7 flex items-center justify-center rounded text-white text-xs font-bold hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#cc0000" }}>
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-600">
            <p>© {year} Serik Haberleri — Tüm hakları saklıdır.</p>
            <p>Serik Haberleri&apos;nde yayımlanan içerikler izinsiz kullanılamaz.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
