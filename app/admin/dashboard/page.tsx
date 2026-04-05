"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Haber } from "@/lib/supabase";

export default function AdminDashboard() {
  const [haberler, setHaberler] = useState<Haber[]>([]);
  const [loading, setLoading] = useState(true);
  const [siliniyor, setSiliniyor] = useState<number | null>(null);
  const router = useRouter();

  const password = typeof window !== "undefined" ? localStorage.getItem("admin_password") : "";

  useEffect(() => {
    if (!password) { router.push("/admin"); return; }
    fetchHaberler();
  }, []);

  async function fetchHaberler() {
    const res = await fetch("/api/haberler");
    const data = await res.json();
    setHaberler(data);
    setLoading(false);
  }

  async function haberSil(id: number) {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;
    setSiliniyor(id);
    await fetch(`/api/haberler/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password || "" },
    });
    setHaberler(haberler.filter((h) => h.id !== id));
    setSiliniyor(null);
  }

  function cikisYap() {
    localStorage.removeItem("admin_password");
    router.push("/admin");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0ece4" }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: "#cc0000" }} className="px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              SERİK HABERLERİ
            </Link>
            <span className="text-red-200 text-sm">/ Yönetim Paneli</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-white text-sm hover:underline">
              Siteyi Gör
            </Link>
            <button onClick={cikisYap} className="bg-white text-red-700 text-sm font-bold px-3 py-1 rounded hover:bg-red-50 transition-colors">
              Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Üst bar */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Haberler ({haberler.length})
          </h2>
          <Link
            href="/admin/haber/yeni"
            className="text-white font-bold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: "#cc0000" }}
          >
            + Yeni Haber Ekle
          </Link>
        </div>

        {/* Haber Listesi */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
        ) : haberler.length === 0 ? (
          <div className="bg-white rounded p-12 text-center text-gray-500 shadow-sm">
            <p className="text-lg mb-2">Henüz haber yok</p>
            <Link href="/admin/haber/yeni" style={{ color: "#cc0000" }} className="font-bold hover:underline">
              İlk haberi ekle →
            </Link>
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
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block text-white" style={{ backgroundColor: "#cc0000" }}>
                          Öne Çıkan
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{haber.category}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                      {new Date(haber.published_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/haber/${haber.slug}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Gör
                        </Link>
                        <Link
                          href={`/admin/haber/duzenle?id=${haber.id}`}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => haberSil(haber.id)}
                          disabled={siliniyor === haber.id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
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
      </div>
    </div>
  );
}
