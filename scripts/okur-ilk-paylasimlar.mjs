// Okur Haberleri ilk içerik: SerikHaberleri editör hesabıyla, sitede yayımlanmış haberlere dayanan paylaşımlar.
// Hepsi "beklemede" girer; yönetici /admin/okur'dan onaylayınca yayına çıkar.
// Çalıştır: node --env-file=.env.local scripts/okur-ilk-paylasimlar.mjs
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const H = "https://www.serikhaberleri.com/haber/";
const G = "https://www.serikhaberleri.com/haber-gorsel/";
const slugify = (s) => s.replace(/[çğıöşüâÇĞİIÖŞÜÂ]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u", Â: "a" })[c] ?? c)
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

const PAYLASIMLAR = [
  {
    kategori: "trafik-kaza", mahalle: "Merkez", yer: "Serik–Antalya yolu", foto: "antalya-cop31-trafik-duzenlemesi.jpg",
    baslik: "COP31 trafik tedbirleri sürüyor: Antalya yolunda durum nasıl?",
    icerik: `Antalya'da COP31 nedeniyle 9-13 Kasım tarihlerinde Dikmen ve Altınova kavşakları arasında trafik tedbiri uygulanıyor; yük taşımacılığı gece saatlerine kaydırıldı.

Serik'ten Antalya'ya gidip gelenler: Bugün yolda durum nasıldı? Yoğunluk, kapalı yol ya da kullandığınız alternatif güzergâhı saat ve yer belirterek yorumlara yazın; birbirimize yol gösterelim.

Tedbirlerin ayrıntısı: ${H}antalya-cop31-trafik-ulasim-duzenlemesi-9-13-kasim`,
  },
  {
    kategori: "bilgi", mahalle: "Merkez", yer: "Çınaraltı Meydanı", foto: "cinaralti-meydani-yagmur-suyu-calismasi.jpg",
    baslik: "Çınaraltı'ndaki yağmur suyu hattı çalışması: Son durum ne?",
    icerik: `Serik Belediyesi, her sağanakta su altında kalan Çınaraltı Meydanı'nda yağmur suyu hattı çalışmasına ekim ayında başladı. Esnaf, yıllardır beklediği çalışmadan umutluydu.

Bölgeden geçenler ve Çınaraltı esnafı: Çalışma ne aşamada, yaya ve araç geçişi nasıl? Son yağmurlarda meydanda su birikti mi? Fotoğraflı bilgi paylaşırsanız konuyu birlikte takip edelim.

Haberin ilk hâli: ${H}serik-cinaralti-meydaninda-yagmur-suyu-hatti-icin-kazi-basladi`,
  },
  {
    kategori: "bilgi", mahalle: "Merkez", yer: "",
    baslik: "Yağmurda su basan sokakları fotoğrafla bildirin",
    icerik: `Kış yağışları başladı. Sağanakta su biriken, rögarı taşan ya da geçilmez hâle gelen sokak ve kavşakları "Yol ve Altyapı" bölümünde paylaşabilirsiniz.

Paylaşırken yeri (mahalle, sokak, yakındaki bilinen bir nokta), günü ve saati yazın; mümkünse fotoğraf ekleyin. Yetkililere iletilen sorunların durumu paylaşımın üzerinde "Yetkililere iletildi" ve "Çözüldü" olarak güncellenir.

İnsan yüzü ve araç plakası görünen fotoğrafları paylaşmayın.`,
  },
  {
    kategori: "gorus", mahalle: "Merkez", yer: "Serik Cuma Pazarı", foto: "serik-cuma-pazari-turist-kapak.jpg",
    baslik: "Cuma Pazarı'na gelen turist: Serik merkezi bundan nasıl kazanır?",
    icerik: `Serik Cuma Pazarı son haftalarda yabancı turistlerle hareketlendi; tezgâhlarda Almanca pazarlık yapılıyor. Oda başkanı Mevlüt Akıllı, otellerde kalan turistin ilçe merkezine daha çok gelmesini istedi.

Sizce turistin Serik merkezine gelmesi ve alışveriş yapması için ne yapılmalı? Servis, yönlendirme tabelası, pazar düzeni, fiyat etiketi… Esnaf ve pazarcı okurlarımızın görüşlerini özellikle merak ediyoruz.

Haber: ${H}serik-cuma-pazarinda-alman-turist-yogunlugu`,
  },
  {
    kategori: "bilgi", mahalle: "Merkez", yer: "Serik Cuma Pazarı", foto: "serik-cintar-mantari-kapak.jpg",
    baslik: "Çıntar mantarı pazarda: Bu hafta kilosu kaç lira?",
    icerik: `Ekim ortasında Serik Cuma Pazarı'nda Dumanlı Yaylası'ndan gelen çıntar mantarının kilosu 250-300 liradan satılıyordu.

Bu cuma pazara gidenler: Çıntar hâlâ tezgâhta mı, fiyatı ne durumda? Yorumlara yazın, alışverişe çıkacaklar bilsin.

Haber: ${H}serik-cuma-pazarinda-cintar-mantari-kilosu-300-lira`,
  },
  {
    kategori: "gorus", mahalle: "Merkez", yer: "", foto: "serikspor-taraftar-mehmet-karadayi-stat.jpg",
    baslik: "Serikspor evinde oynayamıyor: Stat sorunu nasıl çözülmeli?",
    icerik: `Pehlivanlar Taraftar Derneği Başkanı Mehmet Karadayı, stat sorunu çözülmediği için Serikspor maçlarının Serik dışında oynandığını söyledi ve kulübün açıklama yapmasını istedi.

Serikspor taraftarları: Takımın yeniden kendi seyircisi önünde oynayabilmesi için ne yapılmalı? Görüşlerinizi saygı çerçevesinde yazın.

Haber: ${H}serikspor-taraftarindan-stat-tepkisi-kulup-aciklama-yapsin`,
  },
  {
    kategori: "gorus", mahalle: "Merkez", yer: "", foto: "serik-galericiler-sitesi-projesi.jpg",
    baslik: "8 yıldır beklenen Galericiler Sitesi: Sizin görüşünüz ne?",
    icerik: `Serik Oto Galericiler Sitesi Başkanı Mustafa Özkaya, oto galerideki kundaklamanın ardından ilçedeki yaklaşık 800 galericinin 8 yıldır beklediği site projesi için onay istedi.

Galerici okurlarımız, araç alıp satanlar ve galerilerin bulunduğu caddelerde yaşayanlar: Galericilerin tek bir sitede toplanması sizce neyi değiştirir? Görüşlerinizi yazın.

Haber: ${H}serik-te-800-galerici-galericiler-sitesi-ni-bekliyor`,
  },
  {
    kategori: "trafik-kaza", mahalle: "Orta", yer: "Belek Turizm Yolu, ışıklı kavşak", foto: "serik-belek-yolu-kaza-olay-yeri.jpg",
    baslik: "Belek Turizm Yolu'ndaki ışıklı kavşak: Sizce güvenli mi?",
    icerik: `12 Ekim'de Orta Mahalle'de Belek Turizm Yolu üzerindeki ışıklı kavşakta iki otomobil çarpıştı; araçlardan biri alev aldı, 2 kişi yaralandı.

Bu kavşağı her gün kullananlar: Işık süreleri, hız ve görüş açısı nasıl? Yaşadığınız ramak kala durumları ve önlem önerilerinizi yazın. Kaza fotoğrafı paylaşacaksanız yaralı ve plaka görünmesin.

Haber: ${H}serik-te-iki-otomobil-carpisti-biri-alev-alip-kule-dondu-2-yarali`,
  },
  {
    kategori: "bilgi", mahalle: "Diğer", yer: "Akbaş",
    baslik: "Ormanda duman görürseniz vakit kaybetmeden 112'yi arayın",
    icerik: `Jandarma, eylülde Serik Akbaş ve Kaş Çayköy'de toplam 180 hektarı etkileyen orman yangınlarının kasten çıkarıldığını belirledi; 6 şüpheli gözaltına alındı.

Orman yangınlarında ilk dakikalar belirleyicidir. Duman, ateş ya da ormanda şüpheli bir hareket görürseniz hemen 112 Acil Çağrı Merkezi'ni arayın; yeri bilinen bir yol, köy ya da tepe adıyla tarif edin. Kendinizi tehlikeye atmayın.

Haber: ${H}serik-akbas-ve-kas-orman-yanginlari-kasten-cikarildi-6-gozalti`,
  },
  {
    kategori: "bilgi", mahalle: "Diğer", yer: "Sillyon Antik Kenti", foto: "sillyon-kadir-inanir-evi-kopru-filmi.jpg",
    baslik: "Köprü filminin evi Sillyon'da restore edildi: Gidip gören var mı?",
    icerik: `Kadir İnanır'ın başrolünde oynadığı Köprü filminin çekildiği asırlık ev, Serik'teki Sillyon Antik Kenti'nde aslına uygun olarak restore edildi.

Hafta sonu yakın bir gezi arayanlar için güzel bir rota. Gidip görenler: Yol durumu, park yeri ve ziyaret için ipuçlarını yorumlara yazın; çektiğiniz manzara fotoğraflarını da paylaşabilirsiniz.

Haber: ${H}kopru-filminin-evi-sillyon-da-restore-edildi`,
  },
  {
    kategori: "bilgi", mahalle: "Merkez", yer: "", foto: "serik-atiksu-aritma-tesisi-yatirim.jpg",
    baslik: "Serik'e 750 milyon liralık atıksu yatırımı: Mahallenizde sorun var mı?",
    icerik: `ASAT, Serik Atıksu Arıtma Tesisi'nin günlük kapasitesini 90 bin metreküpten 122 bin 500 metreküpe çıkarıyor. Yatırımın tutarı yaklaşık 750 milyon lira.

Mahallenizde kanalizasyon taşması, rögar kokusu ya da bağlantı sorunu yaşıyorsanız yerini, gününü ve fotoğrafını "Yol ve Altyapı" bölümünde paylaşın; sorunları bir arada görünür kılalım.

Haber: ${H}serik-atiksu-aritma-tesisi-750-milyon-liralik-yatirim`,
  },
  {
    kategori: "kayip-buluntu", mahalle: "Merkez", yer: "",
    baslik: "Kayıp ve buluntu ilanlarınızı buradan duyurun",
    icerik: `Kaybolan evcil hayvanınızı, düşürdüğünüz cüzdanı ya da bulduğunuz bir eşyayı "Kayıp / Buluntu" bölümünden duyurabilirsiniz.

Ne zaman ve nerede kaybolduğunu (ya da bulunduğunu), ayırt edici özelliklerini yazın; fotoğraf ekleyin. Güvenliğiniz için telefon numaranızı ve ev adresinizi yazmayın, yorumlardan haberleşin. Bulunan kimlik ve kartları en yakın karakola teslim etmeyi unutmayın.`,
  },
  {
    kategori: "gorus", mahalle: "Merkez", yer: "",
    baslik: "Serik'te en memnun kaldığınız esnaf kim?",
    icerik: `İyi iş yapan esnafı duyurmak da en az şikâyet kadar önemli. Bir ustadan, bir dükkândan, bir lokantadan ya da bir hizmetten çok memnun kaldıysanız "İşletme Tavsiyesi" bölümünde paylaşın.

İşletmenin adını, nerede olduğunu ve neden memnun kaldığınızı yazın. Reklam ya da kişisel saldırı içeren paylaşımlar yayınlanmaz.

Usta arıyorsanız: https://www.serikhaberleri.com/ustam`,
  },
  {
    kategori: "bilgi", mahalle: "Merkez", yer: "",
    baslik: "Gece eczane, acil usta, hava durumu: Serikliler için işe yarar sayfalar",
    icerik: `Serik'te sık aranan bilgiler Serik Haberleri'nde tek yerde:

• Nöbetçi eczaneler: https://www.serikhaberleri.com/eczane
• Usta bul, ücretsiz teklif al (Serik Ustam): https://www.serikhaberleri.com/ustam
• Serik hava durumu: https://www.serikhaberleri.com/hava-durumu

Eklenmesini istediğiniz bir bilgi sayfası varsa yorumlara yazın.`,
  },
  {
    kategori: "gorus", mahalle: "Merkez", yer: "", foto: "serik-cilek-fidesi-kemal-kadioglu.jpg",
    baslik: "Serik çileği aralıkta tezgâhta: Üreticiler, bu sezon nasıl?",
    icerik: `Serik'te seralara çilek fideleri dikildi. 9 dönümde üretim yapan Kemal Kadıoğlu, ilk hasadı aralık ortasında yapmayı planlıyor.

Üretici okurlarımız: Bu sezon fide, gübre ve işçilik maliyetleri nasıl, beklentiniz ne? Tüketiciler: Serik çileğini en çok nereden alıyorsunuz?

Haber: ${H}serik-te-cilek-sezonu-basladi-fideler-seralara-dikildi`,
  },
];

// Editör hesabı (giriş yapılamaz: şifre özeti geçersiz biçimde, kimse oturum açamaz)
let { data: editor } = await db.from("meydan_uyeler").select("id").eq("rumuz_kucuk", "serikhaberleri").maybeSingle();
if (!editor) {
  ({ data: editor } = await db.from("meydan_uyeler").insert([{
    rumuz: "SerikHaberleri", rumuz_kucuk: "serikhaberleri", sifre_hash: `kilitli$${randomBytes(24).toString("hex")}`, cinsiyet: "belirtilmedi", mahalle: "Merkez", guvenilir: true,
  }]).select("id").single());
  console.log("editör hesabı açıldı:", editor.id);
}

for (const p of PAYLASIMLAR) {
  const slug = slugify(p.baslik);
  const { data: var_mi } = await db.from("meydan_paylasimlar").select("id").eq("slug", slug).maybeSingle();
  if (var_mi) { console.log("ATLANDI (zaten var):", slug); continue; }
  const { error } = await db.from("meydan_paylasimlar").insert([{
    slug, uye_id: editor.id, kategori: p.kategori, baslik: p.baslik, icerik: p.icerik, mahalle: p.mahalle, yer: p.yer,
    fotolar: p.foto ? [G + p.foto] : [], durum: "beklemede",
  }]);
  console.log(error ? `HATA ${slug}: ${error.message}` : `beklemede: ${p.kategori.padEnd(13)} ${p.baslik}`);
}
