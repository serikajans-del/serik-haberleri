import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KATEGORILER, MAHALLELER, RENK, kategoriBul } from "@/lib/ustam";
import { onayliUstalar } from "@/lib/ustam-db";
import UstaKarti from "../../UstaKarti";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ mahalle?: string }> };

export function generateStaticParams() {
  return KATEGORILER.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const k = kategoriBul((await params).slug);
  if (!k) return {};
  return {
    title: `Serik ${k.ad} | Serik Ustam`,
    description: `Serik, Belek, Kadriye ve Boğazkent'te ${k.ad.toLocaleLowerCase("tr-TR")} arıyorsanız ücretsiz teklif alın. ${k.aciklama}.`,
    alternates: { canonical: `https://www.serikhaberleri.com/ustam/kategori/${k.slug}` },
  };
}

export default async function KategoriSayfasi({ params, searchParams }: Props) {
  const { slug } = await params;
  const { mahalle = "" } = await searchParams;
  const k = kategoriBul(slug);
  if (!k) notFound();
  const secili = MAHALLELER.includes(mahalle) ? mahalle : "";
  const ustalar = await onayliUstalar(slug, secili || undefined);
  // Premium (sponsorlu) ustalar üstte; sırası zaten doğrulanmış ve iş sayısına göre
  ustalar.sort((a, b) => Number(b.paket === "premium") - Number(a.paket === "premium"));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-500 mb-3"><Link href="/ustam" className="hover:underline">Serik Ustam</Link> › {k.ad}</nav>
      <div className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: "#E6F6F5" }} aria-hidden>{k.ikon}</span>
          <div>
            <h1 className="text-2xl font-black" style={{ color: RENK.lacivert }}>Serik {k.ad}</h1>
            <p className="text-sm text-gray-500">{k.aciklama}</p>
          </div>
        </div>
        <Link href={`/ustam/talep?kategori=${k.slug}`} className="px-6 py-3 rounded-xl font-black text-white text-center" style={{ backgroundColor: RENK.turuncu }}>Ücretsiz Teklif Al</Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {["", ...MAHALLELER.filter((m) => m !== "Diğer")].map((m) => (
          <Link key={m || "tum"} href={m ? `?mahalle=${encodeURIComponent(m)}` : `/ustam/kategori/${k.slug}`}
            className="shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full border"
            style={secili === m ? { backgroundColor: RENK.lacivert, color: "#fff", borderColor: RENK.lacivert } : { backgroundColor: "#fff", color: "#374151", borderColor: "#E5E7EB" }}>
            {m || "Tümü"}
          </Link>
        ))}
      </div>

      {ustalar.length ? (
        <div className="grid sm:grid-cols-2 gap-3">{ustalar.map((u) => <UstaKarti key={u.id} u={u} />)}</div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="font-bold mb-1" style={{ color: RENK.lacivert }}>Bu bölgede henüz kayıtlı {k.ad.toLocaleLowerCase("tr-TR")} yok.</p>
          <p className="text-sm text-gray-500 mb-4">Talebinizi bırakın, ekibimiz sizin için uygun ustayı bulsun.</p>
          <Link href={`/ustam/talep?kategori=${k.slug}`} className="inline-block px-6 py-3 rounded-xl font-black text-white" style={{ backgroundColor: RENK.turuncu }}>Talep Bırak</Link>
        </div>
      )}
    </main>
  );
}
