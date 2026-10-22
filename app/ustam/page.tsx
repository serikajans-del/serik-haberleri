import type { Metadata } from "next";
import Link from "next/link";
import { KATEGORILER, RENK } from "@/lib/ustam";
import { onayliUstalar } from "@/lib/ustam-db";
import AramaKutusu from "./AramaKutusu";

export const metadata: Metadata = {
  title: "Serik Ustam | Serik'te Usta Bul, Ücretsiz Teklif Al",
  description: "Serik'te elektrikçi, tesisatçı, klimacı, boyacı ve daha fazlası. İhtiyacını belirt, Serik, Belek, Kadriye ve Boğazkent'teki ustalardan ücretsiz teklif al.",
  alternates: { canonical: "https://www.serikhaberleri.com/ustam" },
};
export const revalidate = 60;

export default async function UstamAnaSayfa() {
  const ustalar = await onayliUstalar();
  const sayac: Record<string, number> = {};
  for (const u of ustalar) for (const k of u.kategoriler) sayac[k] = (sayac[k] ?? 0) + 1;

  return (
    <>
      {/* Karşılama */}
      <section className="relative overflow-hidden" style={{ backgroundColor: RENK.lacivert }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/firmarehberi/kapak-hizmet.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${RENK.lacivert} 35%, rgba(19,38,63,0.55) 100%)` }} />
        <div className="relative max-w-6xl mx-auto px-4 py-14 sm:py-20 flex flex-col gap-6">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: RENK.turkuaz }}>Serik · Belek · Kadriye · Boğazkent</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-3xl">Serik&apos;te Usta Arama, <span style={{ color: RENK.turuncu }}>Kolayca Bul!</span></h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl">Elektrikçi, tesisatçı, klimacı, boyacı ve daha fazlası. İhtiyacını belirt, ustalardan teklif al.</p>
          <AramaKutusu />
          <div className="flex flex-wrap gap-3">
            <Link href="/ustam/talep" className="px-6 py-3 rounded-xl font-black text-white" style={{ backgroundColor: RENK.turuncu }}>Usta Bul</Link>
            <Link href="/ustam/usta-ol" className="px-6 py-3 rounded-xl font-black text-white border-2" style={{ borderColor: RENK.turkuaz }}>Usta Olarak Katıl</Link>
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-black mb-1" style={{ color: RENK.lacivert }}>Hizmet Kategorileri</h2>
        <p className="text-sm text-gray-500 mb-6">Bir kategori seç, birkaç adımda ücretsiz teklif iste.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {KATEGORILER.map((k) => (
            <div key={k.slug} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: "#E6F6F5" }} aria-hidden>{k.ikon}</span>
              <Link href={`/ustam/kategori/${k.slug}`} className="font-bold leading-tight" style={{ color: RENK.lacivert }}>{k.ad}</Link>
              <p className="text-xs text-gray-500 leading-snug flex-1">{k.aciklama}</p>
              <div className="flex items-center justify-between gap-2">
                <Link href={`/ustam/talep?kategori=${k.slug}`} className="text-xs font-black text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: RENK.turuncu }}>Teklif Al</Link>
                {sayac[k.slug] ? <span className="text-[11px] text-gray-400">{sayac[k.slug]} usta</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-black mb-6" style={{ color: RENK.lacivert }}>Nasıl Çalışır?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ["1", "İhtiyacını anlat", "Hizmeti, mahalleni ve zamanı seç; istersen fotoğraf ekle."],
              ["2", "Teklifleri al", "Talebin bölgendeki uygun ustalara iletilir, en fazla üç ustadan teklif toplanır."],
              ["3", "Ustanı seç", "Profilleri ve teklifleri karşılaştır, istediğin ustayla çalış. İş ücretini ustayla birlikte belirlersin."],
            ].map(([n, b, a]) => (
              <div key={n} className="rounded-2xl p-5" style={{ backgroundColor: RENK.zemin }}>
                <span className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white mb-3" style={{ backgroundColor: RENK.turkuaz }}>{n}</span>
                <h3 className="font-bold mb-1" style={{ color: RENK.lacivert }}>{b}</h3>
                <p className="text-sm text-gray-600">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-5">Talep oluşturmak ücretsizdir. Telefon numaranız ve açık adresiniz herkese gösterilmez.</p>
        </div>
      </section>

      {/* Usta çağrısı */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-5 justify-between" style={{ backgroundColor: RENK.lacivert }}>
          <div>
            <h2 className="text-2xl font-black text-white">Usta mısın? Yeni müşterilere ulaş.</h2>
            <p className="text-white/75 text-sm mt-1">Ücretsiz profilini oluştur; Serik&apos;teki iş taleplerinden haberdar ol.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/ustam/usta-ol" className="px-6 py-3 rounded-xl font-black text-white" style={{ backgroundColor: RENK.turkuaz }}>Usta Olarak Katıl</Link>
            <Link href="/ustam/paketler" className="px-6 py-3 rounded-xl font-bold text-white border border-white/30">Paketler</Link>
          </div>
        </div>
      </section>
    </>
  );
}
