# "Kuş Yuvası: ölüm yolu" dikey kısa videosu — sade kurgu:
# gerçek fotoğraflar (yavaş kaydırma, yumuşak geçiş), ElevenLabs seslendirme, düz altyazı, kısık ped müzik.
# Ses efekti, zıplayan yazı, vinyet ve rakam rozetleri bilinçli olarak yok.
import subprocess, json

W = "video/kusyuvasi"
BS = chr(92)
DUR = 42.8
DONUS = 24.5          # anlatımın "Bugün ise..." diye umuda döndüğü an
GECIS = 0.6           # fotoğraflar arası çözülme süresi


def run(a, **k):
    subprocess.run(a, check=True, **k)


kunye = {x["n"]: x for x in json.load(open(f"{W}/foto/kunye.json", encoding="utf-8"))}
# (foto no, başlangıç, bitiş, kaydırma merkezi, yön) — az sayıda, uzun planlar; kaydırma toplam genişliğin %10'u
PLAN = [
    (3, 0.0, 5.2, 0.42, +1), (2, 5.2, 10.4, 0.50, +1), (1, 10.4, 15.2, 0.50, -1), (5, 15.2, 19.6, 0.40, +1),
    (0, 19.6, 24.5, 0.32, -1), (10, 24.5, 29.0, 0.58, -1), (6, 29.0, 34.3, 0.38, +1), (8, 34.3, 38.6, 0.42, -1),
    (7, 38.6, DUR, 0.45, +1),
]
H = 2016
CW = 1134             # 9:16 pencere, 1.05 kat büyütülmüş görüntüde

girdi = []
fc = ""
for i, (no, s, e, c, yon) in enumerate(PLAN):
    d = (e - s) + GECIS
    a, b = c - 0.05 * yon, c + 0.05 * yon
    girdi += ["-loop", "1", "-t", f"{d:.2f}", "-i", f"{W}/foto/f{no:02d}.jpg"]
    fc += (f"[{i}:v]scale=-2:{H},crop={CW}:{H}:x='(in_w-{CW})*({a:.3f}+({b - a:.3f})*t/{d:.2f})':y=0,scale=1080:1920,fps=30,"
           f"eq=contrast=1.04:saturation=1.05,format=yuv420p,settb=AVTB[k{i}];")
onceki = "k0"
for i in range(1, len(PLAN)):
    fc += f"[{onceki}][k{i}]xfade=transition=fade:duration={GECIS}:offset={PLAN[i][1] - GECIS / 2:.2f}[x{i}];"
    onceki = f"x{i}"


def z(x):
    return f"0:{int(x // 60):02d}:{x % 60:05.2f}"


# Altyazı: kelime kelime değil, anlam öbekleriyle; satır sonları elle belirlendi (cümle ortasında kopmasın)
FRAZ = [
    "Antalya'da bulutların üzerinde uzanan bu yol,", 'yıllarca "ölüm yolu" olarak anıldı.',
    "Antalya'nın en zorlu yollarından biri olan", "Kuş Yuvası,", "iki bin metrelik uçurumlarıyla",
    "yıllarca sürücülere korku yaşattı.", "Alanya'yı Konya'ya bağlayan", "bu Toros geçidinde",
    "dar virajlar, kar ve kaya düşmeleri", "nice kazaya yol açtı.", "Bugün ise dağlar tünellerle aşılıyor.",
    "Elli sekiz kilometrelik güzergâhta", "yirmi bir tünel planlandı,", "on üçü tamamlandı.",
    "En tehlikeli bölüm artık", "dakikalar içinde geçiliyor.", "Kuş Yuvası, korkunun değil,", "manzaranın adı oluyor.",
]
kel = json.load(open(f"{W}/kelimeler.json", encoding="utf-8"))
assert sum(len(f.split()) for f in FRAZ) == len(kel), "öbekler senaryodaki kelime sayısıyla uyuşmuyor"
satirlar, n0 = [], 0
for f in FRAZ:
    adet = len(f.split())
    bas, son = kel[n0], kel[n0 + adet - 1]
    sonraki = kel[n0 + adet]["s"] if n0 + adet < len(kel) else None
    bitis = min(sonraki - 0.04, son["e"] + 0.7) if sonraki else son["e"] + 0.9
    satirlar.append((bas["s"], max(bitis, bas["s"] + 0.9), f))
    n0 += adet

FAD = "{" + BS + "fad(120,120)}"
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Alt,Segoe UI Semibold,64,&H00FFFFFF,&H00FFFFFF,&H00101010,&H78000000,0,0,0,0,100,100,0,0,1,3,2,2,90,90,430,162
Style: Baslik,Segoe UI Semibold,92,&H00FFFFFF,&H00FFFFFF,&H00101010,&H96000000,0,0,0,0,100,100,1,0,1,3,3,8,60,60,250,162
Style: AltBaslik,Segoe UI,40,&H00FFFFFF,&H00FFFFFF,&H00101010,&H96000000,0,0,0,0,100,100,4,0,1,2,2,8,60,60,370,162
Style: Kaynak,Segoe UI,24,&H50FFFFFF,&H50FFFFFF,&H50000000,&H96000000,0,0,0,0,100,100,0,0,1,1,1,7,28,28,28,162

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
YAVAS = "{" + BS + "fad(600,600)}"
ass += f"Dialogue: 1,{z(0.4)},{z(4.8)},Baslik,,0,0,0,,{YAVAS}Kuş Yuvası\n"
ass += f"Dialogue: 1,{z(0.9)},{z(4.8)},AltBaslik,,0,0,0,,{YAVAS}ALANYA – KONYA YOLU · TOROSLAR\n"
for i, (no, s, e, _, _) in enumerate(PLAN):
    k = kunye[no]
    ass += f"Dialogue: 0,{z(s + (0.3 if i else 0))},{z(e)},Kaynak,,0,0,0,," + "{" + BS + "fad(300,300)}" + f"Foto: {k['yazar']} / Wikimedia Commons ({k['lisans']})\n"
for s, e, metin in satirlar:
    ass += f"Dialogue: 2,{z(s)},{z(e)},Alt,,0,0,0,,{FAD}{metin}\n"
open(f"{W}/yazi.ass", "w", encoding="utf-8").write(ass)

run(["python", "video/kusyuvasi_muzik.py", f"{W}/muzik.wav", str(DUR), str(DONUS), "sade"])
n = len(PLAN)
fc += (
    f"[{n + 2}:v]format=rgba[golge];[{onceki}][golge]overlay=0:0[g];"
    f"[g]subtitles={W}/yazi.ass:fontsdir='C{BS}:/Windows/Fonts',fade=t=in:d=0.8,fade=t=out:st={DUR - 1.0:.2f}:d=1.0,format=yuv420p[v];"
    f"[{n}:a]aresample=48000,highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=150,volume=1.5,apad,asplit=2[ses][anahtar];"
    f"[{n + 1}:a]aresample=48000,volume=0.28[muz];[muz][anahtar]sidechaincompress=threshold=0.03:ratio=3:attack=40:release=600[muzk];"
    f"[ses][muzk]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,afade=t=out:st={DUR - 1.5:.2f}:d=1.5[a]"
)
run(["ffmpeg", "-v", "error", "-y", *girdi, "-i", f"{W}/anlatim.mp3", "-i", f"{W}/muzik.wav", "-loop", "1", "-t", str(DUR), "-i", f"{W}/golge.png", "-filter_complex", fc,
     "-map", "[v]", "-map", "[a]", "-t", str(DUR), "-c:v", "libx264", "-preset", "medium", "-crf", "19",
     "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video/kus-yuvasi-olum-yolu-short.mp4"])
print("bitti", len(satirlar), "altyazi satiri,", len(PLAN), "plan")
for s, e, m in satirlar:
    print(f"  {s:5.1f}-{e:5.1f}  {m}")
