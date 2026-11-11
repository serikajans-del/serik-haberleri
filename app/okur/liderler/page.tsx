import type { Metadata } from "next";
import Link from "next/link";
import Rumuz from "@/components/okur/Rumuz";
import { ayAdi, ayEtiketi } from "@/lib/okur";
import { ayBilgisi, ayKazananlari, liderler } from "@/lib/okur-sunucu/veri";

export const metadata: Metadata = {
  title: "Ayın Liderleri",
  description: "Serik Haberleri'nde bu ay en faydalı paylaşımları yapan Serikliler. Liste her ayın 1'inde sıfırlanır.",
  alternates: { canonical: "/okur/liderler" },
};
export const dynamic = "force-dynamic";

export default async function LiderlerSayfasi() {
  const ay = ayBilgisi();
  const [liste, kazananlar] = await Promise.all([liderler(0, 20), ayKazananlari(24)]);
  const ayAd = ayAdi(Number(ay.iso.slice(5, 7)) - 1);
  const podyum = liste.slice(0, 3);
  const sira = [1, 0, 2].filter((i) => podyum[i]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        <p className="cip bg-altin-acik text-amber-800 mx-auto">🏆 Her ayın 1&apos;inde sıfırlanır · {ay.kalanGun} gün kaldı</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3">{ayAd} Ayının Liderleri</h1>
        <p className="text-soluk mt-2 max-w-xl mx-auto">Paylaşımları beğeni, yorum ve “işime yaradı” aldıkça puanı artan Serikliler.</p>
      </div>

      {podyum.length > 0 && (
        <div className="grid grid-cols-3 gap-3 items-end mt-10 max-w-xl mx-auto">
          {sira.map((i) => {
            const l = podyum[i];
            const yuk = ["h-36", "h-28", "h-20"][i];
            return (
              <div key={l.uye_id} className="text-center">
                <div className="text-3xl mb-1">{["🥇", "🥈", "🥉"][i]}</div>
                <div className="flex justify-center text-sm mb-2"><Rumuz rumuz={l.rumuz} cinsiyet={l.cinsiyet} boyut={i === 0 ? 34 : 28} /></div>
                <div className={`${yuk} rounded-t-2xl grid place-items-center ${i === 0 ? "bg-gradient-to-b from-[#F5C451] to-[#E8A317] text-white" : "bg-white border border-cizgi"}`}>
                  <span><b className="block text-2xl baslik">{l.puan.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</b><span className="text-xs opacity-80">puan</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="kart overflow-hidden mt-8">
        {liste.length === 0 ? (
          <p className="p-8 text-center text-soluk">Bu ay henüz puan alan yok. <Link href="/okur/paylas" className="font-bold text-ana">İlk paylaşımı yap</Link>, listenin başına geç.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zemin text-soluk text-xs">
              <tr><th className="text-left px-4 py-3">Sıra</th><th className="text-left px-2">Üye</th><th className="px-2 hidden sm:table-cell">Paylaşım</th><th className="px-2 hidden sm:table-cell">Beğeni</th><th className="px-2 hidden sm:table-cell">Yorum</th><th className="px-2 hidden sm:table-cell">İşe yaradı</th><th className="text-right px-4">Puan</th></tr>
            </thead>
            <tbody className="divide-y divide-cizgi">
              {liste.map((l, i) => (
                <tr key={l.uye_id} className={i < 5 ? "bg-altin-acik/40" : ""}>
                  <td className="px-4 py-3 font-extrabold text-soluk">{i + 1}</td>
                  <td className="px-2"><Rumuz rumuz={l.rumuz} cinsiyet={l.cinsiyet} /></td>
                  <td className="px-2 text-center hidden sm:table-cell">{l.paylasim}</td>
                  <td className="px-2 text-center hidden sm:table-cell">{l.begeni.toLocaleString("tr-TR")}</td>
                  <td className="px-2 text-center hidden sm:table-cell">{l.yorum}</td>
                  <td className="px-2 text-center hidden sm:table-cell">{l.faydali}</td>
                  <td className="px-4 text-right font-extrabold tabular-nums">{l.puan.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="grid sm:grid-cols-2 gap-5 mt-8">
        <div className="kart p-6">
          <h2 className="text-lg font-extrabold">Puan kuralları</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700 list-disc pl-5">
            <li>Yayına giren her paylaşım <b>2 puan</b>.</li>
            <li>Paylaşımlarını beğenen her farklı kişi <b>1 puan</b> (aynı kişinin o ayki beğenileri bir kez sayılır; 7 günden yeni hesapların beğenisi yarım puan).</li>
            <li>Bir paylaşımına yorum yapan her farklı kişi <b>2 puan</b>.</li>
            <li>“İşime yaradı” işareti <b>5 puan</b>.</li>
            <li>Kendi paylaşımına yaptığın etkileşim sayılmaz. Yalnız o ay içinde alınan etkileşimler sayılır.</li>
            <li>Hile tespit edilen hesapların puanı silinir, hesap kapatılır.</li>
          </ul>
        </div>
        <div className="kart p-6">
          <h2 className="text-lg font-extrabold">👑 Onur listesi</h2>
          {kazananlar.length === 0 ? <p className="text-sm text-soluk mt-3">İlk ayın kazananı {ayAd} sonunda burada yer alacak.</p> : (
            <ul className="mt-3 divide-y divide-cizgi">
              {kazananlar.map((k) => (
                <li key={k.ay} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <span className="text-soluk w-28">{ayEtiketi(k.ay)}</span>
                  <span className="flex-1"><Rumuz rumuz={k.rumuz} cinsiyet={k.cinsiyet} boyut={22} /></span>
                  <b>{k.puan.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
