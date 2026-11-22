// VİRAL RADAR · SİNYAL TOPLAYICI (22 Kas 2026)
// Yapay zekâ kullanmaz. Herkese açık kaynaklardan "insanların şu an konuştuğu / paylaştığı" sıra dışı haberleri toplar,
// aynı olayı yazan siteleri kümeler (küme büyüklüğü = yayılma sinyali), ön puan verir → masa/radar/aday.json.
// Radar turu (RADAR.md) önce bunu çalıştırır, sonra WebSearch ile boşluk doldurur ve doğrular.
//
//   node masa/radar/sinyal.mjs            → aday.json + en iyi 25 adayın özeti
//   node masa/radar/sinyal.mjs --saat 12  → yalnız son 12 saat (varsayılan 36)
import { readFileSync, writeFileSync, existsSync } from "fs";

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }; // Ekşi dil başlığı olmadan boş döner
const SAAT = Number(process.argv[process.argv.indexOf("--saat") + 1]) || 36;
const SIMDI = Date.now();
const KOK = "masa/radar";

// ---- kaynaklar -------------------------------------------------------------------------------------------
const gn = (q, dil = "tr") => dil === "tr"
  ? `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:1d")}&hl=tr&gl=TR&ceid=TR:tr`
  : `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:1d")}&hl=en-US&gl=US&ceid=US:en`;
const ARAMALAR_TR = ["sosyal medyada gündem oldu", "görenler şaşırdı", "görenleri şaşırttı", "pes dedirten", "ilginç görüntü",
  "yüzleri güldüren", "duygulandıran", "rekor kırdı", "Guinness", "genç mucit", "buluş geliştirdi", "sıra dışı", "akılalmaz",
  "viral oldu", "izlenme rekoru", "Antalya ilginç", "Antalya görenler", "köyde ilginç", "dünyada ilk", "Türkiye'de ilk"];
const ARAMALAR_EN = ["bizarre", "weird news", "odd news", "Guinness World Records", "goes viral", "world's first",
  "invention", "scientists discover", "heartwarming", "unusual"];
const RSS = [
  ["UPI Odd News", "https://rss.upi.com/news/odd_news.rss", "en"],
  ["Oddity Central", "https://www.odditycentral.com/feed/", "en"],
  ["Guinness", "https://www.guinnessworldrecords.com/news/rss", "en"],
  ["Bored Panda", "https://www.boredpanda.com/feed/", "en"],
  ["New Atlas", "https://newatlas.com/index.rss", "en"],
  ["ScienceAlert", "https://www.sciencealert.com/feed", "en"],
  ["AA Yaşam", "https://www.aa.com.tr/tr/rss/default?cat=yasam", "tr"],
  ["Hürriyet Yaşam", "https://www.hurriyet.com.tr/rss/yasam", "tr"],
  ["NTV Dünya", "https://www.ntv.com.tr/dunya.rss", "tr"],
];

// ---- puan sözlüğü ----------------------------------------------------------------------------------------
// kök: soldan kelime sınırı (Türkçe ekler serbest) · tam: iki yandan sınır (kısa İngilizce kelimeler için)
const kok = (s) => new RegExp(`(?<![\p{L}\p{N}])(?:${s})`, "iu");
const tam = (s) => new RegExp(`(?<![\p{L}\p{N}])(?:${s})(?![\p{L}])`, "iu");
const ARTI = [ // [düzenli ifade, puan, etiket]
  [kok("şaşırt|şaşkın|pes dedirt|akıl ?almaz|inanılmaz|görenler|sıra ?dışı|ilginç|tuhaf|bizarre|weird|bewilder|unusual"), 3, "tuhaflık"],
  [kok("rekor|guinness|dünyanın en|world'?s (?:first|largest|smallest|oldest|biggest|longest|tallest)|world record"), 3, "rekor"],
  [kok("mucit|buluş|icat|invent|prototype|scientists|bilim insanları|keşfett|discover"), 2, "buluş"],
  [kok("güldür|kahkaha|komik|funny|hilarious|prank"), 3, "komik"],
  [kok("duygulandır|gözyaşı|yürek ?ısıt|heartwarming|reunite|kavuştu|vefa"), 3, "duygu"],
  [tam("kedi\w*|köpe\w*|ayı|kuş\w*|inek\w*|keçi\w*|yavru\w*|hayvan\w*|dogs?|cats?|bears?|animals?|puppy|kitten|parrot|goat|cow"), 2, "hayvan"],
  [kok("yaşındaki|dede|nine|babaanne|torun|centenarian|year-old|grandm|grandp"), 2, "insan"],
  [kok("viral|gündem oldu|sosyal medyada|milyonlar izl|tiktok"), 2, "sosyal"],
  [tam("antalya\w*|serik\w*|manavgat\w*|alanya\w*|kemer\w*|belek\w*|konyaaltı\w*|muratpaşa\w*|kepez\w*|gazipaşa\w*|kumluca\w*|finike\w*|demre\w*|kaş'\w*"), 3, "antalya"],
  [kok("köy|tarla|kahvehane|pazar|minibüs|apartman|komşu"), 1, "gündelik"],
  [/\d[\d.,]*\s?(milyon|bin|km|kilo|ton|yıl|metre|cm|%)/i, 1, "rakam"],
];
const EKSI = [
  [kok("seçim|milletvekil|bakan |cumhurbaşkan|chp|akp|ak parti|mhp|dem parti|meclis|trump|biden|putin|netanyahu|zelensk|senate|congress|belediye başkan"), -4, "siyaset"],
  [kok("borsa|dolar|euro |faiz|enflasyon|merkez bankası|altın fiyat|bitcoin|stock|nasdaq|ipo|banker|ücretli çalışan|sektör"), -4, "piyasa"],
  [kok("cinayet|öldürül|bıçak|silahlı|tecavüz|taciz|intihar|köprüden atla|hayatını kaybett|cesed|murder|stabbed|shooting|killed|rape|suicide"), -5, "şiddet"],
  [kok("kaza|yangın|deprem|crash|wildfire|earthquake"), -1, "afet"],
  [kok("kampanya|indirim|lansman|tanıtım|sponsor|reklam|discount|coupon|temizlik ve hijyen"), -3, "reklam"],
  [kok("maç|gol|transfer|derbi|teknik direktör|beşiktaş|fenerbahçe|galatasaray|trabzonspor|league|nba|nfl|f1 |podium|quarterback|coach|76ers|cowboys|lsu|playoff|halftime|teammate"), -4, "spor"],
  [kok("evlendi|boşandı|sevgili|aşk yaşıyor|married|dating|rumou?red|kiss|birthday message"), -2, "magazin"],
];

// ---- yardımcılar -----------------------------------------------------------------------------------------
const ent = (s = "") => s.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/\s+/g, " ").trim();
const tag = (it, t) => ent((it.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1] || "");
const DUR = new Set("ve ile bir bu da de için olan oldu gibi daha çok en the a an of to in on for and is are was with at by from as after".split(" "));
const kelime = (s) => new Set(s.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !DUR.has(w)));

async function getir(url, ms = 20000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { headers: UA, signal: ac.signal, redirect: "follow" }); return r.ok ? await r.text() : ""; }
  catch { return ""; } finally { clearTimeout(t); }
}
function rssAyikla(xml, kaynak, dil, arama = null) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    let baslik = tag(it, "title"), site = tag(it, "source") || kaynak;
    if (arama && baslik.includes(" - ")) { const i = baslik.lastIndexOf(" - "); site = baslik.slice(i + 3); baslik = baslik.slice(0, i); }
    const zaman = Date.parse(tag(it, "pubDate")) || SIMDI;
    return { baslik, url: tag(it, "link"), site, kaynak, dil, zaman, ozet: tag(it, "description").slice(0, 240), arama };
  }).filter((x) => x.baslik && SIMDI - x.zaman < SAAT * 36e5);
}

// ---- topla -----------------------------------------------------------------------------------------------
const isler = [
  ...ARAMALAR_TR.map((q) => getir(gn(q)).then((x) => rssAyikla(x, "Google Haberler", "tr", q))),
  ...ARAMALAR_EN.map((q) => getir(gn(q, "en")).then((x) => rssAyikla(x, "Google News", "en", q))),
  ...RSS.map(([ad, u, dil]) => getir(u).then((x) => rssAyikla(x, ad, dil))),
];
const ham = (await Promise.all(isler)).flat();

// Google Trendler TR: arama hacmi (o konu bir haberle eşleşirse sinyal)
const trendXml = await getir("https://trends.google.com/trending/rss?geo=TR");
const trendler = [...trendXml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => ({
  konu: tag(it, "title"), hacim: Number((tag(it, "ht:approx_traffic") || "0").replace(/\D/g, "")) || 0,
  haberler: [...it.matchAll(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>[\s\S]*?<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/g)].map(([, b, u]) => ({ b: ent(b), u: ent(u) })),
}));
// Ekşi gündem: entry sayısı
const eksiHtml = await getir("https://eksisozluk.com/basliklar/gundem");
const eksi = [...eksiHtml.matchAll(/<a\s+href="(\/[^"]+\?a=popular)">([^<]+?)\s*<small>(\d+)<\/small>/g)].map(([, u, b, n]) => ({ konu: ent(b), entry: +n, url: "https://eksisozluk.com" + u.split("?")[0] }));

// ---- kümele (aynı olayı yazan siteler) -------------------------------------------------------------------
const kumeler = [];
for (const h of ham) {
  const w = kelime(h.baslik);
  let k = kumeler.find((c) => { let o = 0; for (const x of w) if (c.w.has(x)) o++;
    const j = o / (w.size + c.w.size - o || 1); return (o >= 3 && j >= 0.3) || (o >= 2 && j >= 0.5); });
  if (!k) { k = { w, uyeler: [] }; kumeler.push(k); }
  k.uyeler.push(h);
}

// ---- puanla ----------------------------------------------------------------------------------------------
const gorulen = existsSync(`${KOK}/gorulen.json`) ? JSON.parse(readFileSync(`${KOK}/gorulen.json`, "utf8")) : [];
const gorulenW = gorulen.map((g) => kelime(`${g.anahtar} ${g.baslik || ""}`));
let adaylar = kumeler.map((k) => {
  const bas = k.uyeler.sort((a, b) => (b.dil === "tr") - (a.dil === "tr") || b.zaman - a.zaman)[0];
  const metin = `${bas.baslik} ${bas.dil === "en" ? "" : bas.ozet} ` + k.uyeler.slice(0, 5).map((u) => u.baslik).join(" ");
  const siteler = [...new Set(k.uyeler.map((u) => u.site))];
  let puan = 0; const etiket = [];
  const konu = ARTI.filter(([re]) => re.test(metin)).length; if (!konu) puan -= 3; // viral özelliği olmayan düz haber
  for (const [re, p, e] of [...ARTI, ...EKSI]) if (re.test(metin)) { puan += p; etiket.push(e); }
  puan += Math.min(siteler.length - 1, 5) * 1.5;                               // yayılma
  const yas = (SIMDI - Math.max(...k.uyeler.map((u) => u.zaman))) / 36e5;
  puan += yas < 3 ? 3 : yas < 8 ? 2 : yas < 18 ? 1 : 0;                         // tazelik
  const tr = trendler.find((t) => t.haberler.some((h) => { const o = [...kelime(h.b)].filter((x) => k.w.has(x)).length; return o >= 3; }));
  if (tr) { puan += tr.hacim >= 50000 ? 4 : tr.hacim >= 10000 ? 3 : 2; etiket.push(`trend:${tr.hacim}+`); }
  const ek = eksi.find((e) => [...kelime(e.konu)].filter((x) => k.w.has(x)).length >= 2);
  if (ek) { puan += ek.entry >= 100 ? 3 : 2; etiket.push(`ekşi:${ek.entry}`); }
  const tekrar = gorulenW.some((g) => [...g].filter((x) => k.w.has(x)).length >= 3);
  return { baslik: bas.baslik, url: bas.url, dil: bas.dil, site_sayisi: siteler.length, siteler: siteler.slice(0, 6),
    yas_saat: Math.round(yas * 10) / 10, on_puan: Math.round(puan * 10) / 10, etiket, gonderildi: tekrar,
    diger: k.uyeler.slice(1, 4).map((u) => ({ site: u.site, baslik: u.baslik, url: u.url })) };
}).filter((a) => !a.gonderildi && a.on_puan > 0);
// Ekşi gündem başlıkları: haber sitelerinde kümesi olmayan ama Türkiye'nin konuştuğu konular (kaynak WebSearch ile bulunur)
for (const e of eksi) {
  if (adaylar.some((a) => a.etiket.includes(`ekşi:${e.entry}`))) continue;
  let puan = e.entry >= 200 ? 4 : e.entry >= 80 ? 3 : 2; const etiket = [`ekşi:${e.entry}`];
  for (const [re, p, et] of [...ARTI, ...EKSI]) if (re.test(e.konu)) { puan += p; etiket.push(et); }
  if (!ARTI.some(([re]) => re.test(e.konu))) continue; // viral özelliği olmayan Ekşi başlığını alma
  if (gorulenW.some((g) => [...g].filter((x) => kelime(e.konu).has(x)).length >= 2)) continue;
  adaylar.push({ baslik: `[Ekşi gündem] ${e.konu}`, url: e.url, dil: "tr", site_sayisi: 0, siteler: ["Ekşi Sözlük"], yas_saat: null,
    on_puan: puan, etiket, gonderildi: false, diger: [], not: "Haber kaynağını WebSearch ile bul; Ekşi tek başına kaynak değildir." });
}
adaylar.sort((a, b) => b.on_puan - a.on_puan).splice(60);

writeFileSync(`${KOK}/aday.json`, JSON.stringify({ zaman: new Date().toISOString(), ham: ham.length, kume: kumeler.length,
  trendler: trendler.slice(0, 20).map(({ konu, hacim }) => ({ konu, hacim })), eksi: eksi.slice(0, 20), adaylar }, null, 2));
console.log(`ham ${ham.length} · küme ${kumeler.length} · aday ${adaylar.length} · trend ${trendler.length} · ekşi ${eksi.length}`);
for (const a of adaylar.slice(0, 25))
  console.log(`${String(a.on_puan).padStart(5)} | ${a.dil} | ${a.site_sayisi} site | ${a.yas_saat}s | ${a.etiket.join(",")} | ${a.baslik.slice(0, 95)}`);
console.log("TRENDLER:", trendler.slice(0, 12).map((t) => `${t.konu} (${t.hacim}+)`).join(" · "));
console.log("EKŞİ:", eksi.slice(0, 12).map((e) => `${e.konu} (${e.entry})`).join(" · "));
