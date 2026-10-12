// serikhaberleri.com: haber dilinde "Serik'in …" yerine "Serik ilçesi …" kullanılır (kullanıcı kuralı, 12 Eki 2026).
// Yayındaki haberlerde (5 Eki 2026 sonrası) başlık/özet/metindeki "Serik'in" kalıplarını düzeltir; haberler/*.json dosyalarını da günceller.
// Kullanım: node --env-file=.env.local scripts/serik-ilcesi-duzelt.mjs
import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, writeFileSync } from "fs";
const KALIP = [
  ["Serik'in merkezindeki", "Serik ilçe merkezindeki"],
  ["Serik'in Belek Turizm Merkezi'ndeki", "Serik ilçesine bağlı Belek Turizm Merkezi'ndeki"],
  ["Serik'in seralarında", "Serik ilçesindeki seralarda"],
  ["Serik'in Akbaş Mahallesi ile Kaş'ın Çayköy Mahallesi", "Serik ilçesine bağlı Akbaş Mahallesi ile Kaş ilçesine bağlı Çayköy Mahallesi"],
  ["Serik'in", "Serik ilçesinin"],   // kalanlar: "Serik'in artan nüfusu", "Serik'in profesyonel ligdeki temsilcisi" …
];
const duzelt = (t) => { let x = (t || "").replace(/Serik[’‘]in/g, "Serik'in"); for (const [a, b] of KALIP) x = x.split(a).join(b); return x; };
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await s.from("haberler").select("id,slug,title,summary,content").gte("published_at", "2026-10-05T00:00:00+03:00");
if (error) { console.error(error.message); process.exit(1); }
for (const h of data) {
  const yeni = { title: duzelt(h.title), summary: duzelt(h.summary), content: duzelt(h.content) };
  if (yeni.title === h.title && yeni.summary === h.summary && yeni.content === h.content) continue;
  const { error: e } = await s.from("haberler").update(yeni).eq("id", h.id);
  console.log(h.id, e ? "HATA " + e.message : "düzeltildi", "|", h.slug.slice(0, 50));
}
for (const f of readdirSync("haberler").filter((x) => x.endsWith(".json"))) {
  const y = `haberler/${f}`, ham = readFileSync(y, "utf8"), yeni = duzelt(ham);
  if (yeni !== ham) writeFileSync(y, yeni);
}
const { data: son } = await s.from("haberler").select("id,title,summary,content").gte("published_at", "2026-10-05T00:00:00+03:00");
console.log("kalan:", son.filter((h) => /Serik[’'‘]in/.test(h.title + h.summary + h.content)).map((h) => h.id));
