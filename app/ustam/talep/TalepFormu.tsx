"use client";
import Link from "next/link";
import { useState } from "react";
import { KATEGORILER, MAHALLELER, RENK, ZAMANLAR, kategoriBul, telGecerli } from "@/lib/ustam";

const ADIMLAR = ["Hizmet", "Mahalle", "Detay", "Zaman", "İletişim", "Onay"];

export default function TalepFormu({ ilkKategori, ilkBolge, usta }: { ilkKategori: string; ilkBolge: string; usta: string }) {
  const [adim, setAdim] = useState(ilkKategori ? 1 : 0);
  const [kategori, setKategori] = useState(ilkKategori);
  const [mahalle, setMahalle] = useState(MAHALLELER.includes(ilkBolge) && ilkBolge !== "Serik Merkez" ? ilkBolge : "");
  const [mahalleDiger, setMahalleDiger] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [fotolar, setFotolar] = useState<File[]>([]);
  const [zaman, setZaman] = useState("");
  const [tarih, setTarih] = useState("");
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [hata, setHata] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [kod, setKod] = useState("");

  const bugun = new Date().toISOString().slice(0, 10);
  const gecerli = [
    !!kategori,
    !!mahalle && (mahalle !== "Diğer" || mahalleDiger.trim().length > 1),
    aciklama.trim().length >= 10,
    !!zaman && (zaman !== "tarih" || !!tarih),
    ad.trim().length >= 2 && telGecerli(telefon) && kvkk,
    true,
  ];
  const ileri = () => { setHata(""); if (gecerli[adim]) setAdim(adim + 1); else setHata(UYARI[adim]); };

  const gonder = async () => {
    setGonderiliyor(true); setHata("");
    const fd = new FormData();
    Object.entries({ kategori, mahalle, mahalle_diger: mahalleDiger, aciklama, zaman, tarih, ad, telefon, usta, kvkk: kvkk ? "on" : "" })
      .forEach(([k, v]) => fd.append(k, v));
    fotolar.forEach((f) => fd.append("foto", f));
    try {
      const r = await fetch("/api/ustam/talep", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Gönderilemedi");
      setKod(j.kod);
    } catch (e) { setHata((e as Error).message); } finally { setGonderiliyor(false); }
  };

  if (kod) return (
    <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl text-white mb-4" style={{ backgroundColor: RENK.turkuaz }}>✓</div>
      <h2 className="text-2xl font-black mb-2" style={{ color: RENK.lacivert }}>Talebiniz alındı!</h2>
      <p className="text-gray-600 mb-4">Talebiniz bölgenizdeki uygun ustalara iletilecek. En fazla üç ustadan teklif aldığınızda sizinle telefonla iletişime geçilecek.</p>
      <p className="text-sm text-gray-500">Talep kodunuz: <b className="font-mono text-lg" style={{ color: RENK.lacivert }}>{kod}</b></p>
      <Link href="/ustam" className="inline-block mt-6 px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: RENK.lacivert }}>Serik Ustam ana sayfa</Link>
    </div>
  );

  const secim = (aktif: boolean) => `text-left rounded-xl border-2 px-4 py-3 font-semibold transition-colors ${aktif ? "text-white" : "bg-white text-gray-800 border-gray-200 hover:border-gray-300"}`;
  const secimStil = (aktif: boolean) => aktif ? { backgroundColor: RENK.turkuaz, borderColor: RENK.turkuaz } : undefined;
  const girdi = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-teal-500";

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm">
      {/* İlerleme */}
      <div className="flex gap-1.5 mb-2">
        {ADIMLAR.map((a, i) => <div key={a} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i <= adim ? RENK.turkuaz : "#E5E7EB" }} />)}
      </div>
      <p className="text-xs text-gray-500 mb-5">Adım {adim + 1} / 6 · {ADIMLAR[adim]}</p>

      {adim === 0 && (<>
        <h2 className="text-xl font-black mb-4" style={{ color: RENK.lacivert }}>Hangi hizmete ihtiyacınız var?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {KATEGORILER.map((k) => (
            <button key={k.slug} type="button" onClick={() => { setKategori(k.slug); setAdim(1); setHata(""); }} className={secim(kategori === k.slug)} style={secimStil(kategori === k.slug)}>
              <span className="mr-2" aria-hidden>{k.ikon}</span>{k.ad}
            </button>
          ))}
        </div>
      </>)}

      {adim === 1 && (<>
        <h2 className="text-xl font-black mb-4" style={{ color: RENK.lacivert }}>Hizmet hangi mahallede verilecek?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MAHALLELER.map((m) => <button key={m} type="button" onClick={() => setMahalle(m)} className={secim(mahalle === m)} style={secimStil(mahalle === m)}>{m}</button>)}
        </div>
        {mahalle === "Diğer" && <input value={mahalleDiger} onChange={(e) => setMahalleDiger(e.target.value)} placeholder="Mahalle adını yazın" className={`${girdi} mt-3`} />}
        <p className="text-xs text-gray-400 mt-3">Açık adresinizi şimdi yazmanız gerekmez; ustayla anlaştığınızda paylaşırsınız.</p>
      </>)}

      {adim === 2 && (<>
        <h2 className="text-xl font-black mb-1" style={{ color: RENK.lacivert }}>Sorunu kısaca anlatın</h2>
        <p className="text-sm text-gray-500 mb-4">Örnek: &quot;Banyodaki batarya su kaçırıyor, değişmesi gerekiyor.&quot;</p>
        <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} rows={5} maxLength={1500} className={girdi} placeholder="Ne yapılması gerekiyor?" />
        <label className="block mt-4 text-sm font-semibold text-gray-700">Fotoğraf ekleyin (isteğe bağlı, en fazla 4)</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setFotolar(Array.from(e.target.files ?? []).slice(0, 4))} className="mt-2 text-sm" />
        {fotolar.length > 0 && <p className="text-xs text-gray-500 mt-1">{fotolar.length} fotoğraf seçildi</p>}
      </>)}

      {adim === 3 && (<>
        <h2 className="text-xl font-black mb-4" style={{ color: RENK.lacivert }}>Hizmet ne zaman gerekli?</h2>
        <div className="grid grid-cols-2 gap-2">
          {ZAMANLAR.map((z) => <button key={z.id} type="button" onClick={() => setZaman(z.id)} className={secim(zaman === z.id)} style={secimStil(zaman === z.id)}>{z.ad}</button>)}
        </div>
        {zaman === "tarih" && <input type="date" min={bugun} value={tarih} onChange={(e) => setTarih(e.target.value)} className={`${girdi} mt-3`} />}
      </>)}

      {adim === 4 && (<>
        <h2 className="text-xl font-black mb-4" style={{ color: RENK.lacivert }}>İletişim bilgileriniz</h2>
        <div className="flex flex-col gap-3">
          <input value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Ad Soyad" className={girdi} autoComplete="name" />
          <input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Cep telefonu (05xx xxx xx xx)" inputMode="tel" className={girdi} autoComplete="tel" />
          <label className="flex gap-2 items-start text-sm text-gray-600">
            <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-1" />
            <span>Telefon numaramın yalnızca talebimle ilgili ustalarla ve Serik Ustam ekibiyle paylaşılmasını kabul ediyorum. <Link href="/kvkk" target="_blank" className="underline">KVKK Aydınlatma Metni</Link></span>
          </label>
          <p className="text-xs text-gray-400">Numaranız herkese açık hiçbir yerde gösterilmez. Talebiniz ekibimiz tarafından telefonla teyit edilir.</p>
        </div>
      </>)}

      {adim === 5 && (<>
        <h2 className="text-xl font-black mb-4" style={{ color: RENK.lacivert }}>Talebinizi kontrol edin</h2>
        <dl className="text-sm divide-y divide-gray-100 rounded-xl border border-gray-100">
          {[
            ["Hizmet", kategoriBul(kategori)?.ad],
            ["Mahalle", mahalle === "Diğer" ? mahalleDiger : mahalle],
            ["Açıklama", aciklama],
            ["Fotoğraf", fotolar.length ? `${fotolar.length} adet` : "Yok"],
            ["Zaman", zaman === "tarih" ? tarih.split("-").reverse().join(".") : ZAMANLAR.find((z) => z.id === zaman)?.ad],
            ["Ad Soyad", ad],
            ["Telefon", telefon],
          ].map(([k, v]) => <div key={k} className="flex gap-3 px-4 py-2.5"><dt className="w-24 shrink-0 text-gray-500">{k}</dt><dd className="text-gray-900 break-words min-w-0">{v}</dd></div>)}
        </dl>
        <button type="button" onClick={gonder} disabled={gonderiliyor} className="w-full mt-5 py-4 rounded-xl text-white font-black text-lg disabled:opacity-60" style={{ backgroundColor: RENK.turuncu }}>
          {gonderiliyor ? "Gönderiliyor…" : "Ücretsiz Teklif Al"}
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">Talebiniz en fazla üç uygun ustaya iletilir. Hizmet almak ücretsizdir.</p>
      </>)}

      {hata && <p className="mt-4 text-sm font-semibold text-red-600">{hata}</p>}

      <div className="flex justify-between mt-6">
        {adim > 0 ? <button type="button" onClick={() => { setAdim(adim - 1); setHata(""); }} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100">Geri</button> : <span />}
        {adim > 0 && adim < 5 && <button type="button" onClick={ileri} className="px-6 py-2.5 rounded-xl font-black text-white" style={{ backgroundColor: RENK.lacivert }}>Devam</button>}
      </div>
    </div>
  );
}

const UYARI = [
  "Lütfen bir hizmet seçin.",
  "Lütfen mahalle seçin.",
  "Lütfen ihtiyacınızı en az birkaç kelimeyle anlatın.",
  "Lütfen hizmet zamanını seçin.",
  "Ad soyad, geçerli bir cep telefonu ve onay kutusu gerekli.",
  "",
];
