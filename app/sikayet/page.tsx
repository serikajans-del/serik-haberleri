"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function SikayetPage() {
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [adres, setAdres] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [sonuc, setSonuc] = useState<"basarili" | "hata" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function fotografSec(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length) alert("5 MB'tan büyük dosyalar eklenmedi.");
    const newPhotos = [...photos, ...valid].slice(0, 5);
    setPhotos(newPhotos);
    const newPreviews = newPhotos.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
    if (fileRef.current) fileRef.current.value = "";
  }

  function fotografKaldir(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setGonderiliyor(true);
    setSonuc(null);

    const formData = new FormData();
    formData.append("ad_soyad", adSoyad);
    formData.append("email", email);
    formData.append("telefon", telefon);
    formData.append("baslik", baslik);
    formData.append("icerik", icerik);
    formData.append("adres", adres);
    photos.forEach((p) => formData.append("photos", p));

    try {
      const res = await fetch("/api/sikayetler", { method: "POST", body: formData });
      if (res.ok) {
        setSonuc("basarili");
        setAdSoyad(""); setEmail(""); setTelefon("");
        setBaslik(""); setIcerik(""); setAdres("");
        setPhotos([]); setPreviews([]);
      } else {
        setSonuc("hata");
      }
    } catch {
      setSonuc("hata");
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Üst başlık */}
      <div style={{ backgroundColor: "#d90000", borderBottom: "3px solid #b00000" }}>
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-2 text-sm text-red-200 mb-1">
            <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-white">Şikayet / İhbar</span>
          </div>
          <h1 className="text-2xl font-black text-white">Şikayet & İhbar Formu</h1>
          <p className="text-red-100 text-sm mt-1">
            Serik&apos;te yaşanan sorunları, ihbarları ve şikayetlerinizi bizimle paylaşın. Editörlerimiz inceleyecektir.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {sonuc === "basarili" ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e8f5e9" }}>
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Şikayetiniz Alındı</h2>
            <p className="text-gray-500 text-sm mb-6">
              Başvurunuz editörlerimize iletildi. En kısa sürede incelenecektir.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setSonuc(null)}
                className="px-5 py-2 rounded font-bold text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#d90000" }}
              >
                Yeni Şikayet Gönder
              </button>
              <Link href="/" className="px-5 py-2 rounded font-bold text-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={gonder} className="space-y-5">
            {sonuc === "hata" && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
                Bir hata oluştu. Lütfen tekrar deneyin.
              </div>
            )}

            {/* Kişisel Bilgiler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ backgroundColor: "#d90000" }}>1</span>
                Kişisel Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={adSoyad}
                    onChange={(e) => setAdSoyad(e.target.value)}
                    required
                    placeholder="Adınız Soyadınız"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="0 5XX XXX XX XX"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Kimlik bilgileriniz gizli tutulacaktır.</p>
            </div>

            {/* Şikayet Detayı */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ backgroundColor: "#d90000" }}>2</span>
                Şikayet Detayı
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konu Başlığı <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={baslik}
                    onChange={(e) => setBaslik(e.target.value)}
                    required
                    placeholder="Şikayetinizin kısa başlığı"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Olay Yeri / Adres</label>
                  <input
                    type="text"
                    value={adres}
                    onChange={(e) => setAdres(e.target.value)}
                    placeholder="Mahalle, sokak veya konum"
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şikayet / İhbar İçeriği <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={icerik}
                    onChange={(e) => setIcerik(e.target.value)}
                    required
                    rows={6}
                    placeholder="Yaşanan sorunu, ihbarı veya şikayeti detaylıca açıklayın..."
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-400 transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{icerik.length} karakter</p>
                </div>
              </div>
            </div>

            {/* Fotoğraf Yükleme */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ backgroundColor: "#d90000" }}>3</span>
                Fotoğraf Ekle
                <span className="text-xs text-gray-400 font-normal ml-1">(isteğe bağlı, max 5 adet)</span>
              </h2>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Fotoğraf ${i + 1}`} className="w-full h-full object-cover rounded border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => fotografKaldir(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors">
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-400">Fotoğraf seç veya buraya sürükle</span>
                  <span className="text-xs text-gray-300 mt-0.5">JPG, PNG, WEBP — max 5 MB</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={fotografSec}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Gönder */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Formu göndererek{" "}
                <Link href="/gizlilik-politikasi" className="underline hover:text-gray-600">gizlilik politikamızı</Link>{" "}
                kabul etmiş olursunuz.
              </p>
              <button
                type="submit"
                disabled={gonderiliyor}
                className="px-6 py-2.5 rounded font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: "#d90000" }}
              >
                {gonderiliyor ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Gönderiliyor...
                  </>
                ) : "Şikayeti Gönder"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
