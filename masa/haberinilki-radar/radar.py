# -*- coding: utf-8 -*-
"""@haberinilki ERKEN HABER RADARI — durum, puanlama, taslak kontrolü ve Telegram gönderimi.

Kullanım (serik-haberleri klasöründen):
  python -I masa/haberinilki-radar/radar.py hazirlik            -> saat, since_time, açılacak X arama adresleri, genç anlık görüntüler
  python -I masa/haberinilki-radar/radar.py isle [aday.json]    -> adayları puanla, ilk 10'u snapshots.json'a yaz (arg yoksa İndirilenler'deki en yeni hir-aday-*.json)
  python -I masa/haberinilki-radar/radar.py takipci <handle> <sayı>   -> takipçi önbelleği (puanlama için)
  python -I masa/haberinilki-radar/radar.py izle-ekle <handle> <kategori> "<not>"
  python -I masa/haberinilki-radar/radar.py izle-sil <handle>
  python -I masa/haberinilki-radar/radar.py kontrol <secim.json> -> metin kurallarını denetle, paylaş bağlantılarını yaz (göndermez)
  python -I masa/haberinilki-radar/radar.py gonder <secim.json>  -> kontrol + görsel etiketi + Telegram + reported.txt
  python -I masa/haberinilki-radar/radar.py perf <perf.json>     -> paylaşılan seçimlerin etkileşimini performance.json'a işle
  python -I masa/haberinilki-radar/radar.py perf-ozet            -> konu/kaynak türüne göre ortalama; günde bir içgörü hakkı var mı

secim.json: {"secimler": [{"kaynak_url": "https://x.com/u/status/1", "yazar": "u", "takipci": 1234,
              "metin": "🚨 SON DAKİKA | ...\\n...", "neden": "tek satır: neden yükseliyor",
              "konu": "deprem", "kaynak_turu": "resmi|ajans|muhabir|yerel|nis|genel",
              "antalya": false, "gorsel_ham": "masa/haberinilki-radar/images/raw/x.png" (isteğe bağlı)}]}
"""
import json, math, os, re, sys, glob, shutil, subprocess, urllib.parse
from datetime import datetime, timedelta, timezone

KOK = os.path.dirname(os.path.abspath(__file__))
TSI = timezone(timedelta(hours=3))
F = lambda ad: os.path.join(KOK, ad)
IZLE, SNAP, REP, PERF, TAKIPCI = F("watchlist.json"), F("snapshots.json"), F("reported.txt"), F("performance.json"), F("takipci.json")
os.makedirs(F("images/raw"), exist_ok=True)
os.makedirs(F("tmp"), exist_ok=True)


def oku(yol, vars_):
    try:
        with open(yol, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return vars_


def yaz(yol, veri):
    tmp = yol + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(veri, f, ensure_ascii=False, indent=1)
    os.replace(tmp, yol)


def simdi():
    return datetime.now(timezone.utc)


def tsi(dt):
    return dt.astimezone(TSI).strftime("%H.%M")


def zaman(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def durum_id(url):
    m = re.search(r"/status/(\d+)", url or "")
    return m.group(1) if m else None


def raporlananlar():
    if not os.path.exists(REP):
        return set()
    with open(REP, encoding="utf-8") as f:
        return {s.strip().split()[0] for s in f if s.strip()}


def x_ara(q, sekme="live"):
    return "https://x.com/search?q=" + urllib.parse.quote(q) + "&src=typed_query&f=" + sekme


# ---------------------------------------------------------------- hazirlik
ANTALYA_YER = ["Antalya", "Alanya", "Manavgat", "Kemer", "Kaş", "Serik", "Muratpaşa", "Konyaaltı", "Kepez",
               "Gazipaşa", "Kumluca", "Finike", "Demre", "Belek", "Aksu", "Döşemealtı"]
ANTALYA_OLAY = ["kaza", "yangın", "deprem", "sel", "fırtına", "hortum", "operasyon", "gözaltı", "öldü", "hayatını",
                "yaralı", "turist", "boğul", "kayıp", "\"son dakika\""]


def hazirlik():
    n = simdi()
    t60 = int((n - timedelta(minutes=60)).timestamp())
    t120 = int((n - timedelta(minutes=120)).timestamp())
    izle = oku(IZLE, {"hesaplar": []})["hesaplar"]
    print(f"Saat (TSİ): {n.astimezone(TSI):%d.%m.%Y %H.%M}   since_time 60dk={t60}  120dk={t120}")
    filtre = " -filter:replies -filter:retweets"

    def gruplar(liste):
        grup, uz = [], 0
        for h in liste:
            parca = f"from:{h['handle']}"
            if grup and (uz + len(parca) + 4 > 330):
                yield grup
                grup, uz = [], 0
            grup.append(parca)
            uz += len(parca) + 4
        if grup:
            yield grup

    ulusal = [h for h in izle if h.get("kategori") != "antalya"]
    antalya = [h for h in izle if h.get("kategori") == "antalya"]
    print("\n== a) Erken kaynak izleme listesi (Son/Latest sekmesi) ==")
    for g in gruplar(ulusal):
        print(x_ara("(" + " OR ".join(g) + ")" + filtre + f" since_time:{t60}"))
    print("\n== b) Antalya ==")
    for g in gruplar(antalya):
        print(x_ara("(" + " OR ".join(g) + ")" + filtre + f" since_time:{t60}"))
    print(x_ara("(" + " OR ".join(ANTALYA_YER) + ") (" + " OR ".join(ANTALYA_OLAY) + ") lang:tr" + filtre + f" since_time:{t60}"))
    print("\n== d) Genel hız + gündem ==")
    print(x_ara(f"(son OR dakika OR bir OR ve OR bu OR açıklama) lang:tr min_faves:100{filtre} since_time:{t120}", "top"))
    print("https://x.com/explore/tabs/trending")
    print(f"Gündem başlığı için şablon: " + x_ara(f"\"<BAŞLIK>\" lang:tr min_faves:20{filtre} since_time:{t120}", "top"))
    print("\n== e) @haberinilki son paylaşımları ==")
    print(x_ara("from:haberinilki", "live"))

    snap = oku(SNAP, {})
    genc = []
    for i, s in snap.items():
        try:
            yas = (n - zaman(s["created_at"])).total_seconds() / 60
        except Exception:
            continue
        if yas < 120:
            genc.append((yas, i, s))
    print(f"\n== c) Momentum: 2 saatten genç {len(genc)} anlık görüntü (yeniden ölç) ==")
    for yas, i, s in sorted(genc):
        print(f"  {int(yas):>3} dk  @{s.get('author')}  {s.get('url')}  ({len(s.get('olcumler', []))} ölçüm)  {s.get('text', '')[:70]}")
    dogrula = [h["handle"] for h in izle if h.get("dogrula")]
    if dogrula:
        print(f"\nDoğrulanacak hesaplar (turda en çok 4 profil aç; yoksa izle-sil, varsa takipçiyi yaz): {', '.join(dogrula[:8])}")
    print(f"\nİzleme listesi: {len(izle)} hesap. Raporlanan URL: {len(raporlananlar())}.")
    p = oku(PERF, {})
    bugun = n.astimezone(TSI).strftime("%Y-%m-%d")
    print("İçgörü hakkı bugün: " + ("VAR" if p.get("son_icgoru") != bugun else "kullanıldı"))


# ---------------------------------------------------------------- puanlama
def etk(m):
    return (m.get("likes") or 0) + 2 * (m.get("reposts") or 0) + (m.get("replies") or 0) + (m.get("quotes") or 0)


def en_yeni_indirilen():
    ind = os.path.join(os.path.expanduser("~"), "Downloads")
    dosyalar = sorted(glob.glob(os.path.join(ind, "hir-aday-*.json")), key=os.path.getmtime)
    if not dosyalar:
        print("İndirilenler'de hir-aday-*.json yok. Chrome'da HIR.indir() çalıştırıldı mı?"); sys.exit(1)
    hedef = F("tmp/" + os.path.basename(dosyalar[-1]))
    shutil.move(dosyalar[-1], hedef)
    for eski in dosyalar[:-1]:  # yarım kalmış eski turlar
        os.remove(eski)
    return hedef


def isle(yol=None):
    yol = yol or en_yeni_indirilen()
    veri = oku(yol, [])
    adaylar = veri.get("adaylar", veri) if isinstance(veri, dict) else veri
    n = simdi()
    snap = oku(SNAP, {})
    tk = oku(TAKIPCI, {})
    izle = {h["handle"].lower(): h for h in oku(IZLE, {"hesaplar": []})["hesaplar"]}
    rep = raporlananlar()
    tekil = {}
    for a in adaylar:
        i = a.get("id") or durum_id(a.get("url"))
        if not i or not a.get("created_at"):
            continue
        if i not in tekil or etk(a) > etk(tekil[i]):
            a["id"] = i
            tekil[i] = a
    sonuc = []
    for i, a in tekil.items():
        yas = max(1.0, (n - zaman(a["created_at"])).total_seconds() / 60)
        e = etk(a)
        hiz = e / yas
        h = (a.get("author") or "").lower()
        tak = a.get("followers") or (tk.get(h) or {}).get("n") or (izle.get(h) or {}).get("takipci")
        goreli = hiz / max(tak or 0, 1000) * 1000 if tak else None  # 1000 takipçi başına dakikalık etkileşim
        ivme, son_hiz, onceki = None, None, (snap.get(i) or {}).get("olcumler") or []
        if onceki:
            p = onceki[-1]
            dt = (n - zaman(p["t"])).total_seconds() / 60
            yas_p = max(1.0, (zaman(p["t"]) - zaman(a["created_at"])).total_seconds() / 60)
            if dt >= 5:
                son_hiz = (e - etk(p)) / dt
                ilk_hiz = etk(p) / yas_p
                ivme = son_hiz / ilk_hiz if ilk_hiz > 0 else (9.9 if son_hiz > 0 else 0)
        puan = 2 * math.log10(1 + hiz)
        if goreli is not None:
            puan += 3 * math.log10(1 + 10 * goreli)
        if a.get("views") and tak:
            puan += min(2.0, math.log10(1 + a["views"] / max(tak, 1)))
        if ivme is not None:
            puan += 2.5 if ivme >= 1.5 else 1.2 if ivme >= 1.1 else -1.5 if ivme < 0.5 else 0
        if yas > 120:
            puan -= 1.5
        if tak and tak > 1_000_000:
            puan -= 1  # büyük hesap: yalnız ilk kaynaksa
        etiket = []
        if any(r.endswith("/status/" + i) for r in rep):
            etiket.append("RAPORLANDI")
        if tak and tak > 1_000_000:
            etiket.append(">1M: ilk kaynak mı?")
        if ivme is not None and ivme < 0.6:
            etiket.append("zirve geçmiş olabilir")
        if ivme is not None and ivme >= 1.5:
            etiket.append("HIZLANIYOR")
        if tak is None:
            etiket.append("takipçi?")
        if (izle.get(h) or {}).get("kategori") == "antalya" or re.search("|".join(ANTALYA_YER), a.get("text") or "", re.I):
            etiket.append("📍Antalya")
        sonuc.append(dict(a, yas=round(yas), etk=e, hiz=round(hiz, 2), goreli=None if goreli is None else round(goreli, 3),
                          ivme=None if ivme is None else round(ivme, 2), son_hiz=None if son_hiz is None else round(son_hiz, 2),
                          takipci=tak, puan=round(puan, 2), etiket=etiket))
    sonuc.sort(key=lambda s: s["puan"], reverse=True)

    # anlık görüntü: raporlanmamış ilk 10 + zaten izlenenlerin yeni ölçümü
    secilen = [s for s in sonuc if "RAPORLANDI" not in s["etiket"]][:10]
    secilen += [s for s in sonuc if s["id"] in snap and s not in secilen]
    t = n.isoformat()
    for s in secilen:
        k = snap.setdefault(s["id"], {"url": s.get("url"), "author": s.get("author"), "created_at": s["created_at"],
                                      "text": (s.get("text") or "")[:160], "olcumler": []})
        k["followers"] = s.get("takipci")
        k["olcumler"].append({"t": t, **{x: s.get(x) or 0 for x in ("likes", "reposts", "replies", "quotes", "views")}})
        k["olcumler"] = k["olcumler"][-8:]
    sinir = n - timedelta(hours=3)
    snap = {i: s for i, s in snap.items() if zaman(s["olcumler"][-1]["t"]) > sinir and zaman(s["created_at"]) > n - timedelta(hours=6)}
    yaz(SNAP, snap)

    print(f"{len(sonuc)} tekil aday ({len(adaylar)} ham). snapshots.json: {len(snap)} kayıt.\n")
    print(" puan  yaş  etk   hız/dk  göreli  ivme  takipçi   yazar / metin")
    for s in sonuc[:25]:
        print(f"{s['puan']:5.2f} {s['yas']:4}dk {s['etk']:5} {s['hiz']:7.2f} {str(s['goreli'] or '-'):>7} {str(s['ivme'] or '-'):>5} "
              f"{str(s['takipci'] or '?'):>9}  @{s.get('author')}  {' '.join(s['etiket'])}\n"
              f"{'':41}{(s.get('text') or '').replace(chr(10), ' ')[:110]}\n{'':41}{s.get('url')}"
              f"  ❤{s.get('likes',0)} 🔁{s.get('reposts',0)} 💬{s.get('replies',0)} 👁{s.get('views') or '-'}")
    yaz(F("tmp/son-puan.json"), sonuc[:40])


# ---------------------------------------------------------------- taslak kontrolü + gönderim
YASAK = [(r"\bpaylaştı|\baktardı|\bbelirtti\b.*@|\bKaynak\s*:", "başka hesaba işaret eden ifade"),
         (r"@\w", "@hesap adı"), (r"https?://|x\.com/|t\.co/", "bağlantı")]


def kontrol_et(s):
    hata = []
    m = (s.get("metin") or "").strip()
    if not m:
        hata.append("metin boş")
    if len(m) > 260:
        hata.append(f"metin {len(m)} karakter (>260)")
    for desen, ad in YASAK:
        if re.search(desen, m, re.I):
            hata.append(ad)
    if m.count("#") > 1:
        hata.append("birden fazla etiket")
    if not durum_id(s.get("kaynak_url")):
        hata.append("kaynak_url bir X gönderisi değil")
    if s.get("kaynak_url") and s["kaynak_url"].split("?")[0] in raporlananlar():
        hata.append("zaten raporlandı")
    return hata


def niyet(m):
    return "https://x.com/intent/post?text=" + urllib.parse.quote(m, safe="")


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def kontrol(yol, gonder=False):
    secimler = oku(yol, {}).get("secimler", [])
    if not secimler:
        print("secimler boş"); sys.exit(1)
    toplam_hata = 0
    for k, s in enumerate(secimler, 1):
        h = kontrol_et(s)
        toplam_hata += len(h)
        print(f"[{k}] {'GEÇTİ' if not h else 'HATA: ' + '; '.join(h)}  ({len(s.get('metin',''))} kr)")
        print(niyet(s.get("metin", "")))
    if toplam_hata:
        print("Düzeltmeden gönderilmez."); sys.exit(1)
    if not gonder:
        return
    for k, s in enumerate(secimler, 1):
        m = s["metin"].strip()
        satir = m.split("\n")
        govde = "<b>" + esc(satir[0]) + "</b>" + ("\n" + esc("\n".join(satir[1:])) if len(satir) > 1 else "")
        alt = f"\n\n———\n🔎 {esc(s.get('neden',''))}\n{esc(s['kaynak_url'])}"
        cap = (govde + alt)[:1000]
        cfile = F(f"tmp/caption-{k}.html")
        with open(cfile, "w", encoding="utf-8") as f:
            f.write(cap)
        komut = [sys.executable, "-I", F("send_telegram.py"), "--caption-file", cfile, "--button-url", niyet(m)]
        ham = s.get("gorsel_ham")
        if ham and os.path.exists(ham):
            cikti = F(f"images/{datetime.now(TSI):%Y%m%d-%H%M}-{k}.jpg")
            r = subprocess.run([sys.executable, "-I", F("label_image.py"), ham, cikti], capture_output=True, text=True)
            if r.returncode == 0:
                s["gorsel"] = cikti
                komut += ["--photo", cikti]
            else:
                print(f"[{k}] etiket hatası, görselsiz: {r.stderr.strip()[-200:]}")
        r = subprocess.run(komut, capture_output=True, text=True, encoding="utf-8")
        cikis = (r.stdout + r.stderr).strip()
        print(f"[{k}] telegram: {cikis[-200:]}")
        with open(REP, "a", encoding="utf-8") as f:
            f.write(f"{s['kaynak_url'].split('?')[0]}  {datetime.now(TSI):%Y-%m-%d %H:%M}  {s.get('konu','')}\n")
        p = oku(PERF, {"secimler": []})
        p.setdefault("secimler", []).append({"t": simdi().isoformat(), "kaynak_url": s["kaynak_url"], "metin": m,
                                              "konu": s.get("konu"), "kaynak_turu": s.get("kaynak_turu"),
                                              "antalya": bool(s.get("antalya")), "paylasildi": None})
        yaz(PERF, p)
        if s.get("gorsel"):
            print(f"[{k}] görsel: {s['gorsel']}")


# ---------------------------------------------------------------- performans
def perf(yol):
    """perf.json: {"eslesmeler": [{"kaynak_url": "...", "post_url": "https://x.com/haberinilki/status/..",
       "likes": 10, "reposts": 2, "replies": 1, "views": 900}]}"""
    p = oku(PERF, {"secimler": []})
    for e in oku(yol, {}).get("eslesmeler", []):
        for s in p["secimler"]:
            if s["kaynak_url"] == e["kaynak_url"]:
                s["paylasildi"] = e.get("post_url")
                s["etkilesim"] = {k: e.get(k) for k in ("likes", "reposts", "replies", "views")}
                s["olculdu"] = simdi().isoformat()
    p["secimler"] = [s for s in p["secimler"] if zaman(s["t"]) > simdi() - timedelta(days=30)]
    yaz(PERF, p)
    perf_ozet()


def perf_ozet():
    p = oku(PERF, {"secimler": []})
    secim = p.get("secimler", [])
    pay = [s for s in secim if s.get("paylasildi") and s.get("etkilesim")]
    print(f"Son 30 gün: {len(secim)} seçim raporlandı, {len(pay)} tanesi @haberinilki'de paylaşıldı (ölçülmüş).")
    bugun = simdi().astimezone(TSI).strftime("%Y-%m-%d")
    print("İçgörü hakkı bugün: " + ("VAR" if p.get("son_icgoru") != bugun else "kullanıldı"))
    if len(pay) < 8:
        print("İçgörü için veri az (en az 8 ölçülmüş paylaşım).")
        return
    for alan in ("konu", "kaynak_turu", "antalya"):
        grup = {}
        for s in pay:
            grup.setdefault(str(s.get(alan)), []).append(etk(s["etkilesim"]))
        sira = sorted(((sum(v) / len(v), k, len(v)) for k, v in grup.items()), reverse=True)
        print(f"  {alan}: " + ", ".join(f"{k} ort {o:.0f} (n={c})" for o, k, c in sira))


def icgoru_kullanildi():
    p = oku(PERF, {"secimler": []})
    p["son_icgoru"] = simdi().astimezone(TSI).strftime("%Y-%m-%d")
    yaz(PERF, p)
    print("tamam")


# ---------------------------------------------------------------- izleme listesi
def izle_ekle(handle, kategori, not_):
    w = oku(IZLE, {"hesaplar": []})
    handle = handle.lstrip("@")
    if any(h["handle"].lower() == handle.lower() for h in w["hesaplar"]):
        print("zaten listede")
        return
    if len(w["hesaplar"]) >= 150:
        print("liste 150 hesapta: önce zayıf birini izle-sil ile çıkar"); sys.exit(1)
    w["hesaplar"].append({"handle": handle, "kategori": kategori, "not": not_, "eklendi": simdi().astimezone(TSI).strftime("%Y-%m-%d")})
    yaz(IZLE, w)
    print(f"eklendi: @{handle} ({kategori}) — toplam {len(w['hesaplar'])}")


def izle_sil(handle):
    w = oku(IZLE, {"hesaplar": []})
    once = len(w["hesaplar"])
    w["hesaplar"] = [h for h in w["hesaplar"] if h["handle"].lower() != handle.lstrip("@").lower()]
    yaz(IZLE, w)
    print(f"silindi: {once - len(w['hesaplar'])}")


def takipci(handle, sayi):
    handle = handle.lstrip("@").lower()
    tk = oku(TAKIPCI, {})
    tk[handle] = {"n": int(float(sayi)), "t": simdi().isoformat()}
    yaz(TAKIPCI, tk)
    w = oku(IZLE, {"hesaplar": []})
    for h in w["hesaplar"]:
        if h["handle"].lower() == handle:
            h["takipci"] = int(float(sayi))
            h.pop("dogrula", None)
    yaz(IZLE, w)
    print(f"@{handle}: {sayi}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if not a:
        print(__doc__)
    elif a[0] == "hazirlik":
        hazirlik()
    elif a[0] == "isle":
        isle(a[1] if len(a) > 1 else None)
    elif a[0] == "kontrol":
        kontrol(a[1])
    elif a[0] == "gonder":
        kontrol(a[1], gonder=True)
    elif a[0] == "perf":
        perf(a[1])
    elif a[0] == "perf-ozet":
        perf_ozet()
    elif a[0] == "icgoru-kullanildi":
        icgoru_kullanildi()
    elif a[0] == "izle-ekle":
        izle_ekle(a[1], a[2], a[3] if len(a) > 3 else "")
    elif a[0] == "izle-sil":
        izle_sil(a[1])
    elif a[0] == "takipci":
        takipci(a[1], a[2])
    else:
        print(__doc__)
