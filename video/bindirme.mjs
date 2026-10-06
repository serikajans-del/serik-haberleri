// Haber videosu bindirmeleri (1920x1080 şeffaf PNG): logo, başlık bandı, isim bandı, kapanış kartı.
// Kullanım: node video/bindirme.mjs <klasör> "<başlık>" "<alt satır>" "<isim>" "<unvan>"
import sharp from "sharp";
const [out, baslik, altSatir, isim, unvan] = process.argv.slice(2);
const F = "Arial, Helvetica, sans-serif";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const svg = (ic) => Buffer.from(`<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">${ic}</svg>`);
const logo = (x, y) => `
  <rect x="${x}" y="${y}" width="150" height="64" fill="#d90000"/>
  <text x="${x + 75}" y="${y + 45}" font-family="${F}" font-size="38" font-weight="900" fill="#fff" text-anchor="middle">SERİK</text>
  <rect x="${x + 150}" y="${y}" width="250" height="64" fill="#111827"/>
  <text x="${x + 275}" y="${y + 43}" font-family="${F}" font-size="30" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="3">HABERLERİ</text>`;

await sharp(svg(logo(60, 48))).png().toFile(`${out}/logo.png`);
await sharp(svg(`
  <rect x="60" y="868" width="1800" height="100" fill="#ffffff"/>
  <rect x="60" y="868" width="14" height="100" fill="#d90000"/>
  <text x="100" y="936" font-family="${F}" font-size="54" font-weight="900" fill="#111827">${esc(baslik)}</text>
  <rect x="60" y="968" width="1800" height="54" fill="#d90000"/>
  <text x="100" y="1006" font-family="${F}" font-size="30" font-weight="700" fill="#fff">${esc(altSatir)}</text>
  <text x="1840" y="1006" font-family="${F}" font-size="26" font-weight="800" fill="#fff" text-anchor="end">serikhaberleri.com</text>`)).png().toFile(`${out}/bant.png`);
await sharp(svg(`
  <rect x="60" y="800" width="14" height="96" fill="#d90000"/>
  <rect x="74" y="800" width="620" height="56" fill="#111827"/>
  <text x="96" y="841" font-family="${F}" font-size="36" font-weight="900" fill="#fff">${esc(isim)}</text>
  <rect x="74" y="856" width="620" height="40" fill="#ffffff"/>
  <text x="96" y="885" font-family="${F}" font-size="25" font-weight="700" fill="#111827">${esc(unvan)}</text>`)).png().toFile(`${out}/isim.png`);
await sharp(svg(`
  <rect width="1920" height="1080" fill="#111827"/>
  <rect x="0" y="0" width="1920" height="12" fill="#d90000"/>
  ${logo(760, 440)}
  <text x="960" y="590" font-family="${F}" font-size="44" font-weight="800" fill="#fff" text-anchor="middle">serikhaberleri.com</text>
  <text x="960" y="650" font-family="${F}" font-size="28" fill="#9ca3af" text-anchor="middle">Serik, Belek, Kadriye ve Boğazkent'ten güncel haberler</text>`)).png().toFile(`${out}/kapanis.png`);
console.log("ok");
