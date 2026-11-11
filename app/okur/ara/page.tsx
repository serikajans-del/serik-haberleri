import type { Metadata } from "next";
import Link from "next/link";
import PaylasimKarti from "@/components/okur/PaylasimKarti";
import { KATEGORILER } from "@/lib/okur";
import { paylasimlar } from "@/lib/okur-sunucu/veri";

export const metadata: Metadata = { title: "Okur paylaşımlarında ara", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";

export default async function AraSayfasi({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const liste = q.length >= 2 ? await paylasimlar({ ara: q, limit: 40 }) : [];
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold mb-4">Serik&apos;te ne arıyorsun?</h1>
      <form action="/okur/ara" className="flex gap-2">
        <input name="q" defaultValue={q} autoFocus placeholder="örn. nöbetçi veteriner, su kesintisi, iyi bir terzi" className="girdi !py-3" />
        <button className="dugme-ana">Ara</button>
      </form>

      {q.length >= 2 && (
        <div className="mt-6">
          <p className="text-sm text-soluk mb-3">“{q}” için {liste.length} paylaşım bulundu.</p>
          <div className="grid gap-3.5">{liste.map((p, i) => <PaylasimKarti key={p.id} p={p} sira={i} />)}</div>
          <div className="kart p-5 mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between bg-ana-acik border-ana/20">
            <div>
              <b>Aradığını bulamadın mı?</b>
              <p className="text-sm text-slate-600">Okurlara sor; Serikliler yanıtlasın.</p>
            </div>
            <Link href={`/okur/paylas?kategori=ariyorum&baslik=${encodeURIComponent(q)}`} className="dugme-ana shrink-0">🔎 Okurlara sor</Link>
          </div>
        </div>
      )}

      {q.length < 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
          {KATEGORILER.map((k) => (
            <Link key={k.slug} href={`/okur/kategori/${k.slug}`} className="kart kart-hover p-4">
              <span className="text-2xl" aria-hidden>{k.ikon}</span>
              <b className="block mt-2 text-sm">{k.ad}</b>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
