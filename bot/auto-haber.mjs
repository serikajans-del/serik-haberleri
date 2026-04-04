/**
 * Serik Haberleri - Otomatik Haber Botu
 * Haberleri direkt kaynaktan çeker, aynen yayınlar
 * Kaynak: serikpostasi.com, iha.com.tr, sondakika.com
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_MODE            = process.argv.includes("--test");
const DAEMON_MODE          = process.argv.includes("--daemon");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Eksik ortam değişkeni: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Kategoriler ───────────────────────────────────────────────────────────────
const KATEGORILER = [
  { name: "Gündem",  slug: "gundem"  },
  { name: "Asayiş",  slug: "asayis"  },
  { name: "Ekonomi", slug: "ekonomi" },
  { name: "Spor",    slug: "spor"    },
  { name: "Sağlık",  slug: "saglik"  },
  { name: "Eğitim",  slug: "egitim"  },
  { name: "Yaşam",   slug: "yasam"   },
  { name: "Turizm",  slug: "turizm"  },
];

// ── Kaynaklar ─────────────────────────────────────────────────────────────────
const KAYNAKLAR = [
  {
    ad: "Serik Postası",
    url: "https://serikpostasi.com/",
    base: "https://serikpostasi.com",
    linkRegex: /href=['"]?(https?:\/\/serikpostasi\.com\/haber\/[^'">\s]+)|href=['"]?(\/haber\/[^'">\s]+)/g,
  },
  {
    ad: "İHA",
    url: "https://www.iha.com.tr/antalya-haberleri/",
    base: "https://www.iha.com.tr",
    linkRegex: /href="(\/antalya-haberleri\/[^"#?]+)"/g,
  },
  {
    ad: "Son Dakika",
    url: "https://www.sondakika.com/antalya/",
    base: "https://www.sondakika.com",
    linkRegex: /href="(\/[a-z-]+\/haber-[^"#?]+)"/g,
  },
];

// ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function htmlDecode(str = "") {
  return str
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&ccedil;/g, "ç").replace(/&uuml;/g, "ü").replace(/&ouml;/g, "ö")
    .replace(/&iuml;/g, "ı").replace(/&szlig;/g, "ş").replace(/&yuml;/g, "ğ")
    .replace(/&Ccedil;/g, "Ç").replace(/&Uuml;/g, "Ü").replace(/&Ouml;/g, "Ö")
    .replace(/&Iuml;/g, "İ").replace(/&Szlig;/g, "Ş").replace(/&Yuml;/g, "Ğ");
}

function htmlTemizle(html = "") {
  return htmlDecode(html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(?:div|section|aside|nav|header|footer|figure|figcaption|form|button|iframe|noscript)[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim());
}

function kategoriTahmini(metin) {
  const m = metin.toLowerCase();
  if (/polis|jandarma|kaza|yangın|suç|gözaltı|yaralı|öldü|hayatını|hırsız|uyuşturucu|tutuklama|cinayet|soygun/.test(m)) return KATEGORILER[1];
  if (/ekonomi|enflasyon|fiyat|market|esnaf|vergi|ticaret|ihale|bütçe|kredi|faiz/.test(m))                               return KATEGORILER[2];
  if (/futbol|maç|lig|gol|spor|serikspor|şampiyona|basketbol|voleybol|turnuva|güreş|atletizm/.test(m))                   return KATEGORILER[3];
  if (/sağlık|hastane|doktor|ameliyat|aşı|hastalık|tedavi|ilaç|ambulans/.test(m))                                        return KATEGORILER[4];
  if (/okul|öğrenci|eğitim|üniversite|sınav|mezun|öğretmen|burs|lise/.test(m))                                           return KATEGORILER[5];
  if (/turizm|tatil|plaj|otel|kültür|festival|tarihi|antik|side|boğazkent|manavgat/.test(m))                             return KATEGORILER[7];
  if (/yemek|yaşam|doğa|hava|çevre|etkinlik|konser|sergi/.test(m))                                                       return KATEGORILER[6];
  return KATEGORILER[0];
}

async function sayfaCek(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ── Makale Çekici ─────────────────────────────────────────────────────────────
async function makaleCek(url) {
  const html = await sayfaCek(url);
  if (!html) return null;

  // Başlık
  const baslikMatch =
    html.match(/<h1[^>]*>([\s\S]{5,200}?)<\/h1>/i) ||
    html.match(/<title>([\s\S]{5,200}?)<\/title>/i);
  const baslik = baslikMatch ? htmlDecode(baslikMatch[1].replace(/<[^>]+>/g, "").trim()) : "";

  // Görsel — og:image veya ilk büyük resim
  const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
                  html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  let gorsel = ogImage ? ogImage[1] : "";

  if (!gorsel) {
    const imgMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]{20,}\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    gorsel = imgMatch ? imgMatch[1] : "";
  }

  // Özet — og:description
  const descMatch = html.match(/<meta[^>]+(?:property="og:description"|name="description")[^>]+content="([^"]{10,300})"/i) ||
                    html.match(/<meta[^>]+content="([^"]{10,300})"[^>]+(?:property="og:description"|name="description")/i);
  const ozet = descMatch ? htmlDecode(descMatch[1].trim()) : "";

  // İçerik — makale gövdesi
  const icerikPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class="[^"]*(?:haber-detay|haberDetay|haber_detay|haber-icerik|habericerik|news-detail|news-body|article-body|entry-content|post-content|icerik-alani)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]+id="[^"]*(?:habericerik|haber-icerik|icerik|content|article-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  let icerikHtml = "";
  for (const pat of icerikPatterns) {
    const m = html.match(pat);
    if (m) { icerikHtml = m[0]; break; }
  }

  // Paragrafları topla
  let paragraflar = [];
  if (icerikHtml) {
    const pRegex = /<p[^>]*>([\s\S]{15,600}?)<\/p>/gi;
    let pm;
    while ((pm = pRegex.exec(icerikHtml)) !== null) {
      const t = htmlTemizle(pm[1]);
      if (t.length > 15 && !/cookie|reklam|abone|paylaş|yorumlar/i.test(t)) {
        paragraflar.push(t);
      }
    }
  }

  // Paragraf bulunamadıysa tüm sayfadan çek
  if (paragraflar.length < 2) {
    const pRegex = /<p[^>]*>([\s\S]{30,600}?)<\/p>/gi;
    let pm;
    while ((pm = pRegex.exec(html)) !== null) {
      const t = htmlTemizle(pm[1]);
      if (t.length > 30 && !/cookie|reklam|abone|paylaş|javascript/i.test(t)) {
        paragraflar.push(t);
      }
    }
    paragraflar = paragraflar.slice(0, 8);
  }

  if (paragraflar.length === 0) return null;

  // HTML içeriği oluştur
  const icerik = paragraflar
    .slice(0, 10)
    .map(p => `<p>${p}</p>`)
    .join("\n");

  return { baslik, ozet, icerik, gorsel };
}

// ── Haber Listesi Çekici ──────────────────────────────────────────────────────
async function haberlerCek(kaynak) {
  console.log(`\n📡 ${kaynak.ad} çekiliyor...`);
  const html = await sayfaCek(kaynak.url);
  if (!html) { console.warn(`   ⚠️  Erişilemedi`); return []; }

  const linkler = new Set();
  let match;
  const regex = new RegExp(kaynak.linkRegex.source, "g");
  while ((match = regex.exec(html)) !== null) {
    const path = match[1] || match[2];
    if (!path || path.length < 10 || /rss|feed|javascript|#/.test(path)) continue;
    const fullUrl = path.startsWith("http") ? path : kaynak.base + path;
    linkler.add(fullUrl);
  }

  const urls = [...linkler].slice(0, 30);
  console.log(`   ✓ ${urls.length} haber linki bulundu`);
  return urls.map(url => ({ url, kaynak: kaynak.ad }));
}

// ── Mevcut Haberler ───────────────────────────────────────────────────────────
async function mevcutSluglar() {
  const { data } = await supabase
    .from("haberler")
    .select("slug, title")
    .order("published_at", { ascending: false })
    .limit(500);
  return new Set((data || []).map(h => slugify(h.title).slice(0, 30)));
}

// ── Supabase Kayıt ────────────────────────────────────────────────────────────
async function supabaseKaydet(haber, kaynak) {
  const slug  = slugify(haber.baslik) + "-" + Date.now().toString(36);
  const kat   = kategoriTahmini(haber.baslik + " " + haber.ozet + " " + haber.icerik);

  const kayit = {
    title:         haber.baslik,
    slug,
    summary:       haber.ozet || haber.baslik,
    content:       haber.icerik,
    category:      kat.name,
    category_slug: kat.slug,
    image:         haber.gorsel || `https://picsum.photos/seed/${Date.now()}/860/504`,
    author:        kaynak,
    published_at:  new Date().toISOString(),
    featured:      false,
    tags:          [],
  };

  const { error } = await supabase.from("haberler").insert([kayit]);
  if (error) throw error;
  return { slug, kategori: kat.name };
}

// ── Ana Fonksiyon ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🤖 Serik Haber Botu — ${new Date().toLocaleString("tr-TR")}`);
  if (TEST_MODE) console.log("⚠️  TEST MODU\n");

  // Tüm kaynaklardan linkleri topla
  let tumLinkler = [];
  for (const kaynak of KAYNAKLAR) {
    const linkler = await haberlerCek(kaynak);
    tumLinkler = [...tumLinkler, ...linkler];
  }

  // Mevcut haberleri kontrol et
  const mevcutlar = await mevcutSluglar();

  // Her haber için makaleyi çek
  let basarili = 0;
  let denenen  = 0;

  for (const item of tumLinkler) {
    if (basarili >= 10) break; // Her çalışmada max 10 haber

    try {
      const makale = await makaleCek(item.url);
      if (!makale || !makale.baslik || makale.baslik.length < 5) continue;
      if (makale.paragraflar?.length === 0 && !makale.icerik) continue;

      // Daha önce eklendi mi?
      const anahtar = slugify(makale.baslik).slice(0, 30);
      if (mevcutlar.has(anahtar)) continue;
      mevcutlar.add(anahtar);

      denenen++;
      console.log(`\n✍️  [${item.kaynak}] ${makale.baslik.slice(0, 65)}`);

      if (!TEST_MODE) {
        const { slug, kategori } = await supabaseKaydet(makale, item.kaynak);
        console.log(`   ✅ [${kategori}] /haber/${slug}`);
      } else {
        const kat = kategoriTahmini(makale.baslik + " " + makale.ozet);
        console.log(`   🔍 [TEST] Kategori: ${kat.name} | Görsel: ${makale.gorsel ? "✓" : "✗"}`);
        console.log(`   📄 İçerik: ${makale.icerik.slice(0, 120)}...`);
      }

      basarili++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`   ❌ ${err.message}`);
    }
  }

  console.log(`\n🎉 ${basarili} haber eklendi`);
  console.log(`⏰ Sonraki: ${new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString("tr-TR")}\n`);
}

// ── Daemon Modu ───────────────────────────────────────────────────────────────
if (DAEMON_MODE) {
  console.log(`\n⚙️  DAEMON — Her 3 saatte otomatik çalışır. Durdurmak: Ctrl+C\n`);
  (async () => {
    while (true) {
      try { await main(); } catch (e) { console.error("❌", e.message); }
      await new Promise(r => setTimeout(r, 3 * 60 * 60 * 1000));
    }
  })();
} else {
  main().catch(console.error);
}
