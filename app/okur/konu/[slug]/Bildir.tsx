"use client";
import { useState } from "react";
import { BILDIR_NEDENLERI } from "@/lib/okur";

export default function Bildir({ paylasimId, yorumId, kucuk = false }: { paylasimId?: number; yorumId?: number; kucuk?: boolean }) {
  const [acik, setAcik] = useState(false);
  const [neden, setNeden] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [bitti, setBitti] = useState(false);

  async function gonder() {
    if (!neden) return;
    await fetch("/api/okur/bildir", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paylasim_id: paylasimId, yorum_id: yorumId, neden, aciklama }) });
    setBitti(true);
  }

  return (
    <>
      <button onClick={() => setAcik(true)} className={kucuk ? "text-[11px] text-soluk hover:text-mercan" : "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-soluk hover:bg-red-50 hover:text-mercan"} title="Uygunsuz içeriği bildir">
        {kucuk ? "Bildir" : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 21V4h11l-1.5 4L16 12H5" /></svg>Bildir</>}
      </button>
      {acik && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={() => setAcik(false)}>
          <div className="kart w-full max-w-md p-6 belir text-left" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-labelledby="bildir-baslik">
            {bitti ? (
              <>
                <h3 id="bildir-baslik" className="text-lg font-extrabold">Teşekkürler</h3>
                <p className="text-sm text-soluk mt-2">Bildirimin moderatörlere ulaştı. Kurallara aykırıysa içerik kaldırılacak.</p>
                <button onClick={() => setAcik(false)} className="dugme-ana w-full mt-5">Kapat</button>
              </>
            ) : (
              <>
                <h3 id="bildir-baslik" className="text-lg font-extrabold">{yorumId ? "Yorumu" : "Paylaşımı"} bildir</h3>
                <div className="grid gap-2 mt-4">
                  {BILDIR_NEDENLERI.map((n) => (
                    <label key={n} className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm cursor-pointer ${neden === n ? "border-mercan bg-red-50" : "border-cizgi"}`}>
                      <input type="radio" name="neden" checked={neden === n} onChange={() => setNeden(n)} className="accent-[#E5533D]" />{n}
                    </label>
                  ))}
                </div>
                <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} rows={2} maxLength={600} className="girdi mt-3 text-sm" placeholder="İstersen kısaca açıkla (hak sahibiysen belirt)" />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setAcik(false)} className="dugme-ikincil flex-1">Vazgeç</button>
                  <button onClick={gonder} disabled={!neden} className="dugme-ana flex-1 !bg-mercan">Gönder</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
