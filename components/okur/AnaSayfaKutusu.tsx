import Link from "next/link";
import { gecenZaman, kategoriBul, ozet } from "@/lib/okur";
import { liderler, paylasimlar } from "@/lib/okur-sunucu/veri";

// Haber ana sayfasında "Okurlar Ne Diyor": son okur paylaşımları + ayın ilk 3 lideri
export default async function OkurAnaSayfaKutusu() {
  const [liste, lider] = await Promise.all([paylasimlar({ limit: 4 }).catch(() => []), liderler(0, 3).catch(() => [])]);
  return (
    <section className="mt-12" aria-labelledby="okur-kutu">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <span className="tk-badge">Okur Haberleri</span>
          <h2 id="okur-kutu" className="text-2xl font-black mt-2" style={{ color: "#111827" }}>Serikliler Ne Diyor?</h2>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/okur" className="text-sm font-bold px-3 py-2 rounded-lg border border-gray-200 bg-white hidden sm:inline-block">Tümünü gör</Link>
          <Link href="/okur/paylas" className="text-sm font-bold px-3 py-2 rounded-lg text-white" style={{ backgroundColor: "#d90000" }}>+ Sen de paylaş</Link>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        {liste.length === 0 ? (
          <Link href="/okur/paylas" className="tk-card p-8 text-center block">
            <p className="text-3xl" aria-hidden>📣</p>
            <p className="font-extrabold mt-2" style={{ color: "#111827" }}>Mahallende bir sorun mu var, bir şey mi arıyorsun?</p>
            <p className="text-sm text-gray-500 mt-1">Rumuzunla paylaş; Serikliler yanıtlasın. İlk paylaşımı sen yap.</p>
          </Link>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {liste.map((p) => {
              const k = kategoriBul(p.kategori);
              return (
                <Link key={p.id} href={`/okur/konu/${p.slug}`} className="tk-card p-4 block hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-xs">
                    {k && <span className="font-bold rounded-full px-2 py-0.5" style={{ color: k.renk, background: k.zemin }}>{k.ikon} {k.kisa}</span>}
                    <span className="text-gray-400">{p.mahalle} · {gecenZaman(p.yayin_at ?? p.created_at)}</span>
                  </div>
                  <h3 className="font-extrabold leading-snug mt-2 line-clamp-2" style={{ color: "#111827" }}>{p.baslik}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ozet(p.icerik, 140)}</p>
                  <p className="text-xs text-gray-400 mt-2">{p.uye?.rumuz} · ♥ {p.begeni_sayisi} · 💬 {p.yorum_sayisi}</p>
                </Link>
              );
            })}
          </div>
        )}
        <Link href="/okur/liderler" className="tk-card p-5 block" style={{ background: "linear-gradient(160deg,#fff 60%,#FFF6DD)" }}>
          <p className="font-black" style={{ color: "#111827" }}>🏆 Ayın Liderleri</p>
          <p className="text-xs text-gray-500 mt-0.5">Her ayın 1&apos;inde sıfırlanır</p>
          {lider.length === 0 ? <p className="text-sm text-gray-500 mt-4">Bu ay henüz puan alan yok. Paylaş, listenin başına sen geç.</p> : (
            <ol className="mt-3 grid gap-2">
              {lider.map((l, i) => (
                <li key={l.uye_id} className="flex items-center gap-2 text-sm">
                  <span aria-hidden>{["🥇", "🥈", "🥉"][i]}</span>
                  <b className="flex-1 truncate" style={{ color: "#111827" }}>{l.rumuz}</b>
                  <span className="font-bold tabular-nums">{l.puan.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
                </li>
              ))}
            </ol>
          )}
        </Link>
      </div>
    </section>
  );
}
