// Yayındaki haberi (slug ile bulur) haberler/*.json içeriğiyle günceller.
// Kullanım: node --env-file=.env.local scripts/haber-guncelle.mjs haberler/dosya.json
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const dosya = process.argv[2];
if (!dosya) { console.error("Kullanım: haber-guncelle.mjs <haber.json>"); process.exit(1); }
const { slug, published_at, ...alanlar } = JSON.parse(readFileSync(dosya, "utf8"));
if (alanlar.title.length > 60) console.warn(`Uyarı: başlık ${alanlar.title.length} karakter (60 üstü)`);
if (alanlar.summary.length > 160) console.warn(`Uyarı: özet ${alanlar.summary.length} karakter (160 üstü)`);

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await s.from("haberler").update(alanlar).eq("slug", slug).select("id,slug,updated_at").single();
if (error) { console.error("Güncellenemedi:", error.message); process.exit(1); }
console.log("Güncellendi:", data.id, `${process.env.NEXT_PUBLIC_SITE_URL}/haber/${data.slug}`, data.updated_at);
