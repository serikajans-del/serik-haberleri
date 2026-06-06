"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Haber } from "@/lib/supabase";

type Sikayet = {
  id: number;
  ad_soyad: string;
  email: string;
  telefon: string;
  baslik: string;
  icerik: string;
  adres: string;
  foto_urls: string[];
  durum: "beklemede" | "inceleniyor" | "tamamlandi";
  created_at: string;
};

const durumLabel: Record<Sikayet["durum"], string> = {
  beklemede: "Beklemede",
  inceleniyor: "İnceleniyor",
  tamamlandi: "Tamamlandı",
};

const durumColor: Record<Sikayet["durum"], string> = {
  beklemede: "#f59e0b",
  inceleniyor: "#3b82f6",
  tamamlandi: "#22c55e",
};

export default function AdminDashboard() {
  const [sekme, setSekme] = useState<"haberler" | "sikayetler">("haberler");
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [sikayetler, setSikayetler] = useState<Sikayet[]>([]);
  const [loading, setLoading] = useState(true);
  const [siliniyor, setSiliniyor] = useState<number | null>(null);
  const [acikSikayet, setAcikSikayet] = useState<Sikayet | null>(null);
  const router = useRouter();

  const password = typeof window !== "undefined" ? localStorage.getItem("admin_password") : "";

  useEffect(() => {
    if (!password) { router.push("/admin"); return; }
    fetchHaberler();
  }, []);

  useEffect(() => {
    if (sekme === "sikayetler" && sikayetler.length === 0) fetchSikayetler();
  }, [sekme]);

  async function fetchHaberler() {
    const res = await fetch("/api/haberler");
    const data = await res.json();
    setHaberler(data);
    setLoading(false);
  }

  async function fetchSikayetler() {
    setLoading(true);
    const res = await fetch("/api/sikayetler", { headers: { "x-admin-password": password || "" } });
    if (res.ok) setSikayetler(await res.json());
    setLoading(false);
  }

  async function haberSil(id: number) {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;
    setSiliniyor(id);
    await fetch(`/api/haberler/${id}`, { method: "DELETE", headers: { "x-admin-password": password || "" } });
    setHaberler(haberler.filter((h) => h.id !== id));
    setSiliniyor(null);
  }

  async function durumGuncelle(id: number, durum: Sikayet["durum"]) {
    await fetch("/api/sikayetler", {
      method: "PATCH",
      headers: { "x-admin-password": password || "", "Content-Type": "application/json" },
      body: JSON.stringify({ id, durum }),
    });
    setSikayetler((prev) => prev.map((s) => s.id === id ? { ...s, durum } : s));
    if (acikSikayet?.id === id) setAcikSikayet((prev) => prev ? { ...prev, durum } : prev);
  }

  function cikisYap() {
    localStorage.removeItem("admin_password");
    router.push("/admin");
  }

  const bekleyenSayi = sikayetler.filter((s) => s.durum === "beklemede").length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0ece4" }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: "#cc0000" }} className="px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-black text-lg">SERİK HABERLERİ</Link>
            <span className="text-red-200 text-sm">/ Yönetim Paneli</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-white text-sm hover:underline">Siteyi Gör</Link>
            <button onClick={cikisYap} className="bg-white text-red-700 text-sm font-bold px-3 py-1 rounded hover:bg-red-50 transition-colors">Çıkış</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Sekmeler */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setSekme("haberler")}
            className={`px-5 py-2.5 text-sm font-bold rounded-t transition-colors ${sekme === "haberler" ? "bg-white text-red-700 border border-b-white border-gray-200 -mb-px" : "text-gray-500 hover:text-gray-700"}`}
          >
            Haberler ({haberler.length})
          </button>
          <button
            onClick={() => setSekme("sikayetler")}
            className={`px-5 py-2.5 text-sm font-bold rounded-t transition-colors flex items-center gap-2 ${sekme === "sikayetler" ? "bg-white text-red-700 border border-b-white border-gray-200 -mb-px" : "text-gray-500 hover:text-gray-700"}`}
          >
            Şikayetler
            {bekleyenSayi > 0 && (
              <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{bekleyenSayi}</span>
            )}
          </button>
        </div>

        {/* HABERLER SEKMESİ */}
        {sekme === "haberler" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Haberler ({haberler.length})</h2>
              <Link href="/admin/haber/yeni" className="text-white font-bold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity flex items-center gap-2" style={{ backgroundColor: "#cc0000" }}>
                + Yeni Haber Ekle
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
            ) : haberler.length === 0 ? (
              <div className="bg-white rounded p-12 text-center text-gray-500 shadow-sm">
                <p className="text-lg mb-2">Henüz haber yok</p>
                <Link href="/admin/haber/yeni" style={{ color: "#cc0000" }} className="font-bold hover:underline">İlk haberi ekle →</Link>
              </div>
            ) : (
              <div className="bg-white rounded shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: "#f8f8f8" }}>
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Başlık</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Kategori</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Tarih</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {haberler.map((haber) => (
                      <tr key={haber.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800 line-clamp-1">{haber.title}</div>
                          {haber.featured && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block text-white" style={{ backgroundColor: "#cc0000" }}>Öne Çıkan</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{haber.category}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                          {new Date(haber.published_at).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/haber/${haber.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline">Gör</Link>
                            <Link href={`/admin/haber/duzenle?id=${haber.id}`} className="text-xs text-green-600 hover:underline">Düzenle</Link>
                            <button onClick={() => haberSil(haber.id)} disabled={siliniyor === haber.id} className="text-xs text-red-600 hover:underline disabled:opacity-50">
                              {siliniyor === haber.id ? "..." : "Sil"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ŞİKAYETLER SEKMESİ */}
        {sekme === "sikayetler" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Şikayetler & İhbarlar ({sikayetler.length})</h2>
              <div className="flex gap-2 text-xs text-gray-500">
                {(["beklemede", "inceleniyor", "tamamlandi"] as const).map((d) => (
                  <span key={d} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: durumColor[d] }} />
                    {durumLabel[d]}: {sikayetler.filter((s) => s.durum === d).length}
                  </span>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
            ) : sikayetler.length === 0 ? (
              <div className="bg-white rounded p-12 text-center text-gray-500 shadow-sm">Henüz şikayet yok.</div>
            ) : (
              <div className="space-y-3">
                {sikayetler.map((s) => (
                  <div key={s.id} className="bg-white rounded shadow-sm overflow-hidden">
                    <div className="flex items-start gap-4 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: durumColor[s.durum] }}
                          >
                            {durumLabel[s.durum]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(s.created_at).toLocaleString("tr-TR")}
                          </span>
                          {s.foto_urls?.length > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {s.foto_urls.length} fotoğraf
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-800">{s.baslik}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{s.ad_soyad}{s.adres ? ` — ${s.adres}` : ""}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.icerik}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setAcikSikayet(acikSikayet?.id === s.id ? null : s)}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                        >
                          {acikSikayet?.id === s.id ? "Kapat" : "Detay"}
                        </button>
                        <select
                          value={s.durum}
                          onChange={(e) => durumGuncelle(s.id, e.target.value as Sikayet["durum"])}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="beklemede">Beklemede</option>
                          <option value="inceleniyor">İnceleniyor</option>
                          <option value="tamamlandi">Tamamlandı</option>
                        </select>
                      </div>
                    </div>

                    {/* Detay paneli */}
                    {acikSikayet?.id === s.id && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {s.email && <div><span className="text-gray-400 text-xs">E-posta</span><p className="font-medium">{s.email}</p></div>}
                          {s.telefon && <div><span className="text-gray-400 text-xs">Telefon</span><p className="font-medium">{s.telefon}</p></div>}
                          {s.adres && <div><span className="text-gray-400 text-xs">Adres</span><p className="font-medium">{s.adres}</p></div>}
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Şikayet İçeriği</span>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{s.icerik}</p>
                        </div>
                        {s.foto_urls?.length > 0 && (
                          <div>
                            <span className="text-gray-400 text-xs">Fotoğraflar</span>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                              {s.foto_urls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt={`Fotoğraf ${i + 1}`} className="w-full aspect-square object-cover rounded border border-gray-200 hover:opacity-80 transition-opacity" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
