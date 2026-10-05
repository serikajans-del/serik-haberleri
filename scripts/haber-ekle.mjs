// Hazırlanan haberi (haberler/*.json) veritabanına ekler.
// Kullanım: node --env-file=.env.local scripts/haber-ekle.mjs haberler/dosya.json
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const dosya = process.argv[2];
if (!dosya) { console.error("Kullanım: haber-ekle.mjs <haber.json>"); process.exit(1); }
const haber = JSON.parse(readFileSync(dosya, "utf8"));
if (haber.title.length > 60) console.warn(`Uyarı: başlık ${haber.title.length} karakter (60 üstü)`);
if (haber.summary.length > 160) console.warn(`Uyarı: özet ${haber.summary.length} karakter (160 üstü)`);

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await s
  .from("haberler")
  .insert([{ ...haber, published_at: haber.published_at || new Date().toISOString() }])
  .select("id,slug,published_at")
  .single();
if (error) { console.error("Eklenemedi:", error.message); process.exit(1); }
console.log("Eklendi:", data.id, `${process.env.NEXT_PUBLIC_SITE_URL}/haber/${data.slug}`, data.published_at);
