import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PaylasFormu from "./PaylasFormu";
import { aktifUye } from "@/lib/okur-sunucu/oturum";
import { kategoriBul } from "@/lib/okur";

export const metadata: Metadata = { title: "Paylaşım yap", robots: { index: false } };

export default async function PaylasSayfasi({ searchParams }: { searchParams: Promise<{ kategori?: string; baslik?: string }> }) {
  const { kategori, baslik } = await searchParams;
  const uye = await aktifUye();
  if (!uye) {
    const q = new URLSearchParams({ ...(kategori ? { kategori } : {}), ...(baslik ? { baslik } : {}) }).toString();
    redirect(`/okur/giris?kayit=1&sonra=${encodeURIComponent(`/okur/paylas${q ? "?" + q : ""}`)}`);
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">Okur haberi paylaş</h1>
      <p className="text-soluk mt-1.5">Ne gördün, ne istiyorsun, ne arıyorsun? Yerini ve zamanını yaz, fotoğraf ekle.</p>
      <PaylasFormu ilkKategori={kategoriBul(kategori ?? "")?.slug ?? ""} ilkBaslik={(baslik ?? "").slice(0, 110)} mahalle={uye.mahalle} guvenilir={uye.guvenilir} />
    </div>
  );
}
