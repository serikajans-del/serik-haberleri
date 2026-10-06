// "Araç muayene ücreti 2027" haberini serikmerkez.com'a girer: temsili görsel, yazı, Rank Math SEO.
import { readFileSync } from "fs";
import { wp, SITE } from "./wp.mjs";

const alt = "Araç muayene istasyonunda kontrol edilen araçlar (temsili)";
const m = await wp("/wp/v2/media", { method: "POST", body: readFileSync("haberler/gorsel-kaynak/arac-muayene-istasyonu-temsili.jpg"),
  headers: { "Content-Type": "image/jpeg", "Content-Disposition": 'attachment; filename="arac-muayene-ucreti-2027-temsili.jpg"' } });
await wp(`/wp/v2/media/${m.id}`, { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ alt_text: alt, title: alt, caption: "Temsili görsel. Fotoğraf: Aziz Akbiyik / Wikimedia Commons (CC BY-SA 3.0)" }) });

const baslik = "Araç muayene ücreti 2027'de 4 bin lirayı aşabilir";
const ozet = "Araç muayene ücreti için 2027'de yüzde 28 zam bekleniyor. Otomobilde 3.288 TL olan ücret 4.208 TL'ye, egzoz ölçümü 589 TL'ye çıkabilir.";
const icerik = `<p><strong>Araç muayene ücreti, 2027'nin başında yeniden değerleme oranı kadar artacak. Oranın yüzde 28 dolayında açıklanması bekleniyor; bu durumda otomobil, minibüs ve kamyonetler için 3 bin 288 lira olan muayene ücreti 1 Ocak 2027'den itibaren yaklaşık 4 bin 208 liraya yükselecek.</strong></p>
<figure class="wp-block-image size-large"><img src="${m.source_url}" alt="${alt}" class="wp-image-${m.id}"/><figcaption>Temsili görsel. Fotoğraf: Aziz Akbiyik / Wikimedia Commons (CC BY-SA 3.0)</figcaption></figure>
<h2>Araç muayene ücreti ne kadar olacak?</h2>
<p>Muayene ve egzoz emisyon ölçüm ücretleri her yıl yeniden değerleme oranında güncelleniyor. Ekonomi çevrelerinin beklentisi, bu yılki oranın yüzde 28 civarında gerçekleşeceği yönünde. Beklenti tutarsa 2026'da 3 bin 288 lira olan otomobil, minibüs ve kamyonet muayene ücreti 920 lira artarak 4 bin 208 liraya çıkacak.</p>
<p>Egzoz emisyon ölçümünde de benzer bir artış öngörülüyor. Hâlen 460 lira olan ölçüm ücretinin 589 liraya yükselmesi bekleniyor.</p>
<h2>Muayene ve egzoz birlikte 4 bin 797 lira</h2>
<p>Bir otomobil sahibi bugün muayene ve egzoz ölçümü için toplam 3 bin 748 lira ödüyor. Yüzde 28'lik artış senaryosunda bu tutar 4 bin 797 liraya ulaşacak; yani iki işlemin maliyeti yaklaşık 1.049 lira artacak.</p>
<h2>Kesin oran kasımda belli olacak</h2>
<p>Hesaplamalar şimdilik beklentilere dayanıyor. Yeniden değerleme oranı, Türkiye İstatistik Kurumunun kasım ayı başında açıklayacağı ekim ayı Yurt İçi Üretici Fiyat Endeksi verisiyle kesinleşecek ve Hazine ve Maliye Bakanlığının tebliğiyle ilan edilecek. Cumhurbaşkanı'nın bu oranı artırma veya azaltma yetkisi de bulunuyor; yetki kullanılmazsa açıklanan oran doğrudan uygulanacak.</p>
<h2>Yeni tarife ne zaman başlayacak?</h2>
<p>Yeni ücretler 1 Ocak 2027'den itibaren araç muayene istasyonlarında geçerli olacak. Muayene tarihi yaklaşan Serik ve çevresindeki araç sahipleri, işlemlerini yıl sonuna kadar yaptırmaları halinde mevcut tarife üzerinden ödeme yapacak.</p>
<p><a href="${SITE}/category/ekonomi/">Ekonomi</a> kategorimizi takip edebilirsiniz.</p>`;

const post = await wp("/wp/v2/posts", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: baslik, content: icerik, excerpt: ozet, status: process.env.WORDPRESS_STATUS || "publish",
    slug: "arac-muayene-ucreti-2027-zam", categories: [1, 9], featured_media: m.id }) });
await wp(`/wp/v2/media/${m.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post: post.id }) });
await wp("/rankmath/v1/updateMeta", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ objectType: "post", objectID: post.id, meta: {
    rank_math_focus_keyword: "araç muayene ücreti", rank_math_title: baslik, rank_math_description: ozet } }) });
console.log("yayınlandı:", post.id, post.link, "| durum:", post.status);
console.log("başlık", baslik.length, "açıklama", ozet.length, "kelime", icerik.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length);
