// Müzekart kısa videosu için bindirme görselleri (şeffaf PNG).
import sharp from "sharp";
const out = process.argv[2];
const F = "Arial, Helvetica, sans-serif";
const kaydet = (ad, w, h, ic) => sharp(Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${ic}</svg>`)).png().toFile(`${out}/${ad}.png`);

// Temsili kimlik kartı (gerçek tasarımın kopyası değil; kişisel veri yok)
const kimlik = (ek = "") => `
  <defs><linearGradient id="k" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdf3f1"/><stop offset="1" stop-color="#f3d9d6"/></linearGradient>
  <filter id="g" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity="0.45"/></filter></defs>
  <g filter="url(#g)">
  <rect x="20" y="20" width="640" height="400" rx="28" fill="url(#k)" stroke="#ffffff" stroke-width="6"/>
  <rect x="20" y="20" width="640" height="78" rx="28" fill="#d90000"/><rect x="20" y="70" width="640" height="28" fill="#d90000"/>
  <circle cx="72" cy="59" r="22" fill="#fff"/><circle cx="80" cy="59" r="18" fill="#d90000"/>
  <path d="M96 59 l10 -3.5 -6.3 8.6 0 -10.2 6.3 8.6z" fill="#fff"/>
  <text x="122" y="54" font-family="${F}" font-size="24" font-weight="800" fill="#fff">TÜRKİYE CUMHURİYETİ</text>
  <text x="122" y="84" font-family="${F}" font-size="26" font-weight="900" fill="#fff" letter-spacing="2">KİMLİK KARTI</text>
  <rect x="52" y="128" width="170" height="216" rx="12" fill="#cfd6df"/>
  <circle cx="137" cy="204" r="42" fill="#8f9bab"/><path d="M67 344 q70 -110 140 0z" fill="#8f9bab"/>
  <rect x="252" y="136" width="120" height="14" rx="7" fill="#b9a3a0"/><rect x="252" y="160" width="300" height="24" rx="8" fill="#3b2f2f"/>
  <rect x="252" y="206" width="90" height="14" rx="7" fill="#b9a3a0"/><rect x="252" y="230" width="230" height="24" rx="8" fill="#3b2f2f"/>
  <rect x="252" y="276" width="140" height="14" rx="7" fill="#b9a3a0"/><rect x="252" y="300" width="180" height="24" rx="8" fill="#3b2f2f"/>
  <rect x="540" y="258" width="86" height="66" rx="10" fill="#e3b341" stroke="#b8891e" stroke-width="3"/>
  <path d="M540 280h86M540 302h86M568 258v66M598 258v66" stroke="#b8891e" stroke-width="3"/>
  <rect x="52" y="368" width="576" height="26" rx="8" fill="#e8c9c5"/>
  ${ek}</g>`;
await kaydet("kimlik", 680, 460, kimlik());
await kaydet("kimlik_muzekart", 680, 460, kimlik(`
  <g transform="rotate(-9 470 215)"><rect x="330" y="170" width="300" height="92" rx="14" fill="#0b3a5c" stroke="#ffd166" stroke-width="6"/>
  <text x="480" y="232" font-family="${F}" font-size="46" font-weight="900" fill="#ffd166" text-anchor="middle" letter-spacing="1">MÜZEKART</text></g>
  <circle cx="620" cy="60" r="44" fill="#16a34a" stroke="#fff" stroke-width="6"/><path d="M598 60l15 16 30 -32" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
const rozet = (metin, renk = "#0b3a5c", yazi = "#ffffff", w = 760, fs = 70) => `
  <defs><filter id="g" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.45"/></filter></defs>
  <g filter="url(#g)"><rect x="20" y="20" width="${w - 40}" height="130" rx="65" fill="${renk}" stroke="#fff" stroke-width="6"/>
  <text x="${w / 2}" y="108" font-family="${F}" font-size="${fs}" font-weight="900" fill="${yazi}" text-anchor="middle">${metin}</text></g>`;
await kaydet("edevlet", 760, 190, rozet("e-Devlet'ten başvuru", "#b91c1c", "#ffffff", 760, 54));
await kaydet("muze", 760, 190, rozet("MÜZE ve ÖREN YERLERİ", "#0b3a5c", "#ffd166", 760, 46));
await kaydet("y2026", 760, 190, rozet("2026 SONU: HAZIR", "#111827", "#ffd166", 760, 56));
await kaydet("y2027", 760, 190, rozet("2027: KİMLİKLE GİRİŞ", "#16a34a", "#ffffff", 760, 50));
// Üst başlık
await kaydet("baslik", 1080, 230, `
  <rect x="60" y="40" width="960" height="150" rx="26" fill="#d90000"/>
  <text x="540" y="104" font-family="${F}" font-size="50" font-weight="900" fill="#ffffff" text-anchor="middle">KİMLİK KARTIN ARTIK</text>
  <text x="540" y="166" font-family="${F}" font-size="58" font-weight="900" fill="#ffd166" text-anchor="middle" letter-spacing="2">MÜZEKART OLUYOR</text>`);
console.log("görseller tamam");
