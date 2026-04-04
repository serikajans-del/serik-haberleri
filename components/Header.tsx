"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { categories } from "@/lib/news";

export default function Header() {
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("tr-TR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      {/* Üst bilgi şeridi */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs text-gray-500">
          <span className="hidden md:block">{today}</span>
          <div className="flex items-center gap-3">
            <Link href="/iletisim" className="hover:text-red-700 transition-colors">İletişim</Link>
            <span className="text-gray-300">|</span>
            <Link href="/hakkimizda" className="hover:text-red-700 transition-colors">Hakkımızda</Link>
            <span className="text-gray-300">|</span>
            <Link href="/reklam" className="hover:text-red-700 transition-colors">Reklam</Link>
          </div>
        </div>
      </div>

      {/* MASTHEAD - Gazete başlığı */}
      <div className="bg-white border-b-4" style={{ borderColor: "#cc0000" }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">

            {/* Sol sosyal medya */}
            <div className="hidden md:flex items-center gap-1.5 order-3 md:order-1">
              {[
                { label: "Facebook", href: "https://facebook.com", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "Twitter", href: "https://twitter.com", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { label: "Instagram", href: "https://instagram.com", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                { label: "YouTube", href: "https://youtube.com", path: "M21.582 7.186a2.506 2.506 0 00-1.768-1.768C18.267 5 12 5 12 5s-6.268 0-7.814.418a2.506 2.506 0 00-1.768 1.768C2 8.733 2 12 2 12s0 3.267.418 4.814a2.506 2.506 0 001.768 1.768C5.732 19 12 19 12 19s6.268 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 15.267 22 12 22 12s0-3.267-.418-4.814zM10 15V9l5.2 3-5.2 3z" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-7 h-7 rounded flex items-center justify-center text-white transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#cc0000" }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Logo - Masthead */}
            <div className="order-1 md:order-2 text-center">
              <Link href="/">
                <div className="inline-block">
                  <div
                    className="text-3xl md:text-5xl font-black tracking-tight leading-none"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: "#cc0000",
                      textShadow: "2px 2px 0 rgba(0,0,0,0.08)",
                    }}
                  >
                    SERİK HABERLERİ
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-xs text-gray-400 tracking-[0.3em] uppercase font-medium px-2">
                      Serik&apos;in Haber Portalı
                    </span>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Sağ arama */}
            <div className="hidden md:flex items-center order-2 md:order-3">
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <input
                  type="text"
                  placeholder="Haber ara..."
                  className="px-3 py-1.5 text-sm w-40 focus:outline-none focus:w-52 transition-all duration-200"
                />
                <button
                  style={{ backgroundColor: "#cc0000" }}
                  className="px-3 text-white hover:opacity-90 transition-opacity"
                  aria-label="Ara"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobil hamburger */}
            <button className="md:hidden order-2 text-gray-700 p-1" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <nav style={{ backgroundColor: "#cc0000" }} className="hidden md:block shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center">
            <li>
              <Link href="/" className="block px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-800 transition-colors border-r border-red-700">
                Ana Sayfa
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/kategori/${cat.slug}`}
                  className="block px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-800 transition-colors border-r border-red-700"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobil nav */}
      {menuOpen && (
        <nav style={{ backgroundColor: "#cc0000" }} className="md:hidden shadow-md">
          <ul className="divide-y divide-red-800">
            <li><Link href="/" className="block px-4 py-3 text-white text-sm font-bold uppercase tracking-wide" onClick={() => setMenuOpen(false)}>Ana Sayfa</Link></li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/kategori/${cat.slug}`} className="block px-4 py-3 text-white text-sm font-bold uppercase tracking-wide" onClick={() => setMenuOpen(false)}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
