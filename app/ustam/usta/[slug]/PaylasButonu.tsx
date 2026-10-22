"use client";
import { useState } from "react";

export default function PaylasButonu({ baslik }: { baslik: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  const paylas = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: baslik, url }); } catch { /* vazgeçildi */ } return; }
    await navigator.clipboard.writeText(url);
    setKopyalandi(true); setTimeout(() => setKopyalandi(false), 2000);
  };
  return (
    <button type="button" onClick={paylas} className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200">
      {kopyalandi ? "Bağlantı kopyalandı" : "Profili Paylaş"}
    </button>
  );
}
