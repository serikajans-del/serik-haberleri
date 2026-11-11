"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CINSIYET, MAHALLELER, rumuzGecerli } from "@/lib/okur";

export default function GirisFormu({ hedef, ilkSekme }: { hedef: string; ilkSekme: "giris" | "kayit" }) {
  const [sekme, setSekme] = useState(ilkSekme);
  const [rumuz, setRumuz] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);
  const [cinsiyet, setCinsiyet] = useState("belirtilmedi");
  const [mahalle, setMahalle] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const router = useRouter();

  async function gonder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata("");
    if (sekme === "kayit" && !rumuzGecerli(rumuz.trim())) { setHata("Rumuz 3-20 karakter olmalı; harf, rakam, nokta ve alt çizgi kullanılabilir."); return; }
    setBekle(true);
    const web = (new FormData(e.currentTarget).get("web") ?? "").toString();
    const r = await fetch(`/api/okur/uye/${sekme}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rumuz: rumuz.trim(), sifre, cinsiyet, mahalle, kvkk, web }),
    });
    const j = await r.json().catch(() => ({}));
    setBekle(false);
    if (!r.ok) { setHata(j.hata ?? "Bir sorun oluştu."); return; }
    router.replace(hedef);
    router.refresh();
  }

  return (
    <div className="kart p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-2 bg-zemin rounded-xl p-1 mb-6" role="tablist">
        {(["giris", "kayit"] as const).map((s) => (
          <button key={s} type="button" role="tab" aria-selected={sekme === s} onClick={() => { setSekme(s); setHata(""); }}
            className={`py-2.5 rounded-lg text-sm font-bold transition ${sekme === s ? "bg-white shadow-sm text-murekkep" : "text-soluk"}`}>
            {s === "giris" ? "Giriş yap" : "Hemen katıl"}
          </button>
        ))}
      </div>

      <form onSubmit={gonder} className="grid gap-4">
        <input name="web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Rumuz</span>
          <input className="girdi" value={rumuz} onChange={(e) => setRumuz(e.target.value)} placeholder="örn. kokezli_ayse" autoComplete="username" required maxLength={20} />
          {sekme === "kayit" && <span className="text-xs text-soluk">Ekranda yalnız rumuzun görünür. Gerçek adını kullanmak zorunda değilsin.</span>}
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Şifre</span>
          <span className="relative">
            <input className="girdi pr-16" type={sifreGoster ? "text" : "password"} value={sifre} onChange={(e) => setSifre(e.target.value)}
              placeholder={sekme === "kayit" ? "En az 8 karakter" : "Şifren"} autoComplete={sekme === "kayit" ? "new-password" : "current-password"} required minLength={sekme === "kayit" ? 8 : 1} />
            <button type="button" onClick={() => setSifreGoster((g) => !g)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-soluk">{sifreGoster ? "Gizle" : "Göster"}</button>
          </span>
        </label>

        {sekme === "kayit" && (
          <>
            <fieldset className="grid gap-1.5">
              <legend className="text-sm font-semibold mb-1.5">Cinsiyet <span className="font-normal text-soluk">(isteğe bağlı, profilinde simge olarak görünür)</span></legend>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CINSIYET).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setCinsiyet(k)} aria-pressed={cinsiyet === k}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition ${cinsiyet === k ? "border-ana bg-ana-acik text-ana-koyu" : "border-cizgi bg-white"}`}>
                    {v.ikon && <span style={{ color: v.renk }} className="mr-1">{v.ikon}</span>}{k === "belirtilmedi" ? "Belirtme" : v.ad}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">Mahallen <span className="font-normal text-soluk">(isteğe bağlı)</span></span>
              <select className="girdi" value={mahalle} onChange={(e) => setMahalle(e.target.value)}>
                <option value="">Seçmek istemiyorum</option>
                {MAHALLELER.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="flex gap-3 items-start text-sm">
              <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-1 w-4 h-4 accent-[#D90000]" required />
              <span className="text-slate-600"><Link href="/okur/kurallar" target="_blank" className="font-semibold text-ana underline">Okur Kuralları</Link>&apos;nı okudum, kabul ediyorum. <Link href="/okur/aydinlatma" target="_blank" className="font-semibold text-ana underline">Aydınlatma Metni</Link>&apos;ni okudum.</span>
            </label>
          </>
        )}

        {hata && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">{hata}</p>}
        <button className="dugme-ana w-full !py-3.5 mt-1" disabled={bekle}>{bekle ? "Bekle…" : sekme === "giris" ? "Giriş yap" : "Hesabımı oluştur"}</button>
        {sekme === "giris" && <p className="text-xs text-center text-soluk">Hesabın yok mu? <button type="button" onClick={() => setSekme("kayit")} className="font-bold text-ana">Hemen katıl</button>, 20 saniye sürer.</p>}
      </form>
    </div>
  );
}
