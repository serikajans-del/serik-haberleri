# Suluin Short montajı (25 Kas 2026): film.html (tek opak geçiş: gerçek foto + kod kesit + 3 ChatGPT temsilî kare) → goruntu.mp4
# + vo.wav (Atakan Şimşir, Eleven v4; videoda +0,3 sn) + derin su uğultusu (yalnız dalış bölümü) + 90 m'de tek "pat" + rol bazlı efektler.
# Müzik YOK. Sonuna kapak karesi (0,5 sn) gömülür.
# Kullanım (suluin/ klasöründen): python kur.py [--render]
import json, re, subprocess, sys, os
sys.path.insert(0, "..")
from sestemiz import temiz_ses, _sure
from ses_tasarim import miksle

CIKTI = "../antalya-finike-suluin-magarasi-dibi-bilinmiyor-short.mp4"
KAPAK = "kapak.jpg"
Z = open("zaman.js", encoding="utf-8").read()
C = json.loads(re.search(r"window\.C = (\[.*?\]);", Z).group(1))
L = json.loads(re.search(r"window\.L = (\{.*?\});", Z).group(1))   # v5 konum bloğu
SURE, GEC = C[19], 0.3
ff = lambda *a: subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)

if "--render" in sys.argv or not os.path.exists("goruntu.mp4"):
    subprocess.run(["node", "../motion/render.mjs", "film.html", "goruntu.mp4", "--w", "1080", "--h", "1920", "--fps", "30", "--sure", str(SURE)], check=True)

# 1) dış ses: temizle (−16 LUFS), 0,3 sn kaydır
temiz_ses("ses/vo5.wav", "ses/vo_temiz.wav")   # v5 (kullanıcı): konum cümleleri, tek parça okuma
# 2-3) v5 (kullanıcı, 25 Kas: "çok rahatsız edici dip sesler var"): derin su uğultusu (kahverengi gürültü) ve 48 Hz "pat" KALDIRILDI.
#      Alçak frekanslı sürekli ses yok; efektlerin 150 Hz altı kesilir (miksle alt_kes).
ff("-i", "ses/vo_temiz.wav", "-af", f"aresample=48000,aformat=channel_layouts=stereo,adelay={int(GEC * 1000)}:all=1,apad,atrim=0:{SURE:.2f}", "ses/on.wav")

# 4) efektler: her biri bir görsel olaya bağlı (film.html zamanları)
OLAY = [("damga", 0.1), ("gecis", L["bas"]), ("damga", L["bas"] + .1), ("kucuk", L["bas"] + .5), ("kucuk", L["antalyadan"]), ("kayma", L["antalyadan"] + .6),
        ("kucuk", L["kumluca"]), ("kucuk", L["kumluca"] + .8), ("igne", L["adi"] + .4), ("kucuk", L["ilce"] + .5), ("kucuk", L["ilce"] + 1.0), ("gecis", C[3]), ("kucuk", C[3] + 0.2), ("kart", C[3] + 1.4), ("gecis", C[4]), ("gecis", C[5]), ("kucuk", C[5] + 1.6),
        ("kart", C[6] + 0.1), ("gecis", C[7]), ("sayac", C[7] + 0.3), ("gecis", C[8]), ("kart", C[8] + 1.3), ("sayac", C[9] + 0.2),
        ("gecis", C[10]), ("damga", C[10] + 1.5), ("gecis", C[11]), ("kucuk", C[11] + 1.0), ("gecis", C[12]), ("kart", C[12] + 0.1), ("hayir", C[13] + 0.3),
        ("gecis", C[14]), ("kart", C[14] + 0.1), ("gecis", C[15]), ("igne", C[15] + 0.4), ("kucuk", C[15] + 1.0), ("gecis", C[16]), ("kucuk", C[16] + 0.1), ("kucuk", C[16] + 1.2), ("gecis", C[17]), ("kayma", C[17] + 1.6), ("kapanis", C[18] + 3.0)]
k = json.load(open("ses/vo5_kelime.json", encoding="utf-8"))
konusma, a = [], k[0]["a"] + GEC
for i, w in enumerate(k):
    if i == len(k) - 1 or k[i + 1]["a"] - w["b"] > .35:
        konusma.append((a, w["b"] + GEC)); a = (k[i + 1]["a"] + GEC) if i < len(k) - 1 else 0
miksle("goruntu.mp4", "ses/on.wav", OLAY, "ara.mp4", konusma, alt_kes=150)   # v5: dip ses yok

# 5) kapak karesi sona (0,5 sn)
ff("-i", "ara.mp4", "-loop", "1", "-framerate", "30", "-t", "0.5", "-i", KAPAK, "-f", "lavfi", "-t", "0.5", "-i", "anullsrc=r=48000:cl=stereo", "-filter_complex",
   "[0:v]fps=30,setsar=1,format=yuv420p[v0];[1:v]scale=1080:1920,fps=30,setsar=1,format=yuv420p[v1];[0:a]aresample=48000,aformat=channel_layouts=stereo[a0];"
   "[v0][a0][v1][2:a]concat=n=2:v=1:a=1[v][a]", "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-maxrate", "16M", "-bufsize", "32M",
   "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", CIKTI)
print("bitti", _sure("ara.mp4"), "->", _sure(CIKTI))
