# VİRAL RADAR → @antalyahaberci_bot ("haberantalya_bot") — 30 dakikada bir

Kullanıcı (22 Kas 2026): "Türkiye ve dünya gündemini takip etmeli; hayatın içinden, sıra dışı, enteresan, komik, ilginç buluşlar gibi
patlama yaratacak konular lazım. Sosyal medyaya uygun kanca başlık, açıklama ve temsili gerçekçi fotoğraf için görsel promptu versin.
Bu sistemi haberantalya_bot'a uygulayalım, mevcut sistemi kaldıralım, her 30 dakikada bulduklarını yazıp iletsin."

- Eski sistem: GitHub `serikajans-del/serik-haber-bot` deposundaki "Saatlik Antalya Haber Taraması" iş akışı **kapatıldı** (silinmedi; geri açmak için
  `gh workflow enable "Saatlik Antalya Haber Taraması" -R serikajans-del/serik-haber-bot`).
- Çalışma klasörü `C:\Users\MONSTER\Desktop\yapayzeka\serik-haberleri`. Token `.env.local` → `ANTALYA_BOT_TOKEN` (git dışı). Sohbet kimliği `masa/telegram/durum.json` sahibi.
- Ürün yalnız Telegram mesajıdır. Instagram'a, X'e, siteye hiçbir şey GİRİLMEZ; paylaşımı kullanıcı yapar. Görsel ÜRETİLMEZ, yalnız prompt yazılır.
- Serik haber masası, Serik gündem görseli, @haberinilki X masası bu akıştan AYRIDIR; onlara dokunma.

## 1. Tara (son 6 saat öncelikli, en fazla 48 saat)
WebSearch ile paralel, her turda farklı açılardan (hepsini her turda yapmak zorunlu değil, 6–10 arama yeter):
- Türkiye: "sosyal medyada gündem oldu", "görenler şaşırdı", "ilginç olay", "pes dedirten", "duygulandıran", "genç mucit buluş", "rekor kırdı", "köyde ilginç", "yüzleri güldüren" + bugünün tarihi.
- Dünya: "weird news today", "odd news", "bizarre", "viral video news", "world record Guinness", "new invention", "scientists discover", "heartwarming".
- Kaynak örnekleri: İHA/DHA/AA "ilginç" haberleri, Hürriyet/NTV/Habertürk yaşam-dünya, Onedio, Reuters/AP Oddly Enough, UPI Odd News, Guinness, New Atlas, ScienceAlert, Euronews.
- Antalya'dan bu türde bir olay varsa çarpan (+1) alır ve öne geçer.

## 2. Puanla (viral-haber skill'i: `.claude/skills/viral-haber/SKILL.md` ve `veri.md`)
Paylaş / Beğen / Yorum 0–5 + artılar (gündelik nesnede tuhaflık, tek çarpıcı rakam, tezat, ünlü/tanınan, Antalya bağı, güçlü tek kare) − eksiler (reklam, protokol, kuru duyuru, piyasa rakamı, siyasi polemik).
**9/18 altı elenir.** Konu tipi öncelik: sıra dışı / komik / ilginç buluş / rekor / hayatın içinden insan hikâyesi / hayvan. Kuru siyaset, ekonomi rakamı, adliye-suç haberi bu radara girmez.
ELE: cinayet/intihar/taciz ayrıntısı, çocuk yüzü, ölü/yaralı görüntüsü, kumar/bahis, burç/fal, tek kaynaklı söylenti, 48 saatten eski (istisna: hiç işlenmemiş ve hâlâ konuşulan).

## 3. Mükerrer kontrol
Her aday için `node --env-file=.env.local masa/radar/radar.mjs goruldu "<2-4 kelimelik anahtar>"` → EVET ise ele. Elediğin ama bir daha gelmesin istediğin güçlü adayı `... radar.mjs atla "<anahtar>"`.

## 4. Doğrula
En az iki bağımsız kaynak ya da bir resmî/birincil kaynak (Guinness, üniversite, kurum). Rakam, isim, yaş, tarih kaynaktan; bulunamayan yazılmaz.
İddia ("iddia edildi", "öne sürüldü", şirketin "ilk" iddiası) metinde de iddia dilinde kalır. Şaka/aldatmaca ise metin bunu açıkça söyler.

## 5. Yaz (turda en fazla 3 haber; uygun yoksa HİÇBİR ŞEY gönderme)
- `baslik`: haberin kısa adı (iç kullanım, ≤70 karakter).
- `kanca`: fotoğraf içi metin. TEK cümle, 18–28 kelime; can alıcı kısım `**kalın**`. Tezat kalıbında ikinci cümle "Oysa …" ile başlar ve kalındır. Antalya bağı varsa "ANTALYA'nın … ilçesinde" ile başlar. Clickbait yok: haberin verdiğinden fazlasını vaat etmez. "Şok/flaş", ünlem, büyük harf yok.
- `aciklama`: Instagram açıklaması. 1. cümle 5N1K (kancayla aynı olmasın), 2–4 cümle ayrıntı, sonda konuya bağlı TEK yorum sorusu, alt satırda 4–6 etiket. Emoji en fazla 1.
- `gorsel_prompt`: İngilizce, fotogerçekçi, 4:5 dikey, "documentary/news photo style, no text, no logos, no watermark, lower third empty for caption overlay". Sahne KONU/NESNE/MEKÂN kurar.
  ASLA gerçek bir kişinin yüzü (ünlü, haberdeki kişi) ya da belirli olayın sahte "anı" (kaza, yangın, gözaltı) tarif edilmez; kişi gerekiyorsa "faces not visible / from behind". Marka logosu yok. Kullanıcı görseli "Temsili" ibaresiyle kullanacak.
- `zaman`: "Hemen" / "Akşam 19–22" / "Yarın sabah" (sayfada akşam paylaşımları öne çıkıyor; tahmin ise "tahmin").
- `risk`: kısa not (telif, iddia dili, yüz) ya da "Düşük".
- `foto_url` (isteğe bağlı): haberin kendi görselinin doğrudan bağlantısı, yalnız kullanıcıya fikir vermek için; yoksa koyma.
- `kaynaklar`: [{ad, url}] en az 2.

## 6. Gönder
`masa/radar/tur.json` yaz:
```json
{"haberler":[{"anahtar":"kars pense dis","baslik":"...","kanca":"... **...**","aciklama":"...\n...\n#Etiket ...","gorsel_prompt":"...",
 "puan":14,"pbY":"5/3/5","kategori":"TÜRKİYE|DÜNYA|ANTALYA|BULUŞ|KOMİK","kaynaklar":[{"ad":"Hürriyet","url":"https://..."}],"zaman":"Akşam 20–22","risk":"..."}]}
```
→ `node --env-file=.env.local masa/radar/radar.mjs gonder masa/radar/tur.json` (her haber ayrı mesaj; gönderilenler `masa/radar/gorulen.json`'a yazılır, 7 gün tekrar gelmez).
Telegram hatası olursa bir kez yeniden dene; yine olmazsa `radar.mjs yaz "⚠️ Radar hatası: <kısa neden>"` dene ve raporla.

## 7. Kapanış
Tek satır Türkçe rapor: kaç aday, gönderilen başlıklar + puan, elenen güçlü adaylar ve nedeni. Chrome kullandıysan açtığın sekmeleri kapat.

## Asla
Kendiliğinden paylaşım · görsel üretmek · gerçek kişi yüzü/sahte olay görseli promptu · kaynakta olmayan bilgi · tek kaynaklı söylentiyi kesin yazmak · aynı konuyu 7 gün içinde tekrar göndermek · uygun haber yokken dolgu göndermek.
