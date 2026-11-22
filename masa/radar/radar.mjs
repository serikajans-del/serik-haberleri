// ANTALYA HABER MEDYA · VİRAL RADAR GÖNDERİCİSİ (22 Kas 2026)
// Radar turunun bulduğu haberleri @antalyahaberci_bot ("haberantalya_bot") üzerinden kullanıcıya iletir.
// Eski GitHub iş akışı "Saatlik Antalya Haber Taraması" (serik-haber-bot deposu) bunun yerine kapatıldı.
//
// Kullanım (serik-haberleri klasöründen):
//   node --env-file=.env.local masa/radar/radar.mjs gonder masa/radar/tur.json  → turdaki haberleri gönderir, görülenlere yazar
//   node --env-file=.env.local masa/radar/radar.mjs goruldu "anahtar"          → bu konu var mı? (EVET/HAYIR)
//   node --env-file=.env.local masa/radar/radar.mjs atla "anahtar"             → konuyu göndermeden görüldü say
//   node --env-file=.env.local masa/radar/radar.mjs yaz "metin"                → düz mesaj (bilgi/hata)
//   node --env-file=.env.local masa/radar/radar.mjs deneme                     → bağlantı testi
//
// tur.json: { "haberler": [ { "anahtar", "baslik", "kanca", "aciklama", "gorsel_prompt", "puan", "pbY": "5/3/5",
//              "kategori", "kaynaklar": [{"ad","url"}], "zaman", "risk", "foto_url"? } ] }
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";

const TOKEN = process.env.ANTALYA_BOT_TOKEN;
if (!TOKEN) { console.error("ANTALYA_BOT_TOKEN .env.local içinde olmalı"); process.exit(1); }
const API = `https://api.telegram.org/bot${TOKEN}`;
const KOK = "masa/radar";
mkdirSync(KOK, { recursive: true });
const GORULEN = `${KOK}/gorulen.json`;
const oku = (f, v) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : v);
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
// **kalın** → <b>kalın</b> (kanca metnindeki vurgu)
const kalin = (s = "") => html(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const norm = (s = "") => s.toLocaleLowerCase("tr").replace(/[^a-zçğıöşü0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function gorulduMu(anahtar) {
  const g = oku(GORULEN, []), a = norm(anahtar);
  const sinir = Date.now() - 7 * 864e5; // 7 gün
  return g.some((x) => x.zaman > sinir && (norm(x.anahtar) === a || (a.length > 8 && (norm(x.anahtar).includes(a) || a.includes(norm(x.anahtar))))));
}
function isaretle(anahtar, baslik, gonderildi) {
  const g = oku(GORULEN, []).filter((x) => x.zaman > Date.now() - 30 * 864e5);
  g.push({ anahtar, baslik: baslik || "", gonderildi, zaman: Date.now() });
  kaydet(GORULEN, g);
}

function mesaj(h, i, n) {
  const kaynak = (h.kaynaklar || []).map((k) => (k.url ? `<a href="${html(k.url)}">${html(k.ad)}</a>` : html(k.ad))).join(" · ");
  return [
    `🔥 <b>VİRAL RADAR ${i}/${n}</b> — ${html(h.puan)}/18${h.pbY ? ` (P/B/Y ${html(h.pbY)})` : ""} · ${html(h.kategori || "GÜNDEM")}`,
    "",
    `📰 <b>${html(h.baslik)}</b>`,
    "",
    `🖼 <b>FOTOĞRAF İÇİ METİN (kanca):</b>`,
    kalin(h.kanca),
    "",
    `✍️ <b>AÇIKLAMA:</b>`,
    html(h.aciklama),
    "",
    `🎨 <b>GÖRSEL PROMPTU</b> (Temsili):`,
    `<code>${html(h.gorsel_prompt)}</code>`,
    "",
    `⏰ ${html(h.zaman || "")}${h.risk ? `  ·  ⚠️ ${html(h.risk)}` : ""}`,
    kaynak ? `🔗 ${kaynak}` : "",
  ].filter((x) => x !== null).join("\n");
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
  isaretle(arg || "", "", false); console.log("İŞARETLENDİ");
} else if (komut === "gonder") {
  const tur = oku(arg || `${KOK}/tur.json`, null);
  if (!tur?.haberler?.length) { console.log("Gönderilecek haber yok"); process.exit(0); }
  const yeni = tur.haberler.filter((h) => !gorulduMu(h.anahtar));
  const n = yeni.length;
  if (!n) { console.log("Hepsi daha önce gönderilmiş"); process.exit(0); }
  let i = 0;
  for (const h of yeni) {
    i++;
    const metin = mesaj(h, i, n);
    if (h.foto_url && metin.length <= 1024) {
      try { await tg("sendPhoto", { chat_id: CHAT, photo: h.foto_url, caption: metin, parse_mode: "HTML" }); isaretle(h.anahtar, h.baslik, true); console.log("GÖNDERİLDİ (foto)", h.baslik); continue; }
      catch (e) { console.error("foto gönderilemedi, metinle devam:", e.message); }
    }
    await tg("sendMessage", { chat_id: CHAT, text: metin.slice(0, 4096), parse_mode: "HTML", disable_web_page_preview: true });
    isaretle(h.anahtar, h.baslik, true);
    console.log("GÖNDERİLDİ", h.baslik);
  }
} else {
  console.log("Komutlar: gonder <tur.json> | goruldu <anahtar> | atla <anahtar> | yaz <metin> | deneme");
}
