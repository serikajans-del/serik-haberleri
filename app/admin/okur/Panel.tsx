"use client";
import { useCallback, useEffect, useState } from "react";
import { COZUM, KATEGORILER, SIKAYET_TURU, kategoriBul, tarihYaz } from "@/lib/okur";

type U = { id: number; rumuz: string; cinsiyet: string; guvenilir: boolean; engelli: boolean; kayit_ip: string; created_at: string; mahalle?: string };
type P = { id: number; slug: string; kategori: string; baslik: string; icerik: string; fotolar: string[]; mahalle: string; yer: string; olay_tarihi: string | null; olay_saati: string;
  isletme_adi: string; durum: string; cozum: string; red_nedeni: string; begeni_sayisi: number; yorum_sayisi: number; ip: string; created_at: string; uye: U };
type Y = { id: number; icerik: string; durum: string; ip: string; created_at: string; uye: U; paylasim: { slug: string; baslik: string } };
type B = { id: number; neden: string; aciklama: string; ip: string; created_at: string; paylasim_id: number | null; yorum_id: number | null;
  paylasim: { slug: string; baslik: string; durum: string } | null; yorum: { icerik: string; durum: string } | null };
type Veri = { bekleyen: P[]; yayinda: P[]; yorumlar: Y[]; bildirimler: B[]; uyeler: U[]; hata: string | null };

const RED = ["Hakaret / kaba dil", "Kanıtsız suçlama", "Kişisel bilgi veya yüz/plaka içeriyor", "Reklam / spam", "Serik ile ilgili değil", "Yetersiz açıklama"];

export default function Panel() {
  const [sifre, setSifre] = useState("");
  const [girdi, setGirdi] = useState("");
  const [veri, setVeri] = useState<Veri | null>(null);
  const [hata, setHata] = useState("");
  const [sekme, setSekme] = useState<"bekleyen" | "bildirim" | "yayinda" | "yorum" | "uye">("bekleyen");

  const yukle = useCallback(async (s: string) => {
    const r = await fetch("/api/okur/yonetim", { headers: { "x-admin-password": s } });
    if (r.status === 401) { setHata("Şifre yanlış."); localStorage.removeItem("admin_password"); setSifre(""); return; }
    const j = await r.json();
    if (j.hata) setHata(`Veritabanı hatası: ${j.hata} (supabase/meydan.sql çalıştırıldı mı?)`);
    setVeri(j);
  }, []);

  useEffect(() => {
    const s = localStorage.getItem("admin_password");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s) { setSifre(s); yukle(s); }
  }, [yukle]);

  async function islem(govde: Record<string, unknown>) {
    await fetch("/api/okur/yonetim", { method: "PATCH", headers: { "x-admin-password": sifre, "Content-Type": "application/json" }, body: JSON.stringify(govde) });
    yukle(sifre);
  }

  if (!sifre) {
    return (
      <form className="max-w-sm mx-auto px-4 py-20 grid gap-3" onSubmit={(e) => { e.preventDefault(); localStorage.setItem("admin_password", girdi); setSifre(girdi); setHata(""); yukle(girdi); }}>
        <h1 className="text-2xl font-extrabold">Okur Haberleri yönetimi</h1>
        <input type="password" className="girdi" value={girdi} onChange={(e) => setGirdi(e.target.value)} placeholder="Yönetici şifresi" autoFocus />
        {hata && <p className="text-sm text-red-600">{hata}</p>}
        <button className="dugme-ana">Giriş</button>
      </form>
    );
  }
  if (!veri) return <p className="max-w-6xl mx-auto px-4 py-10 text-soluk">Yükleniyor…</p>;

  const yeniBildirim = veri.bildirimler.length;
  const bekleyenYorum = veri.yorumlar.filter((y) => y.durum === "beklemede").length;
  const SEKMELER = [
    ["bekleyen", `Onay bekleyen (${veri.bekleyen.length})`], ["bildirim", `Bildirimler (${yeniBildirim})`],
    ["yayinda", "Paylaşımlar"], ["yorum", `Yorumlar${bekleyenYorum ? ` (${bekleyenYorum} bekliyor)` : ""}`], ["uye", `Üyeler (${veri.uyeler.length})`],
  ] as const;

  const UyeSatiri = ({ u }: { u: U }) => (
    <span className="text-xs text-soluk">
      <b className="text-murekkep">{u.rumuz}</b>{u.guvenilir ? " ✓güvenilir" : " · yeni"}{u.engelli ? " · ENGELLİ" : ""} · IP {u.kayit_ip || "-"}
    </span>
  );

  const Paylasim = ({ p, onayda }: { p: P; onayda?: boolean }) => (
    <div className="kart p-4 grid gap-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="cip !py-0.5" style={{ background: kategoriBul(p.kategori)?.zemin, color: kategoriBul(p.kategori)?.renk }}>{kategoriBul(p.kategori)?.ad}</span>
        <span className="text-soluk">{tarihYaz(p.created_at, true)} · {p.mahalle}{p.yer ? `, ${p.yer}` : ""} · IP {p.ip || "-"}</span>
        {!onayda && <span className={`cip !py-0.5 ${p.durum === "yayinda" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{p.durum}</span>}
      </div>
      <a href={`/okur/konu/${p.slug}`} target="_blank" className="font-bold hover:underline">{p.baslik}</a>
      {p.isletme_adi && <p className="text-sm text-ana font-semibold">⭐ {p.isletme_adi}</p>}
      <p className="text-sm text-slate-700 whitespace-pre-line line-clamp-6">{p.icerik}</p>
      {p.fotolar.length > 0 && (
        <div className="flex gap-2">{p.fotolar.map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <a key={f} href={f} target="_blank"><img src={f} alt="" className="w-28 h-20 object-cover rounded-lg" /></a>))}</div>
      )}
      {p.uye && <UyeSatiri u={p.uye} />}
      <div className="flex flex-wrap gap-2 items-center pt-1">
        {p.durum !== "yayinda" && <button onClick={() => islem({ tur: "paylasim", id: p.id, durum: "yayinda" })} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold">Onayla, yayına al</button>}
        <select defaultValue="" onChange={(e) => e.target.value && islem({ tur: "paylasim", id: p.id, durum: p.durum === "yayinda" ? "kaldirildi" : "reddedildi", red_nedeni: e.target.value })} className="text-xs border border-cizgi rounded-lg px-2 py-1.5">
          <option value="">{p.durum === "yayinda" ? "Yayından kaldır…" : "Reddet…"}</option>
          {RED.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {SIKAYET_TURU.includes(p.kategori) && p.durum === "yayinda" && (
          <select value={p.cozum} onChange={(e) => islem({ tur: "paylasim", id: p.id, cozum: e.target.value })} className="text-xs border border-cizgi rounded-lg px-2 py-1.5">
            {Object.entries(COZUM).map(([k, v]) => <option key={k} value={k}>Durum: {v.ad}</option>)}
          </select>
        )}
        {p.uye && !p.uye.guvenilir && <button onClick={() => islem({ tur: "uye", id: p.uye.id, guvenilir: true })} className="px-3 py-1.5 rounded-lg bg-white border border-cizgi text-xs font-bold">Üyeyi güvenilir yap</button>}
        {p.uye && !p.uye.engelli && <button onClick={() => confirm(`${p.uye.rumuz} engellensin mi?`) && islem({ tur: "uye", id: p.uye.id, engelli: true })} className="ml-auto text-xs text-red-600">Üyeyi engelle</button>}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Okur Haberleri yönetimi</h1>
        <button onClick={() => { localStorage.removeItem("admin_password"); setSifre(""); }} className="text-sm text-soluk">Çıkış</button>
      </div>
      {hata && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{hata}</p>}
      <div className="flex gap-2 overflow-x-auto kaydir-gizli mb-5">
        {SEKMELER.map(([k, a]) => (
          <button key={k} onClick={() => setSekme(k)} className={`cip border !py-2 !px-4 !text-sm ${sekme === k ? "bg-murekkep text-white border-murekkep" : "bg-white border-cizgi"}`}>{a}</button>
        ))}
      </div>

      {sekme === "bekleyen" && (veri.bekleyen.length === 0 ? <p className="kart p-8 text-center text-soluk">Onay bekleyen paylaşım yok. 🎉</p>
        : <div className="grid gap-3">{veri.bekleyen.map((p) => <Paylasim key={p.id} p={p} onayda />)}</div>)}

      {sekme === "yayinda" && <div className="grid gap-3">{veri.yayinda.map((p) => <Paylasim key={p.id} p={p} />)}</div>}

      {sekme === "bildirim" && (veri.bildirimler.length === 0 ? <p className="kart p-8 text-center text-soluk">Yeni bildirim yok.</p> : (
        <div className="grid gap-3">
          {veri.bildirimler.map((b) => (
            <div key={b.id} className="kart p-4 grid gap-1.5 text-sm">
              <div className="flex flex-wrap gap-2 text-xs text-soluk"><b className="text-red-700">{b.neden}</b> · {tarihYaz(b.created_at, true)} · IP {b.ip || "-"}</div>
              {b.aciklama && <p className="italic">“{b.aciklama}”</p>}
              {b.paylasim && <a href={`/okur/konu/${b.paylasim.slug}`} target="_blank" className="font-semibold underline">Paylaşım: {b.paylasim.baslik} ({b.paylasim.durum})</a>}
              {b.yorum && <p className="rounded-lg bg-zemin px-3 py-2">Yorum ({b.yorum.durum}): {b.yorum.icerik}</p>}
              <div className="flex flex-wrap gap-2 mt-1">
                {b.paylasim_id && <button onClick={() => islem({ tur: "paylasim", id: b.paylasim_id, durum: "kaldirildi", red_nedeni: b.neden })} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">Paylaşımı kaldır</button>}
                {b.paylasim_id && <button onClick={() => islem({ tur: "paylasim", id: b.paylasim_id, durum: "yayinda" })} className="px-3 py-1.5 rounded-lg bg-white border border-cizgi text-xs font-bold">Uygun, yayında kalsın</button>}
                {b.yorum_id && <button onClick={() => islem({ tur: "yorum", id: b.yorum_id, durum: "kaldirildi" })} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">Yorumu kaldır</button>}
                {b.yorum_id && <button onClick={() => islem({ tur: "yorum", id: b.yorum_id, durum: "yayinda" })} className="px-3 py-1.5 rounded-lg bg-white border border-cizgi text-xs font-bold">Yorum uygun</button>}
                <button onClick={() => islem({ tur: "bildirim", id: b.id })} className="text-xs text-soluk ml-auto">Kapat</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {sekme === "yorum" && (
        <div className="grid gap-2">
          {veri.yorumlar.map((y) => (
            <div key={y.id} className={`kart p-3.5 text-sm grid gap-1 ${y.durum === "beklemede" ? "border-amber-300 bg-amber-50/50" : ""}`}>
              <div className="text-xs text-soluk"><a href={`/okur/konu/${y.paylasim?.slug}#yorum-${y.id}`} target="_blank" className="underline">{y.paylasim?.baslik}</a> · {tarihYaz(y.created_at, true)} · {y.durum}</div>
              <p className="whitespace-pre-line">{y.icerik}</p>
              {y.uye && <UyeSatiri u={y.uye} />}
              <div className="flex gap-2">
                {y.durum !== "yayinda" && <button onClick={() => islem({ tur: "yorum", id: y.id, durum: "yayinda" })} className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-bold">Yayınla</button>}
                {y.durum !== "kaldirildi" && <button onClick={() => islem({ tur: "yorum", id: y.id, durum: "kaldirildi" })} className="px-3 py-1 rounded-lg bg-white border border-cizgi text-xs font-bold">Kaldır</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {sekme === "uye" && (
        <div className="kart overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zemin text-xs text-soluk"><tr><th className="text-left p-3">Rumuz</th><th className="text-left">Kayıt</th><th className="text-left">IP</th><th>Güvenilir</th><th>Engelli</th></tr></thead>
            <tbody className="divide-y divide-cizgi">
              {veri.uyeler.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 font-semibold">{u.rumuz}<span className="text-soluk font-normal"> {u.cinsiyet !== "belirtilmedi" ? `· ${u.cinsiyet}` : ""}{u.mahalle ? ` · ${u.mahalle}` : ""}</span></td>
                  <td className="text-xs text-soluk">{tarihYaz(u.created_at, true)}</td>
                  <td className="text-xs text-soluk">{u.kayit_ip || "-"}</td>
                  <td className="text-center"><input type="checkbox" checked={u.guvenilir} onChange={(e) => islem({ tur: "uye", id: u.id, guvenilir: e.target.checked })} /></td>
                  <td className="text-center"><input type="checkbox" checked={u.engelli} onChange={(e) => islem({ tur: "uye", id: u.id, engelli: e.target.checked })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-soluk mt-8">Kategoriler: {KATEGORILER.map((k) => k.ad).join(", ")}</p>
    </div>
  );
}
