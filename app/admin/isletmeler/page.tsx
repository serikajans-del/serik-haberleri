"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Isletme } from "@/lib/firmalar";

const durumLabel: Record<string, string> = { beklemede: "Beklemede", onayli: "Yayında", reddedildi: "Reddedildi" };
const durumColor: Record<string, string> = { beklemede: "#d97706", onayli: "#16a34a", reddedildi: "#dc2626" };

export default function AdminIsletmelerPage() {
  const [liste, setListe] = useState<Isletme[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<"beklemede" | "onayli" | "hepsi">("beklemede");
  const router = useRouter();
  const password = typeof window !== "undefined" ? localStorage.getItem("admin_password") : "";

  useEffect(() => {
    if (!password) { router.push("/admin"); return; }
    fetchListe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchListe() {
    setLoading(true);
    const res = await fetch("/api/firmalar", { headers: { "x-admin-password": password || "" } });
    if (res.ok) setListe(await res.json());
    setLoading(false);
  }

  async function durumGuncelle(id: number, durum: string) {
    await fetch("/api/firmalar", {
      method: "PATCH",
      headers: { "x-admin-password": password || "", "Content-Type": "application/json" },
      body: JSON.stringify({ id, durum }),
    });
    setListe((prev) => prev.map((i) => i.id === id ? { ...i, durum: durum as Isletme["durum"] } : i));
  }

  async function sil(id: number) {
    if (!confirm("Bu kaydı kalıcı silmek istediğinize emin misiniz?")) return;
    await fetch("/api/firmalar", {
      method: "DELETE",
      headers: { "x-admin-password": password || "", "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setListe((prev) => prev.filter((i) => i.id !== id));
  }

  const gosterilen = liste.filter((i) => filtre === "hepsi" ? true : i.durum === filtre);
  const bekleyen = liste.filter((i) => i.durum === "beklemede").length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0ece4" }}>
      <div style={{ backgroundColor: "#cc0000" }} className="px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-black text-lg">SERİK HABERLERİ</Link>
            <span className="text-red-200 text-sm">/ Esnaf Rehberi Yönetimi</span>
          </div>
          <Link href="/admin/dashboard" className="bg-white text-red-700 text-sm font-bold px-3 py-1 rounded">Panel</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-5">
          {(["beklemede", "onayli", "hepsi"] as const).map((d) => (
            <button key={d} onClick={() => setFiltre(d)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filtre === d ? "bg-red-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
              {d === "beklemede" ? `Bekleyen${bekleyen > 0 ? ` (${bekleyen})` : ""}` : d === "onayli" ? "Yayında" : "Hepsi"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Yükleniyor…</p>
        ) : gosterilen.length === 0 ? (
          <p className="text-gray-500 bg-white border border-gray-200 rounded-xl p-8 text-center">Kayıt yok.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {gosterilen.map((i) => (
              <div key={i.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{i.ad}</h3>
                      <span className="text-[11px] font-semibold text-red-700 bg-red-50 rounded px-2 py-0.5">{i.kategori_ad}</span>
                      <span className="text-[11px] font-bold rounded px-2 py-0.5 text-white" style={{ backgroundColor: durumColor[i.durum] }}>{durumLabel[i.durum]}</span>
                    </div>
                    {i.aciklama && <p className="text-sm text-gray-600 mt-1">{i.aciklama}</p>}
                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                      {i.adres && <div>📍 {i.adres}</div>}
                      {i.telefon && <div>📞 {i.telefon}</div>}
                      {i.whatsapp && <div>💬 {i.whatsapp}</div>}
                      {i.instagram && <div>📷 @{i.instagram}</div>}
                      {i.website && <div>🌐 {i.website}</div>}
                      {i.calisma_saatleri && <div>🕒 {i.calisma_saatleri}</div>}
                      {i.harita && <div>🗺️ <a href={i.harita} target="_blank" rel="noopener" className="underline">harita</a></div>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {i.durum !== "onayli" && <button onClick={() => durumGuncelle(i.id, "onayli")} className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#16a34a" }}>Onayla & Yayınla</button>}
                  {i.durum !== "beklemede" && <button onClick={() => durumGuncelle(i.id, "beklemede")} className="text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg bg-gray-100">Beklemeye al</button>}
                  {i.durum !== "reddedildi" && <button onClick={() => durumGuncelle(i.id, "reddedildi")} className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#dc2626" }}>Reddet</button>}
                  <button onClick={() => sil(i.id)} className="text-xs font-bold text-gray-400 px-3 py-1.5 rounded-lg bg-gray-50 ml-auto">Sil</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
