# Instagram/Shorts için dikey video: kelime vurgulu altyazı, kimlik görseli, ses efektleri, arka müzik.
import subprocess, json

SRC = r"C:\Users\MONSTER\Desktop\atakan.mp4"
W = "video/muzekart"
BS = chr(92)
DUR = 41.9


def run(a, **k):
    subprocess.run(a, check=True, **k)


# (kelime, başlangıç) — otomatik dökümden, yazımı elle düzeltildi. None = cümle sonu (bitiş zamanı)
KELIME = [
    ("Turizm", 0.5), ("Bakanlığı", 1.3), ("duyurdu.", 1.8), ("Artık", 2.4), ("TC", 2.6), ("kimlik", 3.0),
    ("kartlarımızı", 3.4), ("Müzekart", 5.0), ("olarak", 5.8), ("da", 6.0), ("kullanabileceğiz.", 6.4), (None, 7.5),
    ("e-Devlet", 8.2), ("üzerinden", 8.6), ("yaptığımız", 9.1), ("yeni", 9.7), ("başvuruyla", 9.9), ("birlikte", 10.5),
    ("yeni", 11.4), ("Müzekartlar", 12.1), ("artık", 13.1), ("kimliğimize", 13.7), ("yansıyacak.", 14.8), (None, 15.6),
    ("Ve", 15.8), ("bununla", 16.0), ("birlikte", 16.3), ("gittiğimiz", 16.8), ("müzelere", 17.8), ("ve", 18.3),
    ("ören", 18.6), ("yerlerine", 18.9), ("girişte", 19.9), ("kimlik", 20.5), ("kartımızı", 21.1), ("göstermemiz", 21.6),
    ("yeterli", 22.7), ("olacak.", 23.4), (None, 23.8),
    ("Şu", 23.8), ("an", 24.4), ("proje", 24.7), ("çalışma", 25.5), ("aşamasında", 26.0), ("ve", 26.9), ("2026", 27.6),
    ("yılının", 28.6), ("sonunda", 29.3), ("bitmiş", 29.9), ("olacağı", 30.4), ("tahmin", 30.9), ("ediliyor.", 31.2), (None, 31.6),
    ("Ve", 32.0), ("2027", 32.2), ("yılı", 33.1), ("itibarıyla", 33.3), ("artık", 34.5), ("müze", 35.2), ("ve", 35.5),
    ("ören", 35.7), ("yerlerine", 35.9), ("gittiğimiz", 36.8), ("vakit", 37.3), ("kimlik", 38.1), ("kartı", 38.5),
    ("göstermek", 39.2), ("yeterli", 40.3), ("olacaktır.", 40.7), (None, 41.3),
]


def buyuk(s):
    return s.replace("i", "İ").replace("ı", "I").upper()


def z(x):
    return f"0:{int(x // 60):02d}:{x % 60:05.2f}"


# Kelimeleri 2-3'lük gruplara böl (en çok 20 karakter); cümle sonunda grup kapanır
gruplar, cur = [], []
for i, (k, t) in enumerate(KELIME):
    if k is None:
        if cur:
            gruplar.append((cur, t))
            cur = []
        continue
    son = KELIME[i + 1][1]
    cur.append((k, t, son))
    uz = sum(len(x[0]) for x in cur) + len(cur) - 1
    sonraki = KELIME[i + 1][0]
    if sonraki is not None and not k.endswith((".", "?", "!")) and (len(cur) >= 3 or uz + len(sonraki) > 20):
        gruplar.append((cur, son))
        cur = []

SARI = "{" + BS + "c&H00E6FF&" + BS + "fscx108" + BS + "fscy108}"
BEYAZ = "{" + BS + "c&HFFFFFF&" + BS + "fscx100" + BS + "fscy100}"
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Alt,Arial Black,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&HB4000000,0,0,0,0,100,100,0,0,1,9,4,2,40,40,440,162

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
for grup, gson in gruplar:
    for j, (k, t, son) in enumerate(grup):
        bit = min(son, gson) if j < len(grup) - 1 else gson
        metin = " ".join((SARI + buyuk(x[0]) + BEYAZ) if n == j else buyuk(x[0]) for n, x in enumerate(grup))
        giris = "{" + BS + "fad(50,0)}" if j == 0 else ""
        ass += f"Dialogue: 0,{z(t)},{z(bit)},Alt,,0,0,0,,{giris}{metin}\n"
open(f"{W}/altyazi.ass", "w", encoding="utf-8").write(ass)

# Bindirmeler: (dosya, başlangıç, bitiş, x, y, efekt)
KX = (1080 - 680) // 2
RX = (1080 - 760) // 2
BIND = [
    ("baslik.png", 0.15, 7.6, 0, 60, "whoosh"),
    ("kimlik.png", 2.6, 5.0, KX, 900, "whoosh"),
    ("kimlik_muzekart.png", 5.0, 7.6, KX, 900, "ding"),
    ("edevlet.png", 8.2, 11.3, RX, 1010, "pop"),
    ("kimlik_muzekart.png", 13.6, 15.7, KX, 900, "whoosh"),
    ("muze.png", 17.8, 19.9, RX, 1010, "pop"),
    ("kimlik.png", 20.4, 23.8, KX, 900, "whoosh"),
    ("y2026.png", 27.5, 31.6, RX, 1010, "pop"),
    ("y2027.png", 32.2, 34.5, RX, 1010, "ding"),
    ("kimlik_muzekart.png", 38.0, 41.6, KX, 900, "whoosh"),
]
olay = [[max(0, b[1] - (0.12 if b[5] == "whoosh" else 0.0)), b[5]] for b in BIND]
run(["python", "video/muzekart_ses.py", f"{W}/efekt.wav", str(DUR), json.dumps(olay)])
run(["python", "video/reklam_muzik.py", f"{W}/muzik.wav", str(DUR), "999"])

girdi = ["-t", str(DUR), "-i", SRC]
for b in BIND:
    girdi += ["-loop", "1", "-t", str(DUR), "-i", f"{W}/{b[0]}"]
girdi += ["-i", f"{W}/efekt.wav", "-i", f"{W}/muzik.wav"]
fc = "[0:v]scale=1080:1920,fps=30,eq=contrast=1.05:saturation=1.12[v0];"
onceki = "v0"
for n, (ad, s, e, x, y, _) in enumerate(BIND, 1):
    # Alttan kayarak gelir, sonda kısa sürede solar
    fc += (
        f"[{n}:v]fps=30,format=rgba,fade=t=in:st={s:.2f}:d=0.18:alpha=1,fade=t=out:st={e - 0.2:.2f}:d=0.2:alpha=1[b{n}];"
        f"[{onceki}][b{n}]overlay=x={x}:y='{y}+260*pow(1-min(1,max(0,(t-{s:.2f})/0.28)),3)':enable='between(t,{s:.2f},{e:.2f})'[v{n}];"
    )
    onceki = f"v{n}"
ef = len(BIND) + 1
mz = ef + 1
fc += (
    f"[{onceki}]subtitles={W}/altyazi.ass:fontsdir='C{BS}:/Windows/Fonts',fade=t=in:d=0.2,fade=t=out:st={DUR - 0.4:.2f}:d=0.4,format=yuv420p[v];"
    "[0:a]highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,volume=1.8,asplit=2[ses][anahtar];"
    f"[{mz}:a]aresample=48000,volume=0.22[muz];[muz][anahtar]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[muzk];"
    f"[{ef}:a]aresample=48000,volume=0.75,pan=stereo|c0=c0|c1=c0[efk];"
    f"[ses][muzk][efk]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,afade=t=out:st={DUR - 0.5:.2f}:d=0.5[a]"
)
run(["ffmpeg", "-v", "error", "-y", *girdi, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-t", str(DUR),
     "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
     "video/kimlik-muzekart-reels.mp4"])
print("bitti", len(gruplar), "altyazi grubu")
