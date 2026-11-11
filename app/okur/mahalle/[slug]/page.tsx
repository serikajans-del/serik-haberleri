import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AkisDuzeni from "@/components/okur/AkisDuzeni";
import { KATEGORILER, kategoriBul, mahalleBul } from "@/lib/okur";
import { paylasimlar } from "@/lib/okur-sunucu/veri";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = mahalleBul(slug);
  if (!m) return {};
  const ad = ["Belek", "Kadriye", "Boğazkent"].includes(m) ? m : `Serik ${m} Mahallesi`;
  return { title: `${ad}: şikâyet, istek ve haberler`, description: `${ad} sakinlerinin paylaştığı şikâyet, istek, yol durumu ve tavsiyeler.`, alternates: { canonical: `/okur/mahalle/${slug}` } };
}

export default async function MahalleSayfasi({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ kategori?: string }> }) {
  const { slug } = await params;
  const m = mahalleBul(slug);
  if (!m) notFound();
  const kat = kategoriBul((await searchParams).kategori ?? "");
  const liste = await paylasimlar({ mahalle: m, kategori: kat?.slug, limit: 40 });
  const ad = ["Belek", "Kadriye", "Boğazkent"].includes(m) ? m : `${m} Mahallesi`;

  const ust = (
    <section className="bg-white border-b border-cizgi">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-xs text-soluk mb-3" aria-label="Konum"><Link href="/okur" className="hover:text-ana">Okur Haberleri</Link> / Mahalleler / <span>{m}</span></nav>
        <h1 className="text-3xl font-extrabold">📍 {ad}{kat ? ` · ${kat.ad}` : ""}</h1>
        <p className="text-slate-600 mt-2">{ad} için yapılan paylaşımlar. Mahallende bir sorun mu var? Fotoğrafla bildir.</p>
        <div className="flex gap-2 mt-4 overflow-x-auto kaydir-gizli -mx-4 px-4">
          <Link href={`/okur/mahalle/${slug}`} className={`cip border ${!kat ? "bg-murekkep text-white border-murekkep" : "bg-white border-cizgi"}`}>Tümü</Link>
          {KATEGORILER.map((k) => (
            <Link key={k.slug} href={`/okur/mahalle/${slug}?kategori=${k.slug}`} className={`cip border ${kat?.slug === k.slug ? "bg-murekkep text-white border-murekkep" : "bg-white border-cizgi text-slate-600"}`}>{k.ikon} {k.kisa}</Link>
          ))}
        </div>
      </div>
    </section>
  );
  return <AkisDuzeni ust={ust} liste={liste} bosMesaj={`${ad} için henüz paylaşım yok.`} />;
}
