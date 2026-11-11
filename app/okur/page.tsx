import Link from "next/link";
import AkisDuzeni from "@/components/okur/AkisDuzeni";
import { KATEGORILER } from "@/lib/okur";
import { genelSayilar, paylasimlar } from "@/lib/okur-sunucu/veri";

export const dynamic = "force-dynamic";

const SIRALAR = { yeni: "En yeni", gundem: "Gündemde", cozulen: "Çözülenler" } as const;

export default async function AnaSayfa({ searchParams }: { searchParams: Promise<{ sira?: string; sayfa?: string }> }) {
  const { sira: s, sayfa: sy } = await searchParams;
  const sira = (s && s in SIRALAR ? s : "yeni") as keyof typeof SIRALAR;
  const sayfa = Math.max(1, Number(sy) || 1);
  const [liste, sayilar] = await Promise.all([paylasimlar({ sirala: sira, sayfa, limit: 20 }), genelSayilar()]);

  const ust = (
    <section className="bg-white border-b border-cizgi relative overflow-hidden">
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-ana-acik blur-2xl opacity-70" aria-hidden />
      <div className="absolute right-40 top-24 w-56 h-56 rounded-full bg-altin-acik blur-2xl opacity-80" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
        <div>
          <p className="cip bg-ana-acik text-ana-koyu mb-4">📍 Serik · Belek · Kadriye · Boğazkent</p>
          <h1 className="text-3xl sm:text-[2.7rem] font-extrabold leading-[1.1]">Serik&apos;te ne oluyor?<br /><span className="text-ana">Serikliler anlatıyor.</span></h1>
          <p className="text-slate-600 mt-4 text-base sm:text-lg max-w-xl leading-relaxed">Şikâyetini, isteğini, tavsiyeni ve şehirde gördüğünü paylaş. Bir şey arıyorsan sor; bilen biri mutlaka yanıtlar.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/okur/paylas" className="dugme-ana !px-5 !py-3">✍️ Paylaşım yap</Link>
            <Link href="/okur/paylas?kategori=ariyorum" className="dugme-ikincil !px-5 !py-3">🔎 Bir şey sor</Link>
          </div>
          <form action="/okur/ara" className="md:hidden mt-5">
            <input name="q" placeholder="Serik'te ne arıyorsun?" className="girdi !rounded-full !py-3" />
          </form>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[[sayilar.paylasim, "paylaşım"], [sayilar.uye, "Serikli üye"], [sayilar.cozulen, "çözülen sorun"]].map(([n, a]) => (
            <div key={a as string} className="kart p-4 text-center">
              <b className="block text-2xl sm:text-3xl font-extrabold baslik tabular-nums">{(n as number).toLocaleString("tr-TR")}</b>
              <span className="text-xs text-soluk">{a}</span>
            </div>
          ))}
          <div className="col-span-3 grid grid-cols-2 gap-3">
            {KATEGORILER.slice(0, 4).map((k) => (
              <Link key={k.slug} href={`/okur/paylas?kategori=${k.slug}`} className="kart kart-hover p-3 flex items-center gap-2.5 text-sm font-semibold">
                <span className="w-9 h-9 rounded-xl grid place-items-center text-lg" style={{ background: k.zemin }} aria-hidden>{k.ikon}</span>{k.ad}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <AkisDuzeni
      ust={ust}
      liste={liste}
      sekmeler={Object.entries(SIRALAR).map(([k, ad]) => ({ ad, href: k === "yeni" ? "/okur" : `/okur?sira=${k}`, aktif: sira === k }))}
      sonraki={sira === "yeni" && liste.length === 20 ? `/okur?sayfa=${sayfa + 1}` : undefined}
      bosMesaj={sira === "cozulen" ? "Henüz çözüldü olarak işaretlenen bir şikâyet yok." : undefined}
    />
  );
}
