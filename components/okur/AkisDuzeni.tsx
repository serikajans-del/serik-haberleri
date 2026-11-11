import Link from "next/link";
import PaylasimKarti from "./PaylasimKarti";
import LiderTablosu from "./LiderTablosu";
import { KATEGORILER, type Paylasim } from "@/lib/okur";
import { ayKazananlari, kategoriSayilari, liderler } from "@/lib/okur-sunucu/veri";

type Sekme = { ad: string; href: string; aktif: boolean };

export default async function AkisDuzeni({ ust, liste, sekmeler, bosMesaj, aktifKategori, sonraki }: {
  ust: React.ReactNode; liste: Paylasim[]; sekmeler?: Sekme[]; bosMesaj?: React.ReactNode; aktifKategori?: string; sonraki?: string;
}) {
  const [lider, kazananlar, sayilar] = await Promise.all([liderler(0, 5), ayKazananlari(1), kategoriSayilari()]);
  return (
    <>
      {ust}
      <div className="max-w-6xl mx-auto px-4 mt-6 grid lg:grid-cols-[1fr_330px] gap-6 items-start">
        <div className="min-w-0">
          <div className="flex gap-2 overflow-x-auto kaydir-gizli -mx-4 px-4 pb-1">
            <Link href="/okur" className={`cip border ${!aktifKategori ? "bg-murekkep text-white border-murekkep" : "bg-white border-cizgi text-slate-700"}`}>Tümü</Link>
            {KATEGORILER.map((k) => (
              <Link key={k.slug} href={`/okur/kategori/${k.slug}`} className="cip border transition"
                style={aktifKategori === k.slug ? { background: k.renk, color: "#fff", borderColor: k.renk } : { background: "#fff", borderColor: "var(--color-cizgi)", color: "#334155" }}>
                <span aria-hidden>{k.ikon}</span>{k.kisa}{sayilar[k.slug] ? <span className="opacity-60 font-semibold">{sayilar[k.slug]}</span> : null}
              </Link>
            ))}
          </div>

          {sekmeler && (
            <div className="flex gap-5 border-b border-cizgi mt-4">
              {sekmeler.map((s) => (
                <Link key={s.href} href={s.href} scroll={false} className={`pb-2.5 text-sm font-bold border-b-2 -mb-px ${s.aktif ? "border-ana text-ana" : "border-transparent text-soluk hover:text-murekkep"}`}>{s.ad}</Link>
              ))}
            </div>
          )}

          <div className="grid gap-3.5 mt-4">
            {liste.length === 0 ? (
              <div className="kart p-10 text-center">
                <p className="text-4xl mb-3" aria-hidden>🌱</p>
                <div className="text-soluk">{bosMesaj ?? "Burada henüz paylaşım yok."}</div>
                <Link href="/okur/paylas" className="dugme-ana mt-5">İlk paylaşımı yap</Link>
              </div>
            ) : liste.map((p, i) => <PaylasimKarti key={p.id} p={p} sira={i} />)}
          </div>
          {sonraki && <div className="text-center mt-6"><Link href={sonraki} className="dugme-ikincil">Daha eski paylaşımlar</Link></div>}
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-32">
          <LiderTablosu liderler={lider} sonKazanan={kazananlar[0] ?? null} />
          <div className="kart p-5">
            <h2 className="font-extrabold">Puan nasıl kazanılır?</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {[["Yayına giren paylaşım", "+2"], ["Her farklı kişiden beğeni", "+1"], ["Paylaşımına yorum yapan her kişi", "+2"], ["“İşime yaradı” işareti", "+5"]].map(([a, p]) => (
                <li key={a} className="flex justify-between gap-3"><span className="text-slate-600">{a}</span><b className="text-ana">{p}</b></li>
              ))}
            </ul>
            <p className="text-xs text-soluk mt-3 leading-relaxed">Kendi paylaşımına yaptığın etkileşim sayılmaz. Hileli hesapların puanı silinir.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
