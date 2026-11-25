# @antalyahabermedya gönderi görseli basıcı (25 Kas 2026). Sayfanın kendi şablonu: sablon.html (1080x1350, 4:5).
# Kullanım (serik-haberleri/ klasöründen):
#   python masa/radar/ahm/bas.py <veri.json> [cikti.jpg]
# veri.json: {"foto": "masa/radar/ahm/foto/x.png", "kaynak": "chatgpt", "aci": "ajans önden geniş, biz arkadan yakın", "baslik": "Muş'ta köyün tek öğrencisi öğretmenine **tavuk hediye etti**",
#             "etiket": "EĞİTİM" (isteğe bağlı), "alt": "küçük alt satır" (isteğe bağlı), "ek_foto": "yuvarlak ek kare" (isteğe bağlı)}
# Başlıkta **…** sarı vurgu kutusu olur (sayfa kalıbı: her gönderide tam bir vurgu). Render: video/motion/render.mjs --denetle
# (yazı çakışması/kontrast/kesik yazı denetimi). Çıkış kodu 1 = KAPI KALDI, görsel gönderilmez.
#   python masa/radar/ahm/bas.py --denetle "başlık **vurgu**" "alt satır"   → yalnız başlık denetimi
import json, os, re, subprocess, sys, tempfile
from PIL import Image

KOK = os.path.dirname(os.path.abspath(__file__))
SH = os.path.abspath(os.path.join(KOK, "..", "..", ".."))
R = os.path.join(SH, "video", "motion", "render.mjs")


BOS_KANCA = re.compile(r"(?i)\b(şok|flaş|bomba|bakın|işte|o anlar|görenler|herkes şaşırdı|inanamadı|ortalık karıştı|sosyal medya(yı)? sall)")


def _kelimeler(s):
    return [w for w in re.findall(r"[\wçğıöşüÇĞİÖŞÜâîû']+", s.lower()) if len(w) > 2]


def baslik_denetle(baslik, alt):
    """Sayfanın tutan başlık kalıbı (25 Kas, @antalyahabermedya son 14 gönderisi; kullanıcı: "konu başlıkları düzgün,
    doyurucu, dikkat çekici olmalı"). Kalıp: [yer/özne + bağlam] **[can alıcı eylem/rakam]** + alt satırda başlıkta
    olmayan doyurucu ayrıntı. Örnek: "Antalya'daki iki eve **şehit ateşi düştü**" / "Eskişehir'de eğitim uçuşu sırasında
    askeri helikopter kaza kırıma uğradı." Dönüş: hata listesi (boşsa GEÇTİ)."""
    h = []
    if baslik.count("**") != 2:
        return ["başlıkta tam bir **vurgu** olmalı (sayfa kalıbı)"]
    # 25 Kas (kullanıcı: "renk çizgisi doğru kelimeleri işaretlemeli, biri aşağıda diğeri yukarıda olmamalı"):
    # satır kırılımını editör verir: "1. satır beyaz bağlam | **vurgu** (+ kısa devam)". Kendiliğinden kırılma yok.
    st = [x.strip() for x in baslik.split("|")]
    if len(st) != 2 or not all(st):
        h.append('başlık "|" ile tam İKİ satıra bölünmeli: "Bağlam satırı | **can alıcı kısım** …"')
    elif not st[1].startswith("**"):
        h.append("2. satır sarı vurguyla başlamalı (sayfa kalıbı: \"Antalya'daki iki eve | **şehit ateşi düştü**\")")
    if len(st) == 2:
        for i, x in enumerate(st, 1):   # Poppins Bold ~0,56 em/harf: 31 harf 892 px'e ~52 px'te sığar; sayfada satır ~22–30 harf
            n = len(x.replace("**", ""))
            if not 14 <= n <= 31: h.append(f"{i}. satır {n} karakter (14–31; uzunsa punto küçülür ya da taşar)")
    baslik = baslik.replace("|", " ")
    duz = re.sub(r"\s+", " ", baslik.replace("**", "")).strip()
    vurgu = re.search(r"\*\*(.+?)\*\*", baslik).group(1).strip()
    alt = (alt or "").replace("|", " ")
    nk = len(duz.split())
    if not 32 <= len(duz) <= 70: h.append(f"başlık {len(duz)} karakter (32–70: iki dolu satır)")
    if not 5 <= nk <= 11: h.append(f"başlık {nk} kelime (5–11)")
    if not 1 <= len(vurgu.split()) <= 5: h.append(f"vurgu {len(vurgu.split())} kelime (1–5: yalnız can alıcı kısım)")
    if len(vurgu) > 0.6 * len(duz): h.append("vurgu başlığın çoğunu kaplıyor; yalnız sürpriz eylem/rakamı vurgula")
    if re.match(r'^[\s"“”\'‘’«]', vurgu) or re.match(r'^[\s"“”\'‘’«]', duz):
        h.append("vurgu/başlık alıntıyla başlıyor: okur kimin, ne yaptığını anlamıyor (Erzincan dersi); olayı söyle, alıntıyı alt satıra koy")
    if re.search(r"[!?]", duz): h.append("başlıkta ünlem/soru var")
    if re.search(r"(:|\.\.\.|…)\s*$", duz): h.append("başlık iki nokta/üç noktayla bitiyor; cümleyi tamamla")
    if BOS_KANCA.search(duz): h.append(f"boş merak/klişe sözcük: {BOS_KANCA.search(duz).group(0)}")
    if not re.search(r"(dı|di|du|dü|tı|ti|tu|tü|ıyor|iyor|uyor|üyor|acak|ecek|mış|miş|muş|müş|ldı|ldi|du|oldu|[0-9])\b", duz.lower()) and ":" not in duz:
        h.append("başlıkta yüklem/rakam yok: kim NE YAPTI belli değil")
    a = (alt or "").replace("**", "").strip()
    if not a:
        h.append('"alt" satırı yok: sayfada başlığın altında başlıkta olmayan doyurucu ayrıntı var (nerede/nasıl/sonuç/rakam), 30–120 karakter')
    else:
        if not 30 <= len(a) <= 120: h.append(f"alt satır {len(a)} karakter (30–120, en çok 2 satır)")
        if re.search(r"[!?]", a): h.append("alt satırda ünlem/soru var")
        bk, ak = set(_kelimeler(duz)), _kelimeler(a)
        if ak and sum(w in bk for w in ak) / len(ak) > 0.5: h.append("alt satır başlığı tekrar ediyor; YENİ bilgi ver (yer, nasıl, sonuç, rakam, kim)")
    return h


def bas(veri, cikti):
    v = dict(veri)
    # TELİF (kullanıcı 25 Kas, "en önemli kısım"): şablona yalnız ChatGPT'de sıfırdan, haber fotoğrafından FARKLI açıyla üretilmiş görsel girer.
    if v.get("kaynak") != "chatgpt" or len(str(v.get("aci", "")).strip()) < 10:
        raise SystemExit('TELİF: "kaynak": "chatgpt" ve "aci" (haber fotoğrafından nasıl farklı) zorunlu; haber/ajans fotoğrafı şablona konmaz')
    for k in ("foto", "ek_foto"):
        if v.get(k) and not os.path.abspath(v[k] if os.path.isabs(v[k]) else os.path.join(SH, v[k])).startswith(os.path.join(KOK, "foto")):
            raise SystemExit(f"TELİF: {k} masa/radar/ahm/foto/ içinde olmalı (ChatGPT çıktısı oraya indirilir)")
    for k in ("kaynak", "aci"): v.pop(k, None)
    hata = baslik_denetle(v.get("baslik", ""), v.get("alt", ""))
    if hata: raise SystemExit("BAŞLIK KALDI:\n  - " + "\n  - ".join(hata))
    for k in ("foto", "ek_foto"):
        if v.get(k):
            p = v[k] if os.path.isabs(v[k]) else os.path.join(SH, v[k])
            if not os.path.exists(p): raise SystemExit(f"{k} yok: {p}")
            v[k] = "file:///" + os.path.abspath(p).replace("\\", "/")
    html = open(os.path.join(KOK, "sablon.html"), encoding="utf-8").read()
    html = html.replace("<script>\nconst V", "<script>window.VERI = " + json.dumps(v, ensure_ascii=False) + ";</script>\n<script>\nconst V", 1)
    gec = os.path.join(KOK, "_bas.html"); open(gec, "w", encoding="utf-8").write(html)
    png = os.path.join(tempfile.gettempdir(), "ahm_bas.png")
    r = subprocess.run(["node", R, gec, png, "--kare", "0", "--w", "1080", "--h", "1350", "--denetle"], capture_output=True, text=True, encoding="utf-8", errors="replace")
    print((r.stdout + r.stderr).strip().splitlines()[-1] if (r.stdout + r.stderr).strip() else "")
    Image.open(png.replace(".png", "_0.00.png")).convert("RGB").save(cikti, quality=93)
    return r.returncode == 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if sys.argv[1] == "--denetle":
        hata = baslik_denetle(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "")
        print("BAŞLIK GEÇTİ" if not hata else "BAŞLIK KALDI:\n  - " + "\n  - ".join(hata))
        sys.exit(0 if not hata else 1)
    veri =json.load(open(sys.argv[1], encoding="utf-8"))
    cikti = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(sys.argv[1])[0] + ".jpg"
    ok = bas(veri, cikti)
    print(("YERLEŞİM GEÇTİ → " if ok else "YERLEŞİM KALDI → ") + cikti)
    sys.exit(0 if ok else 1)
