import Link from "next/link";
import { COZUM, SIKAYET_TURU, gecenZaman, gunYaz, kategoriBul, ozet, type Paylasim } from "@/lib/okur";
import Rumuz from "./Rumuz";

export function KategoriCipi({ slug, kucuk = false }: { slug: string; kucuk?: boolean }) {
  const k = kategoriBul(slug);
  if (!k) return null;
  return <span className={`cip ${kucuk ? "!text-[11px] !py-0.5 !px-2" : ""}`} style={{ color: k.renk, background: k.zemin }}><span aria-hidden>{k.ikon}</span>{k.kisa}</span>;
}

export function CozumCipi({ cozum }: { cozum: string }) {
  const c = COZUM[cozum] ?? COZUM.acik;
  return <span className="cip !text-[11px] !py-0.5" style={{ color: c.renk, background: c.zemin }}>{cozum === "cozuldu" ? "✓ " : ""}{c.ad}</span>;
}

const Sayac = ({ d, n, etiket }: { d: React.ReactNode; n: number; etiket: string }) => (
  <span className="flex items-center gap-1.5" title={etiket}>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
    <span className="tabular-nums">{n}</span><span className="sr-only">{etiket}</span>
  </span>
);
export const IKON = {
  kalp: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  yorum: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  faydali: <><path d="M7 11v9H4v-9h3Z" /><path d="M7 11l4-7a2 2 0 0 1 3 2l-1 4h5.5a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 17.2 20H7" /></>,
  konum: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  saat: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
};

export default function PaylasimKarti({ p, sira }: { p: Paylasim; sira?: number }) {
  const foto = p.fotolar?.[0];
  return (
    <article className="kart kart-hover overflow-hidden belir" style={sira ? { animationDelay: `${Math.min(sira, 8) * 40}ms` } : undefined}>
      <Link href={`/okur/konu/${p.slug}`} className="flex flex-col sm:flex-row">
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <KategoriCipi slug={p.kategori} kucuk />
            {SIKAYET_TURU.includes(p.kategori) && <CozumCipi cozum={p.cozum} />}
            <span className="text-xs text-soluk ml-auto">{gecenZaman(p.yayin_at ?? p.created_at)}</span>
          </div>
          <h3 className="text-[1.08rem] font-bold leading-snug line-clamp-2">{p.baslik}</h3>
          {p.isletme_adi && <p className="text-sm font-semibold text-ana mt-1">⭐ {p.isletme_adi}</p>}
          <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{ozet(p.icerik, 220)}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-soluk mt-3">
            <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{IKON.konum}</svg>{p.mahalle}{p.yer ? ` · ${p.yer}` : ""}</span>
            {p.olay_tarihi && <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{IKON.saat}</svg>{gunYaz(p.olay_tarihi)}{p.olay_saati ? `, ${p.olay_saati}` : ""}</span>}
          </div>
          <div className="flex items-center gap-4 mt-3.5 pt-3 border-t border-cizgi text-sm text-slate-500">
            {p.uye && <Rumuz rumuz={p.uye.rumuz} cinsiyet={p.uye.cinsiyet} baglantisiz />}
            <span className="ml-auto flex items-center gap-4">
              <Sayac d={IKON.kalp} n={p.begeni_sayisi} etiket="beğeni" />
              <Sayac d={IKON.yorum} n={p.yorum_sayisi} etiket="yorum" />
              {p.faydali_sayisi > 0 && <Sayac d={IKON.faydali} n={p.faydali_sayisi} etiket="işime yaradı" />}
            </span>
          </div>
        </div>
        {foto && (
          <div className="sm:w-48 shrink-0 order-first sm:order-none aspect-[16/9] sm:aspect-auto bg-zemin relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto} alt={p.baslik} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            {p.fotolar.length > 1 && <span className="absolute bottom-2 right-2 text-[11px] font-bold bg-black/60 text-white rounded-full px-2 py-0.5">+{p.fotolar.length - 1}</span>}
          </div>
        )}
      </Link>
    </article>
  );
}
