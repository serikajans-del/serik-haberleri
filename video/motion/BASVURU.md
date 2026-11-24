# Başvuru kütüphanesi: cinecode + motionforge (4 Kasım 2026)
İki açık kaynak depo (MIT) `araclar/cinecode` ve `araclar/motionforge` altında **yalnız başvuru** olarak duruyor.
Eklenti/skill/hook olarak KURULMADI: kendi yönetmen skill'leri her video isteğini devralıyor, müzik ve −14 LUFS
loudnorm varsayılanları kurallarımızla çakışıyor ([VIDEO_KURALLARI](../VIDEO_KURALLARI.md)). Güncellemek için: `git -C araclar/<ad> pull`.
Biçimden esinlen; örnek sahneleri kopyalayıp aynen kullanma.

## Ne zaman neye bakılır
| İhtiyaç | Dosya |
|---|---|
| Sahnenin kamerasını seçmek (dolly in, pan, pull-back reveal, push-in on detail…), süre/hız/yumuşatma, izleyicide uyandırdığı his | `araclar/cinecode/references/camera-moves.md` |
| Geçiş seçimi (eşleşme kesmesi, cross dissolve, J/L-cut) ve "kesme hareketin içinde nereye düşer" | aynı dosya, Transitions + cut seams |
| Tek plan (kesmesiz) film kurgusu: 3–4 vuruşlu kamera yolu | aynı dosya, One continuous shot |
| Senaryo: önce çoğalt sonra seç, sonu önce yaz, %30 kısaltma turu, Türkçe klişe listesi | `araclar/cinecode/references/writing.md` |
| Türkçesi doğrulanmış açık lisanslı font eşleşmeleri | `araclar/cinecode/references/typography.md`, `docs/type-library.md` |
| Stil tarifleri (uydu brifingi, arşiv ışık masası, gravür, mürekkep, sessiz film, risograf…) | `araclar/cinecode/styles/*.md` |
| 100 stil kataloğu, kategoriye göre | `araclar/motionforge/skills/style-library/styles/README.md` (her stil: STYLE.md + preview.gif; örnek HTML: `examples/styles/<ad>/index.html`) |
| three.js 3B: dünya küresi rotaları, şehir pini, kendini kuran ev | `araclar/motionforge/engines/hyperframes/three/` |
| Teslim öncesi tam kontrol listesi (metin taşması, güvenli alan, okuma süresi, ilk/son kare) | `araclar/motionforge/skills/qa-review/SKILL.md` |

## Konularımıza uyan stiller
- Göç, yol, tarih rotası (Serik Duysun, Sion/iki Nikolaos rotası): `history-map-campaign` (gravür kâğıt harita + kendini çizen ok + tarihli altyazı), `route-journey`.
- Zaman şeridi (köy kaydı → okul → baraj): `timeline-chronicle` (yıllar sayaç gibi döner, kartlar tele düşer).
- Yaban hayatı serisi (alageyik, pars): `nature-field-notes` (defter çizimi kendini çizer, gerçek görüntüye erir, ölçek çubuğu).
- Gizem/hazine: `true-crime-board` (mantar pano, kırmızı ip), cinecode `halftone-dossier`.
- Yerin altı/kesit: cinecode `lidar-survey`, `blueprint`, `satellite-briefing`.
- Haber Short'u: `newspaper-print` (manşete dalış), `breaking-ticker`. Mynet kalıbı kuralı geçerli.
- Arşiv/eski dönem: `archival-newsreel`, cinecode `silent-film`, `archive-lighttable`.

## Bizim sisteme alınanlar
1. `video/harf_kontrol.py film.html`: fontta eksik Türkçe/özel harf varsa render'dan önce uyarır (motionforge X4).
2. Okuma süresi kuralı (motionforge X3): ekrandaki her sabit yazı en az 1,5 sn + kelime başına 0,3 sn kalır.
3. "Soğuk göz" 6 soru (cinecode jury): `/shorts-denetim` skill'inde.
4. Kamera satırı: her sahnenin ilk yorumuna tek satır yaz, ör. `// pull-back reveal, 5 sn, yavaş ease-in, Karagöl'den ovaya`.

## HyperFrames (HeyGen) · 5 Kasım 2026
`araclar/hyperframes` (yalnız başvuru). `npx hyperframes skills update` ÇALIŞTIRILMADI: skill'ler her video isteğini devralır; "Pro" stok görüntü/müzik YPP "tekrar kullanılan içerik" riskini artırır ve HeyGen hesabı ister. Fikir lazımsa `.agents/skills/<ad>/SKILL.md` oku (captions-overlay, motion-doctrine, seam-craft…).

## Lemo-Opuscar + video-shotcraft · 19 Kasım 2026
- `araclar/lemo-opuscar` (100 stil, `styles/<ad>/STYLE.md`; cinecode'un genişlemiş hâli) ve `araclar/video-shotcraft` (Remotion ürün tanıtımı, `references/shots`, `music-beat-sync.md`) yalnız BAŞVURU; eklenti/skill olarak KURULMADI, demo kodu ÇALIŞTIRILMADI.
- Lisans: Lemo STYLE.md'ler CC BY-NC 4.0 + ek izin → kendi filmlerimizde (ticari dahil) okuyup uyarlayabiliriz, md dosyalarını BAŞKASINA dağıtamayız. Yaptığımız film bizimdir, künye gerekmez. Kod MIT. shotcraft Apache-2.0.
- İlk uygulama: `serik-duysun/bolumler/10-haskiziloren-sel/deneme_lemo/arsiv_masa.html` → `archive-lighttable` kendi canvas motorumuzla (ışıklı masa, büyüteç inişi, merceğe giriş, tek sinyal rengi #FF5A1F, okuma kartı + kaynak, sonda arşiv dizini). `karsilastirma.mp4` mevcut "polaroid kart" ile yan yana.
- Kural: arşiv nesnesinin yerine üretilmiş görsel KONMAZ; elde gerçek katalog numarası yoksa numara UYDURMA (ilk denemede HSK-2011-01 uydurulmuştu, kaldırıldı).
- Sıradaki aday: `satellite-briefing` (Landsat/Sentinel sahneleri: griye çekilmiş uydu + ince ölçü çizgisi + tek okuma).

## Impeccable + onetake · 25 Kasım 2026
İkisi de `araclar/` altında YALNIZ BAŞVURU. Eklenti/skill/hook KURULMADI, `npx impeccable install` ve onetake betikleri ÇALIŞTIRILMADI.

**Impeccable** (`araclar/impeccable`, Apache-2.0: ticari dahil serbest) — tasarım dili ve "yapay zekâ kokusu" denetimi.
- Neden eklenti değil: kurulum her UI düzenlemesinde çalışan bir hook ekler; "live" kipi gerektiğinde `claude`'u izinler kapalı (`bypassPermissions`) çalıştırabilir. Bunu istemiyoruz.
| İhtiyaç | Dosya (`araclar/impeccable/skill/reference/`) |
|---|---|
| Sahne/kapak/storyboard sıradan, "yapay zekâ yapmış" görünüyor | `craft-floor.md` (yasak kalıplar), `critique.md` + `critique-rubric.md` (puanlı eleştiri, P0–P3) |
| Yazı hiyerarşisi, font boyu, satır uzunluğu | `typeset.md` |
| Fazla kalabalık / fazla sönük | `distill.md`, `quieter.md`, `bolder.md`, `colorize.md` |
| Boşluk, hizalama, ritim | `layout.md` |
| Teslim öncesi son pas (site sayfası, kapak) | `polish.md`, `audit.md` (erişilebilirlik, hız, taşma) |
| Arayüz hareketleri (site) | `animate.md` |
- Kurulda "soğuk göz" kapak/sahne tasarımını puanlarken `critique-rubric.md` ölçütlerini kullanabilir. Videonun paleti/fontu (kurul dersi) yine önceliklidir.
- İsteğe bağlı, ileride: `npx impeccable detect <klasör|url>` 62 kurallık deterministik tarayıcı (yapay zekâ/anahtar yok). npm'den indirip çalıştırır; kullanıcı onayıyla.

**onetake** (`araclar/onetake`) — kesmesiz, her vuruşun bir öncekinden "büyüdüğü" kısa hareketli filmler + ritim/süreklilik ölçen "oracle".
- **LİSANS: PolyForm Noncommercial 1.0.0 — YALNIZ TİCARİ OLMAYAN kullanım.** Reklam filmleri (TKS Mobilya vb.), para kazanan kanallar ve site ticaridir: onetake'in KODU (`lib/motion.js`, `scripts/*.py`), şablonları (`templates/`, `looks/`) ve fontları bu işlerde KULLANILMAZ, kopyalanmaz, uyarlanmaz.
- Serbest olan: belgeleri OKUYUP yöntem fikrini (ritim, "carry", tek plan mantığı) kendi kodumuzla, kendi sözümüzle uygulamak. Fikir lisansa tabi değil; metin ve kod tabidir.
| Fikir | Dosya (`araclar/onetake/references/`) |
|---|---|
| "PPT gibi tek tek gösteriyor" sorunu: tekdüze tempo vs. vuruşların birbirinden doğmaması (carry) | `rhythm.md` |
| Referans videoyu ölçmek: durgunluk oranı, kesme kümeleri, hareket eğrisi (bizde `video_incele.py` var; eksik ölçüleri buradan esinlenip KENDİMİZ yazarız) | `reference-deconstruction.md` |
| Her değer zamanın fonksiyonu olan tek HTML sahne düzeni | `composition.md` |
| Kameranın anlatılan nesneyi gecikmeli izlemesi, yaslanması, oturması | `motion-library.md` |
- Uygun yer: açılış/reklam filmlerinde tek plan akışı, Serik Duysun geçişleri. Müzik bölümü (`sound.md`) kurallarımız gereği uygulanmaz.
