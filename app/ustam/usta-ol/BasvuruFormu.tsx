"use client";
import Link from "next/link";
import { useState } from "react";
import { KATEGORILER, MAHALLELER, RENK, telGecerli } from "@/lib/ustam";

export default function BasvuruFormu() {
  const [kategoriler, setKategoriler] = useState<string[]>([]);
  const [mahalleler, setMahalleler] = useState<string[]>([]);
  const [hata, setHata] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [tamam, setTamam] = useState(false);

  const degistir = (liste: string[], set: (l: string[]) => void, v: string, sinir = 99) =>
    set(liste.includes(v) ? liste.filter((x) => x !== v) : liste.length < sinir ? [...liste, v] : liste);

  const gonder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setHata("");
    const fd = new FormData(e.currentTarget);
    if (!telGecerli(String(fd.get("telefon")))) return setHata("Geçerli bir cep telefonu girin.");
    if (!kategoriler.length) return setHata("En az bir uzmanlık alanı seçin.");
    if (!mahalleler.length) return setHata("Hizmet verdiğiniz en az bir bölgeyi seçin.");
    kategoriler.forEach((k) => fd.append("kategoriler", k));
    mahalleler.forEach((m) => fd.append("mahalleler", m));
    setGonderiliyor(true);
    try {
      const r = await fetch("/api/ustam/usta", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Gönderilemedi");
      setTamam(true); window.scrollTo({ top: 0 });
    } catch (e) { setHata((e as Error).message); } finally { setGonderiliyor(false); }
  };

  if (tamam) return (
    <div className="bg-white rounded-3xl p-8 text-center">
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl text-white mb-4" style={{ backgroundColor: RENK.turkuaz }}>✓</div>
      <h2 className="text-2xl font-black mb-2" style={{ color: RENK.lacivert }}>Başvurunuz alındı!</h2>
      <p className="text-gray-600">Ekibimiz bilgilerinizi inceleyip sizi telefonla arayacak. Onaylandığında profiliniz Serik Ustam&apos;da yayına girer.</p>
      <Link href="/ustam" className="inline-block mt-6 px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: RENK.lacivert }}>Ana sayfaya dön</Link>
    </div>
  );

  const girdi = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-teal-500";
  const etiket = "block text-sm font-bold text-gray-700 mb-1";
  const cip = (aktif: boolean) => `text-sm font-semibold px-3 py-1.5 rounded-full border ${aktif ? "text-white" : "bg-white text-gray-700 border-gray-200"}`;
  const cipStil = (aktif: boolean) => aktif ? { backgroundColor: RENK.turkuaz, borderColor: RENK.turkuaz } : undefined;

  return (
    <form onSubmit={gonder} className="bg-white rounded-3xl p-5 sm:p-8 flex flex-col gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={etiket}>Ad Soyad / İşletme adı *</label><input name="ad" required minLength={2} className={girdi} /></div>
        <div><label className={etiket}>Cep telefonu *</label><input name="telefon" required inputMode="tel" placeholder="05xx xxx xx xx" className={girdi} /></div>
        <div><label className={etiket}>WhatsApp (farklıysa)</label><input name="whatsapp" inputMode="tel" className={girdi} /></div>
        <div><label className={etiket}>Deneyim (yıl)</label><input name="deneyim_yil" type="number" min={0} max={60} className={girdi} /></div>
        <div><label className={etiket}>İş yeri / dükkân adresi</label><input name="isyeri" className={girdi} placeholder="Varsa" /></div>
        <div><label className={etiket}>Çalışma saatleri</label><input name="calisma_saatleri" className={girdi} placeholder="Örn. Hafta içi 08.00–19.00" /></div>
      </div>

      <div>
        <p className={etiket}>Uzmanlık alanları * <span className="font-normal text-gray-400">(en fazla 5)</span></p>
        <div className="flex flex-wrap gap-2">
          {KATEGORILER.map((k) => <button type="button" key={k.slug} onClick={() => degistir(kategoriler, setKategoriler, k.slug, 5)} className={cip(kategoriler.includes(k.slug))} style={cipStil(kategoriler.includes(k.slug))}>{k.ikon} {k.ad}</button>)}
        </div>
      </div>

      <div>
        <p className={etiket}>Hizmet verdiğiniz bölgeler *</p>
        <div className="flex flex-wrap gap-2">
          {MAHALLELER.filter((m) => m !== "Diğer").map((m) => <button type="button" key={m} onClick={() => degistir(mahalleler, setMahalleler, m)} className={cip(mahalleler.includes(m))} style={cipStil(mahalleler.includes(m))}>{m}</button>)}
        </div>
      </div>

      <div><label className={etiket}>Kendinizi tanıtın</label><textarea name="hakkinda" rows={4} maxLength={800} className={girdi} placeholder="Hangi işleri yapıyorsunuz, nelerde iyisiniz?" /></div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={etiket}>Profil fotoğrafı</label><input name="foto" type="file" accept="image/*" className="text-sm" /></div>
        <div><label className={etiket}>Yaptığınız işlerden fotoğraflar (en fazla 6)</label><input name="galeri" type="file" accept="image/*" multiple className="text-sm" /></div>
      </div>

      <div>
        <label className={etiket}>Belge bilgisi <span className="font-normal text-gray-400">(ustalık belgesi, vergi levhası vb. — herkese gösterilmez)</span></label>
        <input name="belge_notu" className={girdi} placeholder="Örn. Elektrik ustalık belgesi var" />
        <p className="text-xs text-gray-400 mt-1">&quot;Doğrulanmış Usta&quot; rozeti, ekibimiz belgelerinizi gördükten sonra verilir.</p>
      </div>

      <label className="flex gap-2 items-start text-sm text-gray-600">
        <input type="checkbox" name="kvkk" required className="mt-1" />
        <span>Bilgilerimin başvurumun değerlendirilmesi ve onaylanırsa profilimin yayınlanması için işlenmesini kabul ediyorum. Telefonum herkese açık gösterilmez. <Link href="/kvkk" target="_blank" className="underline">KVKK Aydınlatma Metni</Link></span>
      </label>

      {hata && <p className="text-sm font-semibold text-red-600">{hata}</p>}
      <button disabled={gonderiliyor} className="py-4 rounded-xl text-white font-black text-lg disabled:opacity-60" style={{ backgroundColor: RENK.turkuaz }}>
        {gonderiliyor ? "Gönderiliyor…" : "Ücretsiz Başvur"}
      </button>
    </form>
  );
}
