"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsItem } from "@/lib/news";

// Numaralı manşet: ortadaki büyük görsel + altında 1..N sayfa düğmeleri.
export default function MansetSlider({ items }: { items: NewsItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % items.length) + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % items.length), 6000);
    return () => clearInterval(timer);
  }, [items.length, paused]);

  if (!items.length) return null;

  return (
    <div
      className="flex flex-col gap-3 h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex-1 overflow-hidden tk-radius" style={{ backgroundColor: "#0f172a", minHeight: "320px" }}>
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={`/haber/${item.slug}`}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
            aria-hidden={i !== current}
            tabIndex={i === current ? 0 : -1}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div
              className="absolute inset-x-0 bottom-0 p-4 md:p-6"
              style={{ background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.75) 60%, transparent 100%)" }}
            >
              <h2 className="text-white text-xl md:text-3xl font-black uppercase leading-tight line-clamp-3">
                {item.title}
              </h2>
            </div>
          </Link>
        ))}

        {items.length > 1 && (
          <>
            <button
              onClick={() => goTo(current - 1)}
              aria-label="Önceki haber"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(15,23,42,0.7)" }}
            >‹</button>
            <button
              onClick={() => goTo(current + 1)}
              aria-label="Sonraki haber"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(15,23,42,0.7)" }}
            >›</button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => goTo(i)}
              onMouseEnter={() => goTo(i)}
              aria-label={`${i + 1}. haber`}
              aria-current={i === current}
              className="flex-1 h-11 md:h-14 text-xs font-bold transition-colors"
              style={{
                borderRadius: "8px",
                backgroundColor: i === current ? "#d90000" : "#e9ecf1",
                color: i === current ? "#fff" : "#111827",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
