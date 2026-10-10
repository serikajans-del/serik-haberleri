// Yazarı "Serik Haberleri" görünen yayındaki haberlerin yazarını gerçek isimle değiştirir. Kullanım: node --env-file=.env.local scripts/yazar-guncelle.mjs "Ad Soyad"
import { createClient } from "@supabase/supabase-js";
const ad = process.argv[2];
if (!ad) { console.error("Kullanım: yazar-guncelle.mjs \"Ad Soyad\""); process.exit(1); }
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await s.from("haberler").update({ author: ad }).eq("author", "Serik Haberleri").gte("published_at", "2026-10-05T00:00:00+03:00").select("id,slug");
if (error) { console.error("Güncellenemedi:", error.message); process.exit(1); }
console.log(`${data.length} haberin yazarı "${ad}" yapıldı:`, data.map((h) => h.id).join(", "));
