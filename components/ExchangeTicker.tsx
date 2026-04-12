"use client";
import { useEffect, useState } from "react";

type Rate = {
  code: string;
  name: string;
  symbol: string;
  value: string;
};

export default function ExchangeTicker() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/doviz")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates?.length) {
          setRates(d.rates);
          setUpdatedAt(d.updatedAt);
        }
      })
      .catch(() => {});
  }, []);

  if (!rates.length) return null;

  // Ticker için iki kopya oluştur (sonsuz döngü)
  const doubled = [...rates, ...rates, ...rates];

  return (
    <div
      className="flex items-stretch overflow-hidden"
      style={{ backgroundColor: "#1a1a1a", borderBottom: "1px solid #333" }}
    >
      {/* Sol etiket */}
      <div
        className="flex-shrink-0 px-3 py-1.5 flex items-center gap-1.5 text-white text-xs font-black uppercase tracking-widest"
        style={{ backgroundColor: "#111", borderRight: "1px solid #333", minWidth: "90px" }}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#d90000" }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        Piyasalar
      </div>

      {/* Ticker içeriği */}
      <div className="flex-1 overflow-hidden relative py-1.5">
        <div className="doviz-ticker-track">
          {doubled.map((r, i) => (
            <span key={`${r.code}-${i}`} className="inline-flex items-center gap-2 pr-8 text-xs">
              <span className="font-bold" style={{ color: "#aaa" }}>{r.name}</span>
              <span className="font-black text-white">
                ₺{r.value}
              </span>
              <span className="font-black" style={{ color: "#444" }}>|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Güncelleme saati */}
      {updatedAt && (
        <div
          className="flex-shrink-0 hidden md:flex items-center px-3 text-xs"
          style={{ color: "#555", borderLeft: "1px solid #333" }}
        >
          {new Date(updatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}
