import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AkisDuzeni from "@/components/okur/AkisDuzeni";
import { MAHALLELER, SITE_URL, kategoriBul, mahalleSlug } from "@/lib/okur";
import { paylasimlar } from "@/lib/okur-sunucu/veri";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const k = kategoriBul((await params).slug);
  if (!k) return {};
  const baslik = `Serik ${k.ad}`;
  return { title: baslik, description: `${k.aciklama}. Seriklilerin paylaştığı güncel ${k.ad.toLocaleLowerCase("tr-TR")} paylaşımları Serik Haberleri'nde.`,
    alternates: { canonical: `/okur/kategori/${k.slug}` }, openGraph: { title: baslik, url: `${SITE_URL}/okur/kategori/${k.slug}` } };
}

export default async function KategoriSayfasi({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sayfa?: string }> }) {
  const k = kategoriBul((await params).slug);
  if (!k) notFound();
  const sayfa = Math.max(1, Number((await searchParams).sayfa) || 1);
  const liste = await paylasimlar({ kategori: k.slug, sayfa, limit: 20 });

  const ust = (
    <section className="border-b border-cizgi" style={{ background: `linear-gradient(135deg, ${k.zemin}, #fff 70%)` }}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
        <nav className="text-xs text-soluk mb-3" aria-label="Konum"><Link href="/okur" className="hover:text-ana">Okur Haberleri</Link> / <span>{k.ad}</span></nav>
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3"><span aria-hidden>{k.ikon}</span>Serik {k.ad}</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">{k.aciklama}.</p>
          </div>
          <Link href={`/okur/paylas?kategori=${k.slug}`} className="dugme-ana shrink-0" style={{ background: k.renk }}>+ {k.kisa} paylaş</Link>
        </div>
        <div className="flex gap-2 mt-5 overflow-x-auto kaydir-gizli -mx-4 px-4">
          {MAHALLELER.filter((m) => m !== "Diğer").map((m) => (
            <Link key={m} href={`/okur/mahalle/${mahalleSlug(m)}?kategori=${k.slug}`} className="cip bg-white border border-cizgi text-slate-600 hover:border-ana">{m}</Link>
          ))}
        </div>
      </div>
    </section>
  );

  const jsonLd = {
    "@context": "https://schema.org", "@type": "CollectionPage", name: `Serik ${k.ad}`, url: `${SITE_URL}/okur/kategori/${k.slug}`,
    breadcrumb: { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Okur Haberleri", item: `${SITE_URL}/okur` },
      { "@type": "ListItem", position: 2, name: k.ad, item: `${SITE_URL}/okur/kategori/${k.slug}` },
    ] },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AkisDuzeni ust={ust} liste={liste} aktifKategori={k.slug} sonraki={liste.length === 20 ? `/okur/kategori/${k.slug}?sayfa=${sayfa + 1}` : undefined}
        bosMesaj={<>Henüz {k.ad.toLocaleLowerCase("tr-TR")} paylaşımı yok. {k.ipucu}</>} />
    </>
  );
}
