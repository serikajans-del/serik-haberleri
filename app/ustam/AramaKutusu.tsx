"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BOLGELER, KATEGORILER, RENK } from "@/lib/ustam";

// Ana sayfa arama: hizmet adı yazılır (öneri listesiyle), bölge seçilir → talep formu o hizmetle açılır.
export default function AramaKutusu() {
  const router = useRouter();
  const [metin, setMetin] = useState("");
  const [bolge, setBolge] = useState(BOLGELER[0]);
  const ara = (e: React.FormEvent) => {
    e.preventDefault();
    const q = metin.toLocaleLowerCase("tr-TR").trim();
    const k = KATEGORILER.find((x) => x.ad.toLocaleLowerCase("tr-TR").includes(q) || x.aciklama.toLocaleLowerCase("tr-TR").includes(q));
    const p = new URLSearchParams({ bolge });
    if (q && k) p.set("kategori", k.slug);
    router.push(`/ustam/talep?${p.toString()}`);
  };
  return (
    <form onSubmit={ara} className="bg-white rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2 w-full max-w-2xl">
      <select value={bolge} onChange={(e) => setBolge(e.target.value)} aria-label="Konum"
        className="sm:w-44 px-3 py-3 rounded-xl bg-gray-50 text-gray-800 font-semibold text-sm outline-none">
        {BOLGELER.map((b) => <option key={b}>{b}</option>)}
      </select>
      <input list="ustam-hizmetler" value={metin} onChange={(e) => setMetin(e.target.value)} placeholder="Hangi hizmete ihtiyacınız var?"
        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 text-gray-900 text-base outline-none" aria-label="Hizmet ara" />
      <datalist id="ustam-hizmetler">{KATEGORILER.map((k) => <option key={k.slug} value={k.ad} />)}</datalist>
      <button className="px-6 py-3 rounded-xl text-white font-black" style={{ backgroundColor: RENK.turuncu }}>Usta Bul</button>
    </form>
  );
}
