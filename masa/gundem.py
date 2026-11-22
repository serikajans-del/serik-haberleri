# SERİK MERKEZ · GÜNDEM GÖRSELİ (16 Kas 2026)
# 20 dakikada bir Türkiye gündeminden (öncelik ekonomi, piyasalar, önemli gündem) aday haberleri toplar; Claude (zamanlanmış
# görev "serik-gundem-gorseli", talimat masa/GUNDEM.md) birini seçip ANLAŞILIR başlık+metin yazar; bu betik kullanıcının
# 9:16 "Haber Görseli Oluşturucu" şablonuna basar (masa/gundem-ciz.mjs) ve Telegram'dan (@serikmasa_bot) gönderir. Siteye GİRMEZ.
#
# Kullanım (serik-haberleri klasöründen):
#   python masa/gundem.py aday                  → adaylar (masa/gundem/adaylar.json: başlık, kaynaklar, asıl bağlantı, haber metni)
#   python masa/gundem.py bas g1.json g2.json ... [--dene] → hepsini şablona bas, TEK albüm mesajı olarak Telegram'a gönder (--dene: gönderme, son.jpg, son2.jpg…)
#   python masa/gundem.py atla <no>             → adayı bir daha getirme
#   python masa/gundem.py foto-ara <kisa-ad> <haber-url> [<başka-site-url> ...] → haber sayfalarındaki tüm fotoğrafları topla, kontak sayfası yap
#   python masa/gundem.py foto <haber-url|resim-url> <cikti.jpg> → tek fotoğraf indir
import base64, html, json, math, os, re, sys, time, urllib.parse
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import xml.etree.ElementTree as ET
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter

try:
    sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # serik-haberleri
os.chdir(KOK)
KLASOR = "masa/gundem"; os.makedirs(KLASOR, exist_ok=True)
GORULEN = f"{KLASOR}/gorulen.json"; LOG = f"{KLASOR}/log.txt"
GOSTERILEN = f"{KLASOR}/gosterilen.json"  # 21 Kas: listede kaç tur kaldı (gönderilmeyen 2 turdan sonra düşer)
FONT = "C:/Users/MONSTER/Desktop/yapayzeka/serik-duysun/fontlar/Montserrat.ttf"
LOGO = "manset-araci/site_logo.png"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", "Accept-Language": "tr-TR,tr;q=0.9"}
TR = timezone(timedelta(hours=3))
ARG = set(sys.argv[1:])


def log(*a):
    s = datetime.now(TR).strftime("%d.%m %H:%M ") + " ".join(str(x) for x in a)
    print(s); open(LOG, "a", encoding="utf-8").write(s + "\n")


def env(ad):
    for sat in open(".env.local", encoding="utf-8"):
        if sat.startswith(ad + "="): return sat.split("=", 1)[1].strip().strip('"')


# ---------------- 1) HABERLERİ TOPLA ----------------
GN = "https://news.google.com/rss"
KAYNAKLAR = [
    (f"{GN}?hl=tr&gl=TR&ceid=TR:tr", "gundem"),
    (f"{GN}/headlines/section/topic/BUSINESS?hl=tr&gl=TR&ceid=TR:tr", "ekonomi"),
    (f"{GN}/headlines/section/topic/NATION?hl=tr&gl=TR&ceid=TR:tr", "gundem"),
] + [(f"{GN}/search?q={urllib.parse.quote(q + ' when:8h')}&hl=tr&gl=TR&ceid=TR:tr", "ekonomi") for q in
     ["dolar kur", "altın fiyatları", "borsa istanbul", "merkez bankası faiz", "enflasyon", "akaryakıt zam", "asgari ücret emekli maaş", "piyasalar"]]
# Haber dairesi (kullanıcı 16 Kas: "Antalya, Serik çevresinden de araştır, turizm olur"): yerel ve turizm aramaları, 24 saat geriye
YEREL_SORGU = ["Serik", "Belek", "Kadriye Belek", "Boğazkent", "Aspendos", "Gebiz Serik", "Antalya", "Antalya Büyükşehir", "Antalya Valiliği",
               "Manavgat", "Aksu Antalya", "Antalya Havalimanı yolcu", "Antalya turist sayısı", "Antalya turizm", "Antalya otel doluluk",
               "turizm sezonu", "Belek otel", "Antalya tarım ihracat", "Antalya sera", "Antalya hal fiyatları"]
KAYNAKLAR += [(f"{GN}/search?q={urllib.parse.quote(q + ' when:1d')}&hl=tr&gl=TR&ceid=TR:tr", "turizm" if re.search("turi|otel|havalimanı", q, re.I) else "yerel") for q in YEREL_SORGU]
# Teknoloji ve bilim (kullanıcı 20 Kas: "teknoloji ve bilim haberlerini de alalım"): Google Haberler bilim-teknoloji bölümü + aramalar, 12 saat geriye
KAYNAKLAR += [(f"{GN}/headlines/section/topic/SCIENCE?hl=tr&gl=TR&ceid=TR:tr", "bilim"),
              (f"{GN}/headlines/section/topic/TECHNOLOGY?hl=tr&gl=TR&ceid=TR:tr", "teknoloji")]
TEKNO_SORGU = ["yapay zeka", "bilim insanları keşfetti", "uzay keşif", "NASA", "Türk uzay", "TÜBİTAK", "TOGG", "akıllı telefon güncelleme",
               "siber dolandırıcılık uyarı", "BTK internet", "e-Devlet yeni hizmet", "deprem araştırma bilim", "sağlık araştırma çalışma ortaya koydu"]
KAYNAKLAR += [(f"{GN}/search?q={urllib.parse.quote(q + ' when:12h')}&hl=tr&gl=TR&ceid=TR:tr",
               "bilim" if re.search("bilim|uzay|nasa|tübitak|araştırma", q, re.I) else "teknoloji") for q in TEKNO_SORGU]
TEKNO = re.compile(r"yapay zeka|yapay zekâ|\bai\b|chatgpt|gemini|openai|robot|akıllı telefon|iphone|android|samsung|apple|google|microsoft|uygulama|yazılım|internet|5g|uydu|türksat|togg|elektrikli araç|batarya|çip|siber|dolandırıcı|e-devlet|btk|teknoloji", re.I)
BILIM = re.compile(r"bilim|araştırmacı|keşfett|keşfedil|\buzay|\bnasa\b|\besa\b|astronot|gezegen|\bmars\b|tübitak|fosil|arkeolo|kazı(da|sında|larında)|iklim değişikliği|genetik|\bdna\b|kanser|beyin|hücre|tedavi yöntemi|aşı(sı|nın)? (geliştir|çalışma)|araştırma(sı|ya göre)|çalışma(sı)? ortaya", re.I)
# teknoloji/bilim'de çöp: ürün incelemesi, kampanya, oyun, söylenti
# Sağlık (kullanıcı 21 Kas: "sağlık da ekleyelim"): Google Haberler sağlık bölümü + aramalar, 12 saat
KAYNAKLAR += [(f"{GN}/headlines/section/topic/HEALTH?hl=tr&gl=TR&ceid=TR:tr", "saglik")]
SAGLIK_SORGU = ["Sağlık Bakanlığı", "aile hekimi", "MHRS randevu", "ilaç fiyatları", "ilaç geri çağırma", "grip salgını", "aşı takvimi",
                "Antalya hastane", "Serik Devlet Hastanesi", "Antalya Eğitim ve Araştırma Hastanesi", "SGK sağlık", "gıda zehirlenmesi uyarı"]
KAYNAKLAR += [(f"{GN}/search?q={urllib.parse.quote(q + ' when:12h')}&hl=tr&gl=TR&ceid=TR:tr", "saglik") for q in SAGLIK_SORGU]
# 22 Kas UYARI NÖBETİ: MGM servisi otomatik erişime kapalı; uyarı haberleştiği an yakalanır (6 saat). Antalya/Serik geçen uyarı listenin tepesine çıkar.
UYARI_SORGU = ["Antalya meteoroloji uyarı", "Antalya sarı kod", "Antalya turuncu kod", "Antalya kuvvetli yağış", "Antalya sağanak", "Antalya fırtına",
               "Antalya sel", "Serik sel", "Antalya hortum", "Antalya dolu", "Antalya orman yangını", "AFAD Antalya", "Antalya Valiliği uyarı", "Antalya okullar tatil"]
KAYNAKLAR += [(f"{GN}/search?q={urllib.parse.quote(q + ' when:6h')}&hl=tr&gl=TR&ceid=TR:tr", "uyari") for q in UYARI_SORGU]
SAGLIK = re.compile(r"sağlık|hastane|doktor|hekim|hasta|ilaç|aşı|grip|virüs|salgın|kanser|tedavi|ameliyat|mhrs|randevu|sgk|eczane|diyabet|kalp|tansiyon|beslenme|zehirlen", re.I)
TEKNO_COP = re.compile(r"inceleme|kutu açılış|indirim|kampanya|fırsat|kupon|en iyi \d+|kaç para|fiyatı (ne|belli)|sızdırıldı|iddia edildi|oyun|playstation|xbox|steam|nintendo|burç|astroloji", re.I)
SERIK = re.compile(r"serik|belek|kadriye|boğazkent|aspendos|gebiz|abdurrahmanlar|kocayatak|çandır|taşağıl|karadayı|akbaş|belkıs", re.I)
ANTALYA = re.compile(r"antalya|manavgat|aksu|alanya|kemer|konyaaltı|muratpaşa|kepez|döşemealtı|\bside\b|kumluca|finike|\bkaş\b|gazipaşa|elmalı|korkuteli", re.I)
TURIZM = re.compile(r"turizm|turist|otel|tatil|sezon|havalimanı|yolcu|rezervasyon|doluluk|tur operatör|kruvaziyer|golf|konaklama|ziyaretçi", re.I)

EKO = re.compile(r"dolar|euro|kur\b|altın|borsa|bist|faiz|enflasyon|tüfe|merkez bankası|tcmb|piyasa|ekonomi|zam\b|zamlı|benzin|motorin|akaryakıt|petrol|brent|asgari ücret|emekli|maaş|\bkira|vergi|ihracat|ithalat|büyüme|cari|kredi|bitcoin|kripto|hisse|tahvil|fed\b|ecb|bütçe|bakan şimşek|şimşek|karahan|doğalgaz|elektrik", re.I)
BUYUK_KAYNAK = re.compile(r"anadolu ajansı|^aa$|trt haber|bloomberg|forbes|ntv|habertürk|cnn türk|dünya|ekonomim|sözcü|hürriyet|milliyet|sabah|cumhuriyet|bbc|dw|euronews|reuters|para analiz|investing|bigpara|mynet|haberler\.com|t24|halk tv|karar|yeni şafak|takvim", re.I)
RUTIN = re.compile(r"ne kadar\??$|(fiyatı|fiyatları|kuru) ne kadar|elektrik kesintisi!?$|kaç (tl|lira)|fiyatları\b.*\d{1,2} (ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)|^\d{1,2} (ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık).*(fiyat|kur)|döviz kurları|kur(lar)?ı? (ne kadar|kaç)|canlı|anlık|güncel (fiyat|kur)|bugün ne kadar|alış satış|döviz fiyatları|kurlar(ı)? belli oldu|euro(da)? son durum|altın(da)? son durum", re.I)
COP = re.compile(r"\*\*\*|loto|şans topu|on numara|piyango|^kap |pay bazında|devre kesici|magazin|dizi|bölüm|fragman|burç|maç özeti|transfer|canlı izle|şifresiz|futbol|galatasaray|fenerbahçe|beşiktaş|trabzonspor|süper lig|survivor|masterchef|ünlü|aşk|evlendi|boşan|kim kazandı|reyting|tarifi|hava durumu", re.I)
DUR = set("ve ile bir bu da de için mi mı ne olarak son dakika sondakika açıklandı oldu yeni haber haberi gün bugün ki the".split())
# 22 Kas akşam (kullanıcı: "neden haber seçemiyor, 1-2 saati bulan boşluklar oluyor"): 12 kişilik liste, görevin zaten elediği
# türlerle (asayiş, yerel spor, eylem/polemik, tık tuzağı, başka ilin yerel olayı, az önce gönderilen konunun yeni başlığı) doluyor,
# gerçek adaylara yer kalmıyordu (19:05–20:06 dört tur boş). Bunlar artık listeye girmeden düşer.
ASAYIS = re.compile(r"cinayet|öldür|bıçakla|silahla|kurşun|vuruldu|yaraland|cesed|ceset|intihar|taciz|tecavüz|istismar|gözaltı|tutuklan|operasyon|uyuşturucu|uyuşturucu|kaçakçı|hırsız|gasp|dolandırıcıya|kavga|darp|cezaevi|firari|kaza(da|sında)? .*(öldü|yaralı|hayatını kaybett)|hayatını kaybetti|feci kaza|devrildi|takla attı", re.I)
SPOR = re.compile(r"\b\w+spor|serik spor|deplasman|mağlup|galibiyet|beraberlik|karşılaşma|ilk yarı|eşitlik var|\b\d{1,2}-\d{1,2}\b (yenil|kazan|mağlup|galip|bitti)|\bspor kulübü|\bmaç\b|maçı|maçında|\blig\b|ligi|gol\b|teknik direktör|hakem|şampiyon|turnuva|derbi|play-?off|basketbol|voleybol|hentbol|güreş|boks", re.I)
POLEMIK = re.compile(r"tepki gösterdi|tepki yağdı|sert sözler|yüklendi|polemik|eylem(ci| yaptı| düzenle)|protesto|yürüyüş(ü|e)|miting|istifa çağrısı|chp|ak parti|mhp|dem parti|iyi parti|yeniden refah|zafer partisi|milletvekili|öcalan|imralı|\bpkk\b|terör örgütü", re.I)
TIK = re.compile(r"asla yapma|yapmamanız gereken|\d+ hata|şok eden|şaşırtan|herkesi şaşırt|bakın ne|işte o|ortaya çıktı!|varan ek ödeme|maaşla alınabiliyordu|gözler .* çevrildi|nasıl olacak\?|olacak mı\?|ne zaman yatacak|kimler alabilir|var mı\?|açılıyor mu\?|uzatıldı mı\?|ne zaman\?|yapay zekaya sorduk|tarihe geçti!$", re.I)
BASKA_IL = re.compile(r"\b(adana|adıyaman|afyon|ağrı|aksaray|amasya|ankara|ardahan|artvin|balıkesir|bartın|batman|bayburt|bilecik|bingöl|bitlis|bolu|burdur|bursa|çanakkale|çankırı|çorum|denizli|diyarbakır|düzce|edirne|elazığ|erzincan|erzurum|eskişehir|gaziantep|giresun|gümüşhane|hakkari|hatay|ığdır|ısparta|isparta|izmir|kahramanmaraş|karabük|karaman|kars|kastamonu|kayseri|kilis|kırıkkale|kırklareli|kırşehir|kocaeli|konya|kütahya|malatya|manisa|mardin|mersin|muğla|muş|nevşehir|niğde|osmaniye|rize|sakarya|samsun|siirt|sinop|sivas|şanlıurfa|şırnak|tekirdağ|tokat|trabzon|tunceli|uşak|van|yalova|yozgat|zonguldak|turgutlu|bodrum|fethiye)['’](da|de|ta|te|nda|nde|daki|deki|dan|den|tan|ten)\b", re.I)  # yalnız "Malatya'da" gibi yer eki: "Aydın" adı karışmasın
# Konu doygunluğu: son 12 saatte aynı ayırt edici kökle 2 haber gittiyse 3.'sü (yeni başlıkla) gelmez. Genel kökler (antalya, serik, yüzde…) sayılmaz.
GENEL_KOK = set("antal serik türki yüzde milyo milya lira dolar euro altın yapay zekâ zeka günü yarın hafta kasım ekim aralı ocak başla açıkl yılın bakan bakanl beled büyük devle merke hasta okul öğren mahal kesin elekt".split())


def kelimeler(t):
    t = t.lower().replace("i̇", "i")
    return {w for w in re.findall(r"[a-zçğıöşü0-9]{3,}", t) if w not in DUR}


def topla():
    ogeler = []
    simdi = datetime.now(timezone.utc)
    for url, tur in KAYNAKLAR:
        try:
            try:
                x = requests.get(url, headers=UA, timeout=20).content; kok_xml = ET.fromstring(x)
            except ET.ParseError:  # 22 Kas: Google ara sıra XML yerine hata sayfası döndürüyor; bir kez yeniden dene
                time.sleep(3); x = requests.get(url, headers=UA, timeout=20).content; kok_xml = ET.fromstring(x)
            for it in kok_xml.iter("item"):
                bas = html.unescape(it.findtext("title") or "")
                kaynak = it.findtext("source") or (bas.rsplit(" - ", 1)[1] if " - " in bas else "")
                if " - " in bas: bas = bas.rsplit(" - ", 1)[0]
                bas = re.sub(r"\s+-\s+(Son Dakika.*|Finans haberlerinin.*|.*Haber)$", "", bas).strip()
                try: zaman = parsedate_to_datetime(it.findtext("pubDate"))
                except Exception: continue
                if simdi - zaman > timedelta(hours=26 if tur in ("yerel", "turizm") else 12 if tur in ("bilim", "teknoloji", "saglik") else 8 if tur == "ekonomi" else 6): continue  # gündem 4 → 6 sa (22 Kas: akşam havuz kuruyordu)
                # top-stories öğelerinin açıklamasında küme (aynı haberi yazan diğer kaynaklar) olur
                acik = html.unescape(it.findtext("description") or "")
                kume = max(1, len(re.findall(r"<li>", acik)))
                ogeler.append({"b": bas, "k": kaynak.strip(), "l": it.findtext("link"), "z": zaman, "tur": tur, "kume": kume, "w": kelimeler(bas)})
        except Exception as e:
            log("RSS hata", url[:80], e)
    ogeler += dogrudan_topla(simdi)
    return ogeler


# 22 Kas akşam (kullanıcı: "daha fazla haber gelsin, arada boşluk kalmasın, tarama iyi olsun, haber kaçırmasın"):
# Google Haberler yerel siteleri geç ya da hiç göstermiyor. Haber sitelerinin KENDİ akışları doğrudan okunur.
# (ad, url, tür, kaç saat geriye). "serik" türü: başlıkta Serik geçmese de Serik haberi sayılır (Serik Postası, DHA Serik).
DOGRUDAN = [
    ("Serik Postası", "https://www.serikpostasi.com/rss.xml", "serik", 26),
    ("Antalya Ekspres", "https://www.antalyaekspres.com.tr/rss", "yerel", 26),
    ("Antalya Körfez", "https://www.antalyakorfez.com/rss", "yerel", 26),
    ("mygazete", "https://www.mygazete.com/rss", "yerel", 26),
    ("TRT Haber", "https://www.trthaber.com/sondakika_articles.rss", "gundem", 6),
    ("TRT Haber", "https://www.trthaber.com/manset_articles.rss", "gundem", 6),
    ("Habertürk", "https://www.haberturk.com/rss", "gundem", 6),
    ("Hürriyet", "https://www.hurriyet.com.tr/rss/gundem", "gundem", 6),
    ("Sözcü", "https://www.sozcu.com.tr/feeds-son-dakika", "gundem", 6),
    ("CNN Türk", "https://www.cnnturk.com/feed/rss/all/news", "gundem", 6),
    ("Ekonomim", "https://www.ekonomim.com/rss", "ekonomi", 8),
    ("Bloomberg HT", "https://www.bloomberght.com/rss", "ekonomi", 8),
]
DHA_ILK = f"{KLASOR}/dha-ilk.json"  # DHA Serik sayfasında tarih yok: her haberin ilk görüldüğü an tutulur


def dogrudan_topla(simdi):
    o = []
    for ad, url, tur, saat in DOGRUDAN:
        try:
            x = ET.fromstring(requests.get(url, headers=UA, timeout=20).content)
            for it in x.iter("item"):
                bas = re.sub(r"\s+", " ", html.unescape(it.findtext("title") or "")).strip()
                try: zaman = parsedate_to_datetime(html.unescape(it.findtext("pubDate") or ""))
                except Exception: continue
                if zaman.tzinfo is None: zaman = zaman.replace(tzinfo=timezone.utc)
                if len(bas) < 12 or simdi - zaman > timedelta(hours=saat): continue
                if bas.isupper(): bas = bas[:1] + bas[1:].lower()  # "SERİK DEMOKRAT PARTİ..." büyük harf başlıkları
                o.append({"b": bas, "k": ad, "l": (it.findtext("link") or "").strip(), "z": zaman, "tur": tur, "kume": 1, "w": kelimeler(bas)})
        except Exception as e:
            log("RSS hata", ad, url[:60], e)
    try:  # DHA Serik sayfası (RSS yok)
        ilk = json.load(open(DHA_ILK, encoding="utf-8")) if os.path.exists(DHA_ILK) else {}
        tohum = not ilk
        x = requests.get("https://www.dha.com.tr/antalya/serik-haber/", headers=UA, timeout=(8, 20)).text; gor = set()
        for u, ic in re.findall(r'href="(/yerel-haberler/antalya/serik/[a-z0-9-]+-\d+)"[^>]*>([\s\S]{0,1500}?)</a>', x):
            if u in gor: continue
            gor.add(u); b = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", ic))).strip()
            h = (len(b) - 1) // 2
            if len(b) % 2 and b[:h] == b[h + 1:]: b = b[:h]
            if len(b) < 10: continue
            if u not in ilk: ilk[u] = 0 if tohum else time.time()  # ilk çalışmada sayfadakiler eski sayılır
            if ilk[u] and time.time() - ilk[u] < 26 * 3600:
                o.append({"b": b, "k": "DHA", "l": "https://www.dha.com.tr" + u, "z": datetime.fromtimestamp(ilk[u], timezone.utc), "tur": "serik", "kume": 1, "w": kelimeler(b)})
        json.dump(ilk, open(DHA_ILK, "w", encoding="utf-8"))
    except Exception as e:
        log("DHA Serik hata", e)
    o += resmi_topla()
    return o


# 22 Kas: resmî kurum sayfaları (RSS yok, gov.tr şablonu: kart başlığı + cardDate gg.aa.yyyy). Saat olmadığı için ilk görülme anı tutulur.
# Serik Belediyesi otomatik erişimi reddediyor (403), Büyükşehir sayfası içeriği tarayıcıda yüklüyor: ikisi Google aramasıyla gelir.
RESMI = [("Antalya Valiliği", "https://www.antalya.gov.tr/haberler", "yerel"), ("Antalya Valiliği", "https://www.antalya.gov.tr/duyurular", "yerel"),
         ("Antalya Valiliği", "https://www.antalya.gov.tr/basin-aciklamalari", "yerel"),
         ("Serik Kaymakamlığı", "https://www.serik.gov.tr/haberler", "serik"), ("Serik Kaymakamlığı", "https://www.serik.gov.tr/duyurular", "serik")]
RESMI_ILK = f"{KLASOR}/resmi-ilk.json"
KART = re.compile(r'<a[^>]+href="([^"#]+)"[^>]*>(?:(?!</a>)[\s\S]){0,2500}?title="([^"]+)"(?:(?!</a>)[\s\S]){0,800}?cardDate">(\d\d)\.(\d\d)\.(\d{4})')


def resmi_topla():
    o = []
    ilk = json.load(open(RESMI_ILK, encoding="utf-8")) if os.path.exists(RESMI_ILK) else {}
    bugun = datetime.now().date()
    for ad, url, tur in RESMI:
        try:
            s = requests.get(url, headers=UA, timeout=20).text
            for u, t, g, a, y in KART.findall(s):
                tarih = datetime(int(y), int(a), int(g)).date()
                if (bugun - tarih).days > 1: continue  # yalnız bugün ve dün yayımlanan
                u = ("https:" + u) if u.startswith("//") else (url.split("/", 3)[0] + "//" + url.split("/")[2] + u) if u.startswith("/") else u
                if u not in ilk: ilk[u] = time.time()
                b = re.sub(r"\s+", " ", html.unescape(t)).strip()
                if len(b) >= 12:
                    o.append({"b": b, "k": ad, "l": u, "z": datetime.fromtimestamp(ilk[u], timezone.utc), "tur": tur, "kume": 1, "w": kelimeler(b)})
        except Exception as e:
            log("Resmî sayfa hata", ad, url[-30:], e)
    json.dump(ilk, open(RESMI_ILK, "w", encoding="utf-8"))
    return o


# ---------------- UYARI NÖBETİ (22 Kas: puanı yükselt; kullanıcı "uyarılar önemli") ----------------
# Deprem: AFAD'ın açık servisi. Antalya ve komşu iller M3.5+, Türkiye geneli M5.0+ → listenin başına (no:0) geçer.
# Hava: MGM servisi otomatik erişime kapalı ("Not allowed by MGM"); uyarı, haberleştiği an özel Google aramalarıyla yakalanır (tür "uyari").
KOMSU = re.compile(r"antalya|burdur|ısparta|isparta|konya|karaman|mersin|muğla|denizli|akdeniz", re.I)
UYARI_ILK = f"{KLASOR}/uyari-durum.json"


def deprem_ara():
    durum = json.load(open(UYARI_ILK, encoding="utf-8")) if os.path.exists(UYARI_ILK) else {}
    simdi = datetime.now(timezone.utc).replace(tzinfo=None)  # AFAD saatleri UTC (22 Kas Kandilli ile karşılaştırıldı: AFAD 00:14 = TSİ 03:14)
    bas_ = (simdi - timedelta(hours=3)).strftime("%Y-%m-%dT%H:%M:%S")
    try:
        r = requests.get(f"https://deprem.afad.gov.tr/apiv2/event/filter?start={bas_}&end={simdi.strftime('%Y-%m-%dT%H:%M:%S')}&minmag=3.5&format=json",
                         headers=UA, timeout=20).json()
    except Exception as e:
        log("AFAD hata", e); return []
    cik = []
    for d in r:
        m = float(d.get("magnitude") or 0); yer = d.get("location") or ""; il = d.get("province") or ""
        yakin = KOMSU.search(il + " " + yer) or (35.3 <= float(d["latitude"]) <= 37.8 and 28.8 <= float(d["longitude"]) <= 33.5)
        if not ((yakin and m >= 3.5) or m >= 5.0): continue
        n = durum.get(d["eventID"], 0)
        if n >= 3: continue  # 3 turda listede kaldı (gönderildi ya da elendi)
        durum[d["eventID"]] = n + 1
        cik.append({"buyukluk": m, "yer": yer, "il": il, "saat_tsi": (datetime.fromisoformat(d["date"][:19]) + timedelta(hours=3)).strftime("%d.%m %H:%M"), "derinlik_km": d.get("depth"),
                    "url": f"https://deprem.afad.gov.tr/event-detail/{d['eventID']}", "yakin": bool(yakin)})
    json.dump(durum, open(UYARI_ILK, "w", encoding="utf-8"))
    return cik


def kumele(ogeler):
    kumeler = []
    for o in sorted(ogeler, key=lambda o: o["z"], reverse=True):
        for k in kumeler:
            # kümenin ilk (çekirdek) başlığıyla karşılaştır; birleşik kelime kümesiyle değil (yoksa küme her şeyi yutar)
            ort = len(o["w"] & k["c"]) / max(1, min(len(o["w"]), len(k["c"])))
            if ort >= 0.5 and len(o["w"] & k["c"]) >= 3:
                k["o"].append(o); k["w"] |= o["w"]; break
        else:
            kumeler.append({"o": [o], "w": set(o["w"]), "c": set(o["w"])})
    return kumeler


def kok(ws):
    """Türkçe ekleri kaba biçimde at: ilk 5 harf (tespitine/tespitinde → tespi); â î û sadeleşir."""
    return {w.lower().replace("â", "a").replace("î", "i").replace("û", "u")[:5] for w in ws}


# 22 Kas kullanıcı: "uyarılar önemli" → hava/afet/kesinti uyarısı her güncellemede gitmeli; nadir-kök tekrar kuralı bunlara uygulanmaz
# 22 Kas: "sel", "dolu", "kuvvetli" kelime içinde de eşleşiyordu (yüksel, görsel, özel, doluluk) → DEM Parti haberi "uyarı" sayılıp siyaset süzgecinden kaçıyordu
UYARI = re.compile(r"uyar|sarı kod|turuncu kod|kırmızı kod|meteoroloji|\bmgm\b|\bafad\b|sağanak|fırtına|kuvvetli (yağış|rüzgar|fırtına)|yağış|kar yağ|\bdon olay|dolu yağ|dolu tane|dolu vurdu|\bsel(i|de|den|in)?\b|sel felaket|su baskın|hortum|deprem|orman yangın|kesinti|kesil|tsunami|toz taşın|sıcak hava dalga|soğuk hava dalga|okul(lar)?(ı)?\b.{0,25}\btatil (edildi|ilan)|eğitime ara|eğitime 1 gün ara|dersler iptal", re.I)

SON_KOK = {}  # aday_komutu doldurur: son 12 saatte GÖNDERİLEN başlıklarda her ayırt edici kökün kaç haberde geçtiği
DF = {}  # aday_komutu doldurur: gönderilmiş/atlanmış haberlerde her kökün kaç kez geçtiği (nadirlik ölçüsü)


def ayni_haber(gw, kw, gt=None):
    """22 Kas: Parkinson haberi başlığı değişince (21 Kas 23:28 → 22 Kas 11:48) ikinci kez gitti; eski oran kuralı (%45) kaçırdı.
    Ek kural: son 48 saatte en az 3 NADİR kök (geçmişte ≤4 kez geçmiş, sayı değil) + en az 4 ortak kök → aynı haber."""
    gw, kw = set(gw), set(kw)
    if len(gw & kw) / max(1, min(len(gw), len(kw))) >= 0.45: return True
    if gt is not None and time.time() - gt > 48 * 3600: return False
    if UYARI.search(" ".join(kw)): return False  # uyarının yeni güncellemesi engellenmez
    ortak = kok(gw) & kok(kw)
    nadir = [s for s in ortak if DF.get(s, 0) <= 4 and not s.isdigit()]
    return len(nadir) >= 3 and len(ortak) >= 4


def puanla(k, gorulen):
    kaynaklar = {o["k"] for o in k["o"]}
    metin = " ".join(o["b"] for o in k["o"])
    if COP.search(metin): return -1
    if sum(bool(RUTIN.search(o["b"])) for o in k["o"]) * 3 >= len(k["o"]): return -1  # her gün yazılan fiyat sayfası, haber değil
    uyari = UYARI.search(metin); yerel_il = SERIK.search(metin) or ANTALYA.search(metin)
    # GUNDEM.md ELE listesi. Antalya siyaseti (belediye parti değiştirdi) ve dolandırıcılık/ekonomi suçu (kripto) kalır.
    if SPOR.search(metin): return -1  # spor her zaman ("hentbolda fırtına estirdi" uyarı sayılmasın)
    if POLEMIK.search(metin) and not yerel_il: return -1  # siyaset uyarı muafiyeti almaz ("DEM Parti'ye uyarı")
    if not uyari and ASAYIS.search(metin) and not re.search(r"dolandır|kripto|vergi|vurgun|sahte fatura|tefeci|karapara", metin, re.I): return -1
    if all(TIK.search(o["b"]) for o in k["o"]): return -1  # her başlığı tık tuzağı
    for g in gorulen:  # daha önce gönderilen haberle örtüşüyorsa atla
        if ayni_haber(g["w"], k["w"], g["t"]): return -1
    if not uyari and len({s for s in kok(k["w"]) if SON_KOK.get(s, 0) >= 2}) >= 1: return -1  # konu son 12 saatte 2 kez gitti
    yerel = SERIK.search(metin) or any(o["tur"] == "serik" for o in k["o"]); tur = TURIZM.search(metin)
    # Antalya Ekspres/Körfez/mygazete'nin kendi akışındaki haber, başlıkta "Antalya" yazmasa da çoğunlukla Antalya haberidir
    il = ANTALYA.search(metin) or (any(o["tur"] == "yerel" and "news.google" not in (o["l"] or "") for o in k["o"]) and not BASKA_IL.search(metin))
    if not (yerel or il) and BASKA_IL.search(metin) and not EKO.search(metin): return -1  # başka ilin yerel olayı (Malatya, Van, Kütahya…)
    # Google aramasından gelen alakasız sonuç elenir; Antalya Ekspres gibi doğrudan okunan gazetenin ulusal haberi ulusal gibi değerlendirilir
    if all(o["tur"] in ("yerel", "turizm") and "news.google" in (o["l"] or "") for o in k["o"]) and not (yerel or il or tur): return -1
    tb = all(o["tur"] in ("bilim", "teknoloji", "saglik") for o in k["o"])
    if tb and (TEKNO_COP.search(metin) or not (TEKNO.search(metin) or BILIM.search(metin) or SAGLIK.search(metin))): return -1  # ürün/kampanya/oyun ya da konu dışı
    p = len(kaynaklar) * 3 + max(o["kume"] for o in k["o"]) * 2
    if uyari and (yerel or il) and any(o["tur"] == "uyari" for o in k["o"]): p += 40  # UYARI NÖBETİ: Antalya/Serik hava-afet uyarısı tepeye
    elif all(o["tur"] == "uyari" for o in k["o"]): return -1  # uyarı aramasının Antalya'sız ya da uyarısız sonucu
    if yerel: p += 26          # Serik ve çevresi: bizim okurun kendi haberi
    elif il: p += 14           # Antalya
    if tur: p += 10            # turizm: bölgenin geçim kaynağı
    if EKO.search(metin): p += 8
    if any(o["tur"] == "ekonomi" for o in k["o"]): p += 3
    if any(o["tur"] in ("bilim", "teknoloji", "saglik") for o in k["o"]) and (TEKNO.search(metin) or BILIM.search(metin) or SAGLIK.search(metin)): p += 9  # teknoloji/bilim: her turda en az bir aday çıksın
    yas = (datetime.now(timezone.utc) - max(o["z"] for o in k["o"])).total_seconds() / 3600
    return p - yas * (0.6 if (yerel or il) else 0.8 if tb else 2)  # yerel ve bilim haberi daha yavaş eskir


# ---------------- 2) HABERİN AYRINTISI ----------------
def gn_coz(link):
    try:
        i = link.split("/articles/")[1].split("?")[0]
        h = requests.get(f"https://news.google.com/articles/{i}", headers=UA, timeout=15).text
        sg = re.search(r'data-n-a-sg="([^"]+)"', h).group(1); ts = re.search(r'data-n-a-ts="([^"]+)"', h).group(1)
        req = [[["Fbv4je", f'["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"{i}",{ts},"{sg}"]', None, "generic"]]]
        b = requests.post("https://news.google.com/_/DotsSplashUi/data/batchexecute", headers={**UA, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"},
                          data="f.req=" + urllib.parse.quote(json.dumps(req)), timeout=15).text
        m = re.search(r'garturlres\\",\\"(https?:[^\\"]+)', b)
        return m.group(1).replace("\\\\u003d", "=").replace("\\\\u0026", "&") if m else link
    except Exception:
        return link


def ozet(url):
    try:
        h = requests.get(url, headers=UA, timeout=15).text
        for ad in ("og:description", "description", "twitter:description"):
            m = re.search(rf'<meta[^>]+(?:property|name)=["\']{ad}["\'][^>]+content=["\']([^"\']+)', h, re.I) or \
                re.search(rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']{ad}["\']', h, re.I)
            if m and len(m.group(1)) > 40: return html.unescape(m.group(1)).strip()
    except Exception:
        pass
    return ""


# ---------------- 3) PİYASA VERİSİ ----------------
def yahoo(s):
    try:
        j = requests.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{s}?range=5d&interval=30m", headers=UA, timeout=20).json()["chart"]["result"][0]
        m = j["meta"]; seri = [v for v in j["indicators"]["quote"][0]["close"] if v]
        seri = [seri[0]] + [sorted(seri[i - 1:i + 2])[1] for i in range(1, len(seri) - 1)] + [seri[-1]]  # tek noktalık veri sıçramalarını sil (medyan-3)
        # değişim = bir önceki günün kapanışına göre (5 günlük aralığın chartPreviousClose'u 5 gün öncesidir)
        g = requests.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{s}?range=1d&interval=30m", headers=UA, timeout=20).json()["chart"]["result"][0]["meta"]
        return {"f": m["regularMarketPrice"], "o": g.get("previousClose") or g.get("chartPreviousClose") or seri[0], "seri": seri}
    except Exception:
        return None


def piyasa():
    d = {k: yahoo(s) for k, s in {"usd": "USDTRY=X", "eur": "EURTRY=X", "ons": "GC=F", "bist": "XU100.IS", "brent": "BZ=F", "btc": "BTC-USD"}.items()}
    if d["ons"] and d["usd"]:  # gram altın = ons($) × dolar ÷ 31,1035
        n = min(len(d["ons"]["seri"]), len(d["usd"]["seri"]))
        d["gram"] = {"f": d["ons"]["f"] * d["usd"]["f"] / 31.1035, "o": d["ons"]["o"] * d["usd"]["o"] / 31.1035,
                     "seri": [a * b / 31.1035 for a, b in zip(d["ons"]["seri"][-n:], d["usd"]["seri"][-n:])]}
    return d


def buyuk(t):
    return t.replace("i", "İ").replace("ı", "I").upper()


def tl(v, ondalik=2):
    s = f"{v:,.{ondalik}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


# ---------------- 4) GÖRSEL ----------------
W, H = 1600, 900


def font(boy, ag=900):
    f = ImageFont.truetype(FONT, boy); f.set_variation_by_axes([ag]); return f


def sar(d, metin, f, gen):
    sat, cur = [], ""
    for w in metin.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= gen: cur = t
        else: sat.append(cur); cur = w
    return sat + [cur] if cur else sat


def etiket_sec(metin):
    m = metin.replace("İ", "i").replace("I", "ı").lower()  # Türkçe büyük harf (SERİK’TE) doğru küçülsün
    if TURIZM.search(m) and (SERIK.search(m) or ANTALYA.search(m)): return "TURİZM"
    if SERIK.search(m): return "SERİK"
    if ANTALYA.search(m) and not EKO.search(m): return "ANTALYA"
    if re.search(r"dolar|euro|altın|borsa|bist|bitcoin|kripto|hisse|brent|petrol|piyasa", m): return "PİYASALAR"
    if EKO.search(m): return "EKONOMİ"
    if SAGLIK.search(m): return "SAĞLIK"
    if BILIM.search(m): return "BİLİM"
    if TEKNO.search(m): return "TEKNOLOJİ"
    if re.search(r"abd|trump|rusya|ukrayna|israil|gazze|avrupa|çin|nato|iran|dünya", m): return "DÜNYA"
    return "GÜNDEM"


def grafik_sec(metin):
    m = metin.lower()
    for anahtar, k in (("altın", "gram"), ("borsa", "bist"), ("bist", "bist"), ("hisse", "bist"), ("petrol", "brent"), ("brent", "brent"),
                       ("benzin", "brent"), ("motorin", "brent"), ("akaryakıt", "brent"), ("bitcoin", "btc"), ("kripto", "btc"), ("euro", "eur")):
        if anahtar in m: return k
    return "usd"


ADLAR = {"usd": "DOLAR", "eur": "EURO", "gram": "GRAM ALTIN", "bist": "BIST 100", "brent": "BRENT", "btc": "BITCOIN"}


def gorsel(baslik, etiket, p, cikti):
    im = Image.new("RGB", (W, H), (10, 18, 34))
    d = ImageDraw.Draw(im)
    for y in range(H):  # lacivert dikey geçiş
        k = y / H; d.line([(0, y), (W, y)], fill=(int(10 + 8 * k), int(18 + 14 * k), int(34 + 30 * k)))
    for x in range(0, W, 80): d.line([(x, 0), (x, H)], fill=(255, 255, 255, 0) if False else (22, 34, 58))
    for y in range(0, H, 80): d.line([(0, y), (W, y)], fill=(22, 34, 58))
    # arka planda haberle ilgili piyasanın gerçek 5 günlük grafiği
    g = grafik_sec(baslik) if etiket in ("PİYASALAR", "EKONOMİ") else None
    if g and p.get(g) and len(p[g]["seri"]) > 5:
        s = p[g]["seri"]; lo, hi = min(s), max(s); hi = hi if hi > lo else lo + 1
        x0, x1, y0, y1 = 60, W - 60, 470, 700
        pts = [(x0 + (x1 - x0) * i / (len(s) - 1), y1 - (y1 - y0) * (v - lo) / (hi - lo)) for i, v in enumerate(s)]
        yukari = s[-1] >= s[0]; renk = (46, 204, 113) if yukari else (231, 76, 60)
        kat = Image.new("RGBA", (W, H), (0, 0, 0, 0)); kd = ImageDraw.Draw(kat)
        kd.polygon(pts + [(x1, y1 + 30), (x0, y1 + 30)], fill=renk + (38,))
        kd.line(pts, fill=renk + (230,), width=5, joint="curve")
        kd.ellipse([pts[-1][0] - 11, pts[-1][1] - 11, pts[-1][0] + 11, pts[-1][1] + 11], fill=renk + (255,))
        kat = kat.filter(ImageFilter.GaussianBlur(0.6)); im.paste(kat, (0, 0), kat); d = ImageDraw.Draw(im)
        v = p[g]; deg = (v["f"] / v["o"] - 1) * 100
        yazi = f"{ADLAR[g]}  {tl(v['f'], 0 if g in ('bist', 'btc', 'gram') else 2)}{'' if g in ('bist', 'brent', 'btc') else ' ₺'}   {'▲' if deg >= 0 else '▼'} %{tl(abs(deg))}"
        if g == "brent": yazi = f"BRENT  {tl(v['f'])} $   {'▲' if deg >= 0 else '▼'} %{tl(abs(deg))}"
        if g == "btc": yazi = f"BITCOIN  {tl(v['f'], 0)} $   {'▲' if deg >= 0 else '▼'} %{tl(abs(deg))}"
        fy = font(30, 800); d.text((x1 - d.textlength(yazi, font=fy), y0 - 52), yazi, font=fy, fill=renk)
        d.text((x0, y0 - 46), "Son 5 gün", font=font(24, 600), fill=(150, 165, 190))
    # etiket + manşet
    fe = font(34, 800); we = d.textlength(etiket, font=fe) + 44
    d.rectangle([60, 56, 60 + we, 110], fill=(211, 18, 47)); d.text((60 + we / 2, 83), etiket, font=fe, fill="white", anchor="mm")
    boy = 76
    while True:
        f = font(boy); sat = sar(d, baslik, f, W - 120)
        if len(sat) <= 3 or boy <= 46: break
        boy -= 3
    yy = 140
    for s in sat[:4]:
        d.text((60, yy), s, font=f, fill="white"); yy += round(boy * 1.18)
    # alt piyasa şeridi
    d.rectangle([0, H - 112, W, H], fill=(6, 11, 22))
    d.line([(0, H - 112), (W, H - 112)], fill=(211, 18, 47), width=4)
    kalem = [("DOLAR", "usd", 2, " ₺"), ("EURO", "eur", 2, " ₺"), ("GRAM ALTIN", "gram", 0, " ₺"), ("BIST 100", "bist", 0, ""), ("BRENT", "brent", 2, " $")]
    logo = Image.open(LOGO).convert("RGBA"); lh = 64; logo = logo.resize((round(logo.width * lh / logo.height), lh), Image.LANCZOS)
    d.rounded_rectangle([28, H - 112 + 14, 40 + logo.width + 12, H - 112 + 24 + lh + 10], radius=10, fill=(255, 255, 255))
    im.paste(logo, (40, H - 112 + 24), logo)
    bas_x = 40 + logo.width + 52; gen = (W - bas_x - 30) / len(kalem)
    for i, (ad, k, o, b) in enumerate(kalem):
        x = bas_x + i * gen; v = p.get(k)
        d.text((x, H - 92), ad, font=font(22, 700), fill=(150, 165, 190))
        if not v: continue
        deg = (v["f"] / v["o"] - 1) * 100; renk = (46, 204, 113) if deg >= 0 else (231, 76, 60)
        d.text((x, H - 62), tl(v["f"], o) + b, font=font(30, 800), fill="white")
        d.text((x + d.textlength(tl(v["f"], o) + b, font=font(30, 800)) + 12, H - 56), f"{'▲' if deg >= 0 else '▼'}%{tl(abs(deg))}", font=font(22, 700), fill=renk)
    zaman = datetime.now(TR)
    ay = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][zaman.month - 1]
    t = f"{zaman.day} {ay} {zaman.year} · {zaman:%H:%M}"
    ft = font(26, 700); d.text((W - 60 - d.textlength(t, font=ft), 70), t, font=ft, fill=(190, 200, 220))
    im.save(cikti, quality=92)


def grafik_karti(etiket, g, p, cikti):
    """Şablonun fotoğraf alanına (944×540) giren sade kart: yalnız piyasanın 5 günlük gidişatı (gerçek veri).
    Rakam YAZILMAZ: haber metnindeki fiyatla çelişip okuru şaşırtmasın."""
    KW, KH = 944, 540
    im = Image.new("RGB", (KW, KH), (14, 16, 24)); d = ImageDraw.Draw(im)
    for y in range(KH):
        k = y / KH; d.line([(0, y), (KW, y)], fill=(int(16 + 10 * k), int(18 + 8 * k), int(28 + 14 * k)))
    for y in range(140, KH - 40, 70): d.line([(40, y), (KW - 40, y)], fill=(34, 37, 50))
    g = g if g in ADLAR else grafik_sec(g)
    v = p.get(g)
    if v and len(v["seri"]) > 5:
        s = v["seri"]; lo, hi = min(s), max(s); hi = hi if hi > lo else lo + 1
        renk = (46, 204, 113) if s[-1] >= s[0] else (240, 70, 60)
        d.text((44, 40), ADLAR[g], font=font(44, 800), fill="white")
        d.text((KW - 44, 52), "son 5 günün seyri", font=font(30, 600), fill=(150, 155, 175), anchor="ra")
        x0, x1, y0, y1 = 44, KW - 44, 140, KH - 60
        pts = [(x0 + (x1 - x0) * i / (len(s) - 1), y1 - (y1 - y0) * (q - lo) / (hi - lo)) for i, q in enumerate(s)]
        kat = Image.new("RGBA", (KW, KH), (0, 0, 0, 0)); kd = ImageDraw.Draw(kat)
        kd.polygon(pts + [(x1, KH), (x0, KH)], fill=renk + (50,)); kd.line(pts, fill=renk + (255,), width=7, joint="curve")
        kd.ellipse([pts[-1][0] - 13, pts[-1][1] - 13, pts[-1][0] + 13, pts[-1][1] + 13], fill=renk + (255,))
        im.paste(kat, (0, 0), kat)
    im.save(cikti, quality=93)


def vurgula(baslik):
    """Başlıktaki ilk rakamlı ifadeyi *vurgu* yapar (şablonun sarı kutusu)."""
    m = re.search(r"(%\s?[\d.,]+|[\d.,]*\d[\d.,]*\s?(?:lira|TL|dolar|puan|bin|milyon|milyar|yüzde)?(?:'[a-zçğıöşü]+)?)", baslik)
    if m and len(m.group(0).strip()) >= 2: return baslik[:m.start()] + "*" + m.group(0).strip() + "*" + baslik[m.end():]
    return baslik


def kisalt(t, n=230):
    if len(t) <= n: return t
    c = re.split(r"(?<=[.!?])\s+", t); o = ""
    for x in c:
        if len(o) + len(x) + 1 > n: break
        o = (o + " " + x).strip()
    return o or t[:n].rsplit(" ", 1)[0] + "…"


# Şablon görünümü (kullanıcı 16 Kas: "büyük kaba olmasın, saat-tarih gerekmez"; 22 Kas: tarih eklensin, saat yok → sablona_bas dateShow açar) — BÜYÜK HARF yok, ölçülü boy
GORUNUM = {"autoPhoto": False, "photoH": 560, "frameW": 10, "dateShow": False, "titleUpper": False, "titleSize": 74, "titleWeight": "800", "bodySize": 44, "bodyWeight": "600"}


AY_ADLARI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
# Kullanıcı 22 Kas (editör incelemesi): sarı bant her habere "SON DAKİKA - ANLIK HABER - ÖZEL HABER" diyordu → okur gerçek son dakikayı ayırt edemiyor.
# Bant yalnız acil haberde (deprem, uyarı, kesinti, son dakika olayı: girdide "acil": true) olduğu gibi kalır; diğerlerinde bu yazı basılır.
BANT_NORMAL = "SERİK - ANTALYA - TÜRKİYE GÜNDEMİ"


def sablona_bas(baslik, govde, etiket, foto, cikti, grafik=None, p=None, temsili=False, sablon=None, acil=False):
    baslik, govde = baslik.replace("*", ""), govde.replace("*", "")  # kullanıcı 16 Kas: vurgulu renk OLMASIN
    G = {"title": baslik, "body": govde, "badgeText": etiket, "dateText": "", "ek": GORUNUM}
    if sablon: G["sablon"] = sablon  # viral.py: Antalya Haber Medya çerçevesi (masa/viral/sablon-ahm.html)
    else:
        # Kullanıcı 22 Kas: görsel günlerce paylaşılınca süreli haber (vezne saatleri vb.) yanlış bilgiye dönmesin → yalnız tarih (saat yok), etiketin yanında
        bugun = datetime.now(TR); G["dateText"] = f"{bugun.day} {AY_ADLARI[bugun.month - 1]} {bugun.year}"; G["ek"] = {**GORUNUM, "dateShow": True}
        if not acil: G["bant"] = BANT_NORMAL
    if foto:  # kırpmadan sığdırma + bulanık dolgu + "Temsili görsel" artık basıcıda, son çerçeve ölçüsüne göre yapılır
        G["foto"] = cikti.replace(".jpg", "-foto.jpg"); Image.open(foto).convert("RGB").save(G["foto"], quality=94); G["temsili"] = bool(temsili)
    elif grafik and p:  # grafik kartı 944×540; çerçeve yerleşime göre uzar
        G["foto"] = cikti.replace(".jpg", "-grafik.jpg"); grafik_karti(etiket, grafik, p, G["foto"]); G["dolgu"] = "kenar"  # çerçeve uzarsa kartın zemin rengiyle dolar
    gj = cikti.replace(".jpg", ".json"); json.dump(G, open(gj, "w", encoding="utf-8"), ensure_ascii=False)
    import subprocess
    r = subprocess.run(["node", "masa/gundem-ciz.mjs", gj, cikti], capture_output=True, text=True, encoding="utf-8", timeout=180)
    if r.returncode: raise RuntimeError("şablon çizimi: " + r.stderr.strip()[-500:])
    y = json.loads(r.stdout.strip().splitlines()[-1])["yerlesim"]
    sorun = yerlesim_denetimi(y)
    print(f"  yerleşim: başlık {y['baslikBoy']} px/{y['baslikSatir']} satır · metin {y['metinBoy']} px/{y['metinSatir']} satır · "
          f"son satır %{y['sonSatir']} · foto {y['foto']} px · boşluk {y['ustBosluk']} px -> {"KALDI: " + "; ".join(sorun) if sorun else "GEÇTİ"}")
    if sorun: raise RuntimeError("YERLEŞİM KALDI (" + baslik[:50] + "): " + "; ".join(sorun))
    return open(cikti.replace(".jpg", ".txt"), encoding="utf-8").read()


def yerlesim_denetimi(y):
    """Kullanıcı 16 Kas: 'yazılar şablona güzel sığsın, üstte fazla boşluk olmasın, haber metni okunur olsun, dengesiz paragraf olmasın;
    uyum ve görünürlük en önemli görev'. Basıcı en iyi düzeni arar; burada sınırlar zorlanır, geçmeyen gönderilmez."""
    s = []
    if y["ustBosluk"] > 60: s.append(f"üstte {y['ustBosluk']} px boşluk (metin çok kısa, bir cümle ekle)")
    if y["metinBoy"] < 40: s.append("metin yazısı çok küçük (kısalt)")
    if y["baslikSatir"] > 3: s.append(f"başlık {y['baslikSatir']} satır (en çok 3; kısalt)")
    if y["metinSatir"] > 7: s.append(f"metin {y['metinSatir']} satır (en çok 7; kısalt)")
    if y["metinSatir"] > 1 and y["sonSatir"] < 45: s.append(f"metnin son satırı kısa (%{y['sonSatir']}; cümleyi yeniden kur)")
    if y["tekKelime"]: s.append("bir satırda tek kelime kalıyor (yeniden yaz)")
    return s


def gonderilmis_mi(baslik):
    """22 Kas: "Asya Tohumculuk Kongresi Belek'te yapılacak" 19, 21 ve 22 Kas'ta; "Antalya'da 44 bin 819 ağaç…" aynı gün iki kez gitti.
    Gönderim kaydında (log.txt) son 3 günde aynı haber varsa döndürür."""
    gorulen = json.load(open(GORULEN, encoding="utf-8")) if os.path.exists(GORULEN) else []
    DF.clear()
    for g in gorulen:
        for s_ in kok(g["w"]): DF[s_] = DF.get(s_, 0) + 1
    w, simdi, es = kelimeler(baslik.replace("*", "")), datetime.now(), []
    rakam = set(re.findall(r"\d+(?:[.,]\d+)*", baslik))
    for sat in (open(LOG, encoding="utf-8", errors="ignore").readlines()[-1500:] if os.path.exists(LOG) else []):
        m = re.match(r"(\d\d)\.(\d\d) (\d\d):(\d\d) gönderildi .*\| (.+)$", sat.strip())
        if not m: continue
        try: z = datetime(simdi.year, int(m[2]), int(m[1]), int(m[3]), int(m[4]))
        except ValueError: continue
        r2 = set(re.findall(r"\d+(?:[.,]\d+)*", m[5]))
        if rakam and r2 and not (rakam & r2): continue  # rakamı değişmiş fiyat/sayı haberi (yeni altın fiyatı, yeni zam) yeni haberdir
        if timedelta(0) <= simdi - z <= timedelta(days=3) and ayni_haber(kelimeler(m[5]), w, z.timestamp()): es.append(f"{z:%d.%m %H:%M} {m[5]}")
    return es


# ---------------- 5) TELEGRAM ----------------
def gonder(paketler):
    """Kullanıcı 16 Kas: "haber gönderimi yaparken tek tek yapma" → turdaki tüm haberler TEK mesajda (Telegram albümü) gider.
    paketler: [(foto, yazi), ...]; her fotoğrafın kendi açıklaması albümde o fotoğrafın altında görünür. Ayrı belge mesajı YOK."""
    tok = env("TELEGRAM_BOT_TOKEN"); sahip = json.load(open("masa/telegram/durum.json", encoding="utf-8"))["sahip"]["chat"]
    for i in range(0, len(paketler), 10):  # Telegram albümü en fazla 10 fotoğraf
        grup = paketler[i:i + 10]
        if len(grup) == 1:
            with open(grup[0][0], "rb") as f:
                r = requests.post(f"https://api.telegram.org/bot{tok}/sendPhoto", data={"chat_id": sahip, "caption": grup[0][1][:1024]},
                                  files={"photo": ("gundem.jpg", f, "image/jpeg")}, timeout=120).json()
        else:
            dosyalar = {f"f{n}": (os.path.basename(p), open(p, "rb"), "image/jpeg") for n, (p, _) in enumerate(grup)}
            medya = [{"type": "photo", "media": f"attach://f{n}", "caption": y[:1024]} for n, (_, y) in enumerate(grup)]
            r = requests.post(f"https://api.telegram.org/bot{tok}/sendMediaGroup", data={"chat_id": sahip, "media": json.dumps(medya, ensure_ascii=False)},
                              files=dosyalar, timeout=180).json()
            for d in dosyalar.values(): d[1].close()
        if not r.get("ok"): raise RuntimeError(r)


def dosya_adi(b):
    t = b.lower()
    for a, c in zip("çğıöşüâî", "cgiosuai"): t = t.replace(a, c)
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:70]


def metin(url):
    """Haber sayfasındaki paragrafları düz metin olarak alır (Claude'un okuyup anlaşılır haber yazması için)."""
    try:
        h = requests.get(url, headers=UA, timeout=15).text
        h = re.sub(r"(?is)<(script|style|nav|footer|header|aside)[^>]*>.*?</\1>", " ", h)
        ps = [html.unescape(re.sub(r"<[^>]+>", "", p)).strip() for p in re.findall(r"(?is)<p[^>]*>(.*?)</p>", h)]
        ps = [re.sub(r"\s+", " ", p) for p in ps if len(p) > 60 and not re.search(r"çerez|cookie|abone ol|tüm hakları|copyright|reklam", p, re.I)]
        return "\n".join(ps)[:3500]
    except Exception:
        return ""


# ---- KESİNTİ NÖBETİ (kullanıcı 21 Kas: "elektrikler kesik Serik'te, bunu kaçırdın; böyle konular önemli") ----
# Her turda bugünün Serik elektrik/su kesintisi aranır; o gün gönderilmediyse adaylar.json'un EN BAŞINA "kesinti" adayı konur.
# RUTIN süzgeci "elektrik kesintisi" başlıklarını eliyordu; kesinti bu ayrı yoldan gelir.
KESINTI_DURUM = f"{KLASOR}/kesinti-durum.json"
AYLAR = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"]


def kesinti_gonderildi_mi():
    try: return json.load(open(KESINTI_DURUM, encoding="utf-8")).get("gun") == datetime.now().strftime("%Y-%m-%d")
    except Exception: return False


def kesinti_isaretle(G):
    m = (G.get("baslik", "") + " " + " ".join(G.get("kelimeler") or [])).lower()
    if "kesinti" in m and SERIK.search(m):
        json.dump({"gun": datetime.now().strftime("%Y-%m-%d"), "baslik": G.get("baslik")}, open(KESINTI_DURUM, "w", encoding="utf-8"), ensure_ascii=False)


def kesinti_ara():
    bugun = datetime.now(); gun_ay = f"{bugun.day} {AYLAR[bugun.month - 1]}"
    sonuc = {"elektrik": [], "su": []}
    for q in ["Serik elektrik kesintisi", f"{gun_ay} Antalya elektrik kesintisi", f"Antalya elektrik kesintisi {gun_ay} Serik"]:
        try:
            x = requests.get(f"{GN}/search?q={urllib.parse.quote(q + ' when:1d')}&hl=tr&gl=TR&ceid=TR:tr", headers=UA, timeout=20).content
            for it in ET.fromstring(x).iter("item"):
                b = html.unescape(it.findtext("title") or "")
                bl = (b.rsplit(" - ", 1)[0] if " - " in b else b).lower().replace("i̇", "i")  # site adı ("Antalya Hakkında") eşleşmesin
                tarihler = re.findall(r"\b(\d{1,2})[-/.](\d{1,2})[-/.]20\d\d", bl) + [(d, str(AYLAR.index(a) + 1)) for d, a in re.findall(r"\b(\d{1,2}) (" + "|".join(AYLAR) + r")", bl)]
                if any((int(d), int(a)) != (bugun.day, bugun.month) for d, a in tarihler): continue  # başka günün kesintisi
                baska_ilce = re.search(r"manavgat|alanya|gündoğmuş|kemer|kumluca|finike|kaş|gazipaşa|elmalı|korkuteli|akseki|ibradı|demre|kepez|konyaaltı|muratpaşa|döşemealtı|aksu", bl) and not SERIK.search(bl)
                if re.search(r"elektrik", bl) and re.search(r"kesinti|kesil", bl) and not baska_ilce and (SERIK.search(bl) or ((re.search(r"antalya", bl) or (tarihler and "ilçe" in bl and not re.search(r"aydın|mersin|konya|izmir|muğla|denizli|burdur|isparta|ısparta|adana|istanbul|ankara|bursa|karaman|hatay", bl)))
                                                                                                     and (tarihler or "bugün" in bl or "ilçe" in bl))):
                    if all(b != s["baslik"] for s in sonuc["elektrik"]):
                        sonuc["elektrik"].append({"baslik": b, "url": it.findtext("link")})
        except Exception as e:
            log("kesinti RSS hata", q, e)
    try:  # ASAT planlı su kesintisi
        t = requests.get("https://kesinti.asat.gov.tr/dbo_kesintiListe/list", headers=UA, timeout=20).content.decode("windows-1254", "ignore")
        for s in re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", t, re.I):
            h = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", c).replace("&nbsp;", " ")).strip() for c in re.findall(r"<td[^>]*>([\s\S]*?)</td>", s, re.I)]
            h = [c for c in h if c]
            if len(h) >= 3 and SERIK.search(" ".join(h)): sonuc["su"].append(" | ".join(h))
    except Exception as e:
        log("ASAT hata", e)
    return sonuc


def aday_komutu():
    """En iyi 5 kümeyi, her biri için asıl bağlantı + özet + metin ile masa/gundem/adaylar.json'a yazar."""
    gorulen = json.load(open(GORULEN, encoding="utf-8")) if os.path.exists(GORULEN) else []
    DF.clear()
    for g in gorulen:
        for s in kok(g["w"]): DF[s] = DF.get(s, 0) + 1
    sinir = time.time() - 3 * 86400; gorulen = [g for g in gorulen if g["t"] > sinir]
    SON_KOK.clear()
    simdi = datetime.now()
    for sat in (open(LOG, encoding="utf-8", errors="ignore").readlines()[-400:] if os.path.exists(LOG) else []):
        m = re.match(r"(\d\d)\.(\d\d) (\d\d):(\d\d) gönderildi .*\| (.+)$", sat.strip())
        if not m: continue
        try: z = datetime(simdi.year, int(m[2]), int(m[1]), int(m[3]), int(m[4]))
        except ValueError: continue
        if timedelta(0) <= simdi - z <= timedelta(hours=12):
            for s_ in {s for s in kok(kelimeler(m[5])) if len(s) >= 4 and not s.isdigit() and s not in GENEL_KOK}: SON_KOK[s_] = SON_KOK.get(s_, 0) + 1
    kumeler = [k for k in kumele(topla()) if len(k["w"]) >= 3]
    sirali = [a for a in sorted(((puanla(k, gorulen), k) for k in kumeler), key=lambda x: -x[0]) if a[0] > 0]
    # 21 Kas: elenen adaylar `atla` edilmeyince her turda aynı 8 haber geri geliyor, yenilere yer kalmıyordu (13:04 → 14:30 hiç gönderim yok).
    # Kural: 2 turda listeye girip gönderilmeyen haber 3. turdan itibaren listeye alınmaz (12 saat). Gönderilen zaten gorulen'e girer.
    gos = json.load(open(GOSTERILEN, encoding="utf-8")) if os.path.exists(GOSTERILEN) else []
    gos = [g for g in gos if g["t"] > time.time() - 12 * 3600]
    def gosterim(w):
        for g in gos:
            gw = set(g["w"])
            if len(gw & w) / max(1, min(len(gw), len(w))) >= 0.6: return g
    sirali = [a for a in sirali if not ((g := gosterim(a[1]["w"])) and g["n"] >= 2)]
    # teknoloji/bilim için 2 yer ayır (kullanıcı 20 Kas): ekonomi ve gündem listeyi tek başına doldurmasın
    tb = [a for a in sirali if any(o["tur"] in ("bilim", "teknoloji") for o in a[1]["o"]) and etiket_sec(" ".join(o["b"] for o in a[1]["o"])) in ("BİLİM", "TEKNOLOJİ")][:2]
    # sağlığa 1 yer (kullanıcı 21 Kas)
    tb += [a for a in sirali if a not in tb and any(o["tur"] == "saglik" for o in a[1]["o"]) and etiket_sec(" ".join(o["b"] for o in a[1]["o"])) == "SAĞLIK"][:1]
    # ekonomi için de 3 yer ayır (kullanıcı 21 Kas: "ekonomi haberleri önemli, listenin dışında kalmasın")
    eko = [a for a in sirali if a not in tb and (any(o["tur"] == "ekonomi" for o in a[1]["o"]) or EKO.search(" ".join(o["b"] for o in a[1]["o"])))][:3]
    # 21 Kas: 8 kişilik listede kontenjanlar (tekno 2 + sağlık 1 + eko 3) 6 yer tutuyor, Serik/Antalya/gündeme 2 yer kalıyordu → liste 12, en az 6 yer puana göre serbest
    aday = tb + eko + [a for a in sirali if a not in tb and a not in eko][:max(10, 20 - len(tb) - len(eko))]  # 22 Kas gece: 15 → 20 (saatte bir tur, 4–5'lik albüm); önce 12 → 15 (doğrudan kaynaklarla havuz büyüdü)
    aday.sort(key=lambda x: -x[0])
    for _, k in aday:
        g = gosterim(k["w"])
        if g: g["n"] += 1
        else: gos.append({"t": time.time(), "n": 1, "w": sorted(k["w"])})
    json.dump(gos, open(GOSTERILEN, "w", encoding="utf-8"), ensure_ascii=False)
    cikis = []
    for n, (pu, k) in enumerate(aday):
        temsil = max(k["o"], key=lambda o: (bool(BUYUK_KAYNAK.search(o["k"])), o["kume"], len(o["b"]) < 110, -len(o["b"])))
        a = {"no": n + 1, "puan": round(pu), "baslik": temsil["b"], "diger_basliklar": sorted({o["b"] for o in k["o"]} - {temsil["b"]})[:5],
             "kaynaklar": sorted({o["k"] for o in k["o"] if o["k"]}), "etiket_onerisi": etiket_sec(" ".join(o["b"] for o in k["o"])),
             "grafik_onerisi": grafik_sec(" ".join(o["b"] for o in k["o"])), "url": temsil["l"], "ozet": "", "metin": "", "kelimeler": sorted(k["w"]), "bolge": "SERİK ÇEVRESİ" if SERIK.search(" ".join(o["b"] for o in k["o"])) else "ANTALYA" if ANTALYA.search(" ".join(o["b"] for o in k["o"])) else "TÜRKİYE"}
        dogrudan = [o for o in k["o"] if o["l"] and "news.google" not in o["l"]]
        if dogrudan:  # 22 Kas: haber sitesinin kendi bağlantısı varsa Google'a hiç gitme; her adayın metni dolu gelsin
            for o in dogrudan[:2]:
                a["url"] = o["l"]; a["ozet"] = ozet(o["l"]); a["metin"] = metin(o["l"])
                if a["metin"] or a["ozet"]: break
        elif n < 3:  # Google 429 vermesin diye yalnız ilk 3'ü çöz
            for o in sorted(k["o"], key=lambda o: (o is not temsil, not BUYUK_KAYNAK.search(o["k"])))[:2]:
                u = gn_coz(o["l"]); time.sleep(1.5)
                if "news.google.com" in u: continue
                a["url"] = u; a["ozet"] = ozet(u); a["metin"] = metin(u)
                if a["metin"] or a["ozet"]: break
        cikis.append(a)
    if not kesinti_gonderildi_mi():
        ks = kesinti_ara()
        if ks["elektrik"] or ks["su"]:
            cikis.insert(0, {"no": 0, "puan": 999, "kesinti": ks, "bolge": "SERİK ÇEVRESİ", "etiket_onerisi": "SERİK",
                             "baslik": "⚡ BUGÜN SERİK KESİNTİSİ — ÖNCELİKLİ, bu turda MUTLAKA gönder (GUNDEM.md 'KESİNTİ NÖBETİ')",
                             "url": (ks["elektrik"][0]["url"] if ks["elektrik"] else ""), "kaynaklar": [], "metin": "", "ozet": "", "kelimeler": ["serik", "kesinti", "elektrik", "su"]})
            print("⚡ KESİNTİ NÖBETİ: bugün Serik kesintisi henüz gönderilmedi →")
            for e in ks["elektrik"][:6]: print("   ELEKTRİK:", e["baslik"], "·", e["url"][:90])
            for s in ks["su"][:6]: print("   SU (ASAT):", s[:160])
    for d in deprem_ara():  # UYARI NÖBETİ: deprem (AFAD)
        cikis.insert(0, {"no": 0, "puan": 998, "deprem": d, "bolge": "ANTALYA" if d["yakin"] else "TÜRKİYE", "etiket_onerisi": "SON DAKİKA",  # şablonda var (gundem-ciz.mjs BADGES)
                         "baslik": f"🌍 DEPREM {d['buyukluk']:.1f} · {d['yer']} · {d['saat_tsi']} (TSİ) — ÖNCELİKLİ (GUNDEM.md 'UYARI NÖBETİ')",
                         "url": d["url"], "kaynaklar": ["AFAD"], "metin": "", "ozet": "", "kelimeler": ["deprem", "afad"] + sorted(kelimeler(d["yer"]))})
        print(f"🌍 UYARI NÖBETİ: AFAD {d['buyukluk']} {d['yer']} {d['saat_tsi']} TSİ, derinlik {d['derinlik_km']} km")
    json.dump(cikis, open(f"{KLASOR}/adaylar.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for a in cikis:
        print(f"#{a['no']} [{a['puan']}] {a['bolge']} · {a['etiket_onerisi']} · {a['baslik']} · {len(a['kaynaklar'])} kaynak · metin {len(a['metin'])} kr · {a['url'][:90]}")
    if not cikis: print("uygun yeni haber yok")


def bas_komutu(girdiler):
    """Claude'un yazdığı haberleri şablona basar, hepsini TEK albüm hâlinde Telegram'a gönderir.
    girdi.json: {baslik, govde, etiket, aciklama, kaynak_url, kaynaklar[], kelimeler[], foto?: yol, temsili?: bool, grafik?: usd|eur|gram|bist|brent|btc}"""
    GS = [json.load(open(g, encoding="utf-8")) for g in girdiler]
    sorunlar = []
    for G in GS:
        if not G.get("guncelleme") and not G.get("acil") and (e := gonderilmis_mi(G["baslik"])):
            sorunlar.append(f"DAHA ÖNCE GÖNDERİLDİ ({G['baslik'][:50]}): {' / '.join(e[-2:])} — gerçekten yeni gelişmeyse girdiye \"guncelleme\": true koy ve başlıkta yeniliği söyle")
    if sorunlar: raise SystemExit(chr(10).join(sorunlar))
    p = piyasa() if any(G.get("grafik") for G in GS) else None
    paketler = []
    for n, G in enumerate(GS):
        cikti = f"{KLASOR}/{datetime.now(TR):%Y%m%d-%H%M}-{n + 1}-{dosya_adi(G['baslik'].replace('*', ''))}.jpg"
        sablona_bas(G["baslik"], G["govde"], G["etiket"], G.get("foto"), cikti, G.get("grafik"), p, G.get("temsili", False), acil=bool(G.get("acil")))
        yazi = G["aciklama"].strip() + "\n\n— — —\nKaynak: " + ", ".join(G.get("kaynaklar", [])[:4]) + "\n" + G.get("kaynak_url", "")
        paketler.append((cikti, yazi))
    if "--dene" in ARG:
        import shutil
        for n, (c, y) in enumerate(paketler):
            shutil.copy(c, f"{KLASOR}/son{'' if n == 0 else n + 1}.jpg"); print(c); print(y); print()
        return
    gonder(paketler)
    gorulen = json.load(open(GORULEN, encoding="utf-8")) if os.path.exists(GORULEN) else []
    for G, (c, _) in zip(GS, paketler):
        gorulen.append({"t": time.time(), "b": G["baslik"], "w": G.get("kelimeler") or sorted(kelimeler(G["baslik"]))})
        log("gönderildi", c, "|", G["baslik"])
        kesinti_isaretle(G)
    json.dump(gorulen, open(GORULEN, "w", encoding="utf-8"), ensure_ascii=False)
    log(f"tek mesajda {len(paketler)} haber")


def atla_komutu(no):
    """Seçilmeyen ama bir daha gelmesin istenen adayı görüldü say."""
    a = next(x for x in json.load(open(f"{KLASOR}/adaylar.json", encoding="utf-8")) if x["no"] == int(no))
    gorulen = json.load(open(GORULEN, encoding="utf-8")) if os.path.exists(GORULEN) else []
    gorulen.append({"t": time.time(), "b": a["baslik"], "w": a["kelimeler"]}); json.dump(gorulen, open(GORULEN, "w", encoding="utf-8"), ensure_ascii=False)
    print("atlandı:", a["baslik"])


def foto_komutu(url, cikti):
    """Haber sayfasının kendi ana fotoğrafını (og:image / twitter:image) indirir. Kullanıcı 16 Kas: "gerekirse fotoğrafları haberin içinden al"."""
    h = requests.get(url, headers=UA, timeout=20).text
    m = None
    for ad in ("og:image", "twitter:image", "og:image:url"):
        m = (re.search(r'<meta[^>]+(?:property|name)=["\']' + ad + r'["\'][^>]+content=["\']([^"\']+)', h, re.I)
             or re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']' + ad + r'["\']', h, re.I))
        if m: break
    if not m: raise SystemExit("sayfada og:image yok — Chrome'da haberin ana fotoğrafının src'sini al ve: python masa/gundem.py foto <resim-url> <cikti>")
    u = urllib.parse.urljoin(url, html.unescape(m.group(1)))
    r = requests.get(u, headers={**UA, "Referer": url}, timeout=30); r.raise_for_status()
    open(cikti, "wb").write(r.content)
    im = Image.open(cikti); print(cikti, im.size, u)
    if im.width < 800: print("UYARI: fotoğraf küçük (<800 px), şablonda bulanık görünebilir")


def foto_ara(urller, kisa):
    """FOTOĞRAF ARAŞTIRMASI (kullanıcı 16 Kas: "araştırıp haberle ilgili fotoğraf bulma kabiliyetin olsun, direk temsili çözüm olmasın").
    Verilen haber sayfalarının (aynı haberi yazan birden çok site olabilir) içindeki TÜM fotoğrafları toplar: og:image, twitter:image,
    <img src / data-src / srcset>, galeri. Logo/ikon/küçükleri eler, en büyük 12'sini indirir ve masa/gundem/foto/<kisa>-kontak.jpg
    kontak sayfası yapar (numaralı). Claude kontak sayfasına Read ile bakıp haberi en iyi anlatanı seçer: masa/gundem/foto/<kisa>-<n>.jpg"""
    adaylar = []
    for url in urller:
        try:
            h = requests.get(url, headers=UA, timeout=20).text
        except Exception as e:
            print("açılamadı", url, e); continue
        Q, NQ = "[\"']", "[^\"']"
        bul = re.findall(r"<meta[^>]+content=" + Q + "(" + NQ + r"+\.(?:jpe?g|png|webp)" + NQ + "*)" + Q, h, re.I)
        bul += re.findall(r"(?:src|data-src|data-original|data-lazy-src)=" + Q + "(" + NQ + r"+\.(?:jpe?g|png|webp)" + NQ + "*)" + Q, h, re.I)
        for ss in re.findall(r"srcset=" + Q + "(" + NQ + "+)" + Q, h, re.I):
            bul += [x.strip().split(" ")[0] for x in ss.split(",")]
        for u in bul:
            u = urllib.parse.urljoin(url, html.unescape(u))
            if re.search(r"logo|icon|favicon|avatar|sprite|(?<![a-z])banner|reklam|(?<![a-z])ads?[/_-]|placeholder|weather|amp-logo|/assets/|emoji|(?<!\d)1x1(?!\d)|pixel", u, re.I): continue
            if u not in [a[0] for a in adaylar]: adaylar.append((u, url))
    print(len(adaylar), "aday fotoğraf bağlantısı")
    inen = []
    for u, kaynak in adaylar[:60]:
        try:
            r = requests.get(u, headers={**UA, "Referer": kaynak}, timeout=20)
            if r.status_code != 200 or len(r.content) < 15000: continue
            from io import BytesIO
            im = Image.open(BytesIO(r.content)).convert("RGB")
            if im.width < 500 or im.width / im.height < 1.1: continue  # yatay ve yeterince büyük olsun
            inen.append((im.width * im.height, im, u))
        except Exception:
            continue
    # aynı fotoğrafın farklı boyutlarını tekle (küçük önizleme benzerliği)
    tekil = []
    for alan, im, u in sorted(inen, key=lambda x: -x[0]):
        k = im.resize((16, 9)).convert("L"); v = list(k.get_flattened_data()) if hasattr(k, "get_flattened_data") else list(k.getdata())
        if any(sum(abs(a - b) for a, b in zip(v, t[3])) < 16 * 9 * 12 for t in tekil): continue
        tekil.append((alan, im, u, v))
    tekil = tekil[:12]
    if not tekil: print("fotoğraf bulunamadı"); return
    os.makedirs(f"{KLASOR}/foto", exist_ok=True)
    TW, TH = 480, 270; kontak = Image.new("RGB", (TW * 3, TH * ((len(tekil) + 2) // 3)), (20, 20, 20)); d = ImageDraw.Draw(kontak)
    for n, (alan, im, u, _) in enumerate(tekil, 1):
        yol = f"{KLASOR}/foto/{kisa}-{n}.jpg"; im.save(yol, quality=93)
        t = im.copy(); t.thumbnail((TW, TH)); x, y = ((n - 1) % 3) * TW, ((n - 1) // 3) * TH
        kontak.paste(t, (x + (TW - t.width) // 2, y + (TH - t.height) // 2))
        d.rectangle([x, y, x + 120, y + 40], fill=(211, 18, 47)); d.text((x + 10, y + 6), f"{n}  {im.width}", font=font(24, 800), fill="white")
        print(f"{n}: {im.width}x{im.height} {u[:110]}")
    kontak.save(f"{KLASOR}/foto/{kisa}-kontak.jpg", quality=85); print("KONTAK:", f"{KLASOR}/foto/{kisa}-kontak.jpg")


def foto_dogrudan(u, cikti):
    r = requests.get(u, headers=UA, timeout=30); r.raise_for_status(); open(cikti, "wb").write(r.content); print(cikti, Image.open(cikti).size)


def gorulen_mi_komutu(baslik):
    """22 Kas: X'te yükselen haberi albüme koymadan önce: son 3 günde gönderilmiş/atlanmış bir haberle aynı mı?"""
    gorulen = json.load(open(GORULEN, encoding="utf-8")) if os.path.exists(GORULEN) else []
    DF.clear()
    for g in gorulen:
        for s in kok(g["w"]): DF[s] = DF.get(s, 0) + 1
    w = kelimeler(baslik)
    es = [g for g in gorulen if g["t"] > time.time() - 3 * 86400 and ayni_haber(g["w"], w, g["t"])]
    if es: print("GÖNDERİLMİŞ:", " / ".join(f'{datetime.fromtimestamp(g["t"], TR):%d.%m %H:%M} {g["b"]}' for g in es[-3:]))
    else: print("YENİ")


def yukselen_zamani_komutu():
    """22 Kas: X yükselen taraması her turda değil, 40 dakikada bir (EVET ise zamanı kaydeder)."""
    f = f"{KLASOR}/yukselen-zaman.json"
    son = json.load(open(f)) if os.path.exists(f) else 0
    if time.time() - son >= 39 * 60: json.dump(time.time(), open(f, "w")); print("EVET")
    else: print("HAYIR")


def bekleyen_komutu():
    """22 Kas gece (kullanıcı: "tek tek gönderiyor, 4-5 halinde her turda göndersin"; "saatte bire çekme"):
    tur 20 dakikada bir kalır; hazırlanan haberler masa/gundem/bekleyen/ içinde birikir, 4'e ulaşınca
    (ya da en eskisi 40 dk beklediyse / son gönderimden 60 dk geçtiyse / acil haber varsa) hepsi tek albümde gider."""
    d = f"{KLASOR}/bekleyen"; os.makedirs(d, exist_ok=True)
    fs = sorted((os.path.join(d, f) for f in os.listdir(d) if f.endswith(".json")), key=os.path.getmtime)
    simdi = time.time()
    son_gonderim = None
    lf = f"{KLASOR}/log.txt"
    if os.path.exists(lf):
        for s in reversed(open(lf, encoding="utf-8", errors="ignore").read().splitlines()[-400:]):
            m = re.match(r"(\d\d)\.(\d\d) (\d\d):(\d\d) tek mesajda", s)
            if m:
                t = datetime(datetime.now(TR).year, int(m[2]), int(m[1]), int(m[3]), int(m[4]), tzinfo=TR)
                son_gonderim = (datetime.now(TR) - t).total_seconds() / 60; break
    acil = False
    for f in fs:
        G = json.load(open(f, encoding="utf-8"))
        yas = (simdi - os.path.getmtime(f)) / 60
        acil = acil or bool(G.get("acil"))
        print(f"  {f.replace(os.sep, '/')}  ({yas:.0f} dk)  {'ACİL ' if G.get('acil') else ''}{G.get('baslik', '')}"
              + ("  ⚠ 2 saati geçti, hâlâ güncel mi bak" if yas > 120 else ""))
    n = len(fs)
    en_eski = (simdi - os.path.getmtime(fs[0])) / 60 if fs else 0
    neden = ("4+ haber birikti" if n >= 4 else "acil haber var" if acil else
             f"en eskisi {en_eski:.0f} dk bekledi" if n and en_eski >= 40 else
             f"son gönderimden {son_gonderim:.0f} dk geçti" if n and son_gonderim is not None and son_gonderim >= 60 else "")
    if n and neden:
        print(f"KARAR: GÖNDER ({n} haber; {neden}) → python masa/gundem.py bas " + " ".join(f.replace(os.sep, '/') for f in fs[:6]) + " [--dene]")
    else:
        print(f"KARAR: BEKLE ({n} haber hazır; 4'e ulaşınca ya da en eskisi 40 dk olunca gider)")
    log(f"bekleyen: {n} haber, {'GÖNDER' if n and neden else 'BEKLE'}")


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    try:
        if a and a[0] == "aday": aday_komutu()
        elif a and a[0] == "bas": bas_komutu(a[1:])
        elif a and a[0] == "atla": atla_komutu(a[1])
        elif a and a[0] == "foto-ara": foto_ara(a[2:], a[1])
        elif a and a[0] == "foto": (foto_dogrudan if re.search(r"\.(jpe?g|png|webp)(\?|$)", a[1], re.I) else foto_komutu)(a[1], a[2])
        elif a and a[0] == "gorulen-mi": gorulen_mi_komutu(" ".join(a[1:]))
        elif a and a[0] == "yukselen-zamani": yukselen_zamani_komutu()
        elif a and a[0] == "bekleyen": bekleyen_komutu()
        else: print("komut: aday | bas <girdi.json> [--dene] | atla <no> | gorulen-mi <başlık> | yukselen-zamani | bekleyen")
    except Exception as e:
        log("HATA", repr(e)); raise
