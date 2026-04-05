/**
 * Serik Haberleri - Otomatik Haber Botu
 * RSS + HTML kaynaklarından haber çeker, Supabase'e kaydeder
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_MODE            = process.argv.includes("--test");
const DAEMON_MODE          = process.argv.includes("--daemon");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Eksik ortam değişkeni: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Twitter OAuth 1.0a ────────────────────────────────────────────────────────
const TW_API_KEY    = process.env.TWITTER_API_KEY;
const TW_API_SECRET = process.env.TWITTER_API_SECRET;
const TW_TOKEN      = process.env.TWITTER_ACCESS_TOKEN;
const TW_TOKEN_SEC  = process.env.TWITTER_ACCESS_TOKEN_SECRET;

async function tweetGonder(text) {
  if (!TW_API_KEY || !TW_TOKEN) return;
  try {
    const url    = "https://api.twitter.com/1.1/statuses/update.json";
    const body   = { status: text };
    const allP   = { ...buildOAuthParams(), ...body };
    const paramStr = Object.keys(allP).sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allP[k])}`).join("&");
    const base   = `POST&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`;
    const key    = `${encodeURIComponent(TW_API_SECRET)}&${encodeURIComponent(TW_TOKEN_SEC)}`;
    const oauth  = buildOAuthParams();
    oauth.oauth_signature = crypto.createHmac("sha1", key).update(base).digest("base64");
    const authHeader = "OAuth " + Object.keys(oauth).sort()
      .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauth[k])}"`)
      .join(", ");
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log(`   🐦 Tweet gönderildi: ${data?.id_str}`);
  } catch (err) {
    console.error(`   🐦 Tweet hatası: ${err.message}`);
  }
}

function buildOAuthParams() {
  return {
    oauth_consumer_key:     TW_API_KEY,
    oauth_nonce:            crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
    oauth_token:            TW_TOKEN,
    oauth_version:          "1.0",
  };
}

function serikHaberiMi(baslik, ozet = "") {
  const metin = (baslik + " " + ozet).toLowerCase();
  return /serik|side ilçe|boğazkent|belek|kadriye|manavgat/.test(metin);
}

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

// ── RSS Kaynakları ────────────────────────────────────────────────────────────
const RSS_KAYNAKLAR = [
  { ad: "TRT Haber",       url: "https://www.trthaber.com/sondakika.rss" },
  { ad: "Antalya Postası", url: "https://www.antalyapostasi.com/feed/" },
  { ad: "Milliyet",        url: "https://www.milliyet.com.tr/rss/rssNew/sondakikaHaberleri.xml" },
  { ad: "Sabah",           url: "https://www.sabah.com.tr/rss/anasayfa.xml" },
  { ad: "İHA",             url: "https://www.iha.com.tr/rss/antalya-haberleri-rss.xml" },
  { ad: "DHA",             url: "https://www.dha.com.tr/rss/antalya" },
  { ad: "Haber7",          url: "https://www.haber7.com/rss.xml" },
  { ad: "Yeni Şafak",      url: "https://www.yenisafak.com/Rss/Gundem" },
];

// ── HTML Kaynakları ───────────────────────────────────────────────────────────
const HTML_KAYNAKLAR = [
  {
    ad: "Serik Postası",
    url: "https://serikpostasi.com/",
    base: "https://serikpostasi.com",
    linkRegex: /href=['"]?(https?:\/\/serikpostasi\.com\/haber\/[^'">\s]+)|href=['"]?(\/haber\/[^'">\s]+)/g,
  },
  {
    ad: "İHA Antalya",
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
  {
    ad: "Antalya Haber",
    url: "https://www.antalyahaber.com.tr/",
    base: "https://www.antalyahaber.com.tr",
    linkRegex: /href="(\/[a-z0-9-]+\/[a-z0-9-]+-\d+)"/g,
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

// ── RSS Çekici ────────────────────────────────────────────────────────────────
async function rssHaberlerCek(feed) {
  console.log(`\n📡 [RSS] ${feed.ad} çekiliyor...`);
  const xml = await sayfaCek(feed.url);
  if (!xml) { console.warn(`   ⚠️  RSS erişilemedi`); return []; }

  const items = [];
  const CDATA = (s) => s?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() ?? "";

  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleRaw = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const linkRaw  = block.match(/<link[^>]*>([^<]+)<\/link>/i)?.[1]
                  ?? block.match(/<guid[^>]*isPermaLink="true"[^>]*>([^<]+)<\/guid>/i)?.[1]
                  ?? block.match(/<guid[^>]*>([^<]+)<\/guid>/i)?.[1]
                  ?? "";
    const descRaw  = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ?? "";
    const pubDate  = block.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/i)?.[1] ?? "";
    const imgMatch = block.match(/<media:thumbnail[^>]+url="([^"]+)"/i)
                  ?? block.match(/<enclosure[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)
                  ?? block.match(/<media:content[^>]+url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);

    const baslik = htmlDecode(CDATA(titleRaw)).replace(/<[^>]+>/g, "").trim();
    const link   = CDATA(linkRaw).trim();
    const ozet   = htmlTemizle(CDATA(descRaw)).slice(0, 400);
    const gorsel = imgMatch ? imgMatch[1] : "";

    if (!baslik || baslik.length < 5 || !link.startsWith("http")) continue;

    // Sadece son 24 saatin haberlerini al
    if (pubDate) {
      const pub = new Date(pubDate);
      if (!isNaN(pub) && (Date.now() - pub.getTime()) > 24 * 60 * 60 * 1000) continue;
    }

    items.push({ url: link, baslik, ozet, gorsel, kaynak: feed.ad });
  }

  console.log(`   ✓ ${items.length} RSS haberi (son 24 saat)`);
  return items;
}

// ── Makale Çekici ─────────────────────────────────────────────────────────────
async function makaleCek(url, rssOnBilgi = {}) {
  const html = await sayfaCek(url);
  if (!html) return null;

  // Başlık — önce RSS'den gelen bilgi, yoksa sayfadan çek
  let baslik = rssOnBilgi.baslik || "";
  if (!baslik) {
    const baslikMatch =
      html.match(/<h1[^>]*>([\s\S]{5,200}?)<\/h1>/i) ||
      html.match(/<title>([\s\S]{5,200}?)<\/title>/i);
    baslik = baslikMatch ? htmlDecode(baslikMatch[1].replace(/<[^>]+>/g, "").trim()) : "";
  }

  // Görsel — önce RSS'den, yoksa og:image, son çare ilk büyük resim
  let gorsel = rssOnBilgi.gorsel || "";
  if (!gorsel) {
    const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
                    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    gorsel = ogImage ? ogImage[1] : "";
  }
  if (!gorsel) {
    const imgMatch = html.match(/<img[^>]+src="(https?:\/\/[^"]{20,}\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    gorsel = imgMatch ? imgMatch[1] : "";
  }

  // Özet — önce RSS'den, yoksa og:description
  let ozet = rssOnBilgi.ozet || "";
  if (!ozet) {
    const descMatch = html.match(/<meta[^>]+(?:property="og:description"|name="description")[^>]+content="([^"]{10,300})"/i) ||
                      html.match(/<meta[^>]+content="([^"]{10,300})"[^>]+(?:property="og:description"|name="description")/i);
    ozet = descMatch ? htmlDecode(descMatch[1].trim()) : "";
  }

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

  const temizHtml = (icerikHtml || html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(?:div|section)[^>]*(?:ilgili|related|yorum|comment|sidebar|reklam|banner|social|share|tag|etiket)[^>]*>[\s\S]*?<\/(?:div|section)>/gi, "")
    .replace(/<(?:div|section)[^>]*(?:class|id)="[^"]*(?:ilgili|related|yorum|comment|sidebar|widget|banner|share|social|footer|header)[^"]*"[^>]*>[\s\S]{0,2000}?<\/(?:div|section)>/gi, "");

  let paragraflar = [];
  const kaynakHtml = icerikHtml ? temizHtml : html;
  const pRegex = /<p[^>]*>([\s\S]{20,800}?)<\/p>/gi;
  let pm;
  while ((pm = pRegex.exec(kaynakHtml)) !== null) {
    const t = htmlTemizle(pm[1]);
    if (
      t.length < 20 ||
      /cookie|reklam|abone|paylaş|yorumlar|javascript|tıklayın|buraya tıkla|daha fazla|devamını oku/i.test(t) ||
      /^[A-ZÇĞİÖŞÜ\s]{10,}$/.test(t) ||
      t.split(" ").length < 4
    ) continue;
    paragraflar.push(t);
  }

  if (paragraflar.length < 2) {
    const pRegex2 = /<p[^>]*>([\s\S]{30,800}?)<\/p>/gi;
    while ((pm = pRegex2.exec(html)) !== null) {
      const t = htmlTemizle(pm[1]);
      if (t.length > 30 && t.split(" ").length >= 5 && !/cookie|reklam|javascript/i.test(t)) {
        paragraflar.push(t);
      }
    }
    paragraflar = [...new Set(paragraflar)].slice(0, 8);
  }

  // İçerik yoksa özet veya başlıkla devam et
  let icerik;
  if (paragraflar.length === 0) {
    if (ozet && ozet.length > 60) {
      icerik = `<p>${ozet}</p>`;
    } else {
      return null;
    }
  } else {
    icerik = paragraflar.slice(0, 8).map(p => `<p>${p}</p>`).join("\n");
  }

  return { baslik, ozet, icerik, gorsel };
}

// ── HTML Kaynak Linkleri ──────────────────────────────────────────────────────
async function htmlHaberlerCek(kaynak) {
  console.log(`\n📡 [HTML] ${kaynak.ad} çekiliyor...`);
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
async function mevcutlar() {
  const { data } = await supabase
    .from("haberler")
    .select("slug, title")
    .order("published_at", { ascending: false })
    .limit(500);
  const set = new Set((data || []).map(h => slugify(h.title).slice(0, 40)));
  return set;
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

  // Mevcut haberleri çek (dedup için)
  const mevcut = await mevcutlar();
  console.log(`   📚 DB'de ${mevcut.size} haber (slug) var`);

  let tumItems = [];

  // 1) RSS kaynaklarından topla
  for (const feed of RSS_KAYNAKLAR) {
    try {
      const items = await rssHaberlerCek(feed);
      tumItems = [...tumItems, ...items];
    } catch (e) {
      console.warn(`   ⚠️  RSS hatası ${feed.ad}: ${e.message}`);
    }
  }

  // 2) HTML kaynaklarından topla (RSS başarısız olursa yedek)
  for (const kaynak of HTML_KAYNAKLAR) {
    try {
      const items = await htmlHaberlerCek(kaynak);
      tumItems = [...tumItems, ...items];
    } catch (e) {
      console.warn(`   ⚠️  HTML hatası ${kaynak.ad}: ${e.message}`);
    }
  }

  // URL'ye göre tekilleştir
  const urlSet = new Set();
  tumItems = tumItems.filter(item => {
    if (urlSet.has(item.url)) return false;
    urlSet.add(item.url);
    return true;
  });

  console.log(`\n   🔗 Toplam ${tumItems.length} unique link`);

  // Önce başlığı bilinen (RSS) öğeleri, bilinmeyenleri sona koy
  tumItems.sort((a, b) => (b.baslik ? 1 : 0) - (a.baslik ? 1 : 0));

  let basarili = 0;

  for (const item of tumItems) {
    if (basarili >= 20) break; // Her çalışmada max 20 haber

    try {
      // RSS'den başlık geldiyse önce dedup kontrolü yap (sayfa çekmeden)
      if (item.baslik) {
        const anahtar = slugify(item.baslik).slice(0, 40);
        if (mevcut.has(anahtar)) continue;
      }

      const makale = await makaleCek(item.url, item);
      if (!makale || !makale.baslik || makale.baslik.length < 5) continue;

      const anahtar = slugify(makale.baslik).slice(0, 40);
      if (mevcut.has(anahtar)) continue;
      mevcut.add(anahtar);

      console.log(`\n✍️  [${item.kaynak}] ${makale.baslik.slice(0, 65)}`);

      if (!TEST_MODE) {
        const { slug, kategori } = await supabaseKaydet(makale, item.kaynak);
        console.log(`   ✅ [${kategori}] /haber/${slug}`);
        if (serikHaberiMi(makale.baslik, makale.ozet)) {
          const tweetMetin = [
            `📰 ${makale.baslik}`.slice(0, 210),
            "",
            `https://www.serikhaberleri.com/haber/${slug}`,
            "",
            "#Serik #SerikHaberleri #Antalya",
          ].join("\n");
          await tweetGonder(tweetMetin);
        }
      } else {
        const kat = kategoriTahmini(makale.baslik + " " + makale.ozet);
        console.log(`   🔍 [TEST] Kategori: ${kat.name} | Görsel: ${makale.gorsel ? "✓" : "✗"}`);
        console.log(`   📄 İçerik: ${makale.icerik.slice(0, 120)}...`);
      }

      basarili++;
      await new Promise(r => setTimeout(r, 800));
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
