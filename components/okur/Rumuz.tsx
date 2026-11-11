import Link from "next/link";
import { CINSIYET } from "@/lib/okur";

const RENKLER = ["#D90000", "#1D4ED8", "#B45309", "#7C3AED", "#BE185D", "#0F766E", "#C2410C", "#334155"];
export const avatarRengi = (r: string) => RENKLER[[...r].reduce((a, c) => a + c.charCodeAt(0), 0) % RENKLER.length];

export function Avatar({ rumuz, boyut = 28 }: { rumuz: string; boyut?: number }) {
  return (
    <span className="rounded-full text-white grid place-items-center font-bold shrink-0" style={{ width: boyut, height: boyut, background: avatarRengi(rumuz), fontSize: boyut * 0.42 }} aria-hidden>
      {rumuz.slice(0, 1).toLocaleUpperCase("tr-TR")}
    </span>
  );
}

export default function Rumuz({ rumuz, cinsiyet, baglantisiz = false, boyut = 26 }: { rumuz: string; cinsiyet: string; baglantisiz?: boolean; boyut?: number }) {
  const c = CINSIYET[cinsiyet];
  const ic = (
    <>
      <Avatar rumuz={rumuz} boyut={boyut} />
      <span className="font-semibold text-murekkep truncate max-w-36">{rumuz}</span>
      {c?.ikon && <span className="font-bold" style={{ color: c.renk }} title={c.ad} aria-label={c.ad}>{c.ikon}</span>}
    </>
  );
  if (baglantisiz) return <span className="flex items-center gap-1.5 min-w-0">{ic}</span>;
  return <Link href={`/okur/uye/${encodeURIComponent(rumuz)}`} className="flex items-center gap-1.5 min-w-0 hover:underline">{ic}</Link>;
}
