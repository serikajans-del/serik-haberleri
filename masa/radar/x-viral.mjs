// X TÜRKÇE VİRAL → @antalyahaberci_bot radarı için ek sinyal (24 Kas 2026, kullanıcı: "X'te Türkçe viral ekleyebilirsin")
// 25 Kas: İZLENEN SAYFALAR (x-hesaplar.json; @bosunatiklama vb.) — 1 saatte 300+ beğeni / hesabın ≥3 katı / ≥3 hesapta aynı konu → "PATLAYAN" listesi.
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

const HESAP = join(KOK, "x-hesaplar.json");
const hesapVeri = () => JSON.parse(readFileSync(HESAP, "utf8"));
const hesaplar = () => hesapVeri().hesaplar.map((h) => h.handle);
if (process.argv[2] === "hesap-ekle" || process.argv[2] === "hesap-sil") {
  const v = hesapVeri(), h = String(process.argv[3] || "").replace(/^@/, "");
  if (!h) { console.log("kullanım: hesap-ekle <handle> \"not\" | hesap-sil <handle>"); process.exit(1); }
  v.hesaplar = v.hesaplar.filter((x) => x.handle.toLowerCase() !== h.toLowerCase());
  if (process.argv[2] === "hesap-ekle") v.hesaplar.push({ handle: h, not: process.argv[4] || "" });
  writeFileSync(HESAP, JSON.stringify(v, null, 1)); console.log(`${process.argv[2] === "hesap-ekle" ? "EKLENDİ" : "SİLİNDİ"} @${h} (${v.hesaplar.length} hesap)`); process.exit(0);
}
if (process.argv[2] === "adresler") {
  console.log("1) Türkiye sıra dışı / ilginç (son 6 saat):");
  console.log(ara(`(görenler OR şaşırttı OR ilginç OR inanılmaz OR rekor OR "ilk kez" OR köy OR buluş OR mucit OR duygulandıran OR "yaşındaki") lang:tr min_faves:300${filtre} since_time:${once(6)}`));
  // 24 Kas: kullanıcı "2000 beğeni çok" → 500; daha erken yakalamak için 4 saat; spor/siyaset baştan dışarıda (maç gecesi havuzu doluyordu)
  console.log("2) Genel Türkçe viral, görselli (son 4 saat):");
  const disla = '-maç -gol -galatasaray -fenerbahçe -beşiktaş -trabzonspor -hakem -transfer -chp -akp -erdoğan -"özgür özel" -imamoğlu -bahçeli -seçim';
  console.log(ara(`(bir OR ve OR bu OR çok) lang:tr min_faves:500 filter:media ${disla}${filtre} since_time:${once(4)}`));
  // 25 Kas (kullanıcı): "bosunatiklama gibi sayfalarda 1 saat içinde 300 beğeni almış haberleri kaçırmayalım" → izlenen sayfalar, En Son sekmesi, son 3 saat.
  // Sorgu kısa kalsın diye 6'şar hesaplık gruplar; her grup ayrı sayfa, etiket x:hesap
  const hs = hesaplar();
  for (let i = 0; i < hs.length; i += 6) {
    const grup = `(${hs.slice(i, i + 6).map((h) => "from:" + h).join(" OR ")})`;
    // H…e: yalnız etkileşim almışlar (150+ beğeni, son 3 saat) — patlayanı kaçırmaz. H…: tüm akış (son 2 saat) — hesap ortancası ve "N hesapta" için taban.
    console.log(`H${i / 6 + 1}e) İzlenen sayfalar, ETKİLEŞİM ALMIŞ (${hs.slice(i, i + 6).join(", ")}) → await HIR.topla("x:hesap-etk", 8):`);
    console.log(ara(`${grup} min_faves:150${filtre} since_time:${once(3)}`, "live"));
    console.log(`H${i / 6 + 1}) İzlenen sayfalar, TÜM AKIŞ (taban) → await HIR.topla("x:hesap", 10):`);
    console.log(ara(`${grup}${filtre} since_time:${once(2)}`, "live"));
  }
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

// ---- İZLENEN SAYFALARDA PATLAYAN (25 Kas) --------------------------------------------------------------------
// Kural 1 (kullanıcı): ilk 60 dk'da 300+ beğeni ya da 2 saate kadar bu hızda (beğeni/saat ≥ 300).
// Kural 2: hesabın kendi ortancasının ≥ 3 katı (büyük sayfada her gönderi 300'ü geçebilir; asıl sinyal ayrışan gönderi).
// Kural 3: aynı konu ≥ 2 farklı hesapta (kelime örtüşmesi) → "N hesapta" = konu yayılıyor.
// Tur hafızası (x/hesap-gecmis.json): önceki turdaki beğeni → ivme (dk başına artış).
const izlenen = new Set(hesaplar().map((h) => h.toLowerCase()));
const GECMIS = join(KOK, "x", "hesap-gecmis.json");
const gecmis = existsSync(GECMIS) ? JSON.parse(readFileSync(GECMIS, "utf8")) : {};
const ortanca = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const hesapBegeni = {};
for (const a of liste) if (izlenen.has(a.author.toLowerCase()) && a.yas_dk >= 30) (hesapBegeni[a.author.toLowerCase()] ||= []).push(a.likes || 0);
const DUR = new Set("bir ve ile için olan oldu gibi daha çok kadar sonra önce şimdi bunu buna olarak tarafından yeni değil".split(" "));
const kelime = (t) => new Set((t || "").toLocaleLowerCase("tr").replace(/https?:\S+/g, "").match(/[\p{L}\p{N}]{4,}/gu)?.filter((w) => !DUR.has(w)).map((w) => w.slice(0, 6)) || []);
for (const a of liste) a._k = kelime(a.text);
const patlayan = [];
for (const a of liste) {
  if (!izlenen.has(a.author.toLowerCase())) continue;
  const saat = Math.max(a.yas_dk, 10) / 60, hiz_sa = Math.round((a.likes || 0) / saat);
  const ort = ortanca(hesapBegeni[a.author.toLowerCase()] || []), kat = ort ? +((a.likes || 0) / ort).toFixed(1) : null;
  const once_ = gecmis[a.id], ivme = once_ ? +(((a.likes || 0) - once_.likes) / Math.max(1, (Date.parse(veri.toplandi || new Date()) - once_.t) / 6e4)).toFixed(1) : null;
  const diger = new Set(liste.filter((b) => b.author !== a.author && b._k.size && [...a._k].filter((w) => b._k.has(w)).length >= 3).map((b) => "@" + b.author));
  // gürültü süzgeci (25 Kas ilk tur 19 aday verdi): hız işareti en az 150 beğenide; "N hesapta" tek başına ≥3 hesap + 150 beğeni ister
  const ana = [];
  if (a.yas_dk <= 60 && a.likes >= 300) ana.push("🚨 1 SAATTE 300+");
  else if (a.yas_dk <= 120 && hiz_sa >= 300 && a.likes >= 150) ana.push(`🚨 ${hiz_sa}/sa HIZ`);
  if (kat && kat >= 3 && a.likes >= 150) ana.push(`hesabın ${kat} katı`);
  if (diger.size >= 2 && a.likes >= 150) ana.push(`${diger.size + 1} hesapta`);
  if (ivme !== null && ivme >= 5) ana.push(`ivme +${ivme}/dk`);
  if (!ana.length) continue;
  const isaret = [...ana];
  if (diger.size && !isaret.some((x) => x.includes("hesapta"))) isaret.push(`${diger.size + 1} hesapta (${[...diger].slice(0, 3).join(" ")})`);
  else if (diger.size) isaret[isaret.findIndex((x) => x.includes("hesapta"))] += ` (${[...diger].slice(0, 3).join(" ")})`;
  // radar ELE listesi hatırlatması (karar radarın): spor sonucu/kulüp, siyaset, ölüm/şehit → çoğunlukla ELE ya da yalnız insan hikâyesi açısıyla
  if (/(maç|gol|kafile|teknik direktör|şampiyonlar ligi|galatasaray|fenerbahçe|beşiktaş|trabzonspor|transfer|futbol)/i.test(a.text)) isaret.push("⚽ spor?");
  if (/(chp|akp|mhp|erdoğan|özgür özel|imamoğlu|bakan|meclis|seçim|kararname)/i.test(a.text)) isaret.push("🏛 siyaset?");
  if (/(öldü|ölü|hayatını kaybet|şehit|cinayet|intihar)/i.test(a.text)) isaret.push("⚠ ölüm?");
  patlayan.push({ ...a, hiz_sa, hesap_kati: kat, ivme, ayni_konu: [...diger], isaret, _k: undefined });
}
for (const a of liste) if (izlenen.has(a.author.toLowerCase())) gecmis[a.id] = { likes: a.likes || 0, t: Date.parse(veri.toplandi || new Date()) };
for (const [id, g] of Object.entries(gecmis)) if (Date.now() - g.t > 36 * 3600e3) delete gecmis[id];
writeFileSync(GECMIS, JSON.stringify(gecmis));
patlayan.sort((x, y) => (y.isaret[0]?.startsWith("🚨") ? 1 : 0) - (x.isaret[0]?.startsWith("🚨") ? 1 : 0) || y.hiz_sa - x.hiz_sa);
for (const a of liste) delete a._k;

writeFileSync(join(KOK, "x-aday.json"), JSON.stringify({ zaman: new Date().toISOString(), patlayan, adaylar: liste.slice(0, 40) }, null, 1));
if (patlayan.length) {
  console.log(`
=== İZLENEN SAYFALARDA PATLAYAN: ${patlayan.length} (turun İLK bakılacak adayları; konu haber sitesinde doğrulanır) ===`);
  for (const a of patlayan.slice(0, 12)) {
    console.log(`${a.isaret.join(" · ")}
   @${a.author} · ${a.yas_dk} dk · ❤${a.likes} 🔁${a.reposts} 💬${a.replies}${a.views ? ` 👁${a.views}` : ""} · ${a.hiz_sa}/sa${a.hesap_kati ? ` · ort. ×${a.hesap_kati}` : ""}`);
    console.log(`   ${(a.text || "").replace(/\s+/g, " ").slice(0, 160)}
   ${a.url}`);
  }
} else console.log(`
(izlenen ${izlenen.size} sayfada eşik üstü gönderi yok)`);
console.log("");
const gor = existsSync(join(KOK, "gorulen.json")) ? JSON.parse(readFileSync(join(KOK, "gorulen.json"), "utf8")) : [];
console.log(`${liste.length} tekil X gönderisi → masa/radar/x-aday.json (en hızlı 20):\n`);
for (const a of liste.slice(0, 20)) {
  const saat = a.yas_dk >= 60 ? `${Math.floor(a.yas_dk / 60)} sa` : `${a.yas_dk} dk`;
  console.log(`[X ${a.kaynak || ""}] ${a.hiz}/dk · ${saat} · ❤${a.likes} 🔁${a.reposts} 💬${a.replies}${a.views ? ` 👁${a.views}` : ""}${a.yorum_orani > 0.3 ? " · tartışmalı?" : ""}${a.media ? " · görselli" : ""}`);
  console.log(`   @${a.author}: ${(a.text || "").replace(/\s+/g, " ").slice(0, 160)}`);
  console.log(`   ${a.url}`);
}
console.log(`\n(gorulen.json: ${gor.length} kayıt — konu daha önce gönderildiyse radar.mjs goruldu "<anahtar>" ile kontrol et)`);
