import { supabaseAdmin } from "./supabase";
import type { Isletme } from "./firmalar";

// Yayındaki (onaylı) işletmeler; kategoriye göre sıralı. Yalnızca sunucuda çalışır.
export async function onayliIsletmeler(kategori?: string): Promise<Isletme[]> {
  let q = supabaseAdmin.from("isletmeler").select("*").eq("durum", "onayli");
  if (kategori) q = q.eq("kategori", kategori);
  const { data, error } = await q.order("ad", { ascending: true });
  if (error || !data) return [];
  return data as Isletme[];
}
