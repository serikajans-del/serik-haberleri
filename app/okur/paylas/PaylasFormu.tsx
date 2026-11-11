"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KATEGORILER, MAHALLELER, kategoriBul } from "@/lib/okur";

// Telefon fotoğrafını tarayıcıda 1600 px JPEG'e küçült (sunucu sınırı 4,5 MB; yükleme hızlanır)
async function kucult(dosya: File): Promise<Blob> {
  const bmp = await createImageBitmap(dosya, { imageOrientation: "from-image" } as ImageBitmapOptions).catch(() => null);
  if (!bmp) return dosya;
  const oran = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const tuval = document.createElement("canvas");
  tuval.width = Math.round(bmp.width * oran);
  tuval.height = Math.round(bmp.height * oran);
  tuval.getContext("2d")!.drawImage(bmp, 0, 0, tuval.width, tuval.height);
  return new Promise((ok) => tuval.toBlob((b) => ok(b ?? dosya), "image/jpeg", 0.82));
}

const bugun = () => new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
const simdi = () => new Date(Date.now() + 3 * 3600000).toISOString().slice(11, 16);

export default function PaylasFormu({ ilkKategori, ilkBaslik, mahalle: ilkMahalle, guvenilir }: { ilkKategori: string; ilkBaslik: string; mahalle: string; guvenilir: boolean }) {
  const [kategori, setKategori] = useState(ilkKategori);
  const [baslik, setBaslik] = useState(ilkBaslik);
  const [icerik, setIcerik] = useState("");
  const [mahalle, setMahalle] = useState(ilkMahalle);
  const [yer, setYer] = useState("");
  const [tarih, setTarih] = useState(bugun());
  const [saat, setSaat] = useState(simdi());
  const [zamanVar, setZamanVar] = useState(true);
  const [isletme, setIsletme] = useState("");
  const [fotolar, setFotolar] = useState<{ blob: Blob; url: string }[]>([]);
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const [onay, setOnay] = useState(false);
  const dosyaRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const k = useMemo(() => kategoriBul(kategori), [kategori]);

  async function fotoEkle(e: React.ChangeEvent<HTMLInputElement>) {
    const yeni = Array.from(e.target.files ?? []).slice(0, 4 - fotolar.length);
    const islenmis = await Promise.all(yeni.map(async (f) => { const blob = await kucult(f); return { blob, url: URL.createObjectURL(blob) }; }));
    setFotolar((x) => [...x, ...islenmis].slice(0, 4));
    if (dosyaRef.current) dosyaRef.current.value = "";
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    if (!kategori) { setHata("Önce konu türünü seç."); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setBekle(true);
    const fd = new FormData();
    fd.set("kategori", kategori); fd.set("baslik", baslik); fd.set("icerik", icerik); fd.set("mahalle", mahalle); fd.set("yer", yer);
    if (zamanVar) { fd.set("olay_tarihi", tarih); fd.set("olay_saati", saat); }
    if (kategori === "tavsiye") fd.set("isletme_adi", isletme);
    fotolar.forEach((f, i) => fd.append("fotolar", f.blob, `foto-${i}.jpg`));
    const r = await fetch("/api/okur/paylasim", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    setBekle(false);
    if (!r.ok) { setHata(j.hata ?? "Paylaşım gönderilemedi."); return; }
    router.push(`/okur/konu/${j.slug}`);
    router.refresh();
  }

  const adim = (n: number, b: string) => (
    <h2 className="flex items-center gap-2.5 font-extrabold text-lg mb-4"><span className="w-7 h-7 rounded-full bg-murekkep text-white text-sm grid place-items-center">{n}</span>{b}</h2>
  );

  return (
    <form onSubmit={gonder} className="grid gap-5 mt-6">
      <section className="kart p-5 sm:p-6">
        {adim(1, "Konu türü")}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {KATEGORILER.map((x) => (
            <button key={x.slug} type="button" onClick={() => setKategori(x.slug)} aria-pressed={kategori === x.slug}
              className="rounded-2xl border-2 p-3 text-left transition"
              style={kategori === x.slug ? { borderColor: x.renk, background: x.zemin } : { borderColor: "var(--color-cizgi)", background: "#fff" }}>
              <span className="text-2xl block" aria-hidden>{x.ikon}</span>
              <span className="text-[13px] font-bold leading-tight block mt-1.5">{x.ad}</span>
            </button>
          ))}
        </div>
        {k && <p className="text-sm mt-3 rounded-xl px-3.5 py-2.5" style={{ background: k.zemin, color: k.renk }}>💡 {k.ipucu}</p>}
      </section>

      <section className="kart p-5 sm:p-6 grid gap-4">
        {adim(2, "Ne oldu?")}
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Başlık</span>
          <input className="girdi" value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={110} required minLength={8}
            placeholder={kategori === "ariyorum" ? "örn. Serik'te pazar günü açık veteriner var mı?" : kategori === "tavsiye" ? "örn. Kökez'de çok ilgili bir terzi" : "örn. Atatürk Caddesi'ndeki çukur aylardır kapatılmadı"} />
          <span className="text-xs text-soluk text-right">{baslik.length}/110</span>
        </label>
        {kategori === "tavsiye" && (
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">İşletmenin adı</span>
            <input className="girdi" value={isletme} onChange={(e) => setIsletme(e.target.value)} maxLength={100} placeholder="örn. Usta Terzi Mehmet" />
          </label>
        )}
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Açıklama</span>
          <textarea className="girdi resize-y" rows={6} value={icerik} onChange={(e) => setIcerik(e.target.value)} maxLength={5000} required minLength={20}
            placeholder="Ayrıntıları yaz: ne gördün, ne zamandır sürüyor, ne istiyorsun? Telefon numarası, tam ad ve ev adresi yazma." />
          <span className="text-xs text-soluk text-right">{icerik.length}/5000</span>
        </label>
      </section>

      <section className="kart p-5 sm:p-6 grid gap-4">
        {adim(3, "Nerede, ne zaman?")}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Mahalle / bölge</span>
            <select className="girdi" value={mahalle} onChange={(e) => setMahalle(e.target.value)} required>
              <option value="">Seç</option>
              {MAHALLELER.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold">Yer <span className="font-normal text-soluk">(sokak, cadde, mevki)</span></span>
            <input className="girdi" value={yer} onChange={(e) => setYer(e.target.value)} maxLength={140} placeholder="örn. PTT karşısı, 1001. Sokak" />
          </label>
        </div>
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" checked={zamanVar} onChange={(e) => setZamanVar(e.target.checked)} className="w-4 h-4 accent-[#D90000]" />
          Gün ve saat belirt
        </label>
        {zamanVar && (
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1.5"><span className="text-sm font-semibold">Gün</span><input type="date" className="girdi" value={tarih} max={bugun()} onChange={(e) => setTarih(e.target.value)} /></label>
            <label className="grid gap-1.5"><span className="text-sm font-semibold">Saat</span><input type="time" className="girdi" value={saat} onChange={(e) => setSaat(e.target.value)} /></label>
          </div>
        )}
      </section>

      <section className="kart p-5 sm:p-6">
        {adim(4, "Fotoğraf")}
        <div className="grid grid-cols-4 gap-2.5">
          {fotolar.map((f, i) => (
            <div key={f.url} className="relative aspect-square rounded-xl overflow-hidden bg-zemin">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setFotolar((x) => x.filter((_, n) => n !== i))} className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-sm" aria-label="Fotoğrafı kaldır">×</button>
            </div>
          ))}
          {fotolar.length < 4 && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-cizgi grid place-items-center text-center cursor-pointer hover:border-ana hover:bg-ana-acik transition">
              <span className="text-soluk text-xs font-semibold"><span className="text-2xl block" aria-hidden>📷</span>Ekle</span>
              <input ref={dosyaRef} type="file" accept="image/*" multiple onChange={fotoEkle} className="hidden" />
            </label>
          )}
        </div>
        <p className="text-xs text-soluk mt-3 leading-relaxed">En fazla 4 fotoğraf. Fotoğraftaki konum bilgisi silinir. <b>İnsan yüzü, araç plakası ve kişisel belge görünen fotoğraflar yayınlanmaz.</b></p>
      </section>

      <label className="flex gap-3 items-start text-sm px-1">
        <input type="checkbox" checked={onay} onChange={(e) => setOnay(e.target.checked)} required className="mt-0.5 w-4 h-4 accent-[#D90000]" />
        <span className="text-slate-600">Yazdıklarımın doğru olduğunu, hakaret ve kişisel bilgi içermediğini onaylıyorum. <Link href="/okur/kurallar" target="_blank" className="text-ana font-semibold underline">Kurallar</Link></span>
      </label>

      {hata && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3" role="alert">{hata}</p>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className="text-xs text-soluk">{guvenilir ? "Paylaşımın hemen yayına girecek." : "İlk paylaşımların kısa bir moderatör kontrolünden sonra yayına girer."}</p>
        <button className="dugme-ana !px-8 !py-3.5 text-base" disabled={bekle || !onay}>{bekle ? "Gönderiliyor…" : "Paylaş"}</button>
      </div>
    </form>
  );
}
