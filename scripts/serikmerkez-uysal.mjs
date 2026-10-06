// Ümit Uysal - Serik haberini serikmerkez.com'a (WordPress) girer: görseller, yazı, Rank Math SEO.
import { readFileSync } from "fs";
import { wp, SITE } from "./wp.mjs";

async function yukle(dosya, ad, alt) {
  const buf = readFileSync(dosya);
  const m = await wp("/wp/v2/media", { method: "POST", body: buf,
    headers: { "Content-Type": "image/jpeg", "Content-Disposition": `attachment; filename="${ad}"` } });
  await wp(`/wp/v2/media/${m.id}`, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alt_text: alt, title: alt }) });
  return { id: m.id, url: m.source_url };
}

const kapak = await yukle("public/haber-gorsel/umit-uysal-serik-konusma.jpg", "umit-uysal-serik-teknoloji-uyarisi.jpg", "Ümit Uysal Serik'te CHP ilçe teşkilatına konuşuyor");
const g1 = await yukle("public/haber-gorsel/umit-uysal-chp-serik-toplanti.jpg", "umit-uysal-chp-serik-ilce-baskanligi.jpg", "Ümit Uysal'ın CHP Serik İlçe Başkanlığı'ndaki toplantısı");
const g2 = await yukle("public/haber-gorsel/umit-uysal-serik-karsilama.jpg", "umit-uysal-serik-partililer.jpg", "Ümit Uysal Serik'te partililerle selamlaşıyor");

const baslik = "Ümit Uysal Serik'te teknoloji uyarısı yaptı";
const ozet = "Ümit Uysal Serik'te CHP ilçe teşkilatıyla buluştu; 10 yıl içinde tarımda robotların, turizmde hologramların öne çıkacağını söyledi.";
const icerik = `<p><strong>Muratpaşa Belediye Başkanı Ümit Uysal Serik'te CHP İlçe Başkanlığı'nı ziyaret ederek partililerle buluştu. 6 Ekim Salı günü yapılan toplantıda Uysal, önümüzdeki 10 yılda tarımdan turizme pek çok alanın teknolojiyle kökten değişeceğini belirtti, Türkiye'nin bu dönüşüme hazırlanması gerektiğini söyledi.</strong></p>
<figure class="wp-block-image size-large"><img src="${kapak.url}" alt="Ümit Uysal Serik'te CHP ilçe teşkilatına konuşuyor" class="wp-image-${kapak.id}"/></figure>
<h2>“Tarlada insan emeği kalmayacak”</h2>
<p>İlçe yöneticileri, belediye meclis üyeleri, muhtarlar ve oda başkanlarının da izlediği konuşmasında Uysal, tarımın geleceğine geniş yer ayırdı. Uysal'a göre 10 yıla kalmadan ekimden hasada kadar bütün işleri robotlar üstlenecek; tarladaki sensörler toprağın ihtiyacını belirleyecek, ilaçlama ve gübrelemeyi dronlar yapacak, ürünü sürücüsüz araçlar fabrikaya taşıyacak.</p>
<p>Türkiye'deki tarım arazilerinin iki, üç, beş dönümlük parçalardan oluştuğunu hatırlatan Uysal, bu yapıyla yüksek verimliliğe ve düşük maliyete ulaşmanın mümkün olup olmadığını sordu. Uysal, çiftçi sayısının her yıl azaldığını, çiftçilerin yaş ortalamasının 59'a çıktığını ve genç kuşağın üretime yönelmediğini öne sürdü.</p>
<h2>Perge'de hologram örneği</h2>
<p>Turizmde de benzer bir kırılma beklediğini anlatan Uysal, kitle turizminin yerini kişiye özel deneyimlerin alacağını savundu. Yeni kuşakların her şey dahil tatille yetinmediğini söyleyen Uysal, Perge'yi gezen bir ziyaretçinin hologram teknolojisiyle İmparator Hadrianus'u karşısında görmek isteyeceğini örnek verdi.</p>
<p>Uysal, eğitimin kişinin yeteneğine göre şekillenen ve ömür boyu süren bir yapıya dönüşeceğini, sağlıkta ise nanoteknoloji sayesinde hastalıkların daha ortaya çıkmadan önleneceğini ifade etti.</p>
<h2>“Siber saldırı enerji sistemini çökertebilir”</h2>
<p>Yüksek teknolojinin güvenlik boyutuna da değinen Uysal, dünyanın herhangi bir yerinden yapılacak bir siber saldırının bir ülkenin enerji ve gıda sistemini günler içinde durdurabileceğini söyledi. Dünya nüfusunun 10 yıl içinde 9 milyara ulaşacağını, çalışan nüfusun ise 3 milyarda kalacağını savunan Uysal, kendi yazılımı, işlemcisi ve verisi olmayan ülkelerin bu süreçte zorlanacağını dile getirdi.</p>
<h2>Uysal'dan partililere mesaj</h2>
<p>Konuşmasının siyasi bölümünde Uysal, partide kalan üyelere teşekkür etti ve Türkiye'nin yeni bir başlangıca ihtiyaç duyduğunu kaydetti. “Türkiye'yi 100 yıl önce olduğu gibi bugün de CHP taşıyacak” diyen Uysal, bunun parti için aynı zamanda büyük bir sorumluluk anlamına geldiğini, kadro ve bilgi birikimiyle hazır olunması gerektiğini vurguladı.</p>
<p>[gallery ids="${g1.id},${g2.id}"]</p>
<p><a href="${SITE}/category/serik/">Serik</a> kategorimizi takip edebilirsiniz.</p>`;

const post = await wp("/wp/v2/posts", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: baslik, content: icerik, excerpt: ozet, status: process.env.WORDPRESS_STATUS || "publish",
    slug: "umit-uysal-serik-teknoloji-uyarisi", categories: [276, 171], featured_media: kapak.id }) });
for (const id of [g1.id, g2.id, kapak.id])
  await wp(`/wp/v2/media/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ post: post.id }) });
const seo = await wp("/rankmath/v1/updateMeta", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ objectType: "post", objectID: post.id, meta: {
    rank_math_focus_keyword: "Ümit Uysal Serik", rank_math_title: baslik, rank_math_description: ozet } }) });
console.log("yayınlandı:", post.id, post.link, "| durum:", post.status, "| seo:", JSON.stringify(seo).slice(0, 80));
console.log("başlık", baslik.length, "açıklama", ozet.length, "kelime", icerik.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length);
