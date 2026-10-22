import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RENK, kategoriBul } from "@/lib/ustam";
import { ustaDegerlendirmeleri, ustaGetir } from "@/lib/ustam-db";
import { DogrulanmisRozet, SponsorluEtiket } from "../../UstaKarti";
import PaylasButonu from "./PaylasButonu";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = await ustaGetir((await params).slug);
  if (!u) return { title: "Usta bulunamadı | Serik Ustam" };
  const alan = u.kategoriler.map((k) => kategoriBul(k)?.ad).filter(Boolean).join(", ");
  return {
    title: `${u.ad} - ${alan} | Serik Ustam`,
    description: (u.hakkinda || `${u.ad}, Serik'te ${alan} hizmeti veriyor.`).slice(0, 155),
    alternates: { canonical: `https://www.serikhaberleri.com/ustam/usta/${u.slug}` },
    openGraph: u.foto ? { images: [u.foto] } : undefined,
  };
}

export default async function UstaProfili({ params }: Props) {
  const u = await ustaGetir((await params).slug);
  if (!u) notFound();
  const yorumlar = await ustaDegerlendirmeleri(u.id);
  const ort = yorumlar.length ? yorumlar.reduce((s, y) => s + y.puan, 0) / yorumlar.length : 0;
  const anaKategori = u.kategoriler[0] ?? "";
  const kutu = "bg-white rounded-2xl p-5";

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-4">
      <nav className="text-xs text-gray-500"><Link href="/ustam" className="hover:underline">Serik Ustam</Link>
        {anaKategori && <> › <Link href={`/ustam/kategori/${anaKategori}`} className="hover:underline">{kategoriBul(anaKategori)?.ad}</Link></>} › {u.ad}</nav>

      <section className={`${kutu} flex flex-col sm:flex-row gap-5`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {u.foto ? <img src={u.foto} alt={u.ad} className="w-28 h-28 rounded-2xl object-cover" />
          : <span className="w-28 h-28 rounded-2xl flex items-center justify-center text-5xl font-black text-white" style={{ backgroundColor: RENK.lacivert }}>{u.ad.charAt(0)}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-1">{u.paket === "premium" && <SponsorluEtiket />}{u.dogrulandi && <DogrulanmisRozet />}</div>
          <h1 className="text-2xl font-black" style={{ color: RENK.lacivert }}>{u.ad}</h1>
          {u.isyeri && <p className="text-sm text-gray-500">{u.isyeri}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
            {u.deneyim_yil > 0 && <span><b>{u.deneyim_yil}</b> yıl deneyim</span>}
            <span><b>{u.tamamlanan_is}</b> tamamlanan iş</span>
            {yorumlar.length > 0 && <span>★ <b>{ort.toFixed(1)}</b> ({yorumlar.length} yorum)</span>}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href={`/ustam/talep?kategori=${anaKategori}&usta=${u.slug}`} className="px-5 py-2.5 rounded-xl font-black text-white" style={{ backgroundColor: RENK.turuncu }}>Teklif İste</Link>
            <Link href={`/ustam/talep?kategori=${anaKategori}&usta=${u.slug}`} className="px-5 py-2.5 rounded-xl font-bold text-white" style={{ backgroundColor: RENK.lacivert }}>Mesaj Gönder</Link>
            <PaylasButonu baslik={`${u.ad} - Serik Ustam`} />
          </div>
        </div>
      </section>

      <div className="grid sm:grid-cols-3 gap-4">
        <section className={`${kutu} sm:col-span-2`}>
          <h2 className="font-black mb-2" style={{ color: RENK.lacivert }}>Hakkında</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{u.hakkinda || "Usta henüz tanıtım yazısı eklemedi."}</p>
        </section>
        <section className={`${kutu} text-sm flex flex-col gap-3`}>
          <div><h2 className="font-black mb-1" style={{ color: RENK.lacivert }}>Uzmanlık</h2>
            <div className="flex flex-wrap gap-1">{u.kategoriler.map((k) => <span key={k} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">{kategoriBul(k)?.ad}</span>)}</div></div>
          <div><h2 className="font-black mb-1" style={{ color: RENK.lacivert }}>Hizmet bölgeleri</h2><p className="text-gray-600">{u.mahalleler.join(", ")}</p></div>
          {u.calisma_saatleri && <div><h2 className="font-black mb-1" style={{ color: RENK.lacivert }}>Çalışma saatleri</h2><p className="text-gray-600">{u.calisma_saatleri}</p></div>}
        </section>
      </div>

      {u.galeri.length > 0 && (
        <section className={kutu}>
          <h2 className="font-black mb-3" style={{ color: RENK.lacivert }}>Yapılan işler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {u.galeri.map((g) => <a key={g} href={g} target="_blank" rel="noopener"><img src={g} alt={`${u.ad} yaptığı iş`} className="w-full aspect-square object-cover rounded-xl" loading="lazy" /></a>)}
          </div>
        </section>
      )}

      <section className={kutu}>
        <h2 className="font-black mb-3" style={{ color: RENK.lacivert }}>Müşteri yorumları</h2>
        {yorumlar.length ? (
          <ul className="flex flex-col gap-3">{yorumlar.map((y, i) => (
            <li key={i} className="border-b border-gray-100 pb-3 last:border-0">
              <p className="text-sm"><span style={{ color: RENK.turuncu }}>{"★".repeat(y.puan)}{"☆".repeat(5 - y.puan)}</span> <b className="text-gray-800">{y.ad}</b></p>
              {y.yorum && <p className="text-sm text-gray-600 mt-1">{y.yorum}</p>}
            </li>))}</ul>
        ) : <p className="text-sm text-gray-500">Henüz yorum yok. Yorumlar yalnızca bu ustayla iş yapmış müşterilerden alınır.</p>}
      </section>

      {!u.dogrulandi && <p className="text-xs text-gray-400">Bu ustanın kimlik ve belge doğrulaması henüz tamamlanmadı.</p>}
    </main>
  );
}
