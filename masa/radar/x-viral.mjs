// X TÜRKÇE VİRAL → @antalyahaberci_bot radarı için ek sinyal (24 Kas 2026, kullanıcı: "X'te Türkçe viral ekleyebilirsin")
// X gönderisi KAYNAK DEĞİLDİR, konu ipucudur (Reddit kuralıyla aynı): haber sitesinde doğrulanmadan yazılmaz, X'in fotoğraf/videosu kullanılmaz.
//
// Kullanım (serik-haberleri klasöründen):
//   node masa/radar/x-viral.mjs adresler  → Chrome'da açılacak X arama adresleri (since_time hazır)
//   node masa/radar/x-viral.mjs           → İndirilenler'deki en yeni radar-x-*.json'u okur, hızla sıralar → masa/radar/x-aday.json + ekrana en iyi 20
// Chrome adımı: her sayfada masa/haberinilki-radar/x-topla.js'in TAMAMI + `window.HIR_ON = "radar-x"; await HIR.topla("x:<etiket>")`,
// ilk sayfada önce `window.HIR_ON = "radar-x"; HIR.sifirla()`, son sayfada `window.HIR_ON = "radar-x"; HIR.indir()`.
import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const KOK = "masa/radar";
const filtre = " -filter:replies -filter:retweets";
const ara = (q, f = "top") => "https://x.com/search?q=" + encodeURIComponent(q) + "&src=typed_query&f=" + f;
const once = (saat) => Math.floor(Date.now() / 1000 - saat * 3600);

if (process.argv[2] === "adresler") {
  console.log("1) Türkiye sıra dışı / ilginç (son 6 saat):");
  console.log(ara(`(görenler OR şaşırttı OR ilginç OR inanılmaz OR rekor OR "ilk kez" OR köy OR buluş OR mucit OR duygulandıran OR "yaşındaki") lang:tr min_faves:300${filtre} since_time:${once(6)}`));
  // 24 Kas: kullanıcı "2000 beğeni çok" → 500; daha erken yakalamak için 4 saat; spor/siyaset baştan dışarıda (maç gecesi havuzu doluyordu)
  console.log("2) Genel Türkçe viral, görselli (son 4 saat):");
  const disla = "-maç -gol -galatasaray -fenerbahçe -beşiktaş -trabzonspor -hakem -transfer -chp -akp -erdoğan "-özgür özel" -imamoğlu -bahçeli -seçim";
  console.log(ara(`(bir OR ve OR bu OR çok) lang:tr min_faves:500 filter:media ${disla}${filtre} since_time:${once(4)}`));
  console.log("3) Antalya (son 12 saat):");
  console.log(ara(`(Antalya OR Alanya OR Manavgat OR Serik OR Kemer OR Kaş OR Belek OR Kumluca OR Finike OR Gazipaşa) lang:tr min_faves:50${filtre} since_time:${once(12)}`));
  process.exit(0);
}

const ind = join(homedir(), "Downloads");
const dosyalar = readdirSync(ind).filter((f) => /^radar-x-\d+\.json$/.test(f))
  .map((f) => join(ind, f)).sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs);
if (!dosyalar.length) { console.log("İndirilenler'de radar-x-*.json yok (Chrome'da window.HIR_ON = \"radar-x\"; HIR.indir() çalıştı mı?)"); process.exit(1); }
mkdirSync(join(KOK, "x"), { recursive: true });
const hedef = join(KOK, "x", "son.json");
renameSync(dosyalar.at(-1), hedef);
for (const f of dosyalar.slice(0, -1)) unlinkSync(f);

const veri = JSON.parse(readFileSync(hedef, "utf8"));
const tekil = new Map();
for (const a of veri.adaylar || []) {
  const e = (a.likes || 0) + 2 * (a.reposts || 0) + (a.replies || 0) + (a.quotes || 0);
  const onceki = tekil.get(a.id);
  if (!onceki || e > onceki.etk) tekil.set(a.id, { ...a, etk: e });
}
const simdi = Date.now();
const liste = [...tekil.values()].map((a) => {
  const dk = Math.max(1, (simdi - Date.parse(a.created_at)) / 6e4);
  return { ...a, yas_dk: Math.round(dk), hiz: +(a.etk / dk).toFixed(1), yorum_orani: +((a.replies || 0) / Math.max(1, a.likes || 0)).toFixed(2) };
}).filter((a) => a.yas_dk <= 24 * 60).sort((a, b) => b.hiz - a.hiz);

writeFileSync(join(KOK, "x-aday.json"), JSON.stringify({ zaman: new Date().toISOString(), adaylar: liste.slice(0, 40) }, null, 1));
const gor = existsSync(join(KOK, "gorulen.json")) ? JSON.parse(readFileSync(join(KOK, "gorulen.json"), "utf8")) : [];
console.log(`${liste.length} tekil X gönderisi → masa/radar/x-aday.json (en hızlı 20):\n`);
for (const a of liste.slice(0, 20)) {
  const saat = a.yas_dk >= 60 ? `${Math.floor(a.yas_dk / 60)} sa` : `${a.yas_dk} dk`;
  console.log(`[X ${a.kaynak || ""}] ${a.hiz}/dk · ${saat} · ❤${a.likes} 🔁${a.reposts} 💬${a.replies}${a.views ? ` 👁${a.views}` : ""}${a.yorum_orani > 0.3 ? " · tartışmalı?" : ""}${a.media ? " · görselli" : ""}`);
  console.log(`   @${a.author}: ${(a.text || "").replace(/\s+/g, " ").slice(0, 160)}`);
  console.log(`   ${a.url}`);
}
console.log(`\n(gorulen.json: ${gor.length} kayıt — konu daha önce gönderildiyse radar.mjs goruldu "<anahtar>" ile kontrol et)`);
