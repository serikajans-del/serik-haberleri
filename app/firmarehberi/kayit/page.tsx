"use client";
import { useState } from "react";
import Link from "next/link";
import { KATEGORILER } from "@/lib/firmalar";

export default function IsletmeKayitPage() {
  const [f, setF] = useState({
    ad: "", kategori: "", telefon: "", adres: "", whatsapp: "",
    instagram: "", website: "", calisma_saatleri: "", harita: "", aciklama: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [onizleme, setOnizleme] = useState<string>("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sonuc, setSonuc] = useState<"basarili" | "hata" | null>(null);
  const [hataMesaj, setHataMesaj] = useState("");

  function set(k: keyof typeof f, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  function fotoSec(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { alert("Görsel 6 MB'tan küçük olmalı."); return; }
    setFoto(file);
    setOnizleme(URL.createObjectURL(file));
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    setSonuc(null);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      if (foto) fd.append("gorsel", foto);
      const res = await fetch("/api/firmalar", { method: "POST", body: fd });
      if (res.ok) {
        setSonuc("basarili");
        setF({ ad: "", kategori: "", telefon: "", adres: "", whatsapp: "", instagram: "", website: "", calisma_saatleri: "", harita: "", aciklama: "" });
        setFoto(null); setOnizleme("");
      } else {
        const j = await res.json().catch(() => ({}));
        setHataMesaj(j.error || "Kayıt gönderilemedi.");
        setSonuc("hata");
      }
    } catch {
      setHataMesaj("Bağlantı hatası.");
      setSonuc("hata");
    }
    setGonderiliyor(false);
  }

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-400";
  const lbl = "block text-sm font-semibold text-gray-700 mb-1";

  if (sonuc === "basarili") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Kaydınız alındı</h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          İşletmeniz incelendikten sonra Serik Esnaf Rehberi'nde yayınlanacak. Teşekkürler.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/firmarehberi" className="text-white font-bold px-5 py-3 text-sm rounded-lg" style={{ backgroundColor: "#d90000" }}>Rehbere dön</Link>
          <button onClick={() => setSonuc(null)} className="text-gray-700 font-bold px-5 py-3 text-sm rounded-lg bg-gray-100">Yeni kayıt</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/firmarehberi" className="text-sm text-gray-500 hover:underline">← Esnaf Rehberi</Link>
      <h1 className="text-2xl font-black text-gray-900 mt-2 mb-1">İşletmeni rehbere ekle</h1>
      <p className="text-sm text-gray-500 mb-6">Bilgileri doldur, kaydın incelendikten sonra yayınlansın. Ücretsizdir.</p>

      <form onSubmit={gonder} className="flex flex-col gap-4">
        <div>
          <label className={lbl}>İşletme adı *</label>
          <input className={inp} value={f.ad} onChange={(e) => set("ad", e.target.value)} required maxLength={120} placeholder="Örn. Serik Kardeşler Lokantası" />
        </div>
        <div>
          <label className={lbl}>Kategori *</label>
          <select className={inp} value={f.kategori} onChange={(e) => set("kategori", e.target.value)} required>
            <option value="">Seçiniz…</option>
            {KATEGORILER.map((k) => <option key={k.slug} value={k.slug}>{k.emoji} {k.ad}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Telefon</label>
            <input className={inp} value={f.telefon} onChange={(e) => set("telefon", e.target.value)} maxLength={40} placeholder="0242 ..." />
          </div>
          <div>
            <label className={lbl}>WhatsApp</label>
            <input className={inp} value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} maxLength={40} placeholder="05xx ..." />
          </div>
        </div>
        <div>
          <label className={lbl}>Adres</label>
          <input className={inp} value={f.adres} onChange={(e) => set("adres", e.target.value)} maxLength={300} placeholder="Mahalle, cadde, no" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Instagram</label>
            <input className={inp} value={f.instagram} onChange={(e) => set("instagram", e.target.value)} maxLength={60} placeholder="kullanici_adi" />
          </div>
          <div>
            <label className={lbl}>Web sitesi</label>
            <input className={inp} value={f.website} onChange={(e) => set("website", e.target.value)} maxLength={200} placeholder="www..." />
          </div>
        </div>
        <div>
          <label className={lbl}>Çalışma saatleri</label>
          <input className={inp} value={f.calisma_saatleri} onChange={(e) => set("calisma_saatleri", e.target.value)} maxLength={120} placeholder="Örn. Her gün 09.00 - 22.00" />
        </div>
        <div>
          <label className={lbl}>Google Haritalar bağlantısı</label>
          <input className={inp} value={f.harita} onChange={(e) => set("harita", e.target.value)} maxLength={400} placeholder="https://maps.app.goo.gl/..." />
        </div>
        <div>
          <label className={lbl}>Kısa açıklama</label>
          <textarea className={inp} value={f.aciklama} onChange={(e) => set("aciklama", e.target.value)} maxLength={500} rows={3} placeholder="İşletmen hakkında birkaç cümle" />
        </div>
        <div>
          <label className={lbl}>İşletme fotoğrafı / logo</label>
          {onizleme && <img src={onizleme} alt="önizleme" className="w-full h-40 object-cover rounded-lg mb-2" />}
          <input type="file" accept="image/*" onChange={fotoSec} className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-red-700" />
          <p className="text-xs text-gray-400 mt-1">İsteğe bağlı. En fazla 6 MB. Kart daha şık görünür.</p>
        </div>

        {sonuc === "hata" && <p className="text-sm text-red-600">{hataMesaj}</p>}

        <button type="submit" disabled={gonderiliyor} className="text-white font-bold px-5 py-3 text-sm rounded-lg disabled:opacity-60" style={{ backgroundColor: "#d90000" }}>
          {gonderiliyor ? "Gönderiliyor…" : "Kaydı gönder"}
        </button>
        <p className="text-xs text-gray-400">
          Yalnızca kendi işletmenizi kaydedin. Kaydı göndererek bilgilerin doğruluğunu kabul etmiş olursunuz. Kayıtlar yayından önce incelenir.
        </p>
      </form>
    </div>
  );
}
