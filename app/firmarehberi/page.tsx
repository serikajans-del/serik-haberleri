import type { Metadata } from "next";
import Link from "next/link";
import { KATEGORILER, type Isletme } from "@/lib/firmalar";
import { onayliIsletmeler } from "@/lib/firmalar-db";

export const metadata: Metadata = {
  title: "Serik Esnaf Rehberi | Serik'teki İşletmeler",
  description: "Serik'teki yeme-içme, gıda, giyim, kuaför, sağlık ve hizmet işletmeleri tek rehberde. Adres, telefon ve iletişim bilgileriyle Serik esnaf rehberi.",
  alternates: { canonical: "https://www.serikhaberleri.com/firmarehberi" },
};

export const revalidate = 60;

function telTemiz(t: string) {
  return t.replace(/[^0-9+]/g, "");
}

function Kart({ i }: { i: Isletme }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 leading-tight">{i.ad}</h3>
        <span className="shrink-0 text-[11px] font-semibold text-red-700 bg-red-50 rounded px-2 py-0.5">{i.kategori_ad}</span>
      </div>
      {i.aciklama && <p className="text-sm text-gray-600 leading-snug">{i.aciklama}</p>}
      {i.adres && <p className="text-sm text-gray-500">📍 {i.adres}</p>}
      {i.calisma_saatleri && <p className="text-xs text-gray-400">🕒 {i.calisma_saatleri}</p>}
      <div className="flex flex-wrap gap-2 mt-1">
        {i.telefon && <a href={`tel:${telTemiz(i.telefon)}`} className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#16a34a" }}>Ara</a>}
        {i.whatsapp && <a href={`https://wa.me/${telTemiz(i.whatsapp).replace(/^0/, "90")}`} target="_blank" rel="noopener" className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#25D366" }}>WhatsApp</a>}
        {i.instagram && <a href={`https://instagram.com/${i.instagram}`} target="_blank" rel="noopener" className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#E1306C" }}>Instagram</a>}
        {i.website && <a href={i.website.startsWith("http") ? i.website : `https://${i.website}`} target="_blank" rel="noopener" className="text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg bg-gray-100">Web</a>}
        {i.harita && <a href={i.harita} target="_blank" rel="noopener" className="text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg bg-gray-100">Yol Tarifi</a>}
      </div>
    </div>
  );
}

export default async function FirmaRehberiPage() {
  const hepsi = await onayliIsletmeler();
  const dolu = KATEGORILER.filter((k) => hepsi.some((i) => i.kategori === k.slug));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Serik Esnaf Rehberi</h1>
          <p className="text-sm text-gray-500 mt-1">Serik'teki işletmeler; adres ve iletişim bilgileriyle.</p>
        </div>
        <Link href="/firmarehberi/kayit" className="inline-flex items-center justify-center gap-2 text-white font-bold px-5 py-3 text-sm rounded-lg" style={{ backgroundColor: "#d90000" }}>
          İşletmeni ekle <span aria-hidden>+</span>
        </Link>
      </div>

      {hepsi.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-700 font-bold mb-2">Rehber yeni açıldı</p>
          <p className="text-sm text-gray-500 mb-5">İlk işletmeyi sen ekleyebilirsin. Kaydın incelendikten sonra yayınlanır.</p>
          <Link href="/firmarehberi/kayit" className="inline-flex text-white font-bold px-6 py-3 text-sm rounded-lg" style={{ backgroundColor: "#d90000" }}>İşletmeni ekle</Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            {dolu.map((k) => (
              <a key={k.slug} href={`#${k.slug}`} className="text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:border-red-300">
                {k.emoji} {k.ad}
              </a>
            ))}
          </div>
          {dolu.map((k) => (
            <section key={k.slug} id={k.slug} className="mb-8 scroll-mt-20">
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <span>{k.emoji}</span> {k.ad}
                <span className="text-sm font-normal text-gray-400">({hepsi.filter((i) => i.kategori === k.slug).length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {hepsi.filter((i) => i.kategori === k.slug).map((i) => <Kart key={i.id} i={i} />)}
              </div>
            </section>
          ))}
        </>
      )}

      <p className="text-xs text-gray-400 mt-8 text-center">
        İşletme bilgileri sahiplerinin beyanına dayanır. Hatalı kayıt için <Link href="/iletisim" className="underline">iletişim</Link> sayfasından bize ulaşın.
      </p>
    </div>
  );
}
