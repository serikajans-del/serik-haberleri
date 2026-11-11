"use client";
import { useState } from "react";
import Link from "next/link";
import Rumuz from "@/components/okur/Rumuz";
import Bildir from "./Bildir";
import { gecenZaman, type Yorum } from "@/lib/okur";

export default function YorumAlani({ id, ilk, girisli, slug, soru }: { id: number; ilk: Yorum[]; girisli: boolean; slug: string; soru: boolean }) {
  const [liste, setListe] = useState(ilk);
  const [metin, setMetin] = useState("");
  const [bekle, setBekle] = useState(false);
  const [mesaj, setMesaj] = useState("");

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (metin.trim().length < 2) return;
    setBekle(true); setMesaj("");
    const r = await fetch("/api/okur/yorum", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, icerik: metin }) });
    const j = await r.json().catch(() => ({}));
    setBekle(false);
    if (!r.ok) { setMesaj(j.hata ?? "Yorum gönderilemedi."); return; }
    setMetin("");
    if (j.yorum.durum === "yayinda") setListe((l) => [...l, j.yorum]);
    else setMesaj("Yorumun incelemeye alındı; uygunsa kısa sürede yayınlanacak.");
  }

  return (
    <section className="kart p-5 sm:p-7 mt-5" aria-labelledby="yorumlar">
      <h2 id="yorumlar" className="text-xl font-extrabold">{soru ? "Yanıtlar" : "Yorumlar"} <span className="text-soluk font-semibold">{liste.length}</span></h2>

      {liste.length === 0 && <p className="text-sm text-soluk mt-3">{soru ? "Henüz yanıt yok. Biliyorsan ilk sen yanıtla." : "Henüz yorum yok. İlk yorumu sen yaz."}</p>}
      <ul className="mt-4 grid gap-4">
        {liste.map((y) => (
          <li key={y.id} id={`yorum-${y.id}`} className="flex gap-3 group">
            <div className="flex-1 min-w-0 rounded-2xl bg-zemin px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                {y.uye && <Rumuz rumuz={y.uye.rumuz} cinsiyet={y.uye.cinsiyet} boyut={24} />}
                <span className="text-xs text-soluk">{gecenZaman(y.created_at)}</span>
                <span className="ml-auto opacity-60 group-hover:opacity-100"><Bildir yorumId={y.id} kucuk /></span>
              </div>
              <p className="metin-icerik text-[0.95rem] text-slate-800 mt-1.5">{y.icerik}</p>
            </div>
          </li>
        ))}
      </ul>

      {girisli ? (
        <form onSubmit={gonder} className="mt-5">
          <textarea value={metin} onChange={(e) => setMetin(e.target.value)} rows={3} maxLength={1500} className="girdi resize-y"
            placeholder={soru ? "Biliyorsan yanıtla: yer, isim, telefon yerine işletmenin adını yaz…" : "Yorumunu yaz… Saygılı ol, kişisel bilgi paylaşma."} />
          <div className="flex items-center justify-between gap-3 mt-2">
            <span className="text-xs text-soluk">{mesaj || "Hakaret, iftira ve kişisel bilgi içeren yorumlar kaldırılır."}</span>
            <button className="dugme-ana !py-2.5" disabled={bekle || metin.trim().length < 2}>{bekle ? "Gönderiliyor…" : soru ? "Yanıtla" : "Yorum yap"}</button>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-cizgi p-4 text-sm text-center">
          {soru ? "Yanıtlamak" : "Yorum yazmak"} için <Link href={`/okur/giris?sonra=/okur/konu/${slug}`} className="font-bold text-ana">giriş yap</Link> ya da <Link href={`/okur/giris?kayit=1&sonra=/okur/konu/${slug}`} className="font-bold text-ana">rumuzla katıl</Link>.
        </div>
      )}
    </section>
  );
}
