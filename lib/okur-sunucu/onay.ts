import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/okur-sunucu/db";
import { SITE_URL } from "@/lib/okur";

// Telefondan (ntfy düğmesi ya da onay sayfası) giriş yapmadan onay: her bağlantı yalnız
// kendi paylaşımı ve kendi kararı için imzalıdır. Anahtar sunucudaki gizli anahtardan türetilir.
export type Karar = "yayinda" | "reddedildi" | "gor";

function anahtar() {
  const k = process.env.OKUR_ONAY_SIRRI || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!k) throw new Error("onay anahtarı yok");
  return k;
}

export function imza(id: number, karar: Karar): string {
  return createHmac("sha256", anahtar()).update(`okur-onay:${id}:${karar}`).digest("base64url").slice(0, 32);
}

export function imzaDogru(id: number, karar: Karar, t: string): boolean {
  const a = Buffer.from(imza(id, karar));
  const b = Buffer.from(String(t || ""));
  return a.length === b.length && timingSafeEqual(a, b);
}

export const onayLinki = (id: number, karar: Karar) =>
  karar === "gor"
    ? `${SITE_URL}/admin/okur/onay?id=${id}&t=${imza(id, "gor")}`
    : `${SITE_URL}/api/okur/onay?id=${id}&karar=${karar}&t=${imza(id, karar)}`;

// Paylaşımın durumunu değiştirir (yönetim paneli ve telefon onayı aynı kuralı kullanır).
export async function paylasimDurumu(id: number, alan: Record<string, unknown>): Promise<void> {
  if (alan.durum === "yayinda") {
    const { data: p } = await db.from("meydan_paylasimlar").select("yayin_at, uye_id").eq("id", id).single();
    if (p && !p.yayin_at) alan.yayin_at = new Date().toISOString();
    await db.from("meydan_paylasimlar").update(alan).eq("id", id);
    // 3 paylaşımı onaylanan üye "güvenilir" rozeti alır
    if (p) {
      const { count } = await db.from("meydan_paylasimlar").select("*", { count: "exact", head: true }).eq("uye_id", p.uye_id).eq("durum", "yayinda");
      if ((count ?? 0) >= 3) await db.from("meydan_uyeler").update({ guvenilir: true }).eq("id", p.uye_id).eq("engelli", false);
    }
  } else {
    await db.from("meydan_paylasimlar").update(alan).eq("id", id);
  }
  if (alan.durum) await db.from("meydan_bildirimler").update({ durum: "incelendi" }).eq("paylasim_id", id);
}
