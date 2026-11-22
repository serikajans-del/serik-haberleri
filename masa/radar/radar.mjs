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
//     "kanca", "kanca_b"?, "aciklama", "gorsel_prompt", "gorsel_prompt_b"?, "neden", "zaman", "risk",
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
const html = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const kalin = (s = "") => html(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); // **kalın** → <b>
const norm = (s = "") => s.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function gorulduMu(anahtar) {
  const g = oku(GORULEN, []), a = norm(anahtar), sinir = Date.now() - 7 * 864e5;
  return g.some((x) => x.zaman > sinir && (norm(x.anahtar) === a || (a.length > 8 && (norm(x.anahtar).includes(a) || a.includes(norm(x.anahtar))))));
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

function mesaj(h, i, n) {
  const kaynak = (h.kaynaklar || []).map((k) => (k.url ? `<a href="${html(k.url)}">${html(k.ad)}</a>` : html(k.ad))).join(" · ");
  const satir = [
    `🔥 <b>VİRAL RADAR ${i}/${n}</b> · ${html(h.puan)}/18${h.pbY ? ` (P/B/Y ${html(h.pbY)})` : ""} · ${html(h.kategori || "GÜNDEM")}${h.tetik ? ` · ${html(h.tetik)}` : ""}`,
    "",
    `📰 <b>${html(h.baslik)}</b>`,
    h.neden ? `💡 <i>${html(h.neden)}</i>` : null,
    "",
    `🖼 <b>KANCA A</b> (fotoğraf içi metin):`,
    kalin(h.kanca),
    h.kanca_b ? `\n🅱️ <b>KANCA B</b>:\n${kalin(h.kanca_b)}` : null,
    "",
    `✍️ <b>AÇIKLAMA:</b>`,
    html(h.aciklama),
    "",
    `🎨 <b>GÖRSEL PROMPTU — hikâye karesi</b> (Temsili):`,
    `<code>${html(h.gorsel_prompt)}</code>`,
    h.gorsel_prompt_b ? `\n🔎 <b>Alternatif — detay karesi</b>:\n<code>${html(h.gorsel_prompt_b)}</code>` : null,
    "",
    `⏰ ${html(h.zaman || "")}${h.risk ? `  ·  ⚠️ ${html(h.risk)}` : ""}`,
    kaynak ? `🔗 ${kaynak}` : null,
  ];
  return satir.filter((x) => x !== null).join("\n");
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
  const yeni = tur.haberler.filter((h) => !gorulduMu(h.anahtar));
  if (!yeni.length) { console.log("Hepsi daha önce gönderilmiş"); process.exit(0); }
  const d = oku(DURUM, { sayac: 0, offset: 0 });
  let i = 0;
  for (const h of yeni) {
    i++; const no = ++d.sayac;
    const parca = parcala(mesaj(h, i, yeni.length));
    let son;
    for (let j = 0; j < parca.length; j++) {
      son = await tg("sendMessage", { chat_id: CHAT, text: parca[j], parse_mode: "HTML", disable_web_page_preview: true,
        ...(j === parca.length - 1 ? { reply_markup: DUGME(no) } : {}) });
    }
    if (h.foto_url) {
      try { await tg("sendPhoto", { chat_id: CHAT, photo: h.foto_url, caption: `📷 Haberin kendi görseli (fikir için, telif sahibine aittir): ${h.baslik}`.slice(0, 1000), reply_to_message_id: son.message_id }); }
      catch (e) { console.error("foto gönderilemedi:", e.message); }
    }
    isaretle({ no, mesaj_id: son.message_id, anahtar: h.anahtar, baslik: h.baslik, kategori: h.kategori, tetik: h.tetik, puan: h.puan, gonderildi: true });
    console.log("GÖNDERİLDİ", no, h.baslik);
  }
  kaydet(DURUM, d);
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
      try { await tg("answerCallbackQuery", { callback_query_id: u.callback_query.id, text: "Kaydedildi, radar bunu öğrenecek 👍" }); } catch { /* süresi geçmiş olabilir */ }
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
