# GÜNDEM GÖRSELİ — her 20 dakikada bir tur, haberler birikir ve 4–5'lik albümle gider (22 Kas gece) (zamanlanmış görev "serik-gundem-gorseli")
Kullanıcı (16 Kas 2026): "20 dk'da bir gündemle alakalı haber seç, Haber Görseli Oluşturucu şablonunda hazırla, Telegram'dan at;
özellikle ekonomi, piyasalar, önemli gündem." Sonra: **"En önemli kural haber anlaşılır olacak. Okuyucu haberi okuyup anlasın,
kafasında soru işareti olmasın. Büyük, kaba olmasın. Saat-tarih gerekmez [22 Kas güncellemesi: görselde artık TARİH var, saat yok — 4b]. Vurgulu renk olmasın. Görsel mutlaka çerçeveye sığmalı;
gerekirse ChatGPT'den fotoğraf oluştur."**
Siteye (serikmerkez / serikhaberleri) hiçbir şey GİRİLMEZ; ürün yalnız kullanıcıya Telegram'dan giden görsel + paylaşım metnidir.

Çalışma klasörü: `C:\Users\MONSTER\Desktop\yapayzeka\serik-haberleri`. Saat 00:00–07:00 arasıysa hiçbir şey yapma, bitir.

## HABER DAİRESİ GİBİ ÇALIŞ (kullanıcı 16 Kas: "profesyonel bir haber dairesi gibi çalış, haber araştır, işimize yarayacak haberleri bul; Antalya, Serik çevresinden de, turizm olur")
Okurumuz Serik ve Antalya'da yaşıyor; geçimi büyük ölçüde turizm, tarım (sera, narenciye) ve esnaflık. Her turda kendine sor:
**"Serikli bir okur bunu okuyunca ne öğrenir, işine ne yarar?"** Cevabı yoksa o haber bizim değil.

## ⚡ KESİNTİ NÖBETİ — her turun İLK işi (kullanıcı 21 Kas: "elektrikler kesik Serik'te bazı yerde, bunu kaçırdın; görsel yapıp göndermen gerekirdi, böyle konular önemli")
Serik'te elektrik/su kesintisi okurun en çok aradığı ve en çok paylaştığı bilgidir; ASLA atlanmaz, "rutin" sayılmaz.
- `gundem.py aday` çıktısında **"⚡ KESİNTİ NÖBETİ"** satırı ve adaylar.json'da `no: 0, kesinti: {...}` adayı varsa: bugünün Serik kesintisi henüz gönderilmemiş demektir → bu turda MUTLAKA gönder.
- Kaynağı aç (Claude in Chrome; listedeki Antalya Ekspres / mygazete / Antalya Gündem vb.), **yalnız "Serik ilçesine bağlı…" paragraflarını** al. Elektrik dağıtım şirketi AEDAŞ'ın sitesi otomatik erişimde açılmıyor; haber sitelerindeki AEDAŞ listesi kullanılır, en az bir sitede Serik paragrafı görülmeden yazma. Su için `kesinti.su` (ASAT) satırları.
- Görsel: başlık "Serik'te N mahallede elektrik kesintisi" (mahalle sayısı = benzersiz mahalle adları), metin: neden (bakım/altyapı), öne çıkan mahalleler (Merkez, Belek, Boğazkent…), elektriğin kaç arası verileceği. Fotoğraf: haber sayfasındaki yazısız direk/hat fotoğrafı (`foto-ara`); yazılı/afişli kapakları alma.
- Paylaşım metni (`aciklama`): **tam liste saat gruplarıyla** (⏰ 08.30–15.30: …) + "Kesinti mahallenin tamamını değil belirli bölümlerini kapsayabilir. Arıza ve bilgi: 186" + etiketler. Telegram altyazı sınırı 1024 karakter; aşarsa mahalleleri saat grubunda kısalt, saatleri asla atma.
- Gönderilince `kesinti-durum.json` o günü işaretler; aynı gün tekrar gönderilmez. Gün içinde **yeni/plansız** (arıza) kesinti haberi çıkarsa ayrı haber olarak normal akışta değerlendir.
- Örnek (21 Kas 10:15): "Serik'te 25 mahallede elektrik kesintisi" — Antalya Ekspres'ten 8 mahalle grubu.

## 🌍 UYARI NÖBETİ — kesintiyle birlikte her turun ilk işi (22 Kas: kullanıcı "uyarılar önemli", "haber kaçırmamalı")
- **Deprem:** `aday` AFAD'ın açık servisinden son 3 saati okur. Antalya ve komşu iller (Burdur, Isparta, Konya, Karaman, Mersin, Muğla, Denizli, Akdeniz) M3.5+, Türkiye geneli M5.0+ deprem `no:0` aday olarak listenin başına gelir (`deprem`: büyüklük, yer, `saat_tsi`, derinlik, AFAD bağlantısı). Bu turda MUTLAKA gönder. Etiket `SON DAKİKA`. Başlık: "Antalya'da 4,2 büyüklüğünde deprem" / "Burdur'da 3,8 büyüklüğünde deprem, Antalya'da da hissedildi" (hissedildiği haberde geçiyorsa). Metin: büyüklük, merkez, saat (TSİ), derinlik, kaynak AFAD; hasar/yaralı bilgisi yalnız valilik/AFAD açıklamışsa. Fotoğraf: haber sitelerinde çıkan deprem görseli ya da AFAD harita ekranı; yoksa grafik/temsili yok, yazısız sade foto ara (`foto-ara`). Aynı deprem en fazla 3 turda listede görünür.
- **Hava ve afet:** MGM'nin servisi otomatik erişime kapalı. `aday` 14 özel uyarı aramasıyla (Antalya meteoroloji uyarı, sarı/turuncu kod, kuvvetli yağış, sağanak, fırtına, sel, Serik sel, hortum, dolu, orman yangını, AFAD Antalya, Valilik uyarı, okullar tatil; son 6 saat) Antalya/Serik uyarısını yakalar ve +40 puanla listenin tepesine koyar. Etiket `HAVA DURUMU` (yangında `YANGIN`, okul tatilinde `DUYURU`). Uyarının her güncellemesi gidebilir (tekrar kuralı uygulanmaz). Mümkünse `https://www.mgm.gov.tr/meteouyari/antalya.aspx` sayfasını Chrome'da açıp uyarının seviyesini ve saatlerini oradan doğrula.
- **Resmî duyurular:** Antalya Valiliği (haberler, duyurular, basın açıklamaları) ve Serik Kaymakamlığı sayfaları her turda okunur (bugün/dün yayımlananlar). Serik Belediyesi sitesi otomatik erişimi reddediyor (403), Büyükşehir sitesi içeriği tarayıcıda yüklüyor: ikisi Google aramasıyla gelir; liste zayıfsa Chrome'da serik.bel.tr ve antalya.bel.tr/tr/haberler sayfalarına bak.
- Denetçi (denetim.py) artık 60 dakika görsel gitmezse Telegram'a "🛡️ DENETİM" uyarısı atar (önceden 90).

## 1. Adaylar
`python masa/gundem.py aday` → `masa/gundem/adaylar.json` (en iyi ~20: bölge [SERİK ÇEVRESİ / ANTALYA / TÜRKİYE], başlık, diğer başlıklar, kaynaklar, asıl bağlantı, özet, metin).
Aday toplama (20 Kas: + Google Haberler bilim/teknoloji bölümleri ve aramaları, 12 saat; listede bilim/teknolojiye 2 yer ayrılır) Türkiye gündemi + ekonomi + Serik/Belek/Kadriye/Boğazkent/Aspendos/Gebiz + Antalya (Büyükşehir, Valilik, ilçeler) + turizm (turist sayısı, otel doluluk, havalimanı, sezon) + tarım/hal aramalarını kapsar.
Liste zayıfsa (yerel aday yoksa ya da hepsi elenecek türdense) KENDİN ARA: WebSearch ile "Serik", "Belek", "Antalya turizm", "Antalya Valiliği duyuru", "Antalya Büyükşehir" son 24 saat; resmî siteler (antalya.gov.tr, serik.gov.tr, antalya.bel.tr, serik.bel.tr) duyuruları.
"uygun yeni haber yok" derse ve kendi araman da bir şey çıkarmazsa bitir (Telegram'a bir şey atma).

## 1b. 📈 YÜKSELEN HABER (kullanıcı 22 Kas: "yükselişe geçen haberler varsa onu da ekleyebiliriz, X örneğinde olduğu gibi")
Google Haberler RSS geç yakalar; insanların şu an konuştuğu, hızla yayılan haberi X'ten yakala. Yalnız `python masa/gundem.py yukselen-zamani` **EVET** derse (40 dk'da bir) yap:
1. Claude in Chrome'da yeni sekme: `https://x.com/search?q=lang%3Atr%20min_faves%3A300%20since_time%3A<şimdi−3 saat, unix saniye>%20-filter%3Areplies&f=top` → 4 kez kaydırarak makaleleri JS ile topla (çıktı ~1000 karakterde kesilir: sonuçları `window.__R` dizisine yaz, 6'şar oku). Ayrıca `https://x.com/explore/tabs/trending` başlıkları (Promoted olanı at).
2. Yükselen = son 1-3 saatte paylaşılmış ve kısa sürede yüksek görüntülenme/beğeni almış (ör. 1 saatte 100 B+ görüntülenme) ya da gündem listesinde. Dünden kalan konu değil.
3. Süzgeç bu dosyadaki kurallarla aynı (siyasi polemik, magazin, spor, suç ayrıntısı, söylenti YOK) + okur sorusu: "Serikli okur bunu paylaşır mı, işine yarar mı?" İyi örnek: hava/afet uyarısı, cebi etkileyen karar, bilgi/merak (yarışma sorusu, rekor), bilim-teknoloji-savunma başarısı, doğa-hayvan, içten insan hikâyesi, tüketici hakkı.
4. Tekrar kontrolü: `python masa/gundem.py gorulen-mi "<taslak başlık>"` → **GÖNDERİLMİŞ** derse alma (uyarı güncellemesi hariç).
5. Doğrula: en az 2 bağımsız güvenilir kaynak (WebSearch / haber siteleri); X paylaşımı tek başına kaynak değildir. Görsel için haber sitesini `foto-ara`'ya ver; X'teki haber görseli de kullanılabilir (`pbs.twimg.com/media/<id>?format=jpg&name=large`, src'yi `?`'den önce kes).
6. Turda en fazla 2 yükselen haber; normal adaylarla AYNI albümde gider (girdi-N.json, etiket konuya göre; uygun etiket yoksa `GÜNDEM`). Sekmeleri kapat. Rapora "📈 yükselen: N" yaz.

## 2. Seç — öncelik sırası
**ALBÜM = 4–5 HABER, BİRİKTİREREK** (kullanıcı 22 Kas gece: "tek tek gönderiyor, böyle 4-5 halinde her turda göndermesini istiyorum"; ardından "saatte bire çekme"): tur 20 dakikada bir kalır. Hazırladığın her haberin girdisini `masa/gundem/girdi-N.json` yerine **`masa/gundem/bekleyen/<kisa>.json`** olarak yaz (bekleyen klasörünü SİLME; önceki turların haberleri orada birikir). Turun başında ve sonunda `python masa/gundem.py bekleyen` çalıştır: bekleyen haberleri listeler ve karar verir. Turun başında listedeki başlıkları yeniden hazırlama (zaten hazır). **KARAR: GÖNDER** → 4+ haber birikti, en eskisi 40 dk bekledi, son gönderimden 60 dk geçti ya da `"acil": true` haber var: verdiği `bas … --dene` komutuyla hepsini dene, sonra `--dene`'siz BİR KEZ gönder, gönderilen bekleyen/*.json dosyalarını sil. **KARAR: BEKLE** → gönderme; raporda "bekleyen N" yaz. Deprem, hava uyarısı, Serik kesintisi ve son dakika olayı girdisine `"acil": true` koy → beklemeden o turda gider (bekleyenlerle aynı albümde). Bekleyen bir haber 2 saati geçtiyse ya da daha yeni bir gelişmeyle eskidiyse dosyasını sil ya da güncelle. Hedef her albümde 4–5 haber (en fazla 6); tür dengesi mümkünse 1–2 Serik/Antalya, 1 ekonomi, 1 Türkiye gündemi, 1 bilim/teknoloji ya da turizm. Kalite kuralları gevşemez.
**TEK TEK GÖNDERME** (kullanıcı 16 Kas: "haber gönderimi yaparken tek tek yapma sakın"): turda kurallara uyan TÜM haberleri (genelde 2–6, en fazla 10) hazırla ve hepsini TEK mesajda (Telegram albümü) gönder. Uygun tek haber varsa tek gider; her biri için ayrı ayrı `bas` çalıştırma.
1. **Serik ve çevresi**: okuru doğrudan ilgilendiren her şey (yol, su/elektrik kesintisi, belediye kararı, okul, sağlık, Belek otelleri, Serik tarımı).
2. **Antalya'yı etkileyen** resmî karar/duyuru, ulaşım, altyapı, hava uyarısı, büyük yatırım, COP31 gibi şehir gündemi.
3. **Turizm**: turist ve yolcu sayıları, otel doluluk/fiyat, sezon, pazar (Rusya, Almanya, İngiltere), turizm çalışanlarını ilgilendiren kararlar.
4. **Cebi etkileyen ekonomi**: zam, maaş, faiz, kur, altın, akaryakıt, vergi, kira, tarım ürünü/hal fiyatı.
   Kullanıcı 21 Kas: **"ekonomi haberleri önemli, listenin dışında kalmasın"** → aday listesinde ekonomiye 3 yer ayrılır; her albümde uygun (somut, yeni) bir ekonomi/piyasa haberi varsa EN AZ BİR tane mutlaka olur. Yerel haber varken bile ekonomi düşürülmez.
5. **Teknoloji ve bilim** (kullanıcı 20 Kas: "teknoloji ve bilim haberlerini de alalım"): her turda uygun bir tane varsa albüme EN AZ BİR teknoloji/bilim haberi koy.
   İyi örnek: yapay zekâ ve telefonla ilgili herkesin işine yarayan gelişme (yeni özellik, yasak, düzenleme), e-Devlet/BTK kararları, dolandırıcılık uyarısı,
   Türk bilim insanı/TÜBİTAK/uydu başarısı, uzay keşfi, sağlık araştırması (yayımlanmış çalışma), Antalya'daki kazı ve bilim haberleri.
   ELE: ürün incelemesi, kampanya/indirim, "sızdırıldı/iddia" söylentileri, oyun, şirket hisse haberi (o PİYASALAR'dır), siyasi polemiğe dönmüş yapay zekâ haberi.
   Bilim haberinde abartma yok: "kanseri yendi" değil "farelerde umut verici sonuç". Kaynakta çalışma/dergi adı varsa metinde geçir.
6. **Sağlık** (kullanıcı 21 Kas: "sağlık da ekleyelim"): okurun işine yarayan sağlık haberi — Sağlık Bakanlığı kararı, aile hekimi/MHRS/randevu düzenlemesi, ilaç fiyatı ve geri çağırma, aşı ve salgın uyarısı (grip vb.), SGK sağlık ödemeleri, gıda zehirlenmesi uyarısı, Serik/Antalya hastanelerine yeni bölüm-doktor-cihaz. Listede sağlığa 1 yer ayrılır; uygunsa albüme girer.
   ELE: "mucize tedavi", tek hastanın dramı, reklam kokan klinik haberi, kaynaksız diyet/beslenme tavsiyesi. Tıbbi bilgi yalnız kurumun/uzmanın sözüyle, abartısız; tavsiye verme.
7. Türkiye'nin önemli gündemi, sonra dünya (yalnız Türkiye'yi/Antalya'yı etkiliyorsa).
- **YEREL İLGİ** (kullanıcı 22 Kas, editör incelemesi: Kastamonu'daki köy, Muratpaşa'nın vergi veznesi Serikli okuru doğrudan ilgilendirmiyor):
  Başka ilin yerel haberi (köy, ilçe belediyesi, yerel olay) ancak gerçekten herkesin paylaşacağı bir merak/insan hikâyesiyse girer ve albümde EN ÇOK 1 tane olur.
  Antalya'nın başka bir ilçesinin belediye duyurusu (vezne saati, yol, pazar yeri) yalnız tüm Antalya'yı etkiliyorsa girer; önce **Serik karşılığını ara**
  (aynı konuda Serik Belediyesi/Serik Kaymakamlığı duyurusu var mı? serik.bel.tr, Serik Postası) — varsa Serik haberini yaz, yoksa o ilçe haberini çoğunlukla bırak.
- Puan yalnız ipucudur; kararı içerik verir. Aynı tur içinde art arda hep aynı türü gönderme: son 3 gönderim (`masa/gundem/log.txt`) hep ekonomiyse yerel/turizm haberini öne al.
- ELE: tek kaynaklı söylenti, "X olacak mı?" tahmin sayfaları, banka/kurum "senaryosu" gibi somut bilgi vermeyen haberler, KAP bildirimleri, magazin/spor, cinayet/taciz/intihar ve kaza ayrıntısı, siyasi polemik, "elektrik kesintisi!" gibi saat-mahalle listesi olmayan boş başlıklar (listeyi kaynaktan bulabiliyorsan Serik/Antalya kesintisi değerlidir).
- Seçmediğin ama bir daha gelmesini istemediğin adaylar için: `python masa/gundem.py atla <no>`.
- **HEDEF: HER TURDA EN AZ 1 HABER HAZIRLA, 4–5'TE GÖNDER** (22 Kas akşam, kullanıcı: "daha fazla haber gelsin, arada fazla boşluk kalmasın; taramayı iyi yapmalı, haber kaçırmamalı"; 22 Kas gece: haberler bekleyen/ klasöründe birikir, 4–5'lik albümle gider). Boş tur ancak listede ve kendi aramanda kurallara uyan TEK haber bile yoksa olur; raporda kaç adaya bakıldığını yaz. Listede uygun haber yoksa ya da son gönderimden 40 dk geçtiyse kendi aramayı mutlaka yap (WebSearch "Antalya son dakika", "Serik", serikpostasi.com, antalyaekspres.com.tr, dha.com.tr/antalya). Kalite kuralları (yorum yok, abartı yok, siyaset-asayiş-magazin yok) aynen geçerli; "okura faydası zayıf" tek başına eleme gerekçesi değildir, bilgi veren somut haber gider.
- **Kaynaklar** (22 Kas): `aday` artık Google'a ek olarak haber sitelerinin kendi akışlarını da okur: Serik Postası, DHA Serik, Antalya Ekspres, Antalya Körfez, mygazete, TRT Haber, Habertürk, Hürriyet, Sözcü, CNN Türk, Ekonomim, Bloomberg HT. Bu adayların `url`'si sitenin kendi bağlantısıdır ve `metin` dolu gelir; Chrome'da Google yönlendirmesi açmaya gerek yok.
- **"Tek kaynak" ≠ ele** (22 Kas akşam, kullanıcı: "neden haber seçemiyor, 1-2 saati bulan boşluklar oluyor"): o gün 46 turun yarısı boş geçti, çoğu somut haber "tek kaynak" diye elendi. Tek kaynak elemesi YALNIZ söylenti, iddia, tahmin, "senaryo" ve tanıtım kokan haber içindir. Kurumun açıklaması/kararı, belediye-valilik duyurusu, somut olay, rakam veren haber AA/İHA/DHA/TRT ya da yerleşik Antalya yerel gazetesinden (Antalya Ekspres, Akdeniz Gerçek, Antalya Körfez, mygazete…) tek kaynakla gider; metin yalnız o kaynağın söylediğini aktarır. Boş tur istisna olmalı: listede iyi aday yoksa önce 1. adımdaki kendi aramanı yap.
- (22 Kas akşam) `aday` artık asayiş, spor, Antalya dışı parti polemiği/eylem, tık tuzağı başlık, başka ilin yerel olayı ve son 12 saatte 2 kez gönderilmiş konunun yeni başlığını (COP31 gibi) listeye hiç almaz; gündem haberleri 6 saat geriye bakar; Google hata verirse bir kez yeniden dener.
- (21 Kas) `aday` artık kendisi de temizler: 2 turda listeye girip gönderilmeyen haber 3. turdan itibaren 12 saat gelmez (`masa/gundem/gosterilen.json`); liste 12 aday, kontenjanlar (tekno 2, sağlık 1, ekonomi 3) dışında en az 6 yer puana göre serbest. Yine de kesin elediğini `atla` ile hemen düşür.

## 3. Haberi oku ve doğrula
- Adayın `metin`i boşsa: Google bağlantı çözmeyi 429 ile kısıtlıyor. EN KOLAYI: adayın `url`'sini (news.google.com/rss/articles/…) Claude in Chrome'da aç → asıl haber sitesine yönlenir → başlık + paragrafları oku (16 Kas'ta böyle çalıştı). Yine olmazsa haberi WebSearch / WebFetch ile en az bir güvenilir kaynaktan (AA, TRT Haber, Bloomberg HT, Dünya, Ekonomim, Forbes, NTV, Habertürk, resmî kurum) oku.
- Rakamı, kurumu, tarihi kaynakta GÖRMEDİYSEN yazma. Kaynakta olmayan bilgi ekleme. Teyit edemiyorsan o haberi bırak, sıradakine geç.

## 4. Yaz — EN ÖNEMLİ KURAL: ANLAŞILIR ve ŞABLONA UYUMLU
**Yazanın en önemli görevi: uyum ve görünürlük** (kullanıcı 16 Kas: "yazılar şablona güzel sığsın, üstte fazla boşluk olmasın, haber metni okunur
olsun ve dengesiz paragraf olmasın; bunu yazan kişinin en önemli görevi bu olsun"). Metni şablonu düşünerek yaz:
- Başlık **2 satır** olmalı (kullanıcı 22 Kas: "3 satır olunca şiir gibi duruyor") → **en çok ~45 karakter**; 3 satır yalnız kaçınılmazsa. Metin **4–6 satır** ideal (≈ 170–230 karakter), en çok 7.
- Basıcı (`gundem-ciz.mjs`) yazı boyunu ve fotoğraf yüksekliğini birlikte ayarlar: yazı sarı bandın hemen altından başlar, fotoğrafa kadar boşluk kalmaz;
  başlığı tam genişlikte sarar ve 2 satıra sığdırmak için başlık boyunu 60 px'e kadar küçültebilir (3 satır ağır cezalı). Metin de kenara kadar tam genişlikte sarılır; sağda boşluk bırakan satırlar cezalı olduğundan gerekirse metin boyu küçülür (kullanıcı 22 Kas: "alt metinde boşluk kalmasın, düzenli ilerlesin"). Metin bu aralığa uymazsa **YERLEŞİM KALDI** der ve görsel gönderilmez:
  "METİN UZUN" → kısalt (bilgi atma, sözü sıkılaştır); "üstte boşluk" → kaynaktan bir bilgi cümlesi ekle; "son satır kısa / tek kelime" → cümleyi yeniden kur.
  Yazıyı küçülterek sığdırmak YOK (metin en az 40 px, başlık en az 60 px).
Bu görseli 50 yaşında, ekonomi bilmeyen Serikli biri okuyacak. Okuyunca "ne olmuş" net anlamalı; aklında soru kalmamalı. Anlaşılırlık sade dille sağlanır, yorum eklenerek DEĞİL.
- **Başlık** (en fazla ~45 karakter — 2 satır, düz cümle, cümle düzeninde — BÜYÜK HARF değil, `*` vurgu YOK, soru cümlesi YOK, ünlem YOK):
  Ne oldu, düz Türkçe. Yabancı kurum/terim adı başlıkta tek başına durmasın ("TD Securities'ten Fed senaryosu" ✗ → "ABD'de faiz artışı beklentisi doları güçlendirdi" ✓).
  Rakam varsa somut ver ("Gram altın 6.247 liraya indi"). Tık tuzağı ("şok", "dev", "çarpıcı", "flaş") yok.
- **Metin** (2–3 kısa cümle, ~200–260 karakter): ne oldu (kim, ne kadar, ne zaman, nerede) ve kaynakta yazıyorsa nedeni / kimin ne dediği.
  **YORUM KATMA** (kullanıcı 16 Kas: "bazen haberin içine kendinde bir yorum katıyorsun, onu yapma"): yalnız kaynağın söylediğini sade dille aktar.
  Kendi çıkarımın, değerlendirmen, "bu da … anlamına geliyor / kârları eriyor / okuru etkileyecek" gibi cümleler YOK. Neden ve etki ancak kaynakta biri söylemişse,
  söyleyene bağlanarak yazılır ("Taç'a göre …"). Kısaltmayı kısa bir karşılıkla açabilirsin (Fed: ABD Merkez Bankası); bunun ötesinde açıklama ekleme.
  Başlıktaki bilgiyi aynen tekrar etme; tamamlasın.
- **BAŞLIK METİNLE TUTARLI** (kullanıcı 22 Kas, editör incelemesi): "Erdoğan AB ile vize serbestisi için talimat verdi" başlığının metninde Erdoğan hiç geçmiyor, metin
  Hakan Fidan'ın sözlerini anlatıyordu ✗. Başlıktaki özne (kişi/kurum) ve iddia metinde açıklanmalı: başlık "Erdoğan talimat verdi" diyorsa metin Erdoğan'ın neyi,
  nerede söylediğini anlatır; metin Fidan'ı anlatıyorsa başlık da Fidan'ı söyler. Başlık ve metin aynı kaynaktan, aynı olaydan yazılır. Göndermeden önce kendine sor:
  "Başlıktaki her ad ve her iddia metinde ya da paylaşım metninde var mı?"
- **ZAMAN TUTARLI** (22 Kas: "Ara tatil sona erdi" başlığı altında metin "bugün bitiyor" diyordu ✗): başlık ve metin aynı zamanı söyler (ikisi de "bitiyor" ya da
  ikisi de "bitti"). Görsel günlerce paylaşılır: "bugün / yarın / pazartesi" yerine mümkünse tarih yaz ("23 Kasım Pazartesi'den itibaren"); "bugün" yalnız o günün
  olayında kullanılır. Görselin tarihi (4b) yayın günüdür; metindeki göreli zaman ona göre doğru olmalı.
- Yerel haberde yer adını başta söyle ("Serik'te …", "Antalya'da …"); okur kendi ilçesini hemen görsün.
- **Etiket**: SERİK, ANTALYA, TURİZM, EKONOMİ, PİYASALAR, TEKNOLOJİ, BİLİM, SAĞLIK, GÜNDEM ya da DÜNYA (şablon etiketi).
- **Açıklama** (Telegram/Instagram paylaşım metni), şu kalıp:
  ```
  🔴 <ETİKET> | <Başlık>

  <Metin + gerekirse kaynaktan bir-iki cümle daha bilgi (yine yorum yok)>

  📲 WhatsApp İhbar: 0539 544 98 61
  👉 Takip et: @serik.merkez

  #serik #serikmerkez #antalya #<konu> #<konu2> #gündem
  ```

## 4b. Tarih ve bant (kullanıcı 22 Kas, editör incelemesi)
- **Tarih**: basıcı etiketin yanına yayın gününü yazar ("22 Kasım 2026"; saat YOK). Süreli haber (vezne saati, kesinti, son başvuru) tarihsiz dolaşıp yanlış bilgiye dönmesin diye. Elle bir şey yapma.
- **Sarı bant**: şablonda "SON DAKİKA - ANLIK HABER - ÖZEL HABER" yazıyordu; her habere son dakika demek okurun gerçek son dakikayı ayırt etmesini engeller.
  Artık normal haberde bant **"SERİK - ANTALYA - TÜRKİYE GÜNDEMİ"** yazar; eski yazı YALNIZ `"acil": true` girdide (deprem, hava/afet uyarısı, Serik kesintisi, son dakika olayı) kalır.
  `acil`'i yalnız bu durumlarda koy — bant ve beklemeden gönderim ona bağlı.
- **Tekrar engeli**: `bas`, son 3 günde gönderilmiş aynı haberi (log.txt) **DAHA ÖNCE GÖNDERİLDİ** diye durdurur (22 Kas: "Asya Tohumculuk Kongresi" 19, 21, 22 Kas'ta üç kez gitmişti).
  Rakamı değişen fiyat/sayı haberi (yeni altın fiyatı) yeni sayılır. Gerçekten yeni gelişme ise (kongre başladı, karar açıklandı) girdiye `"guncelleme": true` koy ve başlıkta yeniliği söyle; aynı haberi yeniden gönderme.

## 5. Görsel — ÖNCE FOTOĞRAF ARAŞTIR (çerçeveye mutlaka sığar, betik kırpmadan sığdırır)
Kullanıcı 16 Kas: **"gerekirse fotoğrafları haberin içinden al, fazla temsili yazma"** ve 17:07 COP31 görselinden sonra:
**"araştırıp haberle ilgili fotoğraf bulma kabiliyetin olsun, direk temsili çözüm olmasın."**
(Ders: 17:07'de ChatGPT temsili kullanıldı; oysa Habertürk haberinin içinde zirvenin 12 gerçek fotoğrafı vardı.)

ZORUNLU sıra, bir adım sonuç vermezse bir sonrakine geç:
1. **Kendi çekimimiz**: haber bizim daha önce çektiğimiz bir yer/kişiyle ilgiliyse (ör. Serik safran tesisi → `video/cicek/ham/`) oradan kare al.
2. **Haberin sayfalarındaki fotoğraflar**: adayın asıl bağlantısı + aynı haberi yazan diğer sitelerin bağlantıları (Chrome'da açıp asıl URL'leri al):
   `python masa/gundem.py foto-ara <kisa> <url1> [<url2> <url3> ...]` → `masa/gundem/foto/<kisa>-kontak.jpg` (numaralı kontak sayfası) + `<kisa>-1.jpg`, `-2.jpg`…
   Kontak sayfasına Read ile BAK ve haberi EN İYİ anlatanı seç (olayın kendisi, yerin kendisi, kalabalık/ürün/tesis; logo-afiş-portre değil).
3. **Fotoğrafı daha geniş ara**: hâlâ yoksa ya da hepsi uygunsuzsa WebSearch / Chrome ile aynı haberi yazan AA, İHA, DHA, TRT Haber, valilik/kaymakamlık/belediye/bakanlık
   sayfası, kurumun resmî haber sayfası (COP31 için cop31.gov.tr vb.) bul → onlarla `foto-ara` (birden çok URL verilebilir). Tek resim URL'si bulduysan `python masa/gundem.py foto <resim-url> <cikti>`.
   Antalya yer/manzara haberinde Wikimedia Commons'ta yerin özgür lisanslı fotoğrafı da olur.
4. **Piyasa grafiği** (`"grafik": "usd|eur|gram|bist|brent|btc"`): fiyat hareketi haberinde ve uygun fotoğraf yoksa. Gerçek 5 günlük veri; kartta rakam yazmaz.
5. **ChatGPT temsili** (`"foto": "<yol>", "temsili": true` → köşeye "Temsili görsel"): YALNIZ 1–4 denenip sonuç alınamadıysa. Raporda neden temsili kullandığını yaz
   (hangi sayfalara bakıldı). Chrome'da chatgpt.com, yatay 16:9, yazısız, logosuz, gerçekçi genel sahne; gerçek kişi yüzü/siyasetçi/kaza-suç ÜRETME;
   indir: en büyük `img`'nin `src`'si → `fetch` → blob → `<a download>` → İndirilenler'den `masa/gundem/foto/`'ya taşı.

Fotoğraf seçerken: başka sitenin büyük logosu/filigranı/yazısı olan, çocuk/yaralı/şüpheli yüzü net görünen, 500 px'ten dar fotoğrafı kullanma.
Haberin KENDİ fotoğrafına (o olayda, o yerde, o kişiyle çekilmiş) "Temsili" YAZILMAZ; paylaşım metnindeki kaynak satırı fotoğrafın da kaynağıdır.
**Temsili etiketi** (kullanıcı 22 Kas, editör incelemesi: ara tatil haberindeki sınıf ve Kamu-Sen haberindeki para fotoğrafı haberin kendi fotoğrafı değildi):
fotoğraf bu olaydan değilse — haber sitesinin koyduğu arşiv/stok/genel konu fotoğrafı (rastgele bir sınıf, para destesi, pompa, hastane koridoru, "arşiv" yazan foto),
Wikimedia'dan yerin genel fotoğrafı, başka bir olayın fotoğrafı — girdiye `"temsili": true` koy (köşeye "Temsili görsel" yazar). Emin değilsen: fotoğrafın altyazısı/dosya adı
o güne ve o olaya ait değilse temsilidir. Bu basın etiğinin temel kuralı; okur fotoğrafı haberin kanıtı sanmamalı.

## 6. Bas ve gönder — HEPSİ TEK MESAJDA
Her haber için ayrı girdi: `masa/gundem/bekleyen/<kisa>.json` (22 Kas gece: biriktirme — 2. bölümdeki "ALBÜM = 4–5 HABER, BİRİKTİREREK" kuralı; gönderilenleri sil, bekleyenleri silme):
```json
{"baslik": "...", "govde": "...", "etiket": "SERİK", "aciklama": "...", "kaynak_url": "https://...",
 "kaynaklar": ["AA", "Dünya"], "kelimeler": <adayın "kelimeler" listesi>, "foto": "masa/gundem/foto/x.jpg"  /  "grafik": "gram"
 "temsili": true  ← ChatGPT ya da olaydan olmayan (arşiv/stok) fotoğraf,  "acil": true  ← yalnız deprem/uyarı/kesinti/son dakika,  "guncelleme": true  ← gönderilmiş haberin yeni gelişmesi}
```
Yeni hazırladığın haberi o turda tek başına `bas masa/gundem/bekleyen/<kisa>.json --dene` ile dene (yerleşim GEÇTİ mi). Gönderme zamanı `bekleyen` KARAR: GÖNDER derse: `python masa/gundem.py bas masa/gundem/bekleyen/a.json masa/gundem/bekleyen/b.json … --dene` → `masa/gundem/son.jpg`, `son2.jpg`, …'ye Read ile BAK:
her haber için `yerleşim: … -> GEÇTİ` satırı çıkmalı; görselde üstte boşluk yok, metin okunuyor, satırlar dengeli, son satır yarım kalmamış,
fotoğraf çerçevede tam. KALDI ya da gözle dengesizse metni yeniden yaz, tekrar dene. **Tek bir haber bile KALDI ise gönderme.**
Sonra AYNI komutu `--dene`'siz BİR KEZ çalıştır → hepsi tek albüm mesajı olarak gider (her fotoğrafın altında kendi paylaşım metni), `gorulen.json`'a yazılır.

## 7. Rapor
**Tarayıcıda açık bırakma** (kullanıcı 16 Kas): turda Claude in Chrome'da açtığın her sekmeyi (haber sayfası, Google yönlendirmesi, ChatGPT) iş biter bitmez `tabs_close_mcp` ile kapat; gönderimden sonra açık sekme kalmasın. Kullanıcının kendi sekmelerine dokunma.
Tek satır: gönderilen haber sayısı ve başlıklar, görsel türü (haberin fotoğrafı/kendi çekim/grafik/ChatGPT — ChatGPT ise nedeni/fotoğrafsız), elenenler ve nedeni.

## 🛡️ DENETÇİ (21 Kas 2026, kullanıcı: "bu sistemi denetleyen bir şey yapalım, haberleri kaçırmadan geri kalmayalım")
`masa/denetim.py` Windows Görev Zamanlayıcı'da ("Serik Haber Denetcisi", 15 dk'da bir, Claude'dan bağımsız) çalışır, yapay zekâ kullanmaz. Telegram'a "🛡️ DENETİM" yazar:
gündem botu 50 dk kayıt yoksa / 80 dk görsel gitmediyse (22 Kas gece: biriktirme için 60 → 80) (son tur gerekçeleriyle) / Google hata seli; haber masası 80 dk tur atmadıysa;
KAÇAN HABER (DHA Serik + Serik Postası + Google'da 45 dk–6 sa önce çıkmış, DHA ya da 2+ kaynaklı Serik olayı; Telegram'a gitmemiş, sitede/bekleyen taslakta/masa görülende yok); 22:30'da günün karnesi.
Aynı uyarı 2 saatte bir tekrarlanır. Kayıt `masa/denetim/log.txt`, durum `masa/denetim/durum.json`. Denetçi "kaçmış olabilir" dediyse sonraki turda o olayı öncelikle değerlendir.

## Asla
Siteye haber girme · turdan sonra Chrome'da sekme açık bırakma · YERLEŞİM KALDI görseli gönderme · üstte boşluklu / dengesiz paragraflı görsel · kaynakta olmayan rakam/bilgi · kendi yorumunu/çıkarımını katma · BÜYÜK HARF başlık · `*` vurgu · saat (tarih basıcıda otomatik) · soru/ünlem başlık · aynı haberi ikinci kez gönderme · başlığı metinle çelişen haber · olaydan olmayan fotoğrafı "temsili" demeden kullanma · acil olmayan habere `acil`.
