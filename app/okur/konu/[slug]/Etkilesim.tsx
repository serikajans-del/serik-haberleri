"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IKON } from "@/components/okur/PaylasimKarti";

export default function Etkilesim({ id, begeni, faydali, begendi, faydaliMi, girisli, kendi }: {
  id: number; begeni: number; faydali: number; begendi: boolean; faydaliMi: boolean; girisli: boolean; kendi: boolean;
}) {
  const [d, setD] = useState({ begeni, faydali, begendi, faydaliMi });
  const [mesaj, setMesaj] = useState("");
  const router = useRouter();
  const yol = usePathname();

  async function tikla(tur: "begeni" | "faydali") {
    if (!girisli) { router.push(`/okur/giris?sonra=${encodeURIComponent(yol)}`); return; }
    if (kendi) { setMesaj("Kendi paylaşımını işaretleyemezsin."); return; }
    const onceki = d;
    // iyimser güncelleme: hemen göster, hata olursa geri al
    setD((x) => tur === "begeni"
      ? { ...x, begendi: !x.begendi, begeni: x.begeni + (x.begendi ? -1 : 1) }
      : { ...x, faydaliMi: !x.faydaliMi, faydali: x.faydali + (x.faydaliMi ? -1 : 1) });
    const r = await fetch("/api/okur/etkilesim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, tur }) });
    if (!r.ok) { setD(onceki); setMesaj((await r.json().catch(() => ({}))).hata ?? "İşlem yapılamadı."); }
  }

  const tus = "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition active:scale-95";
  return (
    <>
      <button onClick={() => tikla("begeni")} aria-pressed={d.begendi} className={`${tus} ${d.begendi ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-cizgi text-slate-600 hover:border-red-200"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={d.begendi ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">{IKON.kalp}</svg>
        Beğen <span className="tabular-nums">{d.begeni}</span>
      </button>
      <button onClick={() => tikla("faydali")} aria-pressed={d.faydaliMi} className={`${tus} ${d.faydaliMi ? "bg-ana-acik border-ana/30 text-ana-koyu" : "bg-white border-cizgi text-slate-600 hover:border-ana/40"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={d.faydaliMi ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">{IKON.faydali}</svg>
        İşime yaradı <span className="tabular-nums">{d.faydali}</span>
      </button>
      {mesaj && <span className="text-xs text-mercan w-full">{mesaj}</span>}
    </>
  );
}
