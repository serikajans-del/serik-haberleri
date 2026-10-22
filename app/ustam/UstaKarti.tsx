import Link from "next/link";
import { RENK, kategoriBul, type AcikUsta } from "@/lib/ustam";

export function DogrulanmisRozet() {
  return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: RENK.turkuaz }}>✓ Doğrulanmış Usta</span>;
}

export function SponsorluEtiket() {
  return <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FFF1E6", color: "#C25E14" }}>Sponsorlu</span>;
}

export default function UstaKarti({ u }: { u: AcikUsta }) {
  const sponsorlu = u.paket === "premium";
  return (
    <Link href={`/ustam/usta/${u.slug}`} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {u.foto ? <img src={u.foto} alt={u.ad} className="w-20 h-20 rounded-xl object-cover shrink-0" />
        : <span className="w-20 h-20 rounded-xl shrink-0 flex items-center justify-center text-3xl font-black text-white" style={{ backgroundColor: RENK.lacivert }}>{u.ad.charAt(0)}</span>}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {sponsorlu && <SponsorluEtiket />}
          {u.dogrulandi && <DogrulanmisRozet />}
        </div>
        <h3 className="font-black leading-tight truncate" style={{ color: RENK.lacivert }}>{u.ad}</h3>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{u.kategoriler.map((k) => kategoriBul(k)?.ad).filter(Boolean).join(" · ")}</p>
        <p className="text-xs text-gray-500 mt-1">
          {u.deneyim_yil > 0 && <>{u.deneyim_yil} yıl deneyim · </>}
          {u.tamamlanan_is > 0 && <>{u.tamamlanan_is} iş tamamlandı · </>}
          {u.mahalleler.slice(0, 3).join(", ")}{u.mahalleler.length > 3 ? "…" : ""}
        </p>
      </div>
    </Link>
  );
}
