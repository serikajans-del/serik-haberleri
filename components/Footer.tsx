import Link from "next/link";
import { categories } from "@/lib/news";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      {/* Kırmızı üst şerit */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #a60000 0%, #d90000 100%)" }} />

      <div style={{ backgroundColor: "#111111" }} className="pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4">

          {/* Logo */}
          <div className="text-center mb-6 pb-6" style={{ borderBottom: "1px solid #222" }}>
            <Link href="/">
              <span
                className="text-3xl font-black"
                style={{ color: "#d90000" }}
              >
                SERİK HABERLERİ
              </span>
            </Link>
            <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: "#444" }}>Serik&apos;in Haber Portalı</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1" style={{ borderBottom: "1px solid #222" }}>Kategoriler</h4>
              <ul className="space-y-1.5">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/kategori/${cat.slug}`} className="text-xs transition-colors flex items-center gap-1" style={{ color: "#666" }}>
                      <span style={{ color: "#d90000" }}>›</span> {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1" style={{ borderBottom: "1px solid #222" }}>Haberler</h4>
              <ul className="space-y-1.5">
                {categories.slice(4).map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/kategori/${cat.slug}`} className="text-xs transition-colors flex items-center gap-1" style={{ color: "#666" }}>
                      <span style={{ color: "#d90000" }}>›</span> {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1" style={{ borderBottom: "1px solid #222" }}>Kurumsal</h4>
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
                    <Link href={l.href} className="text-xs transition-colors flex items-center gap-1" style={{ color: "#666" }}>
                      <span style={{ color: "#d90000" }}>›</span> {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3 pb-1" style={{ borderBottom: "1px solid #222" }}>İletişim</h4>
              <ul className="space-y-2 text-xs" style={{ color: "#666" }}>
                <li>Serik, Antalya</li>
                <li>
                  <a href="mailto:info@serikhaberleri.com" className="transition-colors hover:text-white">
                    info@serikhaberleri.com
                  </a>
                </li>
              </ul>
              <div className="flex gap-2 mt-4">
                {[
                  { label: "Facebook", href: "https://facebook.com/serikhaberleri", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { label: "X", href: "https://twitter.com/serikhaberleri", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                  { label: "Instagram", href: "https://instagram.com/serikhaberleri", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                  { label: "YouTube", href: "https://youtube.com/@serikhaberleri", path: "M21.582 7.186a2.506 2.506 0 00-1.768-1.768C18.267 5 12 5 12 5s-6.268 0-7.814.418a2.506 2.506 0 00-1.768 1.768C2 8.733 2 12 2 12s0 3.267.418 4.814a2.506 2.506 0 001.768 1.768C5.732 19 12 19 12 19s6.268 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 15.267 22 12 22 12s0-3.267-.418-4.814zM10 15V9l5.2 3-5.2 3z" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="w-7 h-7 flex items-center justify-center rounded text-white hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#d90000" }}>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs" style={{ borderTop: "1px solid #1e1e1e", color: "#444" }}>
            <p>© {year} Serik Haberleri — Tüm hakları saklıdır.</p>
            <p>Serik Haberleri&apos;nde yayımlanan içerikler izinsiz kullanılamaz.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
