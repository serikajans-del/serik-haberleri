import type { Metadata } from "next";
import { db } from "@/lib/okur-sunucu/db";
import { imza, imzaDogru } from "@/lib/okur-sunucu/onay";
import { kabaDilVar, kisiselVeriVar } from "@/lib/okur-sunucu/denetim";
import { SITE_URL, kategoriBul } from "@/lib/okur";

// Telefondaki ntfy bildiriminden açılan tek paylaşımlık onay sayfası (imzalı bağlantı, giriş gerekmez).
export const metadata: Metadata = { title: "Paylaşım onayı", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SONUC: Record<string, [string, string]> = {
  yayinda: ["✅ Yayına alındı", "bg-emerald-50 text-emerald-800 border-emerald-200"],
  reddedildi: ["✖ Reddedildi", "bg-slate-100 text-slate-700 border-slate-300"],
};

function Dugme({ id, karar, yazi, renk }: { id: number; karar: "yayinda" | "reddedildi"; yazi: string; renk: string }) {
  return (
    <form action="/api/okur/onay" method="post" className="flex-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="karar" value={karar} />
      <input type="hidden" name="t" value={imza(id, karar)} />
      <button className={`w-full rounded-2xl py-4 text-lg font-extrabold text-white ${renk}`}>{yazi}</button>
    </form>
  );
}

export default async function OnaySayfasi({ searchParams }: { searchParams: Promise<{ id?: string; t?: string; sonuc?: string }> }) {
  const s = await searchParams;
  const id = Number(s.id);
  if (!id || !imzaDogru(id, "gor", s.t ?? "")) {
    return <main className="max-w-xl mx-auto p-6"><p className="text-lg font-bold">Geçersiz bağlantı.</p></main>;
  }
  const { data: p } = await db.from("meydan_paylasimlar")
    .select("id, slug, kategori, baslik, icerik, fotolar, mahalle, yer, isletme_adi, olay_tarihi, olay_saati, durum, created_at, uye:meydan_uyeler!meydan_paylasimlar_uye_id_fkey(rumuz, guvenilir, created_at)")
    .eq("id", id).maybeSingle();
  if (!p) return <main className="max-w-xl mx-auto p-6"><p className="text-lg font-bold">Paylaşım bulunamadı.</p></main>;

  const uye = (Array.isArray(p.uye) ? p.uye[0] : p.uye) as { rumuz: string; guvenilir: boolean; created_at: string } | null;
  const k = kategoriBul(p.kategori);
  const metin = `${p.baslik} ${p.icerik} ${p.isletme_adi ?? ""} ${p.yer ?? ""}`;
  const uyari = [kabaDilVar(metin) && "küfür / kaba dil", kisiselVeriVar(metin) && "telefon ya da kişisel bilgi"].filter(Boolean);
  const sonuc = s.sonuc && SONUC[s.sonuc];
  const fotolar: string[] = p.fotolar ?? [];

  return (
    <main className="max-w-xl mx-auto p-4 pb-32">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Okur Haberleri · onay</p>
      {sonuc && <p className={`mt-3 rounded-xl border px-4 py-3 font-bold ${sonuc[1]}`}>{sonuc[0]}</p>}
      {s.sonuc?.startsWith("zaten-") && <p className="mt-3 rounded-xl border px-4 py-3 font-bold bg-amber-50 border-amber-200 text-amber-800">Bu paylaşım zaten karara bağlanmış.</p>}

      <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full px-3 py-1 font-bold" style={{ background: k?.zemin, color: k?.renk }}>{k?.ikon} {k?.ad ?? p.kategori}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">📍 {p.mahalle}{p.yer ? ` · ${p.yer}` : ""}</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold leading-snug">{p.baslik}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {uye?.rumuz ?? "?"}{uye?.guvenilir ? " · güvenilir üye" : ""} · {new Date(p.created_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
          {p.olay_tarihi ? ` · olay: ${p.olay_tarihi} ${p.olay_saati ?? ""}` : ""}
        </p>
        {p.isletme_adi && <p className="mt-2 text-sm font-semibold">İşletme: {p.isletme_adi}</p>}
        {uyari.length > 0 && <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-800">⚠️ Otomatik denetim: {uyari.join(", ")} olabilir.</p>}
        <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-800">{p.icerik}</p>
        {fotolar.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {fotolar.map((f) => <a key={f} href={f} target="_blank"><img src={f} alt="" className="w-full rounded-xl object-cover aspect-square" /></a>)}
          </div>
        )}
      </article>

      <p className="mt-4 text-sm text-slate-600">Durum: <b>{p.durum}</b>{p.durum === "yayinda" && <> · <a className="font-bold text-[#D90000] underline" href={`${SITE_URL}/okur/konu/${p.slug}`}>yayında gör</a></>}</p>

      {p.durum === "beklemede" && (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
          <div className="max-w-xl mx-auto flex gap-3">
            <Dugme id={id} karar="reddedildi" yazi="Reddet" renk="bg-slate-600" />
            <Dugme id={id} karar="yayinda" yazi="Onayla" renk="bg-emerald-600" />
          </div>
        </div>
      )}
    </main>
  );
}
