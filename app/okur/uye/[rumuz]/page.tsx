import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PaylasimKarti from "@/components/okur/PaylasimKarti";
import { Avatar } from "@/components/okur/Rumuz";
import { CINSIYET, tarihYaz } from "@/lib/okur";
import { db } from "@/lib/okur-sunucu/db";
import { aktifUye } from "@/lib/okur-sunucu/oturum";
import { ayBilgisi, paylasimlar, uyeGetir } from "@/lib/okur-sunucu/veri";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ rumuz: string }> }): Promise<Metadata> {
  const r = decodeURIComponent((await params).rumuz);
  return { title: `${r} adlı üyenin paylaşımları`, robots: { index: false, follow: true } };
}

export default async function UyeSayfasi({ params }: { params: Promise<{ rumuz: string }> }) {
  const u = await uyeGetir(decodeURIComponent((await params).rumuz));
  if (!u) notFound();
  const ben = await aktifUye();
  const kendi = ben?.id === u.id;
  const ay = ayBilgisi();
  const [liste, bekleyen, puan] = await Promise.all([
    paylasimlar({ uyeId: u.id, limit: 50 }),
    kendi ? db.from("meydan_paylasimlar").select("slug, baslik, durum, red_nedeni").eq("uye_id", u.id).neq("durum", "yayinda").order("created_at", { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
    db.rpc("meydan_ay_puanlari", { p_bas: ay.bas.toISOString(), p_bit: ay.bit.toISOString(), adet: 1000 }),
  ]);
  const siralama = ((puan.data ?? []) as { uye_id: number; puan: number }[]);
  const sira = siralama.findIndex((x) => x.uye_id === u.id);
  const c = CINSIYET[u.cinsiyet];
  const toplamBegeni = liste.reduce((a, p) => a + p.begeni_sayisi, 0);
  const toplamFaydali = liste.reduce((a, p) => a + p.faydali_sayisi, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <section className="kart p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar rumuz={u.rumuz} boyut={68} />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold flex items-center gap-2 truncate">{u.rumuz}{c?.ikon && <span style={{ color: c.renk }} title={c.ad}>{c.ikon}</span>}</h1>
            <p className="text-sm text-soluk">{u.mahalle ? `${u.mahalle} · ` : ""}{tarihYaz(u.created_at)} tarihinden beri üye</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-6 text-center">
          {[[liste.length, "paylaşım"], [toplamBegeni, "beğeni"], [toplamFaydali, "işe yaradı"], [sira >= 0 ? `${sira + 1}.` : "–", "bu ay sırası"]].map(([n, a]) => (
            <div key={a as string} className="rounded-2xl bg-zemin py-3">
              <b className="block text-xl baslik">{n}</b><span className="text-[11px] text-soluk">{a}</span>
            </div>
          ))}
        </div>
        {sira >= 0 && <p className="text-sm mt-4 rounded-xl bg-altin-acik px-4 py-2.5">🏆 Bu ay <b>{Number(siralama[sira].puan).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} puan</b> ile <b>{sira + 1}. sırada</b>.</p>}
      </section>

      {kendi && (bekleyen.data ?? []).length > 0 && (
        <section className="kart p-5 mt-5">
          <h2 className="font-extrabold mb-3">Yayında olmayan paylaşımların</h2>
          <ul className="grid gap-2 text-sm">
            {(bekleyen.data ?? []).map((b) => (
              <li key={b.slug} className="flex items-center gap-2">
                <span className={`cip !text-[11px] !py-0.5 ${b.durum === "beklemede" ? "bg-altin-acik text-amber-800" : "bg-red-50 text-red-700"}`}>{b.durum === "beklemede" ? "Onay bekliyor" : "Yayınlanmadı"}</span>
                <a href={`/okur/konu/${b.slug}`} className="hover:underline truncate">{b.baslik}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="text-xl font-extrabold mt-8 mb-3">Paylaşımları</h2>
      <div className="grid gap-3.5">
        {liste.length === 0 ? <p className="kart p-6 text-soluk text-sm">Henüz yayında paylaşımı yok.</p> : liste.map((p, i) => <PaylasimKarti key={p.id} p={p} sira={i} />)}
      </div>
    </div>
  );
}
