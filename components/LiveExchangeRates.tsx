"use client";
import { useEffect, useState } from "react";

type Rate = {
  code: string;
  name: string;
  symbol: string;
  value: string;
};

export default function LiveExchangeRates() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doviz")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates?.length) {
          setRates(d.rates);
          setUpdatedAt(d.updatedAt);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="wp-widget">
      <div className="wp-widget-title">
        <span>Döviz Kurları</span>
        {updatedAt && (
          <span className="text-xs font-normal tracking-normal normal-case" style={{ color: "#999" }}>
            {new Date(updatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
      <div className="px-3">
        {loading ? (
          <div className="py-4 text-center text-xs" style={{ color: "#bbb" }}>Yükleniyor...</div>
        ) : rates.length === 0 ? (
          <div className="py-4 text-center text-xs" style={{ color: "#bbb" }}>Veri alınamadı</div>
        ) : (
          rates.map((r) => (
            <div key={r.code} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid #f0f0f0" }}>
              <span className="text-sm font-medium" style={{ color: "#333" }}>{r.name}</span>
              <span className="text-sm font-bold" style={{ color: "#1a1a1a" }}>₺{r.value}</span>
            </div>
          ))
        )}
      </div>
      <p className="text-xs px-3 pb-3 pt-1" style={{ color: "#bbb" }}>* TCMB satış kuru</p>
    </div>
  );
}
