/**
 * Serik Haberleri - Otomatik Haber Botu
 * Kaynak: sondakika.com, serikpostasi.com, iha.com.tr
 * AI: Groq (Ücretsiz) | Fotoğraf: Pexels | DB: Supabase
 */

import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// ── Ortam Değişkenleri ────────────────────────────────────────────────────────
const GROQ_API_KEY         = process.env.GROQ_API_KEY;
const PEXELS_API_KEY       = process.env.PEXELS_API_KEY;
const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_MODE   = process.argv.includes("--test");
const DAEMON_MODE = process.argv.includes("--daemon");

if (!GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Eksik ortam değişkeni!");
  process.exit(1);
}

const groq    = new Groq({ apiKey: GROQ_API_KEY });
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

// ── Haber Kaynakları ──────────────────────────────────────────────────────────
const KAYNAKLAR = [
  {
    ad: "Serik Postası",
    url: "https://serikpostasi.com/",
    base: "https://serikpostasi.com",
    linkRegex: /href=['"]?(https?:\/\/serikpostasi\.com\/haber\/[^'">\s]+)|href=['"]?(\/haber\/[^'">\s]+)/g,
    kaynak: "Serik Postası",
  },
  {
    ad: "İHA Antalya",
    url: "https://www.iha.com.tr/antalya-haberleri/",
    base: "https://www.iha.com.tr",
    linkRegex: /href="(\/antalya-haberleri\/[^"#?]+)"/g,
    kaynak: "İHA",
  },
  {
    ad: "Son Dakika Antalya",
    url: "https://www.sondakika.com/antalya/",
    base: "https://www.sondakika.com",
    linkRegex: /href="(\/[a-z-]+\/haber-[^"#?]+)"/g,
    kaynak: "Son Dakika",
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

function htmlDecode(str) {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&ccedil;/g, "ç").replace(/&uuml;/g, "ü").replace(/&ouml;/g, "ö")
    .replace(/&iuml;/g, "ı").replace(/&szlig;/g, "ş").replace(/&yuml;/g, "ğ");
}

function metinTemizle(html) {
  return htmlDecode(html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000));
}

function kategoriTahmini(metin) {
  const m = metin.toLowerCase();
  if (/polis|jandarma|kaza|yangın|suç|gözaltı|yaralı|öldü|hayatını|hırsız|uyuşturucu|soygun|tutuklama/.test(m)) return KATEGORILER[1];
  if (/ekonomi|işsizlik|enflasyon|fiyat|market|esnaf|vergi|ticaret|ihracat|ihale/.test(m))                      return KATEGORILER[2];
  if (/futbol|maç|lig|gol|spor|serikspor|şampiyona|basketbol|voleybol|turnuva/.test(m))                         return KATEGORILER[3];
  if (/sağlık|hastane|doktor|ameliyat|aşı|hastalık|tedavi|korona|salgın/.test(m))                               return KATEGORILER[4];
  if (/okul|öğrenci|eğitim|üniversite|sınav|mezun|öğretmen|burs/.test(m))                                       return KATEGORILER[5];
  if (/turizm|tatil|plaj|otel|kültür|festival|tarihi|antik|side|boğazkent/.test(m))                             return KATEGORILER[7];
  if (/yemek|yaşam|doğa|hava|çevre|sosyal|aile|etkinlik/.test(m))                                               return KATEGORILER[6];
  return KATEGORILER[0];
}

async function sayfaCek(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
    });
    return await res.text();
  } catch (e) {
    return null;
  }
}

async function makaleCek(url) {
  const html = await sayfaCek(url);
  if (!html) return "";

  // Önce makale gövdesini bul
  const patterns = [
    /<article[\s\S]*?<\/article>/i,
    /<div[^>]+class="[^"]*(?:haber[-_]?detay|haber[-_]?icerik|haber[-_]?metin|news[-_]?detail|news[-_]?body|article[-_]?body|entry[-_]?content|post[-_]?content|icerik)[^"]*"[^>]*>([\s\S]{200,}?)<\/div>/i,
    /<div[^>]+id="[^"]*(?:habericerik|haber|icerik|content|article)[^"]*"[^>]*>([\s\S]{200,}?)<\/div>/i,
  ];

  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) {
      const temiz = metinTemizle(m[0]);
      if (temiz.length > 100) return temiz.slice(0, 2500);
    }
  }

  // Paragrafları topla
  const paragraflar = [];
  const pRegex = /<p[^>]*>([\s\S]{20,400}?)<\/p>/gi;
  let pm;
  while ((pm = pRegex.exec(html)) !== null) {
    const metin = metinTemizle(pm[1]);
    if (metin.length > 20 && !metin.includes("cookie") && !metin.includes("reklam")) {
      paragraflar.push(metin);
    }
  }
  if (paragraflar.length > 2) return paragraflar.slice(0, 8).join(" ").slice(0, 2500);

  return metinTemizle(html).slice(200, 1500);
}

async function haberlerCek(kaynak) {
  console.log(`\n📡 ${kaynak.ad} çekiliyor...`);
  const html = await sayfaCek(kaynak.url);
  if (!html) { console.warn(`   ⚠️  Erişilemedi`); return []; }

  const linkler = new Set();
  let match;
  const regex = new RegExp(kaynak.linkRegex.source, "g");
  while ((match = regex.exec(html)) !== null) {
    const path = match[1] || match[2];
    if (!path || path.length < 10 || path.includes("javascript") || path.includes("rss") || path.includes("feed")) continue;
    const fullUrl = path.startsWith("http") ? path : kaynak.base + path;
    linkler.add(fullUrl);
  }

  // Başlıkları bul
  const titleRegex = /title="([^"]{10,150})"/g;
  const altRegex   = /alt="([^"]{10,150})"/g;
  const h3Regex    = /<h[23][^>]*>([^<]{10,150})<\/h[23]>/g;
  const basliklar  = [];

  for (const r of [titleRegex, altRegex, h3Regex]) {
    let m;
    const re = new RegExp(r.source, "g");
    while ((m = re.exec(html)) !== null) {
      const baslik = htmlDecode(m[1] || "").trim();
      if (baslik && baslik.length > 5 && !baslik.toLowerCase().includes("logo") && !/^https?:/.test(baslik)) {
        basliklar.push(baslik);
      }
    }
  }

  const urlArr = [...linkler].slice(0, 20);
  console.log(`   ✓ ${urlArr.length} link bulundu`);

  return urlArr.map((url, i) => ({
    url,
    baslik: basliklar[i] || "",
    kaynak: kaynak.kaynak,
  }));
}

// ── Pexels Fotoğraf ───────────────────────────────────────────────────────────
const KATEGORI_ARAMALAR = {
  gundem:  ["turkey city news", "ankara turkey", "protest crowd"],
  asayis:  ["police car", "security officer", "law enforcement"],
  ekonomi: ["turkish market bazaar", "business meeting", "economy"],
  spor:    ["football stadium turkey", "soccer match", "sports"],
  saglik:  ["hospital medical", "doctor nurse", "health care"],
  egitim:  ["school classroom", "university students", "education"],
  yasam:   ["turkish lifestyle", "nature park", "daily life"],
  turizm:  ["antalya beach", "side ruins turkey", "mediterranean coast"],
};

async function gorselBul(baslik, kategoriSlug) {
  if (!PEXELS_API_KEY) return `https://picsum.photos/seed/${Date.now()}/860/504`;
  try {
    const aramalar = KATEGORI_ARAMALAR[kategoriSlug] || ["turkey news"];
    const arama   = aramalar[Math.floor(Math.random() * aramalar.length)];
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(arama)}&per_page=15&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY }, signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    if (data.photos?.length > 0) {
      const foto = data.photos[Math.floor(Math.random() * data.photos.length)];
      return foto.src.large2x || foto.src.large;
    }
  } catch {}
  return `https://picsum.photos/seed/${Date.now()}/860/504`;
}

// ── Haber Yazımı (Groq AI) ────────────────────────────────────────────────────
async function haberYaz(item) {
  const icerik = item.icerik || "";
  const kat    = kategoriTahmini(item.baslik + " " + icerik);

  const prompt = `Sen deneyimli bir Türk haber ajansı muhabirissin (İHA/DHA/AA üslubu).
Aşağıdaki kaynak habere dayanarak Serik Haberleri için profesyonel bir haber yaz.

KAYNAK AJANS: ${item.kaynak}
HABERİN BAŞLIĞI: ${item.baslik}
HABERİN İÇERİĞİ:
${icerik.slice(0, 2000) || "(İçerik çekilemedi, başlıktan yararlan)"}

─── HABER YAZIM KURALLARI ───────────────────────────────────────

1. KURAL — 5N1K: Her haberde şu soruların yanıtı mutlaka olmalı:
   Ne? Kim? Nerede? Ne zaman? Nasıl? Neden?
   İlk paragrafta en önemli bilgiyi ver.

2. KURAL — DİL: Ajans dili kullan.
   ✓ Kısa ve net cümleler (max 20 kelime/cümle)
   ✓ Üçüncü şahıs anlatım: "yaralandı", "açıkladı", "belirtildi"
   ✓ Alıntılar tırnak içinde: Yetkili, "..." ifadelerini kullandı.
   ✗ Yorum ve süslü sıfat yasak: "korkunç", "trajik", "müthiş" gibi kelimeler kullanma
   ✗ "Sanki", "adeta", "âdeta" gibi mecazi ifade kullanma

3. KURAL — YAPI (Ters Piramit):
   • 1. paragraf: Kim, ne yaptı/oldu, nerede, ne zaman (özet)
   • 2. paragraf: Olayın detayları, nasıl gelişti
   • 3. paragraf: Yetkili açıklaması veya arka plan bilgisi
   • 4. paragraf: Sonuç, gelişmeler, ya da kısa ek bilgi
   • Son satır: "(${item.kaynak})" — kaynak ibaresi

4. KURAL — DOĞRULUK:
   ✗ Kaynakta olmayan hiçbir bilgiyi ekleme veya uydurma
   ✓ Sadece verilen kaynaktan çıkarılabilecek gerçekleri yaz
   ✓ Emin olmadığın bilgiyi "iddia edildi", "belirtildi" ile yaz

5. KURAL — TÜRKÇE:
   ✓ Doğru Türkçe imla: ş, ğ, ı, ö, ü, ç harflerini doğru kullan
   ✓ Cümle başları büyük harf, özel isimler büyük harf
   ✓ Noktalama işaretlerine dikkat et

─── ÇIKTI FORMATI ───────────────────────────────────────────────
SADECE şu JSON'ı döndür, başka hiçbir şey yazma:
{
  "baslik": "Kısa, bilgi içerikli başlık — fiil içermeli, max 80 karakter",
  "ozet": "Haberin özünü tek cümlede anlat, max 155 karakter",
  "icerik": "<p>1. paragraf — 5N1K özeti</p><p>2. paragraf — detaylar</p><p>3. paragraf — açıklama/arka plan</p><p>4. paragraf — sonuç/gelişmeler</p><p>(${item.kaynak})</p>",
  "etiketler": ["konu1", "konu2", "konu3"]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "Sen İHA, DHA ve AA gibi Türk haber ajansları için haber yazan bir muhabirsin. Türkçe dil bilgin mükemmel, ajans haberciliği kurallarını çok iyi biliyorsun. Sadece gerçek bilgileri yazar, asla uydurmazsın. JSON formatında yanıt verirsin.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0.3,
  });

  const jsonMetin = completion.choices[0].message.content.trim();
  const jsonMatch = jsonMetin.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON bulunamadı");

  // Güvenli JSON parse — özel karakterleri temizle
  let jsonStr = jsonMatch[0];
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Satır içi kontrol karakterleri ve bozuk escape'leri temizle
    jsonStr = jsonStr
      .replace(/[\x00-\x1F\x7F]/g, " ")
      .replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e2) {
      throw new Error("JSON parse hatası: " + e2.message);
    }
  }
  return { ...parsed, kategori: kat };
}

// ── Supabase Kayıt ────────────────────────────────────────────────────────────
async function supabaseKaydet(haber) {
  const slug = slugify(haber.baslik) + "-" + Date.now().toString(36);
  const gorsel = await gorselBul(haber.baslik, haber.kategori.slug);

  const kayit = {
    title:         haber.baslik,
    slug,
    summary:       haber.ozet,
    content:       haber.icerik,
    category:      haber.kategori.name,
    category_slug: haber.kategori.slug,
    image:         gorsel,
    author:        "Serik Haberleri",
    published_at:  new Date().toISOString(),
    featured:      false,
    tags:          haber.etiketler || [],
  };

  const { error } = await supabase.from("haberler").insert([kayit]);
  if (error) throw error;
  return slug;
}

// ── Mevcut Sluglar ────────────────────────────────────────────────────────────
async function mevcutBasliklar() {
  const { data } = await supabase
    .from("haberler")
    .select("title, slug")
    .order("published_at", { ascending: false })
    .limit(300);
  return (data || []).map((h) => slugify(h.title).slice(0, 25));
}

// ── Ana Fonksiyon ─────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🤖 Serik Haber Botu — ${new Date().toLocaleString("tr-TR")}`);
  if (TEST_MODE) console.log("⚠️  TEST MODU\n");

  // 1. Tüm kaynaklardan haber topla
  let tumHaberler = [];
  for (const kaynak of KAYNAKLAR) {
    const haberler = await haberlerCek(kaynak);
    tumHaberler = [...tumHaberler, ...haberler];
  }

  // 2. Tekrar olmayan haberleri filtrele
  const mevcutlar = await mevcutBasliklar();
  const benzersiz = [];
  const gorulmus  = new Set();

  for (const h of tumHaberler) {
    const anahtar = slugify(h.baslik || h.url).slice(0, 25);
    if (anahtar.length < 5) continue;
    if (gorulmus.has(anahtar)) continue;
    if (mevcutlar.some((m) => m === anahtar)) continue;
    gorulmus.add(anahtar);
    benzersiz.push(h);
  }

  console.log(`\n📰 Toplam yeni haber: ${benzersiz.length}`);
  if (benzersiz.length === 0) { console.log("ℹ️  Yeni haber yok."); return; }

  // 3. Her haber için makale içeriğini çek ve yaz
  const islenecekler = benzersiz.slice(0, 5);
  let basarili = 0;

  for (const item of islenecekler) {
    try {
      // Makale sayfasından içerik çek
      const icerik = await makaleCek(item.url);
      item.icerik  = icerik;

      // Başlık hala boşsa URL'den çıkar
      item.baslik = htmlDecode(item.baslik || "");
      if (!item.baslik || item.baslik.length < 5) {
        item.baslik = item.url.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Haber";
      }

      console.log(`\n✍️  [${item.kaynak}] "${item.baslik.slice(0, 60)}"`);
      const haber = await haberYaz(item);
      console.log(`   📝 ${haber.baslik}`);
      console.log(`   📁 ${haber.kategori.name}`);

      if (!TEST_MODE) {
        const slug = await supabaseKaydet(haber);
        console.log(`   ✅ /haber/${slug}`);
      } else {
        console.log("   🔍 [TEST] Kayıt atlandı");
      }

      basarili++;
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`   ❌ ${err.message}`);
    }
  }

  console.log(`\n🎉 ${basarili}/${islenecekler.length} haber eklendi`);
  console.log(`⏰ Sonraki: ${new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString("tr-TR")}\n`);
}

// ── Daemon modu: sürekli çalışır ─────────────────────────────────────────────
if (DAEMON_MODE) {
  const ARALIK_SAAT = 3;
  console.log(`\n⚙️  DAEMON MODU — Her ${ARALIK_SAAT} saatte bir otomatik çalışır`);
  console.log(`   Durdurmak için: Ctrl+C\n`);

  async function loop() {
    while (true) {
      try {
        await main();
      } catch (err) {
        console.error("❌ Bot hatası:", err.message);
      }
      const sonrakiMs = ARALIK_SAAT * 60 * 60 * 1000;
      const sonraki   = new Date(Date.now() + sonrakiMs);
      console.log(`💤 Bekleniyor... Sonraki çalışma: ${sonraki.toLocaleString("tr-TR")}`);
      await new Promise((r) => setTimeout(r, sonrakiMs));
    }
  }

  loop();
} else {
  main().catch(console.error);
}
