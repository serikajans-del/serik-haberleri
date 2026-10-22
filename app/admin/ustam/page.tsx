"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PAKETLER, RENK, ZAMANLAR, kategoriBul, telTemiz, type Talep, type Usta } from "@/lib/ustam";

const TALEP_DURUM: Record<string, [string, string]> = {
  yeni: ["Yeni", "#dc2626"], iletildi: ["Ustalara iletildi", "#d97706"], teklif: ["Teklif verildi", "#2563eb"],
  tamamlandi: ["Tamamlandı", "#16a34a"], iptal: ["İptal", "#6b7280"],
};
const USTA_DURUM: Record<string, [string, string]> = { beklemede: ["Beklemede", "#d97706"], onayli: ["Yayında", "#16a34a"], reddedildi: ["Reddedildi", "#dc2626"] };

// 05xx… / +90 5xx… → wa.me için 905xxxxxxxxx
const waNo = (t: string) => "90" + telTemiz(t).replace(/^\+?90/, "").replace(/^0/, "");
const tarihYaz = (s?: string) => s ? new Date(s).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

export default function AdminUstamPage() {
  const [sekme, setSekme] = useState<"talepler" | "ustalar">("talepler");
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [ustalar, setUstalar] = useState<Usta[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [ustaFiltre, setUstaFiltre] = useState<"odeme" | "onayli" | "hepsi">("hepsi");
  const router = useRouter();
  const sifre = typeof window !== "undefined" ? localStorage.getItem("admin_password") || "" : "";
  const bas = { "x-admin-password": sifre, "Content-Type": "application/json" };

  useEffect(() => {
    if (!sifre) { router.push("/admin"); return; }
    (async () => {
      const [t, u] = await Promise.all([fetch("/api/ustam/talep", { headers: bas }), fetch("/api/ustam/usta", { headers: bas })]);
      if (t.ok) setTalepler(await t.json()); else setHata("Talepler alınamadı (tablolar kurulmamış olabilir).");
      if (u.ok) setUstalar(await u.json());
      setYukleniyor(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function talepGuncelle(id: number, alan: Partial<Talep>) {
    await fetch("/api/ustam/talep", { method: "PATCH", headers: bas, body: JSON.stringify({ id, ...alan }) });
    setTalepler((p) => p.map((t) => t.id === id ? { ...t, ...alan } : t));
  }
  async function ustaGuncelle(id: number, alan: Partial<Usta>) {
    await fetch("/api/ustam/usta", { method: "PATCH", headers: bas, body: JSON.stringify({ id, ...alan }) });
    setUstalar((p) => p.map((u) => u.id === id ? { ...u, ...alan } : u));
  }
  async function ustaSil(id: number) {
    if (!confirm("Bu usta kaydı kalıcı silinsin mi? (Yayından kaldırmak için 'Reddet' yeterli)")) return;
    await fetch("/api/ustam/usta", { method: "DELETE", headers: bas, body: JSON.stringify({ id }) });
    setUstalar((p) => p.filter((u) => u.id !== id));
  }

  const uygunUstalar = (t: Talep) => ustalar
    .filter((u) => u.durum === "onayli" && u.kategoriler.includes(t.kategori))
    .map((u) => ({ u, puan: (u.slug === t.istenen_usta ? 100 : 0) + (u.mahalleler.includes(t.mahalle) ? 10 : 0) + (u.dogrulandi ? 3 : 0) + (u.paket === "premium" ? 2 : u.paket === "profesyonel" ? 1 : 0) }))
    .sort((a, b) => b.puan - a.puan).slice(0, 6);

  const waMetni = (t: Talep) => {
    const z = t.zaman === "tarih" && t.tarih ? t.tarih.split("-").reverse().join(".") : ZAMANLAR.find((x) => x.id === t.zaman)?.ad;
    return encodeURIComponent(`Merhaba, Serik Ustam'dan yeni iş talebi (${t.kod}):\n• Hizmet: ${kategoriBul(t.kategori)?.ad}\n• Mahalle: ${t.mahalle}\n• Zaman: ${z}\n• İş: ${t.aciklama}\n\nİlgileniyorsanız fiyat teklifinizi bu mesaja yanıt olarak yazın.`);
  };

  const yeniSayi = talepler.filter((t) => t.durum === "yeni").length;
  const odemeBekliyor = (u: Usta) => u.istenen_paket && u.istenen_paket !== "ucretsiz" && u.istenen_paket !== u.paket;
  const bekleyenUsta = ustalar.filter(odemeBekliyor).length;
  const istatistik = [
    ["Toplam talep", talepler.length], ["Yeni talep", yeniSayi],
    ["Yayındaki usta", ustalar.filter((u) => u.durum === "onayli").length], ["Ödeme bekleyen", bekleyenUsta],
    ["Doğrulanmış usta", ustalar.filter((u) => u.dogrulandi).length], ["Ücretli paket", ustalar.filter((u) => u.paket !== "ucretsiz").length],
  ] as const;
  const enCokTalep = Object.entries(talepler.reduce<Record<string, number>>((a, t) => ({ ...a, [t.kategori]: (a[t.kategori] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const gosterilenUsta = ustalar.filter((u) => ustaFiltre === "hepsi" || (ustaFiltre === "odeme" ? odemeBekliyor(u) : u.durum === ustaFiltre));

  return (
    <div className="min-h-screen" style={{ backgroundColor: RENK.zemin }}>
      <div style={{ backgroundColor: RENK.lacivert }} className="px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/ustam" className="text-white font-black text-lg">SERİK <span style={{ color: RENK.turuncu }}>USTAM</span></Link>
            <span className="text-white/60 text-sm">/ Yönetim</span>
          </div>
          <Link href="/admin/dashboard" className="bg-white text-sm font-bold px-3 py-1 rounded" style={{ color: RENK.lacivert }}>Panel</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {istatistik.map(([a, s]) => <div key={a} className="bg-white rounded-xl p-3"><p className="text-2xl font-black" style={{ color: RENK.lacivert }}>{s}</p><p className="text-xs text-gray-500">{a}</p></div>)}
        </div>
        {enCokTalep.length > 0 && <p className="text-xs text-gray-500 mb-4">En çok talep: {enCokTalep.map(([k, n]) => `${kategoriBul(k)?.ad} (${n})`).join(" · ")}</p>}

        <div className="flex gap-2 mb-5">
          {(["talepler", "ustalar"] as const).map((s) => (
            <button key={s} onClick={() => setSekme(s)} className="px-4 py-2 text-sm font-bold rounded-lg"
              style={sekme === s ? { backgroundColor: RENK.turkuaz, color: "#fff" } : { backgroundColor: "#fff", color: "#4b5563" }}>
              {s === "talepler" ? `İş Talepleri${yeniSayi ? ` (${yeniSayi} yeni)` : ""}` : `Ustalar${bekleyenUsta ? ` (${bekleyenUsta} ödeme bekliyor)` : ""}`}
            </button>
          ))}
        </div>

        {hata && <p className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{hata}</p>}
        {yukleniyor ? <p className="text-gray-500">Yükleniyor…</p> : sekme === "talepler" ? (
          talepler.length === 0 ? <p className="bg-white rounded-xl p-8 text-center text-gray-500">Henüz talep yok.</p> : (
            <div className="flex flex-col gap-3">
              {talepler.map((t) => {
                const [dEt, dRenk] = TALEP_DURUM[t.durum] ?? [t.durum, "#6b7280"];
                return (
                  <div key={t.id} className="bg-white rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-gray-400">{t.kod}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: dRenk }}>{dEt}</span>
                      <span className="font-black" style={{ color: RENK.lacivert }}>{kategoriBul(t.kategori)?.ikon} {kategoriBul(t.kategori)?.ad}</span>
                      <span className="text-sm text-gray-500">· {t.mahalle} · {t.zaman === "tarih" && t.tarih ? t.tarih.split("-").reverse().join(".") : ZAMANLAR.find((z) => z.id === t.zaman)?.ad}</span>
                      <span className="text-xs text-gray-400 ml-auto">{tarihYaz(t.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-line mb-2">{t.aciklama}</p>
                    {t.fotolar?.length > 0 && <div className="flex gap-2 mb-2">{t.fotolar.map((f) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <a key={f} href={f} target="_blank" rel="noopener"><img src={f} alt="" className="w-16 h-16 object-cover rounded-lg" /></a>))}</div>}
                    <p className="text-sm mb-3"><b>{t.ad}</b> · <a href={`tel:${telTemiz(t.telefon)}`} className="underline">{t.telefon}</a>
                      {" · "}<a href={`https://wa.me/${waNo(t.telefon)}`} target="_blank" rel="noopener" className="underline text-green-700">WhatsApp</a></p>

                    <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: RENK.zemin }}>
                      <p className="text-xs font-bold text-gray-600 mb-2">Uygun ustalar (talebi WhatsApp ile iletmek için tıkla, en fazla 3):</p>
                      <div className="flex flex-wrap gap-2">
                        {uygunUstalar(t).length ? uygunUstalar(t).map(({ u }) => (
                          <a key={u.id} href={`https://wa.me/${waNo(u.whatsapp || u.telefon)}?text=${waMetni(t)}`} target="_blank" rel="noopener"
                            onClick={() => t.durum === "yeni" && talepGuncelle(t.id, { durum: "iletildi" })}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-green-500">
                            {u.slug === t.istenen_usta && "⭐ "}{u.ad}{u.mahalleler.includes(t.mahalle) ? " · bölgede" : ""}{u.dogrulandi ? " ✓" : ""}
                          </a>)) : <span className="text-xs text-gray-500">Bu kategoride yayında usta yok — kendi rehberinden ara.</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <select value={t.durum} onChange={(e) => talepGuncelle(t.id, { durum: e.target.value })} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5">
                        {Object.entries(TALEP_DURUM).map(([k, [a]]) => <option key={k} value={k}>{a}</option>)}
                      </select>
                      <input defaultValue={t.yonetici_notu} placeholder="Not (teklifler, kim aldı…)" onBlur={(e) => e.target.value !== t.yonetici_notu && talepGuncelle(t.id, { yonetici_notu: e.target.value })}
                        className="flex-1 min-w-48 text-sm border border-gray-200 rounded-lg px-2 py-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <>
            <div className="flex gap-2 mb-3">
              {(["hepsi", "odeme", "onayli"] as const).map((d) => (
                <button key={d} onClick={() => setUstaFiltre(d)} className="px-3 py-1.5 text-xs font-bold rounded-lg"
                  style={ustaFiltre === d ? { backgroundColor: RENK.lacivert, color: "#fff" } : { backgroundColor: "#fff", color: "#4b5563" }}>
                  {d === "odeme" ? `Ödeme bekleyen${bekleyenUsta ? ` (${bekleyenUsta})` : ""}` : d === "onayli" ? "Yayında" : "Hepsi"}
                </button>
              ))}
            </div>
            {gosterilenUsta.length === 0 ? <p className="bg-white rounded-xl p-8 text-center text-gray-500">Kayıt yok.</p> : (
              <div className="flex flex-col gap-3">
                {gosterilenUsta.map((u) => {
                  const [dEt, dRenk] = USTA_DURUM[u.durum];
                  return (
                    <div key={u.id} className="bg-white rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {u.foto ? <img src={u.foto} alt="" className="w-20 h-20 rounded-lg object-cover" /> : <div className="w-20 h-20 rounded-lg bg-gray-100" />}
                      <div className="flex-1 min-w-0 text-sm">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: dRenk }}>{dEt}</span>
                          {u.durum === "onayli" ? <Link href={`/ustam/usta/${u.slug}`} target="_blank" className="font-black underline" style={{ color: RENK.lacivert }}>{u.ad}</Link>
                            : <span className="font-black" style={{ color: RENK.lacivert }}>{u.ad}</span>}
                          <span className="text-xs text-gray-400">{tarihYaz(u.created_at)}</span>
                        </div>
                        {odemeBekliyor(u) && (
                          <div className="flex flex-wrap items-center gap-2 rounded-lg p-2 mb-2" style={{ backgroundColor: "#FFF1E6" }}>
                            <span className="text-xs font-black" style={{ color: "#9A4A0E" }}>💰 Ödeme bekliyor: {PAKETLER.find((p) => p.id === u.istenen_paket)?.ad} ({PAKETLER.find((p) => p.id === u.istenen_paket)?.fiyat})</span>
                            <button onClick={() => ustaGuncelle(u.id, { paket: u.istenen_paket })} className="px-2.5 py-1 text-xs font-bold rounded bg-green-600 text-white">Ödeme alındı, paketi aç</button>
                            <button onClick={() => ustaGuncelle(u.id, { istenen_paket: u.paket })} className="px-2.5 py-1 text-xs font-bold rounded bg-white text-gray-600">Vazgeçti</button>
                          </div>
                        )}
                        <p className="text-gray-600">{u.kategoriler.map((k) => kategoriBul(k)?.ad).join(", ")} · {u.mahalleler.join(", ")}</p>
                        <p className="text-gray-600"><a href={`tel:${telTemiz(u.telefon)}`} className="underline">{u.telefon}</a>{u.whatsapp && ` · WA ${u.whatsapp}`}{u.deneyim_yil ? ` · ${u.deneyim_yil} yıl` : ""}{u.isyeri && ` · ${u.isyeri}`}</p>
                        {u.belge_notu && <p className="text-gray-600"><b>Belge:</b> {u.belge_notu}</p>}
                        {u.hakkinda && <p className="text-gray-500 mt-1 line-clamp-3">{u.hakkinda}</p>}
                        <div className="flex flex-wrap gap-2 mt-3 items-center">
                          {u.durum !== "onayli" && <button onClick={() => ustaGuncelle(u.id, { durum: "onayli" })} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 text-white">Onayla, yayına al</button>}
                          {u.durum !== "reddedildi" && <button onClick={() => ustaGuncelle(u.id, { durum: "reddedildi" })} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-100 text-gray-700">{u.durum === "onayli" ? "Yayından kaldır" : "Reddet"}</button>}
                          <label className="flex items-center gap-1 text-xs font-bold text-gray-700">
                            <input type="checkbox" checked={u.dogrulandi} onChange={(e) => ustaGuncelle(u.id, { dogrulandi: e.target.checked })} /> Doğrulanmış Usta
                          </label>
                          <select value={u.paket} onChange={(e) => ustaGuncelle(u.id, { paket: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1">
                            {PAKETLER.map((p) => <option key={p.id} value={p.id}>{p.ad}</option>)}
                          </select>
                          <button onClick={() => ustaSil(u.id)} className="ml-auto text-xs text-red-600 hover:underline">Sil</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
