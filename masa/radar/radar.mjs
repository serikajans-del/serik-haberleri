// ANTALYA HABER MEDYA · VİRAL RADAR GÖNDERİCİSİ (22 Kas 2026)
// Radar turunun bulduğu haberleri @antalyahaberci_bot ("haberantalya_bot") üzerinden kullanıcıya iletir.
// Eski GitHub iş akışı "Saatlik Antalya Haber Taraması" (serik-haber-bot deposu) bunun yerine kapatıldı.
//
// Kullanım (serik-haberleri klasöründen):
//   node --env-file=.env.local masa/radar/radar.mjs gonder masa/radar/tur.json  → haberleri gönderir (düğmeli), görülenlere yazar
//   node --env-file=.env.local masa/radar/radar.mjs geri                       → kullanıcının düğme/yanıtlarını toplar → geribildirim.json
//   node --env-file=.env.local masa/radar/radar.mjs ozet                       → son 30 günün geri bildirimi (radar turu bunu okur)
//   node --env-file=.env.local masa/radar/radar.mjs goruldu "anahtar"          → bu konu gönderildi mi? (EVET/HAYIR)
//   node --env-file=.env.local masa/radar/radar.mjs atla "anahtar"             → konuyu göndermeden görüldü say
//   node --env-file=.env.local masa/radar/radar.mjs yaz "metin"                → düz mesaj (bilgi/hata)
//   node --env-file=.env.local masa/radar/radar.mjs deneme                     → bağlantı testi
//
// tur.json: { "haberler": [ { "anahtar", "baslik", "kategori", "tetik", "puan", "pbY": "5/3/5",
//     "kanca" (kısa viral başlık), "aciklama" (1–2 cümle + soru + 3–4 etiket), "gorsel_prompt", "neden", "zaman", "risk",
//     "kaynaklar": [{"ad","url"}], "foto_url"? } ] }
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

const TOKEN = process.env.ANTALYA_BOT_TOKEN;
if (!TOKEN) { console.error("ANTALYA_BOT_TOKEN .env.local içinde olmalı"); process.exit(1); }
const API = `https://api.telegram.org/bot${TOKEN}`;
const KOK = "masa/radar";
mkdirSync(KOK, { recursive: true });
const GORULEN = `${KOK}/gorulen.json`, GERI = `${KOK}/geribildirim.json`, DURUM = `${KOK}/durum.json`;
const oku = (f, v) => { try { return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : v; } catch { return v; } };
const kaydet = (f, v) => writeFileSync(f, JSON.stringify(v, null, 2));

// Sohbet: aynı Telegram kullanıcısı, serikmasa_bot'taki sahip kimliğiyle aynı (özel sohbette chat id = kullanıcı id).
const CHAT = process.env.ANTALYA_CHAT_ID || oku("masa/telegram/durum.json", {})?.sahip?.chat;
if (!CHAT) { console.error("Sohbet kimliği yok: ANTALYA_CHAT_ID ver ya da masa/telegram/durum.json"); process.exit(1); }

async function tg(yontem, govde) {
  const r = await fetch(`${API}/${yontem}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(govde) });
  const j = await r.json();
  if (!j.ok) throw new Error(`telegram ${yontem}: ${j.description}`);
  return j.result;
}
// Dosyalı gönderim (sendPhoto multipart): hazır gönderi görseli (masa/radar/ahm/bas.py çıktısı)
async function tgDosya(yontem, alanlar, alan, yol) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(alanlar)) fd.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  fd.append(alan, new Blob([readFileSync(yol)], { type: "image/jpeg" }), yol.split(/[\\/]/).pop());
  const j = await (await fetch(`${API}/${yontem}`, { method: "POST", body: fd })).json();
  if (!j.ok) throw new Error(`telegram ${yontem}: ${j.description}`);
  return j.result;
}
const html = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const kalin = (s = "") => html(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); // **kalın** → <b>
const norm = (s = "") => s.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// 24 Kas: "isveç göta kanal" ile "isvec gota kanali" aynı sayılmadı, haber iki kez gitti → Türkçe harf katlama + kelime örtüşmesi,
// geçmiş kaydın anahtarı VE başlığı ile karşılaştırılır (3+ ortak kök ya da küçük kümenin %60'ı).
const katla = (s = "") => norm(s).replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u");
const DURAK = new Set("ve ile bir bu icin olan oldu gibi daha cok en de da ki the and of to in on for".split(" "));
const kokler = (s) => new Set(katla(s).split(" ").filter((w) => w.length > 2 && !DURAK.has(w)).map((w) => w.slice(0, 5)));
function gorulduMu(anahtar, baslik = "") {
  const g = oku(GORULEN, []), sinir = Date.now() - 7 * 864e5, a = kokler(anahtar), b = kokler(`${anahtar} ${baslik}`);
  return g.some((x) => {
    if (x.zaman <= sinir) return false;
    if (katla(x.anahtar) === katla(anahtar)) return true;
    for (const [bu, o] of [[a, kokler(x.anahtar)], [b, kokler(`${x.anahtar} ${x.baslik || ""}`)]]) {
      let n = 0; for (const w of bu) if (o.has(w)) n++;
      if (n >= 3 && n >= Math.min(bu.size, o.size) * 0.5 || (n >= 2 && n >= Math.min(bu.size, o.size) * 0.6)) return true;
    }
    return false;
  });
}
function isaretle(kayit) {
  const g = oku(GORULEN, []).filter((x) => x.zaman > Date.now() - 30 * 864e5);
  g.push({ ...kayit, zaman: Date.now() });
  kaydet(GORULEN, g);
}

const DUGME = (no) => ({ inline_keyboard: [[
  { text: "✅ Paylaştım", callback_data: `p:${no}` },
  { text: "🔥 Böyle devam", callback_data: `i:${no}` },
  { text: "👎 Zayıf", callback_data: `z:${no}` },
]] });

// Kısa biçim (kullanıcı 24 Kas: "çok uzun geliyor, çarpıcı viral başlık + kısa açıklama"):
// kalın başlık, kısa açıklama, katlanmış görsel promptu, tek satır künye.
function mesaj(h, i, n) {
  if (h.gorsel) return kunye(h, i, n);
  const kaynak = (h.kaynaklar || []).filter((k) => k.url).slice(0, 2).map((k) => `<a href="${html(k.url)}">${html(k.ad)}</a>`).join(" · ");
  const satir = [
    `<b>${seviye(h.puan)}</b>`,
    `🔥 <b>${html(String(h.kanca || h.baslik).replace(/\*\*/g, "").replace(/\s*\|\s*/g, " "))}</b>`,
    "",
    html(h.aciklama),
    "",
    `<blockquote expandable>🎨 Görsel promptu (Temsili) — dokun, aç:\n<code>${html(h.gorsel_prompt)}</code></blockquote>`,
    `<i>${n > 1 ? `${i}/${n} · ` : ""}${html(h.puan)}/18 · ${html(h.kategori || "GÜNDEM")}${h.zaman ? ` · ⏰ ${html(h.zaman)}` : ""}${h.risk && !/^düşük/i.test(h.risk) ? ` · ⚠️ ${html(h.risk)}` : ""}</i>`,
    kaynak ? `🔗 ${kaynak}` : null,
  ];
  return satir.filter((x) => x !== null).join("\n");
}

// Görselli gönderim (kullanıcı 25 Kas: "viral haber yakaladığın zaman görseli aynı boyut ve ölçülerde hazırla, paylaşacağım şekilde gönder"):
// 1) fotoğraf = sayfanın şablonunda hazır gönderi, altyazısı = Instagram açıklaması (kopyala-yapıştır), 2) yanıt olarak kısa künye + düğmeler.
const seviye = (p) => (+p >= 13 ? "🔴 SEVİYE: YÜKSEK" : +p >= 10 ? "🟠 SEVİYE: ORTA" : "🟡 SEVİYE: POTANSİYEL");
function kunye(h, i, n) {
  const kaynak = (h.kaynaklar || []).filter((k) => k.url).slice(0, 2).map((k) => `<a href="${html(k.url)}">${html(k.ad)}</a>`).join(" · ");
  return [
    `<b>${seviye(h.puan)}</b>`,
    `🔥 <b>${html(String(h.kanca || h.baslik).replace(/\*\*/g, "").replace(/\s*\|\s*/g, " "))}</b>`,
    h.gorsel_alt ? html(String(h.gorsel_alt).replace(/\*\*/g, "")) : null,
    h.neden ? `💡 ${html(h.neden)}` : null,
    `<i>${n > 1 ? `${i}/${n} · ` : ""}${html(h.puan)}/18 · ${html(h.kategori || "GÜNDEM")} · ${html(h.tetik || "")}${h.zaman ? ` · ⏰ ${html(h.zaman)}` : ""}${h.risk && !/^düşük/i.test(h.risk) ? ` · ⚠️ ${html(h.risk)}` : ""}</i>`,
    kaynak ? `🔗 ${kaynak}` : null,
  ].filter((x) => x !== null).join("\n");
}

// Kalite kapısı: RADAR.md kurallarının ölçülebilir kısmı. Hata varsa HİÇBİR ŞEY gönderilmez, tur düzeltir.
const kelimeSay = (s = "") => s.replace(/\*\*/g, "").trim().split(/\s+/).filter(Boolean).length;
function kontrol(tur) {
  const hata = [], uyari = [];
  const h = tur?.haberler || [];
  if (h.length > 3) hata.push(`turda ${h.length} haber var, en fazla 3`);
  h.forEach((x, i) => {
    const ad = `#${i + 1} ${x.baslik || x.anahtar || "?"}`;
    for (const a of ["anahtar", "baslik", "kanca", "aciklama", "gorsel_prompt", "puan", "kategori", "tetik", "zaman"])
      if (x[a] === undefined || x[a] === null || x[a] === "") hata.push(`${ad}: "${a}" boş`);
    // 25 Kas (kullanıcı): "eşik diye bir şey düşünme, potansiyel viral olma ihtimali bile çıkabilir; seviyesi yüksek olanı belirt" → eşik yok, seviye etiketi var
    if (!(+x.puan >= 0 && +x.puan <= 18)) hata.push(`${ad}: puan 0–18 arasında olmalı`);
    if (x.kanca) {
      const k = x.kanca.replace(/\*\*/g, ""), n = kelimeSay(k);
      if (n < 4 || n > 14) hata.push(`${ad}: başlık (kanca) ${n} kelime (hedef 6–12, tek satır)`);
      if (k.length > 90) hata.push(`${ad}: başlık ${k.length} karakter (en çok 90)`);
      if (/!|(şok|flaş|bomba)/i.test(k)) hata.push(`${ad}: başlık ünlem/şok/flaş içeriyor`);
      if (/\?\s*$/.test(k)) hata.push(`${ad}: başlık soru ile bitiyor`);
      // 25 Kas (kullanıcı: "konu başlıkları düzgün olmalı ve doyurucu dikkat çekmeli"): başlık tek okumada KİM/NEREDE + NE YAPTI söyler
      const bos = k.match(/(bakın|işte|o anlar|görenler|herkes şaşırdı|inanamadı|ortalık karıştı|sosyal medyayı salladı)/i);
      if (bos) hata.push(`${ad}: başlıkta boş merak/klişe "${bos[0]}"; olayın kendisini söyle`);
      if (/^\s*["“'‘«]/.test(k)) hata.push(`${ad}: başlık alıntıyla başlıyor; önce kim ne yaptı, alıntı açıklamaya`);
      if (/(:|\.\.\.|…)\s*$/.test(k)) hata.push(`${ad}: başlık yarım (: / … ile bitiyor)`);
    }
    if (x.gorsel) {
      const ga = String(x.gorsel_alt || "").replace(/\*\*/g, "").trim();
      if (ga.length < 30 || ga.length > 120) hata.push(`${ad}: gorsel_alt ${ga.length} karakter (30–120; görseldeki doyurucu bağlam satırı, bas JSON'undaki "alt" ile aynı)`);
    }
    if (x.aciklama && !/\?/.test(x.aciklama)) hata.push(`${ad}: açıklamada yorum sorusu yok`);
    const govde = (x.aciklama || "").replace(/#[\p{L}\p{N}_]+/gu, "").trim();
    if (govde.length > 300) hata.push(`${ad}: açıklama ${govde.length} karakter (etiketler hariç en çok 300; 1–2 kısa cümle + soru)`);
    const etiket = (x.aciklama || "").match(/#[\p{L}\p{N}_]+/gu) || [];
    if (etiket.length < 2 || etiket.length > 5) hata.push(`${ad}: açıklamada ${etiket.length} etiket (3–4)`);
    for (const [alan, p] of [["gorsel_prompt", x.gorsel_prompt]]) {
      if (!p) continue;
      if (!/4:5/.test(p)) hata.push(`${ad}: ${alan} 4:5 demiyor`);
      if (!/no text/i.test(p) || !/no logo/i.test(p)) hata.push(`${ad}: ${alan} "no text, no logos" yok`);
      if (!/(seen from behind|face[s]? (turned away|out of frame|hidden|not visible)|no faces|no recognizable|hands only)/i.test(p)) hata.push(`${ad}: ${alan} yüz/kimlik yasağını belirtmiyor`);
      if (p.split(/\s+/).length < 45) uyari.push(`${ad}: ${alan} kısa (${p.split(/\s+/).length} kelime) — 8 katmanı içeriyor mu?`);
      if (/[çğışöüÇĞİŞÖÜ]/.test(p)) uyari.push(`${ad}: ${alan} Türkçe karakter içeriyor (İngilizce olmalı)`);
    }
    if (x.gorsel) {   // hazır gönderi görseli
      if (!existsSync(x.gorsel)) hata.push(`${ad}: gorsel dosyası yok (${x.gorsel}); masa/radar/ahm/bas.py ile bas`);
      if ((x.gorsel_baslik || "").split("**").length !== 3) hata.push(`${ad}: gorsel_baslik'ta tam bir **vurgu** olmalı`);
      if ((x.gorsel_baslik || "").split("|").length !== 2) hata.push(`${ad}: gorsel_baslik editörün kırdığı iki satır olmalı ("1. satır | **vurgu** …")`);
      const ia = (x.ig_aciklama || "").trim();
      if (ia.length < 120 || ia.length > 900) hata.push(`${ad}: ig_aciklama ${ia.length} karakter (120–900; sayfa kalıbı: 5N1K haber paragrafı)`);
      if (/\*\*|!/.test(ia)) hata.push(`${ad}: ig_aciklama'da ** ya da ünlem var`);
    }
    const kay = (x.kaynaklar || []).filter((k) => k.url);
    if (!kay.length) hata.push(`${ad}: bağlantılı kaynak yok`);
    else if (kay.length < 2 && !/birincil|tek kaynak/i.test(x.risk || "")) hata.push(`${ad}: tek kaynak; ikinci kaynak bul ya da risk'e "Tek kaynak (birincil: …)" yaz`);
    if (kay.some((k) => /news\.google\.com/.test(k.url))) uyari.push(`${ad}: kaynak Google Haberler bağlantısı; masa/oku.mjs ile asıl adrese çevir`);
  });
  const kat = h.map((x) => x.kategori);
  if (new Set(kat).size < kat.length) uyari.push(`aynı kategoriden birden çok haber: ${kat.join(", ")}`);
  return { hata, uyari };
}

// Uzun mesajı Telegram sınırına göre böl (4096); düğmeler son parçada.
function parcala(metin, sinir = 3900) {
  if (metin.length <= sinir) return [metin];
  const p = []; let kalan = metin;
  while (kalan.length > sinir) { const i = kalan.lastIndexOf("\n\n", sinir); const k = i > 500 ? i : sinir; p.push(kalan.slice(0, k)); kalan = kalan.slice(k).trimStart(); }
  return [...p, kalan];
}

const [komut, arg] = process.argv.slice(2);
if (komut === "deneme") {
  const me = await tg("getMe", {});
  await tg("sendMessage", { chat_id: CHAT, text: `✅ @${me.username} bağlandı. Viral radar 30 dakikada bir buraya yazacak.` });
  console.log("GÖNDERİLDİ", me.username);
} else if (komut === "yaz") {
  await tg("sendMessage", { chat_id: CHAT, text: String(arg || "").slice(0, 4000), disable_web_page_preview: true });
  console.log("GÖNDERİLDİ");
} else if (komut === "goruldu") {
  console.log(gorulduMu(arg || "") ? "EVET" : "HAYIR");
} else if (komut === "atla") {
  isaretle({ anahtar: arg || "", baslik: "", gonderildi: false }); console.log("İŞARETLENDİ");
} else if (komut === "gonder") {
  const tur = oku(arg || `${KOK}/tur.json`, null);
  if (!tur?.haberler?.length) { console.log("Gönderilecek haber yok"); process.exit(0); }
  const { hata, uyari } = kontrol(tur);
  for (const u of uyari) console.log("UYARI:", u);
  if (hata.length) { for (const e of hata) console.log("HATA:", e); console.log("KALİTE KAPISI KALDI — hiçbir şey gönderilmedi; tur.json'u düzelt ve tekrar çalıştır."); process.exit(1); }
  const yeni = tur.haberler.filter((h) => !gorulduMu(h.anahtar, h.baslik));
  if (!yeni.length) { console.log("Hepsi daha önce gönderilmiş"); process.exit(0); }
  const d = oku(DURUM, { sayac: 0, offset: 0 });
  let i = 0;
  for (const h of yeni) {
    i++; const no = ++d.sayac;
    let foto = null;
    if (h.gorsel) {
      try { foto = await tgDosya("sendPhoto", { chat_id: CHAT, caption: String(h.ig_aciklama).trim().slice(0, 1024) }, "photo", h.gorsel); }
      catch (e) { console.error("görsel gönderilemedi:", e.message); }
    }
    const parca = parcala(mesaj(h, i, yeni.length));
    let son;
    for (let j = 0; j < parca.length; j++) {
      son = await tg("sendMessage", { chat_id: CHAT, text: parca[j], parse_mode: "HTML", disable_web_page_preview: true,
        ...(foto && j === 0 ? { reply_to_message_id: foto.message_id } : {}),
        ...(j === parca.length - 1 ? { reply_markup: DUGME(no) } : {}) });
    }
    if (h.foto_url && !h.gorsel) {
      try { await tg("sendPhoto", { chat_id: CHAT, photo: h.foto_url, caption: `📷 Haberin kendi görseli (fikir için, telif sahibine aittir): ${h.baslik}`.slice(0, 1000), reply_to_message_id: son.message_id }); }
      catch (e) { console.error("foto gönderilemedi:", e.message); }
    }
    isaretle({ no, mesaj_id: son.message_id, anahtar: h.anahtar, baslik: h.baslik, kategori: h.kategori, tetik: h.tetik, puan: h.puan, gonderildi: true });
    console.log("GÖNDERİLDİ", no, h.baslik);
  }
  d.son_gonderim = Date.now();
  kaydet(DURUM, d);
} else if (komut === "kontrol") {
  const { hata, uyari } = kontrol(oku(arg || `${KOK}/tur.json`, {}));
  for (const u of uyari) console.log("UYARI:", u);
  for (const e of hata) console.log("HATA:", e);
  console.log(hata.length ? "KALDI" : "GEÇTİ");
  process.exit(hata.length ? 1 : 0);
} else if (komut === "nabiz") {
  // Her turun sonunda çağrılır: tur kaydı tutar; gündüz 3 saattir hiçbir şey gönderilmediyse kullanıcıya "çalışıyorum" der,
  // böylece sessizlik "radar durdu" diye anlaşılmaz.
  const d = oku(DURUM, { sayac: 0, offset: 0 });
  const rapor = String(arg || "").slice(0, 600);
  writeFileSync(`${KOK}/log.txt`, `${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })} ${rapor}\n`, { flag: "a" });
  const saat = +new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul", hour: "numeric", hour12: false });
  const sessiz = Date.now() - Math.max(d.son_gonderim || 0, d.son_nabiz || 0) > 3 * 36e5;
  if (sessiz && saat >= 9 && saat <= 23) {
    await tg("sendMessage", { chat_id: CHAT, disable_web_page_preview: true,
      text: `🟢 Radar çalışıyor — son 3 saatte gönderilecek aday çıkmadı (yalnız güvenlik/telif yasakları eler).\n${rapor}` });
    d.son_nabiz = Date.now(); kaydet(DURUM, d);
    console.log("NABIZ GÖNDERİLDİ");
  } else console.log("nabız kaydedildi");
} else if (komut === "geri") {
  // Düğmeler ve gönderilere verilen yanıtlar ("paylaştım 12B beğeni 340 yorum" gibi) → geribildirim.json
  const d = oku(DURUM, { sayac: 0, offset: 0 });
  const gor = oku(GORULEN, []), geri = oku(GERI, []);
  const bul = (f) => gor.find(f);
  const up = await tg("getUpdates", { offset: d.offset, timeout: 0, allowed_updates: ["message", "callback_query"] });
  let say = 0;
  for (const u of up) {
    d.offset = u.update_id + 1;
    if (u.callback_query) {
      const [tur, no] = (u.callback_query.data || "").split(":");
      const k = bul((x) => String(x.no) === no);
      const ad = { p: "paylaşıldı", i: "beğenildi", z: "zayıf" }[tur] || tur;
      geri.push({ zaman: Date.now(), tur: ad, no: +no, anahtar: k?.anahtar, baslik: k?.baslik, kategori: k?.kategori, tetik: k?.tetik, puan: k?.puan });
      if (tur === "x") continue; // "kaydedildi" düğmesine tekrar basılması
      try { await tg("answerCallbackQuery", { callback_query_id: u.callback_query.id, text: "Kaydedildi, radar bunu öğrenecek 👍" }); } catch { /* 30 dk geçmiş olabilir */ }
      // Düğmeler tur başında okunur (en geç 30 dk); kullanıcı kaydı görsün diye düğmeyi onaya çevir.
      const m = u.callback_query.message;
      if (m) try { await tg("editMessageReplyMarkup", { chat_id: m.chat.id, message_id: m.message_id,
        reply_markup: { inline_keyboard: [[{ text: `✔️ Kaydedildi: ${ad}`, callback_data: "x:0" }]] } }); } catch { /* mesaj çok eski */ }
      say++;
    } else if (u.message?.text && String(u.message.chat.id) === String(CHAT)) {
      const r = u.message.reply_to_message?.message_id;
      const k = r ? bul((x) => x.mesaj_id === r) : null;
      geri.push({ zaman: Date.now(), tur: k ? "yanıt" : "not", metin: u.message.text.slice(0, 500), no: k?.no, anahtar: k?.anahtar, baslik: k?.baslik, kategori: k?.kategori, tetik: k?.tetik });
      say++;
    }
  }
  kaydet(GERI, geri.filter((x) => x.zaman > Date.now() - 60 * 864e5)); kaydet(DURUM, d);
  console.log(`${say} yeni geri bildirim`);
} else if (komut === "ozet") {
  const geri = oku(GERI, []).filter((x) => x.zaman > Date.now() - 30 * 864e5);
  if (!geri.length) { console.log("Henüz geri bildirim yok."); process.exit(0); }
  const say = {};
  for (const g of geri) for (const anah of [g.kategori, g.tetik].filter(Boolean)) {
    say[anah] ??= { "paylaşıldı": 0, "beğenildi": 0, "zayıf": 0 }; if (say[anah][g.tur] !== undefined) say[anah][g.tur]++;
  }
  console.log("KATEGORİ/TETİK → paylaşıldı / beğenildi / zayıf");
  for (const [k, v] of Object.entries(say).sort((a, b) => (b[1]["paylaşıldı"] * 2 + b[1]["beğenildi"] - b[1]["zayıf"] * 2) - (a[1]["paylaşıldı"] * 2 + a[1]["beğenildi"] - a[1]["zayıf"] * 2)))
    console.log(`  ${k}: ${v["paylaşıldı"]} / ${v["beğenildi"]} / ${v["zayıf"]}`);
  console.log("SON 15 KAYIT:");
  for (const g of geri.slice(-15)) console.log(`  [${g.tur}] ${g.baslik || "-"}${g.metin ? ` — "${g.metin}"` : ""}`);
} else {
  console.log("Komutlar: gonder <tur.json> | geri | ozet | goruldu <anahtar> | atla <anahtar> | yaz <metin> | deneme");
}
