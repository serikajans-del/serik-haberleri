import Link from "next/link";
import Rumuz from "./Rumuz";
import { ayAdi, ayEtiketi, type AyKazanani, type Lider } from "@/lib/okur";
import { ayBilgisi } from "@/lib/okur-sunucu/veri";

const MADALYA = ["🥇", "🥈", "🥉"];

export default function LiderTablosu({ liderler, sonKazanan }: { liderler: Lider[]; sonKazanan?: AyKazanani | null }) {
  const ay = ayBilgisi();
  const ayNo = Number(ay.iso.slice(5, 7)) - 1;
  return (
    <section className="kart overflow-hidden" aria-labelledby="lider-baslik">
      <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-[#D90000] to-[#A60000] text-white">
        <div className="flex items-center justify-between">
          <h2 id="lider-baslik" className="text-lg font-extrabold flex items-center gap-2">🏆 {ayAdi(ayNo)} Ayının Liderleri</h2>
        </div>
        <p className="text-xs text-white/75 mt-1">Liste her ayın 1&apos;inde sıfırlanır · Kalan süre: {ay.kalanGun} gün</p>
      </div>

      {liderler.length === 0 ? (
        <div className="p-5 text-sm text-soluk">
          Bu ay henüz puan alan olmadı. <Link href="/okur/paylas" className="font-bold text-ana">İlk paylaşımı sen yap</Link>, listenin başına sen geç.
        </div>
      ) : (
        <ol className="divide-y divide-cizgi">
          {liderler.map((l, i) => (
            <li key={l.uye_id} className={`flex items-center gap-3 px-5 py-3 ${i === 0 ? "bg-altin-acik" : ""}`}>
              <span className="w-7 text-center text-lg font-extrabold text-soluk">{MADALYA[i] ?? i + 1}</span>
              <span className="flex-1 min-w-0 text-sm"><Rumuz rumuz={l.rumuz} cinsiyet={l.cinsiyet} /></span>
              <span className="text-right">
                <b className="block text-base tabular-nums leading-none">{l.puan.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</b>
                <span className="text-[10.5px] text-soluk">puan</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="px-5 py-3 border-t border-cizgi text-xs text-soluk flex items-center justify-between gap-2">
        <Link href="/okur/liderler" className="font-bold text-ana">Tam liste ve puan kuralları →</Link>
      </div>
      {sonKazanan && (
        <div className="px-5 py-3.5 border-t border-cizgi bg-zemin flex items-center gap-3">
          <span className="text-xl" aria-hidden>👑</span>
          <span className="text-xs text-soluk leading-tight">
            <span className="block font-semibold uppercase tracking-wide text-[10px]">{ayEtiketi(sonKazanan.ay)} ayının lideri</span>
            <span className="flex items-center gap-1.5 mt-1 text-sm"><Rumuz rumuz={sonKazanan.rumuz} cinsiyet={sonKazanan.cinsiyet} boyut={22} /> <b className="text-murekkep">· {sonKazanan.puan.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} puan</b></span>
          </span>
        </div>
      )}
    </section>
  );
}
