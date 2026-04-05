"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsItem, timeAgo } from "@/lib/news";

export default function HeroSlider({ items }: { items: NewsItem[] }) {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % items.length) + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="relative overflow-hidden bg-black hero-slider" style={{ height: "480px" }}>
      {items.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 10 : 0 }}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.1) 100%)" }} />

          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8" style={{ zIndex: 20 }}>
            <div className="max-w-7xl mx-auto lg:pr-72">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-white text-xs font-black px-2.5 py-1 uppercase tracking-wider" style={{ backgroundColor: "#cc0000" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Son Dakika
                </span>
                <span className="text-white text-xs font-bold px-2 py-1 uppercase tracking-wider bg-white bg-opacity-15 backdrop-blur-sm rounded-sm">
                  {item.category}
                </span>
                <span className="text-gray-300 text-xs ml-1">{timeAgo(item.publishedAt)}</span>
              </div>

              <Link href={`/haber/${item.slug}`}>
                <h2 className="text-white text-2xl md:text-4xl font-black leading-tight mb-3 hover:text-red-200 transition-colors cursor-pointer line-clamp-3 md:line-clamp-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                  {item.title}
                </h2>
              </Link>
              <p className="text-gray-200 text-sm line-clamp-2 hidden md:block mb-3">{item.summary}</p>
              <Link href={`/haber/${item.slug}`}
                className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-sm transition-opacity hover:opacity-80 hidden md:inline-flex"
                style={{ backgroundColor: "#cc0000" }}>
                Haberi Oku
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Sol ok */}
      <button onClick={() => goTo(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all text-xl font-bold"
        style={{ zIndex: 30 }} aria-label="Önceki haber">‹</button>

      {/* Sağ ok */}
      <button onClick={() => goTo(current + 1)}
        className="absolute right-3 lg:right-80 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all text-xl font-bold"
        style={{ zIndex: 30 }} aria-label="Sonraki haber">›</button>

      {/* Numaralı sayfa navigasyon — Alanya Postası tarzı */}
      <div className="absolute bottom-0 left-0 right-72 hidden lg:flex items-center" style={{ zIndex: 30 }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="flex items-center justify-center text-xs font-black w-8 h-8 transition-all"
            style={{
              backgroundColor: i === current ? "#cc0000" : "rgba(0,0,0,0.55)",
              color: "white",
              borderRight: "1px solid rgba(255,255,255,0.1)",
            }}
            aria-label={`Haber ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Mobil nokta nav */}
      <div className="absolute bottom-4 right-5 flex gap-1.5 items-center lg:hidden" style={{ zIndex: 30 }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? "24px" : "8px", height: "8px", backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.45)" }}
            aria-label={`Haber ${i + 1}`} />
        ))}
      </div>

      {/* Sağ küçük haber listesi */}
      <div className="absolute bottom-0 right-0 top-0 hidden lg:flex flex-col w-72 bg-black bg-opacity-75 backdrop-blur-sm" style={{ zIndex: 30 }}>
        <div className="px-3 py-2 border-b border-white border-opacity-10" style={{ backgroundColor: "#cc0000" }}>
          <span className="text-white text-xs font-black uppercase tracking-widest">Son Haberler</span>
        </div>
        {items.slice(0, 4).map((item, i) => (
          <Link key={item.id} href={`/haber/${item.slug}`} onClick={() => goTo(i)}
            className={`flex items-start gap-2.5 px-3 py-3 border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 transition-colors flex-1 ${i === current ? "bg-white bg-opacity-10 border-l-2 border-l-red-500" : ""}`}>
            <div className="flex-shrink-0 relative w-16 h-12 overflow-hidden rounded-sm">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-red-400 text-xs font-bold uppercase block mb-0.5">{item.category}</span>
              <p className="text-white text-xs font-semibold line-clamp-2 leading-snug">{item.title}</p>
              <span className="text-gray-400 text-xs mt-1 block">{timeAgo(item.publishedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
