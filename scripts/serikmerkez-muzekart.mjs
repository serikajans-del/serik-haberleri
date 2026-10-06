// "Kimlik kartı Müzekart olacak" haberini serikmerkez.com'a girer: temsili görsel, yazı, Rank Math SEO.
import { readFileSync } from "fs";
import { wp, SITE } from "./wp.mjs";

const alt = "Serik'teki Aspendos Antik Tiyatrosu'nu gezen ziyaretçiler (temsili)";
const kaynak = "Aspendos Antik Tiyatrosu, Serik (temsili). Fotoğraf: Lee Vilenski / Wikimedia Commons (CC BY-SA 4.0)";
const m = await wp("/wp/v2/media", { method: "POST", body: readFileSync("haberler/gorsel-kaynak/aspendos-tiyatrosu-temsili.jpg"),
  headers: { "Content-Type": "image/jpeg", "Content-Disposition": 'attachment; filename="kimlik-karti-muzekart-aspendos-temsili.jpg"' } });
await wp(`/wp/v2/media/${m.id}`, { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ alt_text: alt, title: alt, caption: kaynak }) });

const baslik = "Kimlik kartı Müzekart olacak: 216 müzede yeni dönem";
const ozet = "T.C. kimlik kartı Müzekart olarak kullanılacak. Ücreti e-Devlet'ten ödeyen ziyaretçi, 216 müze ve ören yerine kimliğini okutarak girecek.";
const icerik = `<p><strong>Kimlik kartı Müzekart olarak kullanılabilecek. Kültür ve Turizm Bakanı Mehmet Nuri Ersoy'un duyurduğu projeye göre, Türkiye genelindeki 216 müze ve ören yerinde ziyaretçiler ücretini internetten ödedikten sonra girişte T.C. kimlik kartlarını okutarak içeri girecek. Çalışmaların 2026 yılı sonuna kadar tamamlanması planlanıyor.</strong></p>
<figure class="wp-block-image size-large"><img src="${m.source_url}" alt="${alt}" class="wp-image-${m.id}"/><figcaption>${kaynak}</figcaption></figure>
<h2>Kimlik kartı Müzekart olarak nasıl kullanılacak?</h2>
<p>Bakan Ersoy'un sosyal medya hesabından paylaştığı bilgilere göre sistem iki adımdan oluşacak. Ziyaretçi önce Müzekart'ın yıllık kullanım ücretini e-Devlet üzerinden ya da Bakanlığın mobil uygulamasından ödeyecek. Ödeme tamamlandıktan sonra müze ve ören yerlerinin girişindeki turnikelerde kimlik kartını okutması yeterli olacak; ayrıca kart çıkarmaya ya da gişede sıra beklemeye gerek kalmayacak.</p>
<h2>Mevcut Müzekartlar ne olacak?</h2>
<p>Kullanım süresi devam eden Müzekartlar, süreleri dolana kadar bugünkü gibi geçerli olacak. Yeni uygulama, süresi biten kartların yerine devreye girecek; kartını yenilemek isteyenler işlemi kimlik kartları üzerinden yapacak.</p>
<h2>216 müze ve ören yerinde dijital altyapı</h2>
<p>Proje için Kültür ve Turizm Bakanlığı ile Türk Telekom arasında protokol imzalandı. Protokol kapsamında 216 müze ve ören yerine fiber altyapı, kablosuz internet ve 5G bağlantısı kurulacak. Akıllı biletleme, yapay zekâ destekli veri analitiği, sesli rehber ile artırılmış ve sanal gerçeklik uygulamalarının da ziyaretçilerin hizmetine sunulması hedefleniyor.</p>
<h2>Aspendos ve Antalya'daki ören yerleri</h2>
<p>Antalya, Bakanlığa bağlı müze ve ören yerlerinin en yoğun olduğu illerden biri. Serik'teki Aspendos Antik Kenti de Müzekart'la gezilebilen noktalar arasında yer alıyor. Kapsamdaki 216 müze ve ören yerinin tam listesi ile Müzekart ücretinde bir değişiklik olup olmayacağı ise açıklamada yer almadı.</p>
<p><a href="${SITE}/category/kultur-sanat/">Kültür Sanat</a> kategorimizi takip edebilirsiniz.</p>`;

const post = await wp("/wp/v2/posts", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: baslik, content: icerik, excerpt: ozet, status: process.env.WORDPRESS_STATUS || "publish",
    slug: "kimlik-karti-muzekart-olacak", categories: [193, 9], featured_media: m.id }) });
await wp(`/wp/v2/media/${m.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post: post.id }) });
await wp("/rankmath/v1/updateMeta", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ objectType: "post", objectID: post.id, meta: {
    rank_math_focus_keyword: "kimlik kartı Müzekart", rank_math_title: baslik, rank_math_description: ozet } }) });
console.log("yayınlandı:", post.id, post.link, "| durum:", post.status);
console.log("başlık", baslik.length, "açıklama", ozet.length, "kelime", icerik.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length);
