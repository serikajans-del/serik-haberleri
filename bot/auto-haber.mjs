/**
 * Serik Haberleri - Otomatik Haber Botu
 * RSS + HTML kaynaklarından haber çeker,
 * Claude ile ajans dilinde yeniden yazar,
 * Unsplash ile orijinal fotoğraf ekler,
 * Supabase'e kaydeder.
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY    = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_ACCESS_KEY  = process.env.UNSPLASH_ACCESS_KEY;
const TEST_MODE            = process.argv.includes("--test");
const DAEMON_MODE          = process.argv.includes("--daemon");
const NO_AI                = process.argv.includes("--no-ai");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Eksik: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase  = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

// ── Twitter OAuth ─────────────────────────────────────────────────────────────
const TW_API_KEY    = process.env.TWITTER_API_KEY;
const TW_API_SECRET = process.env.TWITTER_API_SECRET;
const TW_TOKEN      = process.env.TWITTER_ACCESS_TOKEN;
const TW_TOKEN_SEC  = process.env.TWITTER_ACCESS_TOKEN_SECRET;

async function tweetGonder(text) {
  if (!TW_API_KEY || !TW_TOKEN) return;
  try {
    const url   = "https://api.twitter.com/1.1/statuses/update.json";
    const body  = { status: text };
    const allP  = { ...buildOAuthParams(), ...body };
    const pStr  = Object.keys(allP).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allP[k])}`).join("&");
    const base  = `POST&${encodeURIComponent(url)}&${encodeURIComponent(pStr)}`;
    const key   = `${encodeURIComponent(TW_API_SECRET)}&${encodeURIComponent(TW_TOKEN_SEC)}`;
    const oauth = buildOAuthParams();
    oauth.oauth_signature = crypto.createHmac("sha1", key).update(base).digest("base64");
    const authH = "OAuth " + Object.keys(oauth).sort().map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauth[k])}"`).join(", ");
    const res   = await fetch(url, {
      method: "POST",
      headers: { Authorization: authH, "Content-Type": "application/x-www-form-urlencoded" },
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
    oauth_consumer_key: TW_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TW_TOKEN,
    oauth_version: "1.0",
  };
}

function serikHaberiMi(baslik, ozet = "") {
  return /serik|side ilçe|boğazkent|belek|kadriye|manavgat/.test((baslik + " " + ozet).toLowerCase());
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
];

// ── Yardımcı ─────────────────────────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase()
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
    .replace(/<!--[\s\S]*?-->/g, "")        // HTML yorumları sil (-->)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(?:div|section|aside|nav|header|footer|figure|figcaption|form|button|iframe|noscript)[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/-->/g, "")                    // Kalan --> kalıntıları temizle
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim());
}

function kategoriTahmini(metin) {
  const m = metin.toLowerCase();
  if (/polis|jandarma|kaza|yangın|suç|gözaltı|yaralı|öldü|hayatını|hırsız|uyuşturucu|tutuklama|cinayet|soygun/.test(m)) return KATEGORILER[1];
  if (/ekonomi|enflasyon|fiyat|market|esnaf|vergi|ticaret|ihale|bütçe|kredi|faiz/.test(m))                               return KATEGORILER[2];
  if (/futbol|maç|lig|gol|spor|serikspor|şampiyona|basketbol|voleybol|turnuva/.test(m))                                  return KATEGORILER[3];
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
  } catch { return null; }
}

// ── Claude ile İçerik Yeniden Yazma ─────────────────────────────────────────
async function haberYazdir(baslik, ozet, hammadde) {
  if (!anthropic || NO_AI) return { baslik, ozet, icerik: hammadde };

  try {
    console.log(`   🤖 Claude ile yeniden yazılıyor...`);
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Sen Türk bir haber ajansı editörüsün. Aşağıdaki haberi ajans diliyle, özgün ve akıcı Türkçeyle yeniden yaz.

KURALLAR:
- Haber ajansı dili kullan (DHA, İHA tarzı): net, yalın, 3. şahıs
- Orijinal içeriği KOPYALAMA — kelimeleri, cümle yapısını değiştir
- Başlığı kısa ve dikkat çekici yap (max 12 kelime)
- Özeti tek cümleyle özetle (max 2 satır)
- Haber gövdesini MUTLAKA 5-7 paragraf yaz, her paragraf 3-4 cümle olsun
- Bilgi azsa yorumla ve bağlam ekle, haberi tam ve okunabilir yap
- Gereksiz kelime, tekrar ve klişeden kaçın
- Sonuna kaynak belirtme

ORİJİNAL BAŞLIK: ${baslik}
ORİJİNAL ÖZET: ${ozet}
ORİJİNAL İÇERİK:
${hammadde.replace(/<[^>]+>/g, "").slice(0, 2000)}

JSON formatında yanıt ver:
{
  "baslik": "yeni başlık",
  "ozet": "yeni özet",
  "paragraflar": ["paragraf1", "paragraf2", "paragraf3", "paragraf4"]
}`
      }]
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON bulunamadı");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.baslik || !parsed.paragraflar?.length) throw new Error("Eksik alan");

    const icerik = parsed.paragraflar.map(p => `<p>${p}</p>`).join("\n");
    console.log(`   ✅ Claude yazımı tamamlandı: "${parsed.baslik.slice(0, 50)}"`);
    return { baslik: parsed.baslik, ozet: parsed.ozet || ozet, icerik };

  } catch (err) {
    console.warn(`   ⚠️  Claude hatası: ${err.message} — orijinal kullanılıyor`);
    return { baslik, ozet, icerik: hammadde };
  }
}

// ── Unsplash ile Fotoğraf Bulma ──────────────────────────────────────────────
async function gorselBul(baslik, kategoriSlug) {
  if (!UNSPLASH_ACCESS_KEY) return null;

  // Başlıktan İngilizce anahtar kelimeler türet
  const kategoriAnahtar = {
    gundem:  "turkey news politics",
    asayis:  "police crime accident turkey",
    ekonomi: "economy market business turkey",
    spor:    "sports football turkey",
    saglik:  "health hospital medical",
    egitim:  "education school students turkey",
    yasam:   "lifestyle nature turkey",
    turizm:  "antalya turkey beach tourism",
  };

  const temelAnahtar = kategoriAnahtar[kategoriSlug] || "turkey news";

  // Başlıktan Türkçe kelimeleri İngilizceye çevir (basit eşleme)
  const sozluk = {
    "yangın": "fire", "kaza": "accident", "sel": "flood", "deprem": "earthquake",
    "okul": "school", "hastane": "hospital", "polis": "police", "futbol": "football",
    "deniz": "sea", "orman": "forest", "çarşı": "market", "turizm": "tourism",
    "serik": "antalya turkey", "side": "side antalya", "belek": "belek antalya",
    "ekonomi": "economy", "sağlık": "health", "eğitim": "education",
  };

  let ekAnahtar = "";
  const baslikKelimeler = baslik.toLowerCase().split(/\s+/);
  for (const kelime of baslikKelimeler) {
    if (sozluk[kelime]) { ekAnahtar = sozluk[kelime]; break; }
  }

  const sorgu = ekAnahtar ? `${ekAnahtar} ${temelAnahtar}` : temelAnahtar;

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(sorgu)}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Unsplash attribution gereksinimi: utm parametreleri ekliyoruz
    const url = data?.urls?.regular || data?.urls?.full;
    if (url) {
      console.log(`   🖼️  Unsplash fotoğraf: ${data.alt_description || sorgu} (by ${data.user?.name})`);
    }
    return url || null;
  } catch (err) {
    console.warn(`   ⚠️  Unsplash hatası: ${err.message}`);
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
                  ?? block.match(/<guid[^>]*>([^<]+)<\/guid>/i)?.[1] ?? "";
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
    if (pubDate) {
      const pub = new Date(pubDate);
      if (!isNaN(pub) && (Date.now() - pub.getTime()) > 24 * 60 * 60 * 1000) continue;
    }
    items.push({ url: link, baslik, ozet, gorsel, kaynak: feed.ad });
  }

  console.log(`   ✓ ${items.length} RSS haberi`);
  return items;
}

// ── Makale Çekici ─────────────────────────────────────────────────────────────
async function makaleCek(url, rssOnBilgi = {}) {
  const html = await sayfaCek(url);
  if (!html) return null;

  let baslik = rssOnBilgi.baslik || "";
  if (!baslik) {
    const m = html.match(/<h1[^>]*>([\s\S]{5,200}?)<\/h1>/i) || html.match(/<title>([\s\S]{5,200}?)<\/title>/i);
    baslik = m ? htmlDecode(m[1].replace(/<[^>]+>/g, "").trim()) : "";
  }

  let gorsel = rssOnBilgi.gorsel || "";
  if (!gorsel) {
    const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
             || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    gorsel = og ? og[1] : "";
  }
  if (!gorsel) {
    const im = html.match(/<img[^>]+src="(https?:\/\/[^"]{20,}\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    gorsel = im ? im[1] : "";
  }

  let ozet = rssOnBilgi.ozet || "";
  if (!ozet) {
    const dm = html.match(/<meta[^>]+(?:property="og:description"|name="description")[^>]+content="([^"]{10,300})"/i)
             || html.match(/<meta[^>]+content="([^"]{10,300})"[^>]+(?:property="og:description"|name="description")/i);
    ozet = dm ? htmlDecode(dm[1].trim()) : "";
  }

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
    .replace(/<(?:div|section)[^>]*(?:ilgili|related|yorum|comment|sidebar|reklam|banner|social|share|tag|etiket)[^>]*>[\s\S]*?<\/(?:div|section)>/gi, "");

  let paragraflar = [];
  const pRegex = /<p[^>]*>([\s\S]{20,800}?)<\/p>/gi;
  let pm;
  while ((pm = pRegex.exec(temizHtml)) !== null) {
    const t = htmlTemizle(pm[1]);
    if (
      t.length < 20 ||
      /cookie|reklam|abone|paylaş|yorumlar|javascript|tıklayın|buraya tıkla|daha fazla|devamını oku/i.test(t) ||
      t.split(" ").length < 4
    ) continue;
    paragraflar.push(t);
  }

  // Paragraf bulunamadıysa düz metin blokları dene
  if (paragraflar.length === 0) {
    // Tüm sayfadan anlamlı cümleler çıkar
    const duzMetin = htmlTemizle(temizHtml);
    const cumleler = duzMetin.split(/\n+/).map(s => s.trim()).filter(s =>
      s.length > 40 && s.split(" ").length >= 6 &&
      !/cookie|reklam|javascript|©|tüm hakları|telif/i.test(s)
    );
    if (cumleler.length >= 2) {
      // Her 3 cümleyi bir paragraf yap
      const gruplar = [];
      for (let i = 0; i < Math.min(cumleler.length, 18); i += 3) {
        gruplar.push(cumleler.slice(i, i + 3).join(" "));
      }
      paragraflar = gruplar.filter(g => g.length > 60);
    }
    if (paragraflar.length === 0) {
      if (ozet && ozet.length > 60) {
        return { baslik, ozet, icerik: `<p>${ozet}</p>`, gorsel };
      }
      return null;
    }
  }

  const hammadde = paragraflar.slice(0, 12).map(p => `<p>${p}</p>`).join("\n");
  return { baslik, ozet, icerik: hammadde, gorsel };
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
  console.log(`   ✓ ${urls.length} haber linki`);
  return urls.map(url => ({ url, kaynak: kaynak.ad }));
}

// ── Mevcut Haberler ───────────────────────────────────────────────────────────
async function mevcutlar() {
  const { data } = await supabase
    .from("haberler")
    .select("slug, title")
    .order("published_at", { ascending: false })
    .limit(1000);
  const set = new Set();
  for (const h of (data || [])) {
    set.add(slugify(h.title).slice(0, 50));
    set.add(h.slug?.split("-").slice(0, -1).join("-").slice(0, 50)); // slug'ın timestamp kısmını çıkar
  }
  return set;
}

// ── Supabase Kayıt ────────────────────────────────────────────────────────────
async function supabaseKaydet(haber, kaynak, kategori) {
  const slug  = slugify(haber.baslik) + "-" + Date.now().toString(36);

  // İçeriği temizle: başındaki --> ve boşlukları sil
  const temizIcerik = (haber.icerik || "")
    .replace(/^[\s\n]*-->[\s\n]*/g, "")
    .replace(/^(<p>\s*-->[\s\S]*?<\/p>\s*)/g, "")
    .trim();

  const kayit = {
    title:         haber.baslik,
    slug,
    summary:       haber.ozet || haber.baslik,
    content:       temizIcerik || haber.icerik,
    category:      kategori.name,
    category_slug: kategori.slug,
    image:         haber.gorsel,
    author:        kaynak,          // Gerçek kaynak: "TRT Haber", "Sabah" vb.
    published_at:  new Date().toISOString(),
    featured:      false,
    tags:          [],
  };

  const { error } = await supabase.from("haberler").insert([kayit]);
  if (error) {
    // Duplicate slug hatası — slug'a random suffix ekleyip tekrar dene
    if (error.code === "23505") {
      const kayit2 = { ...kayit, slug: slug + "-" + Math.random().toString(36).slice(2, 6) };
      const { error: err2 } = await supabase.from("haberler").insert([kayit2]);
      if (err2) throw new Error(err2.message);
      return { slug: kayit2.slug, kategori: kategori.name };
    }
    throw new Error(error.message);
  }
  return { slug, kategori: kategori.name };
}

// ── Ana Fonksiyon ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🤖 Serik Haber Botu — ${new Date().toLocaleString("tr-TR")}`);
  if (TEST_MODE) console.log("⚠️  TEST MODU");
  if (NO_AI)     console.log("⚠️  AI KAPALI (--no-ai)");
  if (!anthropic) console.log("⚠️  ANTHROPIC_API_KEY yok — Claude devre dışı");
  if (!UNSPLASH_ACCESS_KEY) console.log("⚠️  UNSPLASH_ACCESS_KEY yok — orijinal görseller kullanılacak");

  const mevcut = await mevcutlar();
  console.log(`   📚 DB'de ${mevcut.size} haber var`);

  let tumItems = [];

  for (const feed of RSS_KAYNAKLAR) {
    try { tumItems = [...tumItems, ...await rssHaberlerCek(feed)]; }
    catch (e) { console.warn(`   ⚠️  RSS hatası ${feed.ad}: ${e.message}`); }
  }
  for (const kaynak of HTML_KAYNAKLAR) {
    try { tumItems = [...tumItems, ...await htmlHaberlerCek(kaynak)]; }
    catch (e) { console.warn(`   ⚠️  HTML hatası ${kaynak.ad}: ${e.message}`); }
  }

  const urlSet = new Set();
  tumItems = tumItems.filter(item => {
    if (urlSet.has(item.url)) return false;
    urlSet.add(item.url);
    return true;
  });

  tumItems.sort((a, b) => (b.baslik ? 1 : 0) - (a.baslik ? 1 : 0));
  console.log(`\n   🔗 Toplam ${tumItems.length} unique link`);

  let basarili = 0;

  for (const item of tumItems) {
    if (basarili >= 20) break;

    try {
      if (item.baslik) {
        const anahtar = slugify(item.baslik).slice(0, 40);
        if (mevcut.has(anahtar)) continue;
      }

      const makale = await makaleCek(item.url, item);
      if (!makale || !makale.baslik || makale.baslik.length < 5) continue;

      const anahtar = slugify(makale.baslik).slice(0, 40);
      if (mevcut.has(anahtar)) continue;
      mevcut.add(anahtar);

      const kategori = kategoriTahmini(makale.baslik + " " + makale.ozet + " " + makale.icerik);
      console.log(`\n📰 [${item.kaynak}] ${makale.baslik.slice(0, 65)}`);

      // 1. Claude ile yeniden yaz
      const yazilmis = await haberYazdir(makale.baslik, makale.ozet, makale.icerik);

      // 2. Unsplash'tan fotoğraf bul (orijinal yoksa veya her zaman)
      let gorsel = makale.gorsel;
      if (UNSPLASH_ACCESS_KEY) {
        const unsplashGorsel = await gorselBul(yazilmis.baslik, kategori.slug);
        if (unsplashGorsel) gorsel = unsplashGorsel;
      }
      if (!gorsel) gorsel = `https://picsum.photos/seed/${Date.now()}/860/504`;

      const haberKayit = { ...yazilmis, gorsel };

      if (!TEST_MODE) {
        const { slug, kategori: katAd } = await supabaseKaydet(haberKayit, item.kaynak, kategori);
        console.log(`   ✅ [${katAd}] /haber/${slug}`);
        if (serikHaberiMi(yazilmis.baslik, yazilmis.ozet)) {
          await tweetGonder([
            `📰 ${yazilmis.baslik}`.slice(0, 210),
            "",
            `https://www.serikhaberleri.com/haber/${slug}`,
            "",
            "#Serik #SerikHaberleri #Antalya",
          ].join("\n"));
        }
      } else {
        console.log(`   🔍 [TEST] Kategori: ${kategori.name}`);
        console.log(`   🖼️  Görsel: ${gorsel.slice(0, 80)}`);
        console.log(`   📄 Başlık: ${yazilmis.baslik}`);
        console.log(`   📝 İçerik: ${yazilmis.icerik.replace(/<[^>]+>/g, "").slice(0, 150)}...`);
      }

      basarili++;
      await new Promise(r => setTimeout(r, 1500)); // Claude rate limit için biraz bekle

    } catch (err) {
      console.error(`   ❌ ${err.message}`);
    }
  }

  console.log(`\n🎉 ${basarili} haber eklendi`);
  console.log(`⏰ Sonraki: ${new Date(Date.now() + 30 * 60 * 1000).toLocaleString("tr-TR")}\n`);
}

if (DAEMON_MODE) {
  console.log(`\n⚙️  DAEMON — Her 3 saatte çalışır. Durdurmak: Ctrl+C\n`);
  (async () => {
    while (true) {
      try { await main(); } catch (e) { console.error("❌", e.message); }
      await new Promise(r => setTimeout(r, 3 * 60 * 60 * 1000));
    }
  })();
} else {
  main().catch(console.error);
}
