import "server-only";
import { db } from "./db";
import { EDITOR_RUMUZ, type AyKazanani, type Lider, type Paylasim, type Yorum } from "../okur";

const PAYLASIM_ALANLARI = "*, uye:meydan_uyeler!meydan_paylasimlar_uye_id_fkey(rumuz, cinsiyet)";
const tekil = <T,>(x: T | T[] | null | undefined): T | null => (Array.isArray(x) ? x[0] ?? null : x ?? null);
const duzelt = (p: Paylasim): Paylasim => ({ ...p, uye: tekil(p.uye as never) });

// Türkiye saati sabit UTC+3 (2016'dan beri yaz saati yok). Ay sınırları buna göre hesaplanır.
const TR_SAAT = 3 * 3600 * 1000;
export function ayBilgisi(fark = 0) {
  const simdi = new Date(Date.now() + TR_SAAT);
  const y = simdi.getUTCFullYear(), m = simdi.getUTCMonth() + fark;
  const bas = new Date(Date.UTC(y, m, 1) - TR_SAAT);
  const bit = new Date(Date.UTC(y, m + 1, 1) - TR_SAAT);
  const t = new Date(Date.UTC(y, m, 1));
  const iso = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-01`;
  return { bas, bit, iso, kalanGun: Math.ceil((bit.getTime() - Date.now()) / 86400000) };
}

type Liste = { kategori?: string; mahalle?: string; sirala?: "yeni" | "gundem" | "cozulen"; limit?: number; ara?: string; uyeId?: number; sayfa?: number };

export async function paylasimlar(o: Liste = {}): Promise<Paylasim[]> {
  const limit = o.limit ?? 30;
  let q = db.from("meydan_paylasimlar").select(PAYLASIM_ALANLARI).eq("durum", "yayinda");
  if (o.kategori) q = q.eq("kategori", o.kategori);
  if (o.mahalle) q = q.eq("mahalle", o.mahalle);
  if (o.uyeId) q = q.eq("uye_id", o.uyeId);
  if (o.sirala === "cozulen") q = q.eq("cozum", "cozuldu");
  if (o.ara) {
    // PostgREST or() filtresinde boşluklu değer çift tırnak ister; tırnak/virgül/parantez temizlenir
    const t = o.ara.replace(/[%,()"\\*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
    if (t) q = q.or(["baslik", "icerik", "yer", "isletme_adi"].map((a) => `${a}.ilike."%${t}%"`).join(","));
  }
  if (o.sirala === "gundem") {
    // son 30 günün paylaşımları etkileşim ağırlığına ve tazeliğe göre sıralanır
    const { data } = await q.gte("yayin_at", new Date(Date.now() - 30 * 86400000).toISOString()).order("yayin_at", { ascending: false }).limit(300);
    const skor = (p: Paylasim) => (p.begeni_sayisi + p.yorum_sayisi * 2 + p.faydali_sayisi * 3 + 1) / Math.pow((Date.now() - new Date(p.yayin_at ?? p.created_at).getTime()) / 3600000 + 2, 0.8);
    return ((data ?? []) as Paylasim[]).map(duzelt).sort((a, b) => skor(b) - skor(a)).slice(0, limit);
  }
  const bas = ((o.sayfa ?? 1) - 1) * limit;
  const { data } = await q.order("yayin_at", { ascending: false }).range(bas, bas + limit - 1);
  return ((data ?? []) as Paylasim[]).map(duzelt);
}

export async function paylasimGetir(slug: string): Promise<Paylasim | null> {
  const { data } = await db.from("meydan_paylasimlar").select(PAYLASIM_ALANLARI).eq("slug", slug).maybeSingle();
  return data ? duzelt(data as Paylasim) : null;
}

export async function yorumlar(paylasimId: number): Promise<Yorum[]> {
  const { data } = await db.from("meydan_yorumlar").select("*, uye:meydan_uyeler!meydan_yorumlar_uye_id_fkey(rumuz, cinsiyet)")
    .eq("paylasim_id", paylasimId).eq("durum", "yayinda").order("created_at", { ascending: true }).limit(300);
  return ((data ?? []) as Yorum[]).map((y) => ({ ...y, uye: tekil(y.uye as never) }));
}

export async function etkilesimDurumu(paylasimId: number, uyeId?: number) {
  if (!uyeId) return { begendi: false, faydali: false };
  const [b, f] = await Promise.all([
    db.from("meydan_begeniler").select("uye_id").eq("paylasim_id", paylasimId).eq("uye_id", uyeId).maybeSingle(),
    db.from("meydan_faydali").select("uye_id").eq("paylasim_id", paylasimId).eq("uye_id", uyeId).maybeSingle(),
  ]);
  return { begendi: !!b.data, faydali: !!f.data };
}

export async function liderler(fark = 0, adet = 5): Promise<Lider[]> {
  const { bas, bit } = ayBilgisi(fark);
  const { data, error } = await db.rpc("meydan_ay_puanlari", { p_bas: bas.toISOString(), p_bit: bit.toISOString(), adet: adet + 1 });
  if (error || !data) return [];
  return (data as Lider[]).filter((l) => l.rumuz !== EDITOR_RUMUZ).slice(0, adet)
    .map((l) => ({ ...l, puan: Number(l.puan), begeni: Number(l.begeni) }));
}

// Geçmiş ayların kazananları. Biten ayın kazananı ilk kez istendiğinde hesaplanıp kalıcı yazılır
// (her ayın 1'inde liste kendiliğinden sıfırlanır: puanlar yalnız o ayın etkileşimlerinden hesaplanır).
export async function ayKazananlari(adet = 12): Promise<AyKazanani[]> {
  const onceki = ayBilgisi(-1);
  const { data: var_mi } = await db.from("meydan_ay_kazananlari").select("ay").eq("ay", onceki.iso).maybeSingle();
  if (!var_mi) {
    const [k] = await liderler(-1, 1);
    if (k && k.puan > 0) {
      await db.from("meydan_ay_kazananlari").upsert([{ ay: onceki.iso, uye_id: k.uye_id, rumuz: k.rumuz, cinsiyet: k.cinsiyet, puan: k.puan }], { onConflict: "ay", ignoreDuplicates: true });
    }
  }
  const { data } = await db.from("meydan_ay_kazananlari").select("ay, rumuz, cinsiyet, puan").order("ay", { ascending: false }).limit(adet);
  return ((data ?? []) as AyKazanani[]).map((k) => ({ ...k, puan: Number(k.puan) }));
}

export async function uyeGetir(rumuz: string) {
  const { data } = await db.from("meydan_uyeler").select("id, rumuz, cinsiyet, mahalle, created_at, engelli")
    .eq("rumuz_kucuk", rumuz.toLocaleLowerCase("tr-TR")).maybeSingle();
  return data && !data.engelli ? data as { id: number; rumuz: string; cinsiyet: string; mahalle: string; created_at: string } : null;
}

export async function genelSayilar() {
  const [p, u, c] = await Promise.all([
    db.from("meydan_paylasimlar").select("*", { count: "exact", head: true }).eq("durum", "yayinda"),
    db.from("meydan_uyeler").select("*", { count: "exact", head: true }).neq("rumuz", EDITOR_RUMUZ),
    db.from("meydan_paylasimlar").select("*", { count: "exact", head: true }).eq("durum", "yayinda").eq("cozum", "cozuldu"),
  ]);
  return { paylasim: p.count ?? 0, uye: u.count ?? 0, cozulen: c.count ?? 0 };
}

export async function kategoriSayilari(): Promise<Record<string, number>> {
  const { data } = await db.from("meydan_paylasimlar").select("kategori").eq("durum", "yayinda").limit(5000);
  const s: Record<string, number> = {};
  for (const r of data ?? []) s[r.kategori] = (s[r.kategori] ?? 0) + 1;
  return s;
}

// Az etkileşimli kısa paylaşımlar Google'a kapalı kalır (ince içerik dizine girmez)
export const dizinlenebilir = (p: Paylasim) =>
  p.durum === "yayinda" && (p.icerik.length >= 280 || p.yorum_sayisi + p.begeni_sayisi + p.faydali_sayisi >= 3 || p.fotolar.length > 0 && p.icerik.length >= 120);
