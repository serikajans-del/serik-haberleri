# Serik Merkez Otomatik Haber Botu

Bot 15 dakikada bir haber kaynaklarını tarar. Yalnızca metninde gerçek yer
bağlamıyla **Serik** veya **Belek** bulunan haberleri işler; genel Antalya ve
ülke gündemini yayınlamaz.

## Yayın akışı

1. Serik/Belek odaklı sayfalar ve yerel/ulusal kaynaklar taranır.
2. Son 48 saatteki, görseli ve kullanılabilir gövdesi olan haberler seçilir.
3. Serik/Belek filtresi yapay zekâdan önce ve WordPress kaydından hemen önce
   iki kez uygulanır.
4. Kaynakta olmayan bilgi eklenmeden SEO başlığı, özet ve kısa paragraflar
   hazırlanır.
5. Görsel WordPress ortam kitaplığına yüklenir; Serik kategorisi, konu
   kategorisi ve Serik/Belek etiketleri atanır.
6. Haber `serikmerkez.com` WordPress REST API'sine gönderilir.

## Gerekli `.env.local` değişkenleri

```dotenv
ANTHROPIC_API_KEY=...
GROQ_API_KEY=...
WORDPRESS_URL=https://serikmerkez.com
WORDPRESS_USERNAME=wordpress_kullanici_adi
WORDPRESS_APP_PASSWORD=wordpress_uygulama_parolasi
WORDPRESS_STATUS=publish
```

Anthropic kullanılamazsa bot Groq üzerindeki üretim modeline geçer. İki motor
da başarısızsa kaynak metni kopyalamaz ve haberi yayınlamaz.

WordPress uygulama parolası, yönetim panelinde Kullanıcılar > Profil > Uygulama
Parolaları bölümünden yalnızca bu bot için oluşturulmalıdır. Normal hesap
parolası kullanılmamalıdır.

## Kullanım

```powershell
node --env-file=.env.local bot/auto-haber.mjs --test --no-ai
node --env-file=.env.local bot/auto-haber.mjs
```

`--test` WordPress'e yazmaz. Windows zamanlanmış görevi `bot/zamanlayici-kur.bat`
ile kurulur ve `bot/calistir.bat` üzerinden çalışır.
