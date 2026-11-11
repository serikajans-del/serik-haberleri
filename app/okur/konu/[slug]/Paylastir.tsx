"use client";
import { useState } from "react";

// Telefonda sistem paylaşım menüsü; yoksa WhatsApp ve bağlantı kopyalama
export default function Paylastir({ url, baslik }: { url: string; baslik: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  async function paylas() {
    if (navigator.share) { try { await navigator.share({ title: baslik, url }); } catch { /* vazgeçildi */ } return; }
    await navigator.clipboard.writeText(url);
    setKopyalandi(true); setTimeout(() => setKopyalandi(false), 2000);
  }
  return (
    <>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${baslik}\n${url}`)}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[#128C7E] hover:bg-[#E7F8F1]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.2Z" /></svg>
        WhatsApp
      </a>
      <button onClick={paylas} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-zemin">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" /></svg>
        {kopyalandi ? "Kopyalandı" : "Paylaş"}
      </button>
    </>
  );
}
