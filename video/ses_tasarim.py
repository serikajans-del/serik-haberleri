# Profesyonel ses tasarımı: rol bazlı efekt haritası (earshot, telifsiz) + konuşmanın altına oturtma.
# Kullanım (betikten):  from ses_tasarim import miksle
#   miksle("goruntu.mp4", "vo.wav", [("gecis", 6.15), ("kart", 13.7), ...], "cikti.mp4")
# Rol listesi aşağıda. Her rol: (earshot id, ses seviyesi dB, zaman kaydırma sn, ek render seçenekleri).
# Kurallar (profesyonel kurgu alışkanlıkları):
#   - Whoosh/kaydırma sesi kesmeden ÖNCE başlar, tepe noktası (apex) tam kesmeye denk gelir.
#   - Belirme sesleri (pop) görselle aynı karede; konuşmanın 14-22 dB altında, dinleyen fark etmez ama hisseder.
#   - Aynı rol üst üste çalarsa perde hafifçe kaydırılır (tekrar eden "aynı ses" hissi olmasın).
#   - Konuşma sürerken efektler ayrıca 4 dB kısılır (sidechain benzeri bastırma).
import os, subprocess, sys, hashlib

EARSHOT = os.path.join(os.path.dirname(__file__), "..", "..", "araclar", "earshot", ".venv", "Scripts", "earshot")
ONBELLEK = os.path.join(os.path.dirname(__file__), "sfx_kutuphane")

ROL = {
    "gecis":   ("swipe/glide",           -20, -0.26, ["--dur", "0.55", "--apex", "0.26"]),  # sahne geçişi
    "kayma":   ("swipe/velvet",          -22, -0.15, []),                                    # uzun kayan nesne (tramvay, şerit)
    "kart":    ("pro_pop_in/round",      -19,  0.0,  []),                                    # kart / yazı belirmesi
    "kucuk":   ("pro_pop/boop",          -23,  0.0,  []),                                    # küçük hap, çip, satır
    "onay":    ("pro_notify/ding_1822",  -21,  0.0,  []),                                    # ✓ doğru / tamam
    "hayir":   ("knock/wood",            -18,  0.0,  []),                                    # ✕ kapalı / yok
    "yazma":   ("pro_typing_run/soft",   -24,  0.0,  []),                                    # klavye / form doldurma
    "damga":   ("pro_impact/short",      -17,  0.0,  []),                                    # damga, kesin bilgi
    "igne":    ("pro_pop_in/deep",       -18,  0.0,  []),                                    # haritaya iğne düşmesi
    "sayac":   ("pro_riser/nblips",      -25,  0.0,  ["--dur", "1.2"]),                      # sayı sayma
    "kanca":   ("reverse_swell/short",   -22, -0.6,  []),                                    # açılış vurgusuna emiş
    "foto":    ("shutter/quick",         -22,  0.0,  []),                                    # fotoğraf / karekod çıkışı
    "kapanis": ("pro_logo_sting/sweep_hit", -21, -0.2, []),                                  # son kart
}
PERDE = [0, 1.5, -1.0, 2.5, -2.0]   # aynı rol tekrar edince perde kaydırma (yarım ton; asetrate ile)


def _uret(rol):
    kimlik, _, _, ek = ROL[rol]
    os.makedirs(ONBELLEK, exist_ok=True)
    ad = os.path.join(ONBELLEK, hashlib.md5((kimlik + " ".join(ek)).encode()).hexdigest()[:10] + ".wav")
    if not os.path.exists(ad):
        subprocess.run([EARSHOT, "sfx", "render", kimlik, "-o", ad, *ek], check=True, capture_output=True)
    return ad


def miksle(video, ses, olaylar, cikti, konusma=None, alt_kes=None):
    """olaylar: [(rol, saniye), ...]. konusma: [(bas, son), ...] konuşma aralıkları (yoksa bastırma yok).
    alt_kes: Hz; verilirse efektlerin bu frekans altı kesilir (Suluin, 25 Kas: kullanıcı "dip sesler rahatsız edici")."""
    sys.path.insert(0, os.path.dirname(__file__))
    from sestemiz import _sure
    S = _sure(video)
    gir, fc, sayac = ["-i", video, "-i", ses], "", {}
    for i, (rol, t) in enumerate(olaylar):
        kimlik, db, kay, _ = ROL[rol]
        n = sayac.get(rol, 0); sayac[rol] = n + 1
        oran = 2 ** (PERDE[n % len(PERDE)] / 12)
        gir += ["-i", _uret(rol)]
        bas = max(0, t + kay)
        fc += (f"[{i + 2}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
               f"asetrate={int(48000 * oran)},aresample=48000,volume={db}dB,adelay={int(bas * 1000)}:all=1[e{i}];")
    ek = "".join(f"[e{i}]" for i in range(len(olaylar)))
    fc += f"{ek}amix=inputs={len(olaylar)}:duration=longest:normalize=0" + (f",highpass=f={alt_kes},highpass=f={alt_kes}" if alt_kes else "") + "[efx];"
    if konusma:   # konuşma varken efektleri 4 dB daha kıs
        ifade = "+".join(f"between(t,{a:.2f},{b:.2f})" for a, b in konusma)
        fc += f"[efx]volume='if({ifade},0.63,1)':eval=frame[efx2];"
    else:
        fc += "[efx]anull[efx2];"
    fc += "[1:a]apad[v0];[v0][efx2]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *gir, "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "16M", "-bufsize", "32M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{S:.2f}",
                    "-movflags", "+faststart", cikti], check=True)
    return cikti
