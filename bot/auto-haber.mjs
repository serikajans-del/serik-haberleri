/**
 * Serik Haberleri - Otomatik Haber Botu
 * Çoklu kaynaktan paralel link çekimi,
 * JSON-LD ile hızlı içerik + görsel alma,
 * Claude ile ajans dilinde yeniden yazma,
 * Supabase'e kayıt.
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
  { name: "Antalya", slug: "antalya" },
  { name: "Asayiş",  slug: "asayis"  },
  { name: "Ekonomi", slug: "ekonomi" },
  { name: "Spor",    slug: "spor"    },
  { name: "Sağlık",  slug: "saglik"  },
  { name: "Eğitim",  slug: "egitim"  },
  { name: "Yaşam",   slug: "yasam"   },
  { name: "Turizm",  slug: "turizm"  },
];

// ── Haber Kaynakları ──────────────────────────────────────────────────────────
// linkRegex: listing sayfasından makale URL'lerini çıkarır
const KAYNAKLAR = [
  // NTV — JSON-LD mevcut
  { ad: "NTV",              base: "https://www.ntv.com.tr", url: "https://www.ntv.com.tr/son-dakika",    linkRegex: /href="(\/[a-z][a-z-]+\/[a-z0-9][a-z0-9-]+,[A-Za-z0-9_-]{6,})"/g },
  { ad: "NTV Ekonomi",      base: "https://www.ntv.com.tr", url: "https://www.ntv.com.tr/ekonomi",       linkRegex: /href="(\/[a-z][a-z-]+\/[a-z0-9][a-z0-9-]+,[A-Za-z0-9_-]{6,})"/g },
  { ad: "NTV Spor",         base: "https://www.ntv.com.tr", url: "https://www.ntv.com.tr/spor",          linkRegex: /href="(\/[a-z][a-z-]+\/[a-z0-9][a-z0-9-]+,[A-Za-z0-9_-]{6,})"/g },
  // Antalya Haber — yerel haberler, JSON-LD mevcut (hava-durumu sayfalarını filtrele)
  { ad: "Antalya Haber",    base: "https://www.antalyahaber.net", url: "https://www.antalyahaber.net/son-dakika/", linkRegex: /href="(https?:\/\/www\.antalyahaber\.net\/(?!hava-durumu|namaz|takvim|nöbetci)[a-z0-9-]{15,}\/?)"/g },
  { ad: "Antalya Haber Güncel", base: "https://www.antalyahaber.net", url: "https://www.antalyahaber.net/guncel/", linkRegex: /href="(https?:\/\/www\.antalyahaber\.net\/(?!hava-durumu|namaz|takvim|nöbetci)[a-z0-9-]{15,}\/?)"/g },
  // Gün Haber — full URL'ler liste sayfasında
  { ad: "Gün Haber",        base: "https://www.gunhaber.com.tr", url: "https://www.gunhaber.com.tr/son-dakika",    linkRegex: /href="(https?:\/\/www\.gunhaber\.com\.tr\/haber\/[a-z0-9-]+\/\d{4,})"/g },
  // Ekonomim
  { ad: "Ekonomim",         base: "https://www.ekonomim.com",    url: "https://www.ekonomim.com/son-dakika/",      linkRegex: /href="(https?:\/\/www\.ekonomim\.com\/[a-z-]+\/[a-z0-9-]+-\d{4,}\/)"/g },
  // Sondakika — JSON-LD mevcut
  { ad: "Sondakika",        base: "https://www.sondakika.com",   url: "https://www.sondakika.com/",                linkRegex: /href="(\/[a-z][a-z-]*\/haber-[a-z0-9-]+-\d{6,}\/)"/g },
  { ad: "Sondakika Güncel", base: "https://www.sondakika.com",   url: "https://www.sondakika.com/guncel/",         linkRegex: /href="(\/[a-z][a-z-]*\/haber-[a-z0-9-]+-\d{6,}\/)"/g },
  { ad: "Sondakika Spor",   base: "https://www.sondakika.com",   url: "https://www.sondakika.com/spor/",           linkRegex: /href="(\/[a-z][a-z-]*\/haber-[a-z0-9-]+-\d{6,}\/)"/g },
  { ad: "Sondakika Ekonomi",base: "https://www.sondakika.com",   url: "https://www.sondakika.com/ekonomi/",        linkRegex: /href="(\/[a-z][a-z-]*\/haber-[a-z0-9-]+-\d{6,}\/)"/g },
];

// Kaç saatlik haberleri kabul et
const MAX_HABER_YASI_SAAT = 12;
// Her çalışmada max kaç haber eklensin
const MAX_EKLE = 25;

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
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(?:div|section|aside|nav|header|footer|figure|figcaption|form|button|iframe|noscript)[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim());
}

function kategoriTahmini(metin) {
  const m = metin.toLowerCase();
  if (/polis|jandarma|kaza|yangın|suç|gözaltı|yaralı|öldü|hayatını|hırsız|uyuşturucu|tutuklama|cinayet|soygun/.test(m)) return KATEGORILER[2];
  if (/antalya|kepez|konyaaltı|muratpaşa|alanya|manavgat|serik|kaş|finike|akseki/.test(m))                               return KATEGORILER[1];
  if (/ekonomi|enflasyon|fiyat|market|esnaf|vergi|ticaret|ihale|bütçe|kredi|faiz|borsa|dolar|euro/.test(m))              return KATEGORILER[3];
  if (/futbol|maç|lig|gol|spor|serikspor|şampiyona|basketbol|voleybol|turnuva/.test(m))                                  return KATEGORILER[4];
  if (/sağlık|hastane|doktor|ameliyat|aşı|hastalık|tedavi|ilaç|ambulans/.test(m))                                        return KATEGORILER[5];
  if (/okul|öğrenci|eğitim|üniversite|sınav|mezun|öğretmen|burs|lise/.test(m))                                           return KATEGORILER[6];
  if (/turizm|tatil|plaj|otel|kültür|festival|tarihi|antik|side|boğazkent/.test(m))                                      return KATEGORILER[8];
  if (/yemek|yaşam|doğa|hava|çevre|etkinlik|konser|sergi/.test(m))                                                       return KATEGORILER[7];
  return KATEGORILER[0];
}

async function sayfaCek(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9",
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ── Claude ile İçerik Yeniden Yazma ──────────────────────────────────────────
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

// ── Unsplash ile Fotoğraf Bulma ───────────────────────────────────────────────
async function gorselBul(baslik, kategoriSlug) {
  if (!UNSPLASH_ACCESS_KEY) return null;
  const kategoriAnahtar = {
    gundem: "turkey news politics", asayis: "police crime accident turkey",
    ekonomi: "economy market business turkey", spor: "sports football turkey",
    saglik: "health hospital medical", egitim: "education school students turkey",
    yasam: "lifestyle nature turkey", turizm: "antalya turkey beach tourism",
  };
  const sozluk = {
    "yangın": "fire", "kaza": "accident", "sel": "flood", "deprem": "earthquake",
    "okul": "school", "hastane": "hospital", "polis": "police", "futbol": "football",
    "deniz": "sea", "orman": "forest", "turizm": "tourism", "serik": "antalya turkey",
    "ekonomi": "economy", "sağlık": "health", "eğitim": "education",
  };
  const temelAnahtar = kategoriAnahtar[kategoriSlug] || "turkey news";
  let ekAnahtar = "";
  for (const kelime of baslik.toLowerCase().split(/\s+/)) {
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
    return data?.urls?.regular || data?.urls?.full || null;
  } catch { return null; }
}

// ── Listing sayfasından link çıkar ───────────────────────────────────────────
async function linklerCek(kaynak) {
  const html = await sayfaCek(kaynak.url);
  if (!html) { console.warn(`   ⚠️  [${kaynak.ad}] erişilemedi`); return []; }

  const linkSet = new Set();
  const regex = new RegExp(kaynak.linkRegex.source, "g");
  let m;
  while ((m = regex.exec(html)) !== null) {
    const path = m[1];
    if (!path || path.length < 10) continue;
    const fullUrl = path.startsWith("http") ? path : kaynak.base + path;
    // Kategori, etiket, sayfa linklerini filtrele
    if (/\/(kategori|etiket|tag|sayfa|page|author|yazar|search|ara)\//i.test(fullUrl)) continue;
    if (/[?#]/.test(fullUrl)) continue;
    linkSet.add(fullUrl);
  }

  const urls = [...linkSet].slice(0, 20);
  console.log(`   ✓ [${kaynak.ad}] ${urls.length} link`);
  return urls.map(url => ({ url, kaynak: kaynak.ad }));
}

// ── Evrensel JSON-LD Makale Çekici ────────────────────────────────────────────
// Tüm kaynaklarda çalışır: NTV, Sondakika, Antalya Haber, vb.
async function jsonLdMakaleCek(url) {
  const html = await sayfaCek(url);
  if (!html) return null;

  // Tüm JSON-LD bloklarını tara, NewsArticle olanı bul
  const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let article = null;
  let ldMatch;
  while ((ldMatch = ldRegex.exec(html)) !== null) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      if (Array.isArray(ld)) {
        const found = ld.find(g => g["@type"] === "NewsArticle" || g["@type"] === "Article");
        if (found) { article = found; break; }
      } else if (ld["@graph"]) {
        const found = ld["@graph"].find(g => g["@type"] === "NewsArticle" || g["@type"] === "Article");
        if (found) { article = found; break; }
      } else if (ld["@type"] === "NewsArticle" || ld["@type"] === "Article") {
        article = ld; break;
      }
    } catch { continue; }
  }

  // JSON-LD yoksa og: meta ile dene
  let baslik = "";
  let ozet = "";
  let gorsel = "";

  if (article) {
    // Tarih filtresi
    const dateStr = article.datePublished || article.dateCreated || "";
    if (dateStr) {
      const pub = new Date(dateStr);
      if (!isNaN(pub.getTime())) {
        const saatFarki = (Date.now() - pub.getTime()) / (1000 * 60 * 60);
        if (saatFarki > MAX_HABER_YASI_SAAT) {
          console.log(`   ⏭️  Eski (${Math.round(saatFarki)}sa): ${(article.headline || "").slice(0, 50)}`);
          return null;
        }
      }
    }

    baslik = htmlDecode((article.headline || article.name || "").trim());
    ozet   = htmlDecode((article.description || "").trim());

    // Görsel — çoklu alan denemesi
    if (article.image?.url)           gorsel = article.image.url;
    else if (article.image?.contentUrl) gorsel = article.image.contentUrl;
    else if (typeof article.image === "string") gorsel = article.image;
    else if (Array.isArray(article.image) && article.image[0]?.url) gorsel = article.image[0].url;
    else if (Array.isArray(article.image) && typeof article.image[0] === "string") gorsel = article.image[0];
    else if (article.thumbnailUrl)    gorsel = article.thumbnailUrl;
  }

  // og: meta fallback için her zaman kontrol et
  if (!baslik) {
    const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]{5,200})"/i)
                 || html.match(/<meta[^>]+content="([^"]{5,200})"[^>]+property="og:title"/i);
    if (ogTitle) baslik = htmlDecode(ogTitle[1].trim());
  }
  if (!ozet) {
    const ogDesc = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]{10,400})"/i)
                || html.match(/<meta[^>]+content="([^"]{10,400})"[^>]+property="og:description"/i);
    if (ogDesc) ozet = htmlDecode(ogDesc[1].trim());
  }
  if (!gorsel) {
    const ogImg = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
               || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    if (ogImg) gorsel = ogImg[1];
  }

  // Görsel yoksa → haberi atla (alakasız fotoğraf girmesin)
  if (!gorsel) {
    console.log(`   ⏭️  Görsel yok, atlandı: ${baslik.slice(0, 50)}`);
    return null;
  }
  // Görsel küçük/ikon gibi görünüyorsa atla
  if (/logo|icon|avatar|sprite|pixel|1x1|placeholder/i.test(gorsel)) {
    console.log(`   ⏭️  Alakasız görsel, atlandı: ${baslik.slice(0, 50)}`);
    return null;
  }

  if (!baslik || baslik.length < 5) return null;

  // İçerik: articleBody varsa kullan, yoksa HTML'den çek
  let icerik = "";
  if (article?.articleBody) {
    const body = htmlDecode(article.articleBody.trim());
    if (body.length > 50) {
      const cumleler = body.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
      const gruplar = [];
      for (let i = 0; i < cumleler.length; i += 3) {
        const grup = cumleler.slice(i, i + 3).join(" ").trim();
        if (grup.length > 20) gruplar.push(grup);
      }
      icerik = gruplar.map(p => `<p>${p}</p>`).join("\n");
    }
  }

  // articleBody yoksa HTML'den <p> çek
  if (!icerik) {
    const temizHtml = html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<(?:div|section|aside)[^>]*(?:ilgili|related|yorum|comment|reklam|banner|social|share|cookie|popup)[^>]*>[\s\S]*?<\/(?:div|section|aside)>/gi, "");

    const paragraflar = [];
    const pRegex = /<p[^>]*>([\s\S]{20,1200}?)<\/p>/gi;
    let pm;
    while ((pm = pRegex.exec(temizHtml)) !== null) {
      const t = htmlTemizle(pm[1]);
      if (t.length < 20 || /cookie|reklam|abone|paylaş|©|tüm hakları/i.test(t) || t.split(" ").length < 4) continue;
      paragraflar.push(t);
    }
    if (paragraflar.length > 0) {
      icerik = paragraflar.slice(0, 12).map(p => `<p>${p}</p>`).join("\n");
    }
  }

  // İçerik hâlâ yoksa özeti kullan
  if (!icerik && ozet && ozet.length > 60) {
    icerik = `<p>${ozet}</p>`;
  }

  if (!icerik) return null;
  return { baslik, ozet, icerik, gorsel };
}

// ── Mevcut Haberler ───────────────────────────────────────────────────────────
async function mevcutlar() {
  const { data } = await supabase
    .from("haberler")
    .select("slug, title")
    .order("published_at", { ascending: false })
    .limit(1500);
  const set = new Set();
  for (const h of (data || [])) {
    set.add(slugify(h.title || "").slice(0, 50));
    if (h.slug) set.add(h.slug.split("-").slice(0, -1).join("-").slice(0, 50));
  }
  return set;
}

// ── Supabase Kayıt ────────────────────────────────────────────────────────────
async function supabaseKaydet(haber, kaynak, kategori) {
  const slug = slugify(haber.baslik) + "-" + Date.now().toString(36);

  const temizIcerik = (haber.icerik || "")
    .replace(/^[\s\n]*-->[\s\n]*/g, "")
    .replace(/^(<p[^>]*>\s*-->\s*<\/p>\s*)+/g, "")
    .trim();

  const kayit = {
    title:         haber.baslik,
    slug,
    summary:       haber.ozet || haber.baslik,
    content:       temizIcerik || haber.icerik,
    category:      kategori.name,
    category_slug: kategori.slug,
    image:         haber.gorsel,
    author:        kaynak,
    published_at:  new Date().toISOString(),
    featured:      false,
    tags:          [],
  };

  const { error } = await supabase.from("haberler").insert([kayit]);
  if (error) {
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
  const baslangic = Date.now();
  console.log(`\n🤖 Serik Haber Botu — ${new Date().toLocaleString("tr-TR")}`);
  if (TEST_MODE) console.log("⚠️  TEST MODU");
  if (NO_AI)     console.log("⚠️  AI KAPALI");
  if (!anthropic) console.log("⚠️  ANTHROPIC_API_KEY yok — Claude devre dışı");

  const mevcut = await mevcutlar();
  console.log(`   📚 DB'de ${mevcut.size} haber var`);

  // ── TÜM KAYNAKLARI PARALEL ÇEK ──────────────────────────────────────────
  console.log(`\n📡 ${KAYNAKLAR.length} kaynak paralel taranıyor...`);
  const sonuclar = await Promise.allSettled(KAYNAKLAR.map(k => linklerCek(k)));

  let tumItems = [];
  for (const s of sonuclar) {
    if (s.status === "fulfilled") tumItems = [...tumItems, ...s.value];
  }

  // URL deduplikasyonu
  const urlSet = new Set();
  tumItems = tumItems.filter(item => {
    if (urlSet.has(item.url)) return false;
    urlSet.add(item.url);
    return true;
  });

  // Karıştır — farklı kaynaklardan sırayla al
  tumItems = tumItems.sort(() => Math.random() - 0.5);

  console.log(`\n   🔗 Toplam ${tumItems.length} unique link (${Math.round((Date.now() - baslangic) / 1000)}s)`);

  let basarili = 0;
  let atlanan = 0;

  for (const item of tumItems) {
    if (basarili >= MAX_EKLE) break;

    try {
      const makale = await jsonLdMakaleCek(item.url);
      if (!makale || !makale.baslik || makale.baslik.length < 5) { atlanan++; continue; }
      if (!makale.gorsel) { atlanan++; continue; }

      const anahtar = slugify(makale.baslik).slice(0, 50);
      if (mevcut.has(anahtar)) { console.log(`   ⏭️  Zaten var: ${makale.baslik.slice(0, 50)}`); continue; }
      mevcut.add(anahtar);

      const kategori = kategoriTahmini(makale.baslik + " " + makale.ozet + " " + makale.icerik);
      console.log(`\n📰 [${item.kaynak}] ${makale.baslik.slice(0, 65)}`);
      console.log(`   🖼️  ${makale.gorsel.slice(0, 80)}`);

      // Claude ile yeniden yaz
      const yazilmis = await haberYazdir(makale.baslik, makale.ozet, makale.icerik);

      const haberKayit = { ...yazilmis, gorsel: makale.gorsel };

      if (!TEST_MODE) {
        const { slug, kategori: katAd } = await supabaseKaydet(haberKayit, item.kaynak, kategori);
        console.log(`   ✅ [${katAd}] /haber/${slug}`);
        if (serikHaberiMi(yazilmis.baslik, yazilmis.ozet)) {
          await tweetGonder([
            `📰 ${yazilmis.baslik}`.slice(0, 210), "",
            `https://www.serikhaberleri.com/haber/${slug}`, "",
            "#Serik #SerikHaberleri #Antalya",
          ].join("\n"));
        }
      } else {
        console.log(`   🔍 [TEST] Kategori: ${kategori.name}`);
        console.log(`   📄 Başlık: ${yazilmis.baslik}`);
      }

      basarili++;
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.error(`   ❌ ${err.message}`);
    }
  }

  const sure = Math.round((Date.now() - baslangic) / 1000);
  console.log(`\n🎉 ${basarili} haber eklendi, ${atlanan} atlandı — ${sure}s`);
  console.log(`⏰ Sonraki: ${new Date(Date.now() + 15 * 60 * 1000).toLocaleString("tr-TR")}\n`);
}

if (DAEMON_MODE) {
  console.log(`\n⚙️  DAEMON — Her 15 dakikada çalışır. Durdurmak: Ctrl+C\n`);
  (async () => {
    while (true) {
      try { await main(); } catch (e) { console.error("❌", e.message); }
      await new Promise(r => setTimeout(r, 15 * 60 * 1000));
    }
  })();
} else {
  main().catch(console.error);
}
