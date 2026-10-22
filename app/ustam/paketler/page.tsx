import type { Metadata } from "next";
import Link from "next/link";
import { PAKETLER, RENK } from "@/lib/ustam";

export const metadata: Metadata = {
  title: "Usta Paketleri | Serik Ustam",
  description: "Serik Ustam üyelik paketleri: Ücretsiz, Profesyonel ve Premium usta paketleri.",
  alternates: { canonical: "https://www.serikhaberleri.com/ustam/paketler" },
};

export default function PaketlerSayfasi() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-center mb-2" style={{ color: RENK.lacivert }}>Usta Paketleri</h1>
      <p className="text-center text-gray-600 mb-8">Müşteriler Serik Ustam&apos;ı ücretsiz kullanır. Ustalar ücretsiz başlar, isterse daha fazla görünürlük için paket seçer.</p>
      <div className="grid md:grid-cols-3 gap-4">
        {PAKETLER.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl p-6 flex flex-col border-2" style={{ borderColor: p.one ? RENK.turuncu : "transparent" }}>
            {p.one && <span className="self-start text-xs font-black text-white px-3 py-1 rounded-full mb-3" style={{ backgroundColor: RENK.turuncu }}>En çok tercih edilen</span>}
            <h2 className="text-xl font-black" style={{ color: RENK.lacivert }}>{p.ad}</h2>
            <p className="text-3xl font-black my-3" style={{ color: RENK.turkuaz }}>{p.fiyat}</p>
            <ul className="text-sm text-gray-600 flex flex-col gap-2 flex-1">
              {p.ozellikler.map((o) => <li key={o} className="flex gap-2"><span style={{ color: RENK.turkuaz }}>✓</span>{o}</li>)}
            </ul>
            <Link href="/ustam/usta-ol" className="mt-6 text-center py-3 rounded-xl font-black text-white" style={{ backgroundColor: p.one ? RENK.turuncu : RENK.lacivert }}>
              {p.id === "ucretsiz" ? "Ücretsiz Başla" : "Başvur"}
            </Link>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-8 max-w-3xl mx-auto flex flex-col gap-1 text-center">
        <p>Premium paketteki ustalar listelerde <b>&quot;Sponsorlu&quot;</b> etiketiyle açıkça işaretlenir.</p>
        <p>Paket ödemeleri şimdilik başvuru sonrası ekibimizle görüşülerek yapılır; site üzerinden hizmet bedeli tahsil edilmez.</p>
      </div>
    </main>
  );
}
