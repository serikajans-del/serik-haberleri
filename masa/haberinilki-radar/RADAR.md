# @haberinilki ERKEN HABER RADARI (zamanlanmış görev "haberinilki-erken-radar")

Kuruluş 24 Kas 2026. Kaynak: Atakan'ın Grok routine talimatı (`radar-prompt.txt`), bu bilgisayara uyarlandı. Eski "@haberinilki X masası" (XMASA.md, Chrome'dan kendisi paylaşan) kapalı kalır; bu radar onun yerine geçer.

**Hesap:** X @haberinilki — "Türkiye'de ve dünyada olan biten, ilk burada. Son dakika, kısa ve net. Kaynaksız haber yok."
**Amaç:** viral olmak üzere olan haberi büyük toplayıcı hesaplardan ÖNCE, mümkünse ilk kaynaktan yakalamak; Atakan'a kendi haberi gibi yazılmış, paylaşmaya hazır gönderi + temsili görsel vermek. Antalya'dan önemli haber kaçmamalı.
**Zaman:** her 20 dk, 08.00–22.40 TSİ. Hız önemli: tur ~10 dk'yı geçmesin. Her şey Türkçe, saatler TSİ.
**Klasör:** `C:\Users\MONSTER\Desktop\yapayzeka\serik-haberleri` (komutlar buradan). Radar dosyaları `masa/haberinilki-radar/`.

## KESİN KURALLAR
- **Hiçbir şey paylaşılmaz.** X'te gönderi, yanıt, beğeni, takip YOK; compose sayfası açılmaz. Paylaşımı Atakan "X'te paylaş" düğmesiyle kendisi yapar.
- Telegram yalnız Atakan'ın özel sohbetine (`send_telegram.py`, chat id `telegram.json`). Token hiçbir yere yazılmaz/yazdırılmaz.
- Metrik uydurma: yalnız X sayfasından okunan sayılar.
- Bu hesapta görsel **"Temsili görsel"** etiketlidir (Antalya Haber Medya'nın "temsili yazma" kuralı BURADA GEÇERLİ DEĞİL; farklı hesap).
- Kaynak gönderinin fotoğrafı/videosu ASLA kullanılmaz (haberin nereden geldiğini ele verir).

## TUR

### 0) Hazırlık (5 sn)
`python -I masa/haberinilki-radar/radar.py hazirlik` → saat, since_time değerleri, açılacak X arama adresleri (a, b, d, e), 2 saatten genç anlık görüntüler (c), doğrulanacak hesaplar, içgörü hakkı.

### 1) X'ten aday topla (Claude in Chrome, kullanıcının oturumu; hesap @haberinilki)
Tek yeni sekme aç, sırayla aynı sekmede gez. Her sayfada: 3–5 sn bekle → `masa/haberinilki-radar/x-topla.js` dosyasının TAMAMI + ardından komut (`javascript_tool`). Turun ilk sayfasında önce `HIR.sifirla()`.
a. **İzleme listesi** (hazirlik'in a satırları, "En Son" sekmesi): `await HIR.topla("watchlist")`
b. **Antalya** (hazirlik'in b satırları: antalya hesapları + ilçe/olay anahtar kelimeleri): `await HIR.topla("antalya")`
c. **Momentum:** hazirlik'te listelenen genç anlık görüntüler bu turun aramalarında zaten görünmüyorsa, en yüksek puanlı en çok 3 tanesinin gönderi sayfasını aç: `await HIR.durum()`
d. **Gündem + genel hız:** `https://x.com/explore/tabs/trending` → JS ile ilk ~15 başlığı oku (Reklam/"Tanıtılan" olanları, siyasi kampanya etiketlerini at). En sıcak, habere benzeyen en çok 2 başlık için hazirlik'teki şablonla ara: `await HIR.topla("trend:<başlık>")`. Ayrıca genel hız araması: `await HIR.topla("genel")`.
   (X aramasında yalnız `lang:` ve `min_faves:` ile sonuç gelmez; anahtar kelime grubu şart — şablonda var.)
e. **@haberinilki son paylaşımları:** `await HIR.topla("haberinilki", 2)` — ne yazıldığını ve hangi eski radar seçimlerinin paylaşıldığını görmek için (adaylar arasında puanlanmaz; isle sonrası sen ele).
Bitince: `HIR.indir()` → İndirilenler'e `hir-aday-*.json`.
Sayfa "Bir sorun oluştu" der ya da 30 sn'de açılmazsa bir kez yenile, olmazsa o sayfayı atla. Toplam ~8–10 sayfa yükü; fazlası turu yavaşlatır.
**Takipçi:** `isle` çıktısında üst sıralarda `takipçi?` olan en çok 3 hesabın profilini aç → `HIR.takipci()` → `python -I masa/haberinilki-radar/radar.py takipci <handle> <sayı>` (önbelleğe girer, bir daha açılmaz). `dogrula` işaretli izleme hesaplarından turda en çok 2'sini de böyle doğrula; `yok:true` ise `izle-sil`.

### 2) Puanla (`radar.py isle`)
`python -I masa/haberinilki-radar/radar.py isle` → İndirilenler'deki en yeni dosyayı alır, tekilleştirir, puanlar, ilk 10'u `snapshots.json`'a yazar (3 saatten eskiler budanır), tabloyu basar.
- hız = (beğeni + 2×RT + yanıt + alıntı) / dakika; göreli = 1000 takipçi başına hız; ivme = son ölçümden bu yana hız ÷ önceki ortalama hız (≥1,5 "HIZLANIYOR" en iyi sinyal; <0,6 "zirve geçmiş olabilir").
- Görüntülenme takipçinin çok üstündeyse güçlü erken sinyal (puana dahil).
- Puan bir pusuladır; kararı sen verirsin:
  - **>1M takipçi** sınırı: yalnız hikâyenin açıkça ilk kaynağıysa. Değilse ayırt edici bir ifadeyle X'te ara (`"<ifade>" -filter:retweets` En Son, eskiden yeniye) ve en erken küçük kaynağı göster.
  - Hâlâ erken (zirve geçmemiş), haber hesabına uygun ve güvenilir olsun. Kaynak verilmeyeceği için **daha katı ol**: resmî hesap, ajans ya da en az iki bağımsız kaynak teyidi (X'te ikinci bağımsız hesap ya da WebSearch ile haber sitesi). Siyasi kampanya etiketi, doğrulanmamış söylenti, şaka, zaten bildirilen konu → ELE.
  - Siyaset yasak DEĞİL ama taraf tutulmaz; parti/siyasetçi propaganda gönderisi haber değildir.
  - Konu çeşitliliği: turda hikâye başına en çok 1 seçim. Daha önce bildirilen hikâyenin devamı ancak gerçekten yeni bir olgu ekliyorsa.
  - **Antalya:** yerel hesaplar küçük; ulusal hızla değil önemle değerlendir (ölü/yaralı, büyük kaza, yangın, deprem, fırtına/sel, büyük operasyon, turist olayı, dikkat çeken dava, resmî duyuru). Belediye PR'ı ve küçük işler ELE.
- @haberinilki'nin son paylaşımlarında aynı konu varsa ELE.
- **Öğrenme:** küçük bir hesap tekrar tekrar ilk veriyorsa `radar.py izle-ekle <handle> <kategori> "<bir satır not>"` (Antalya hesapları `antalya`). Liste ~150'yi geçmez.

### 3) Tekrar önleme
`reported.txt` `gonder` sırasında otomatik dolar; `isle` raporlananları "RAPORLANDI" diye işaretler — onları seçme.

### 4) Seç ve yaz
En iyi 3 (uygun yoksa daha az; hiç yoksa HİÇBİR ŞEY gönderme). Önemli bir Antalya haberi ilk 3'e giremediyse 4. seçim olarak ekle ("📍 Antalya").
Her seçim için @haberinilki'nin kendi haberi gibi **tek gönderi** yaz:
- Alıntı yok, kaynak bağlantısı yok, "Kaynak: @…" yok, X hesabı adı yok, başka hesabı işaret eden "paylaştı / aktardı" yok. Olguları tamamen kendi cümlelerinle yaz; kaynağın cümlesini kopyalama.
- 1. satır: güçlü kanca ("🚨 SON DAKİKA |", "⚡️", "📍 Antalya |") + en çarpıcı somut olgu, birkaç kelime, BÜYÜK HARF ya da Başlık Düzeni. Olgulara sadık: abartı, uydurma ayrıntı, yanıltıcı tık tuzağı yok.
- Sonra 1–2 kısa satır: kim, ne, nerede, en yeni ayrıntı. Resmî kurumun kendi açıklaması kuruma bağlanabilir ("Valilik açıkladı", "AFAD duyurdu"). Doğrulanmamış ayrıntı "iddia ediliyor / öne sürülüyor".
- İnsan hikâyesi kısa bir soruyla biter (yanıt getirir); sert haber en çok 1 ilgili etiketle biter.
- ≤260 karakter, tarafsız.
Metni BİR KEZ, son haliyle yaz. `masa/haberinilki-radar/tmp/secim.json`:
```json
{"secimler": [{"kaynak_url": "https://x.com/<u>/status/<id>", "yazar": "<u>", "takipci": 1234,
  "metin": "🚨 SON DAKİKA | ...\n...", "neden": "tek satır: neden yükseliyor (rakamla)",
  "konu": "deprem|yangın|kaza|ekonomi|spor|yaşam|dünya|...", "kaynak_turu": "resmi|ajans|muhabir|yerel|nis|genel",
  "antalya": false, "gorsel_ham": "masa/haberinilki-radar/images/raw/<ad>.png"}]}
```
`python -I masa/haberinilki-radar/radar.py kontrol masa/haberinilki-radar/tmp/secim.json` → GEÇTİ olana kadar düzelt (uzunluk, @, bağlantı, "paylaştı/aktardı/Kaynak:", birden fazla etiket). Yazdığı paylaş bağlantısı (`https://x.com/intent/post?text=…`) Telegram düğmesinde ve sohbet raporunda AYNEN kullanılır.

### 5) Temsili görsel (ChatGPT, Claude in Chrome)
Her seçim için `https://chatgpt.com/` yeni sohbet → İngilizce prompt: "Photorealistic news-photo style illustrative image, 16:9 landscape, <sahne>. No text, no logos, no watermark." + kurallar:
- Mekânı ve olayı GENEL göster. Gerçek, tanınabilir kişinin yüzü/benzerliği YOK (ünlü, siyasetçi, oyuncu yok; uzak, bulanık, arkadan figür ya da nesne/mekân).
- Yazı/logo yok. Grafik şiddet, yara, ceset UYDURMA.
- Bekle (en çok ~2,5 dk). En büyük `img`'nin `src`'si → `fetch` → blob → `<a download="hir-gorsel-<n>.png">` → İndirilenler → `masa/haberinilki-radar/images/raw/`'a taşı, `gorsel_ham`'a yaz.
- Üretim başarısızsa/uzarsa o seçim GÖRSELSİZ gider (kaynak fotoğrafı ASLA). ChatGPT sekmesini kapat.
- Etiket `gonder` içinde otomatik: `label_image.py` 1600×900'e kırpar, sol alta "Temsili görsel" basar → `images/`.

### 6) Gönder
`python -I masa/haberinilki-radar/radar.py gonder masa/haberinilki-radar/tmp/secim.json` → her seçim için: görsel etiketi, HTML başlık (ilk satır kalın) + ayraç + "neden" + kaynak gönderi bağlantısı (yalnız Atakan görür), "X'te paylaş" düğmesi; foto başarısızsa metin mesajı. `reported.txt` ve `performance.json` güncellenir. Çıktıda `FAIL` varsa raporda söyle.

### 7) Geri bildirim (performance.json)
Adım 1e'de okunan @haberinilki gönderilerini `performance.json`'daki eski seçimlerle (metin/konu benzerliği) eşleştir. Eşleşme varsa `tmp/perf.json` yaz: `{"eslesmeler":[{"kaynak_url":"…","post_url":"https://x.com/haberinilki/status/…","likes":0,"reposts":0,"replies":0,"views":0}]}` → `radar.py perf tmp/perf.json`.
`radar.py perf-ozet` yeterli veri gösterdiğinde en iyi performans gösteren konu/kaynak türünü puanlamada öne al. "İçgörü hakkı VAR" ise rapora tek satır içgörü ekle ve `radar.py icgoru-kullanildi` (günde en çok bir).

### 8) Rapor (bu oturumun son mesajı = Atakan'a sohbet raporu)
Uygun seçim yoksa: tek satır "Bu tur yeni seçim yok" (Telegram'a hiçbir şey gitmez). Varsa kısa mesaj, her seçim için:
- `[@yazar](kaynak gönderi URL)` · takipçi · yaş · ❤/🔁/💬/👁 · (önceki tura göre artış, biliniyorsa) · neden yükseliyor (tek satır)
- son gönderi metni (aynen) ve paylaş bağlantısı (aynen)
- etiketli görselin tam yolu (`masa/haberinilki-radar/images/...`)
Açtığın tüm Chrome sekmelerini kapat.
