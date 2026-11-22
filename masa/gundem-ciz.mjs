// Gündem haberini kullanıcının "Serik Merkez · Haber Görseli Oluşturucu" şablonuna (claude.ai artifact K5Z4ZBFQbU71QFWMhUrdon,
// yerel kopya masa/gundem/sablon.html — 1080×1920, 9:16) başsız Chrome'da basar. Şablonun kendi render() kodu kullanılır.
// Kullanım: node masa/gundem-ciz.mjs <girdi.json> <cikti.jpg>
//   girdi.json: { title, body, badgeText, dateText, foto?: "yol.jpg", loc?, preset? }
import { spawn } from "child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve, dirname } from "path";
import { pathToFileURL, fileURLToPath } from "url";

const [girdi, cikti] = process.argv.slice(2);
const G = JSON.parse(readFileSync(girdi, "utf8"));
if (G.foto) G.fotoData = "data:image/jpeg;base64," + readFileSync(G.foto).toString("base64");
const SABLON = G.sablon ? resolve(G.sablon) : join(dirname(fileURLToPath(import.meta.url)), "gundem", "sablon.html");  // G.sablon: viral.py AHM çerçevesi
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9800 + (process.pid % 150);
const prof = mkdtempSync(join(tmpdir(), "gundem-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, "--window-size=1200,1000", "--no-first-run", "about:blank"], { stdio: "ignore" });
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
let hedef;
for (let i = 0; i < 80 && !hedef; i++) { await bekle(250); try { hedef = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((x) => x.type === "page"); } catch {} }
if (!hedef) { chrome.kill(); throw new Error("Chrome'a bağlanılamadı"); }
const ws = new WebSocket(hedef.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let sira = 0; const bekleyen = new Map(), olay = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && bekleyen.has(d.id)) { const [ok, h] = bekleyen.get(d.id); bekleyen.delete(d.id); d.error ? h(new Error(d.error.message)) : ok(d.result); } else if (d.method && olay.has(d.method)) { olay.get(d.method)(d.params); olay.delete(d.method); } };
const cdp = (method, params = {}) => new Promise((ok, h) => { const id = ++sira; bekleyen.set(id, [ok, h]); ws.send(JSON.stringify({ id, method, params })); });
const js = async (e) => { const r = await cdp("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
try {
  await cdp("Page.enable");
  const yuklendi = new Promise((r) => olay.set("Page.loadEventFired", r));
  await cdp("Page.navigate", { url: pathToFileURL(resolve(SABLON)).href });
  await yuklendi; await bekle(1500);
  const veri = await js(`(async () => {
    const G = ${JSON.stringify(G)};
    await new Promise(r => { if (TPL.complete && TPL.naturalWidth) r(); else TPL.onload = r; });
    S = Object.assign(DEF(), { title: G.title, body: G.body || "", badgeText: G.badgeText, badgeShow: true, dateText: G.dateText, dateShow: true,
      layout: G.fotoData ? "single" : "none", loc: G.loc || "", locShow: !!G.loc, credit: "", vpos: "center" }, G.ek || {});
    photos = [null, null];
    await loadFonts(); await document.fonts.ready;
    // ===== YERLEŞİM (kullanıcı 16 Kas: "yazılar şablona güzel sığsın, üstte fazla boşluk olmasın, metin okunur olsun,
    // dengesiz paragraf olmasın — uyum ve görünürlük en önemli görev") =====
    // Başlık ve metin boyu + fotoğraf yüksekliği BİRLİKTE aranır: yazı bloğu banttan hemen sonra başlar, fotoğrafa kadar boşluk kalmaz.
    // Satırlar dengelenir (son satırda tek kelime / yarım satır kalmaz).
    const Y = G.yerlesim || {};
    const TS = Y.baslik || [84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 64], BS = Y.metin || [48, 47, 46, 45, 44, 43, 42, 41, 40];
    const PH_MIN = Y.fotoMin || 540, PH_MAX = Y.fotoMax || 800, SABIT = Y.fotoSabit || 0, BOSLUK = 40;
    const orjT = G.title.trim(), orjB = (G.body || "").trim(), MW = W - 2 * SIDE;
    const satirlar = (t, w, f) => wrapRich(parseRich(t), w, f, f).lines;
    const yazi = (L) => L.map(l => l.map(x => x.segs.map(q => q.t).join("")).join(" ")).join(String.fromCharCode(10));
    function dengele(t, f, taban) { // en dar genişlikte aynı satır sayısı → satırlar eşitlenir
      if (!t) return { t, n: 0, son: 1 };
      const n = satirlar(t, MW, f).length; if (n < 2) return { t, n, son: 1 };
      let lo = MW * taban, hi = MW;
      if (satirlar(t, lo, f).length <= n) hi = lo; else for (let i = 0; i < 16; i++) { const m = (lo + hi) / 2; if (satirlar(t, m, f).length <= n) hi = m; else lo = m; }
      const L = satirlar(t, hi, f); ctx.font = f; const gen = L.map(l => ctx.measureText(yazi([l])).width);
      return { t: yazi(L), n: L.length, son: gen[gen.length - 1] / Math.max(...gen), tekKelime: L[L.length - 1].length === 1 };
    }
    // Başlık (kullanıcı 22 Kas: "başlıklar şiir gibi geliyor, sağda çok boşluk kalıyor, profesyonel görünmüyor"):
    // eskiden %60 genişliğe kadar daraltılıyordu → kısa kısa satırlar. Artık tam genişlikte doldurulur; yalnız son satırda
    // tek kelime / çok kısa satır kalırsa en az %85 genişlikte hafifçe dengelenir.
    function baslikSar(t, f) {
      const L = satirlar(t, MW, f); ctx.font = f;
      const olc = (L) => { const g = L.map(l => ctx.measureText(yazi([l])).width); return { t: yazi(L), n: L.length, son: g[g.length - 1] / Math.max(...g), tekKelime: L[L.length - 1].length === 1, dol: Math.max(...g) / MW }; };
      const tam = olc(L);
      if (tam.n < 2 || (!tam.tekKelime && tam.son >= .45)) return tam;
      const d = dengele(t, f, .85);
      return d.n === tam.n && (!d.tekKelime || tam.tekKelime) ? d : tam;
    }
    let en = null;
    for (const ts of TS) for (const bs of BS) {
      S.titleSize = ts; S.bodySize = bs;
      const tf = titleFonts(ts), bF = S.bodyFont === "Montserrat" ? "Montserrat" : "Inter";
      const T = baslikSar(orjT, tf.fN), B = dengele(orjB, S.bodyWeight + " " + bs + "px " + bF + ",Arial,sans-serif", .92);
      S.title = T.t; S.body = B.t;
      const bh = buildBlock(1).h;
      const yer = PHOTO_BOTTOM - BOSLUK - TEXT_TOP - bh; // yazıdan sonra fotoğrafa kalan
      const ph = G.fotoData ? (SABIT || Math.floor(Math.min(PH_MAX, yer))) : 0;
      if (!globalThis.__iz || bh < globalThis.__iz.bh) globalThis.__iz = { bh: Math.round(bh), ts, bs, t: T.n, b: B.n };
      if (G.fotoData && ph < PH_MIN) continue;
      const bosluk = G.fotoData ? yer - ph : yer;
      const puan = bs * 4 + ts * 1.2 - bosluk * .5 - Math.max(0, T.n - 3) * 200 - Math.max(0, T.n - 2) * 30 + (T.dol || 1) * 80 - Math.max(0, B.n - 7) * 25 + Math.min(ph, 720) * .03
        - (B.n > 1 && B.son < .5 ? 40 : 0) - (T.n > 1 && T.son < .5 ? 40 : 0) - (B.tekKelime ? 60 : 0) - (T.tekKelime && T.n > 1 ? 60 : 0);
      if (!en || puan > en.puan) en = { puan, ts, bs, ph, bosluk: Math.round(bosluk), T, B };
    }
    if (!en) return { hata: "METİN UZUN: en küçük yazı boyunda (başlık " + TS.at(-1) + ", metin " + BS.at(-1) + ") bile fotoğrafa " + PH_MIN + " px kalmıyor — metni kısalt " + "(en sıkı hâl: başlık " + __iz.t + " satır, metin " + __iz.b + " satır; " + (Math.round(__iz.bh) - (PHOTO_BOTTOM - BOSLUK - TEXT_TOP - PH_MIN)) + " px fazla)" };
    S.titleSize = en.ts; S.bodySize = en.bs; S.title = en.T.t; S.body = en.B.t; S.photoH = en.ph || S.photoH; S.autoPhoto = false;
    if (G.fotoData) { // çerçeve iç ölçüsüne kırpmadan sığdır, kalan yer aynı fotoğrafın bulanık hâli (kullanıcı: "görsel mutlaka çerçeveye sığmalı")
      const im = new Image(); im.src = G.fotoData; await im.decode();
      const CW = W - 116 - 2 * S.frameW, CH = en.ph - 2 * S.frameW, c = document.createElement("canvas"); c.width = CW; c.height = CH; const x = c.getContext("2d");
      x.imageSmoothingQuality = "high";
      if (G.dolgu === "kenar") { // grafik kartı: kalan yer kartın kendi zemin rengi
        const t = document.createElement("canvas"); t.width = t.height = 1; const tx = t.getContext("2d"); tx.drawImage(im, 2, 2, 1, 1, 0, 0, 1, 1);
        const d = tx.getImageData(0, 0, 1, 1).data; x.fillStyle = "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")"; x.fillRect(0, 0, CW, CH);
      } else {
        const kz = Math.max(CW / im.naturalWidth, CH / im.naturalHeight); x.filter = "blur(28px)";
        x.drawImage(im, (CW - im.naturalWidth * kz) / 2, (CH - im.naturalHeight * kz) / 2, im.naturalWidth * kz, im.naturalHeight * kz); x.filter = "none";
      }
      const ki = Math.min(CW / im.naturalWidth, CH / im.naturalHeight), w = im.naturalWidth * ki, h = im.naturalHeight * ki;
      x.drawImage(im, (CW - w) / 2, (CH - h) / 2, w, h);
      if (G.temsili) { x.font = "600 22px Inter,Arial"; const tw = x.measureText("Temsili görsel").width; x.fillStyle = "rgb(10,12,20)"; x.beginPath(); x.roundRect(CW - tw - 40, CH - 50, tw + 28, 36, 8); x.fill(); x.fillStyle = "#fff"; x.textBaseline = "middle"; x.fillText("Temsili görsel", CW - 26 - tw, CH - 32); }
      const p = { img: c, ox: 0, oy: 0, zoom: 1, blob: null }; processPhoto(p); photos[0] = p;
    }
    render(true);
    const yerlesim = { baslikBoy: en.ts, metinBoy: en.bs, foto: en.ph, ustBosluk: en.bosluk, baslikSatir: en.T.n, metinSatir: en.B.n,
      sonSatir: Math.round(en.B.son * 100), tekKelime: !!(en.B.tekKelime || (en.T.n > 1 && en.T.tekKelime)) };
    return { url: cv.toDataURL("image/jpeg", .93), fitted, yerlesim, cap: (updateCaption(), document.getElementById("caption").value) };
  })()`);
  if (veri.hata) { console.error(veri.hata); process.exitCode = 3; throw new Error(veri.hata); }
  writeFileSync(cikti, Buffer.from(veri.url.split(",")[1], "base64"));
  writeFileSync(cikti.replace(/\.jpg$/, ".txt"), veri.cap);
  console.log(JSON.stringify({ ok: true, kucultuldu: veri.fitted, yerlesim: veri.yerlesim }));
} finally { ws.close(); chrome.kill(); await bekle(300); try { rmSync(prof, { recursive: true, force: true }); } catch {} }
