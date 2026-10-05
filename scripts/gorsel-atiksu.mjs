import sharp from "sharp";

// Haber görseli (1200x675 bilgi kartı): Serik Atıksu Arıtma Tesisi yatırımı
const F = "Arial, Helvetica, sans-serif";
const svg = `
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b3a5c"/><stop offset="1" stop-color="#0f6b8f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <path d="M0 560 Q150 520 300 560 T600 560 T900 560 T1200 560 V675 H0 Z" fill="#ffffff" opacity="0.08"/>
  <path d="M0 600 Q150 565 300 600 T600 600 T900 600 T1200 600 V675 H0 Z" fill="#ffffff" opacity="0.10"/>
  <rect x="60" y="56" width="10" height="92" fill="#d90000"/>
  <text x="90" y="96" font-family="${F}" font-size="30" font-weight="700" fill="#bfe3f2" letter-spacing="3">SERİK ATIKSU ARITMA TESİSİ</text>
  <text x="90" y="142" font-family="${F}" font-size="40" font-weight="900" fill="#ffffff">Kapasite artışı ve altyapı yatırımı</text>

  <text x="90" y="290" font-family="${F}" font-size="26" font-weight="700" fill="#bfe3f2">GÜNLÜK ARITMA KAPASİTESİ (m³)</text>
  <text x="90" y="390" font-family="${F}" font-size="96" font-weight="900" fill="#ffffff">90.000</text>
  <path d="M470 355 H560 M535 330 L562 355 L535 380" stroke="#ffd166" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="600" y="390" font-family="${F}" font-size="96" font-weight="900" fill="#ffd166">122.500</text>

  <g font-family="${F}">
    <rect x="90" y="450" width="320" height="110" rx="8" fill="#ffffff" opacity="0.12"/>
    <text x="114" y="500" font-size="33" font-weight="900" fill="#ffffff">~750 milyon TL</text>
    <text x="114" y="536" font-size="22" fill="#bfe3f2">yatırım tutarı</text>
    <rect x="440" y="450" width="320" height="110" rx="8" fill="#ffffff" opacity="0.12"/>
    <text x="464" y="500" font-size="40" font-weight="900" fill="#ffffff">~15 km</text>
    <text x="464" y="536" font-size="22" fill="#bfe3f2">yeni atıksu hattı</text>
    <rect x="790" y="450" width="320" height="110" rx="8" fill="#ffffff" opacity="0.12"/>
    <text x="814" y="500" font-size="40" font-weight="900" fill="#ffffff">3</text>
    <text x="814" y="536" font-size="22" fill="#bfe3f2">yeni terfi istasyonu</text>
  </g>
  <text x="90" y="640" font-family="${F}" font-size="20" fill="#bfe3f2">Kaynak: ASAT Genel Müdürlüğü açıklaması</text>
  <text x="1110" y="640" font-family="${F}" font-size="22" font-weight="900" fill="#ffffff" text-anchor="end">serikhaberleri.com</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile("public/haber-gorsel/serik-atiksu-aritma-tesisi-yatirim.jpg");
console.log("ok");
