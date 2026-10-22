import { supabaseAdmin } from "./supabase";
import { acikUsta, type AcikUsta, type Usta } from "./ustam";

// Yalnızca sunucuda çalışır. Herkese açık sayfalar telefon/belge bilgisi içermeyen AcikUsta döndürür.

export async function onayliUstalar(kategori?: string, mahalle?: string): Promise<AcikUsta[]> {
  let q = supabaseAdmin.from("ustam_ustalar").select("*").eq("durum", "onayli");
  if (kategori) q = q.contains("kategoriler", [kategori]);
  if (mahalle) q = q.contains("mahalleler", [mahalle]);
  const { data, error } = await q.order("dogrulandi", { ascending: false }).order("tamamlanan_is", { ascending: false });
  if (error || !data) return [];
  return (data as Usta[]).map(acikUsta);
}

export async function ustaGetir(slug: string): Promise<AcikUsta | null> {
  const { data, error } = await supabaseAdmin.from("ustam_ustalar").select("*").eq("slug", slug).eq("durum", "onayli").maybeSingle();
  if (error || !data) return null;
  return acikUsta(data as Usta);
}

export async function ustaDegerlendirmeleri(ustaId: number) {
  const { data } = await supabaseAdmin.from("ustam_degerlendirmeler").select("puan, yorum, ad, created_at")
    .eq("usta_id", ustaId).eq("onayli", true).order("created_at", { ascending: false }).limit(30);
  return (data ?? []) as { puan: number; yorum: string; ad: string; created_at: string }[];
}

export async function gorselYukle(dosya: File, onEk: string): Promise<string> {
  if (!dosya || dosya.size === 0 || dosya.size > 6 * 1024 * 1024 || !dosya.type.startsWith("image/")) return "";
  const ext = (dosya.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const yol = `${onEk}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await supabaseAdmin.storage.from("ustam-gorseller").upload(yol, Buffer.from(await dosya.arrayBuffer()), { contentType: dosya.type });
  if (error) return "";
  return supabaseAdmin.storage.from("ustam-gorseller").getPublicUrl(yol).data.publicUrl;
}
